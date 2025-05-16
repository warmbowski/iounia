import { CreateRecordingForm } from '@/components/create-recording-form'
import { SessionCard } from '@/components/session-card'
import {
  convexQuery,
  convexAction,
  useConvexAction,
} from '@convex-dev/react-query'
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
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
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
  const { mutate: generateSummary, isPending } = useMutation({
    mutationFn: useConvexAction(
      api.functions.transcripts.generateSessionSummary,
    ),
  })
  const { data: hasTranscript } = useQuery(
    convexAction(api.functions.transcripts.hasTranscript, {
      sessionId: sessionId,
    }),
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
      (_loaded, missing) => {
        setInvalidIcons(missing.map((icon) => icon.name))
      },
    )
    return () => {
      unload()
    }
  }, [session.summary])

  return (
    <div className="p-6">
      <div className="grid grid-cols-[350px_minmax(350px,_auto)] gap-8">
        <SessionCard session={session} />
        <div>
          <h2 className="text-xl font-semibold">What Happened</h2>
          <p>{session.shortSummary || <i>No short summary available</i>}</p>
          <h3 className="text-2xl font-bold mt-4">Session Notes</h3>
          <p>{session.notes || <i>No notes available</i>}</p>
          <h3 className="text-xl font-semibold mt-4">Recordings</h3>
          <div className="flex flex-col gap-2">
            {recordings.length > 0 ? (
              recordings.map((recording, index) => {
                return (
                  <div key={recording._id} className="flex gap-2 items-center">
                    <Icon icon="lucide:mic" className="text-secondary-500" />
                    <a
                      href={`./recording/${recording._id}`}
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
              })
            ) : (
              <i>No recordings available</i>
            )}
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
        <h2 className="text-2xl w-full font-bold mt-8 flex justify-start gap-2">
          <span>Summary</span>
          {hasTranscript && (
            <Button
              onPress={() => generateSummary({ sessionId })}
              isIconOnly
              isLoading={isPending}
              variant="light"
            >
              <Icon icon="lucide:refresh-cw" className="text-secondary-500" />
            </Button>
          )}
        </h2>
        {session.summary.length > 0 ? (
          session.summary.map((item, index) => {
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
          })
        ) : (
          <i>No summary available</i>
        )}
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
