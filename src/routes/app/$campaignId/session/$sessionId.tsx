import { AudioPlayerCard } from '@/components/audio-player-card'
import { CreateRecordingForm } from '@/components/create-recording-form'
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
import { Icon } from '@iconify/react/dist/iconify.js'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { BulletItem } from 'convex/functions/transcripts'
import { useAction } from 'convex/react'

export const Route = createFileRoute('/app/$campaignId/session/$sessionId')({
  parseParams: (params) => {
    const { sessionId } = params

    if (typeof sessionId !== 'string') {
      throw new Error('Invalid sessionId')
    }
    return {
      sessionId: sessionId as Id<'sessions'>,
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
  const generateSummary = useAction(
    api.functions.transcripts.generateSessionSummary,
  )
  const { data: session } = useSuspenseQuery(
    convexQuery(api.functions.sessions.readSession, {
      sessionId: sessionId,
    }),
  )
  const { data: recs } = useSuspenseQuery(
    convexQuery(api.functions.recordings.listRecordings, {
      sessionId,
    }),
  )
  // const { data: trans } = useQuery(
  //   convexQuery(api.functions.transcripts.listTranscripts, {
  //     recordingId: recs[0]?._id,
  //   }),
  // )
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <div className="p-8">
      <div>
        <h1 className="text-2xl font-bold">{session.name}</h1>
        {Object.entries(session).map(([key, value]) => {
          if (key === 'summary') {
            return (
              <div key={key} className="mb-2">
                <strong>{key}:</strong>{' '}
                {Array.isArray(value) && value.length === 0 ? (
                  <Button
                    onPress={() => generateSummary({ sessionId })}
                    size="sm"
                  >
                    generate
                  </Button>
                ) : (
                  <>
                    {(value as unknown as BulletItem[]).map((item, index) => (
                      <div key={index}>
                        <Icon icon={`lucide:${item.icon}`} />
                        {item.text}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )
          }
          return (
            <div key={key} className="mb-2">
              <strong>{key}:</strong> {JSON.stringify(value)}
            </div>
          )
        })}
      </div>

      <Button
        color="primary"
        startContent={<Icon icon="lucide:upload" />}
        onPress={onOpen}
      >
        Upload Audio
      </Button>

      <h2 className="text-2xl font-bold">Recordings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {(recs || []).map((rec) => (
          <AudioPlayerCard
            key={rec._id}
            title={session?.date || 'unknown'}
            artist={session?.name || 'unknown'}
            duration={5 * 60}
            audioSrc={rec.fileUrl}
          />
        ))}
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
