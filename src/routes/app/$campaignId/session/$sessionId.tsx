import { CreateRecordingForm } from '@/components/create-recording-form'
import { SessionCard } from '@/components/session-card'
import { convexQuery } from '@convex-dev/react-query'
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  useDisclosure,
} from '@heroui/react'
import { Icon, loadIcons } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useAction } from 'convex/react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/app/$campaignId/session/$sessionId')({
  parseParams: (params) => {
    const { sessionId, campaignId } = params

    if (typeof sessionId !== 'string') {
      throw new Error('Invalid sessionId')
    }
    if (typeof campaignId !== 'string') {
      throw new Error('Invalid campaignId')
    }
    return {
      sessionId: sessionId as Id<'sessions'>,
      campaignId: campaignId as Id<'campaigns'>,
    }
  },

  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.sessions.readSession, {
        sessionId: params.sessionId,
      }),
    )
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.recordings.listRecordings, {
        sessionId: params.sessionId,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { sessionId } = Route.useParams()
  const [invalidIcons, setInvalidIcons] = useState<string[]>([])
  const generateSummary = useAction(
    api.functions.transcripts.generateSessionSummary,
  )
  const { data: session } = useSuspenseQuery(
    convexQuery(api.functions.sessions.readSession, {
      sessionId: sessionId,
    }),
  )
  const { data: recordings } = useSuspenseQuery(
    convexQuery(api.functions.recordings.listRecordings, {
      sessionId: sessionId,
    }),
  )
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    const unload = loadIcons(
      session.summary.map((item) => `lucide:${item.icon}`),
      (loaded, missing) => {
        setInvalidIcons(missing.map((icon) => icon.name))
        console.log(loaded, missing)
      },
    )
    return () => {
      unload()
    }
  }, [session.summary])

  return (
    <div className="p-6">
      <div className="flex gap-4">
        <div className="w-200">
          <SessionCard session={session} />
        </div>
        <div className="basis-auto">
          <h2 className="text-2xl font-bold">Session Notes</h2>
          <p>{session.notes}</p>
          <h3 className="text-xl font-semibold mt-4">What Happened</h3>
          <p>{session.shortSummary}</p>
          <h3 className="text-xl font-semibold mt-4">Recordings</h3>
          <div className="flex flex-col gap-2">
            {recordings.map((recording, index) => {
              return (
                <div key={recording._id} className="flex gap-2 items-center">
                  <Icon icon="lucide:mic" />
                  <a
                    href={recording.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-500 hover:underline"
                  >
                    Recording {index + 1}
                  </a>
                  <span className="text-sm text-gray-500">
                    {new Date(recording._creationTime).toLocaleDateString()}
                  </span>
                </div>
              )
            })}
          </div>
          <Button
            className="mt-4"
            color="primary"
            startContent={<Icon icon="lucide:upload" />}
            onPress={onOpen}
          >
            Upload New Audio
          </Button>
        </div>
      </div>
      <div>
        <h2 className="text-2xl w-full font-bold mt-4 flex justify-between">
          Summary
          <Button onPress={() => generateSummary({ sessionId })} size="sm">
            generate
          </Button>
        </h2>
        {session.summary.map((item, index) => {
          const iconName = invalidIcons.includes(item.icon)
            ? 'lucide:circle-small'
            : `lucide:${item.icon}`
          return (
            <div
              key={index}
              className="flex items-start leading-none gap-2 mt-4"
            >
              <Icon icon={iconName} className="text-secondary-500" />
              {item.text}
            </div>
          )
        })}
      </div>

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right">
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Upload Audio
              </DrawerHeader>
              <DrawerBody>
                <CreateRecordingForm sessionId={sessionId} onClose={onClose} />
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
