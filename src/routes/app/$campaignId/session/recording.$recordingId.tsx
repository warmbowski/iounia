import { AudioPlayerCard } from '@/components/audio-player-card'
import { formatDate, formatTime } from '@/utils'
import { convexQuery } from '@convex-dev/react-query'
import { Button } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useState } from 'react'

export const Route = createFileRoute(
  '/app/$campaignId/session/recording/$recordingId',
)({
  parseParams: (params) => {
    const { campaignId, recordingId } = params

    if (typeof campaignId !== 'string') {
      throw new Error('Invalid campaignId')
    }
    if (typeof recordingId !== 'string') {
      throw new Error('Invalid recordingId')
    }
    return {
      campaignId: campaignId as Id<'campaigns'>,
      recordingId: recordingId as Id<'recordings'>,
    }
  },
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.recordings.readRecording, {
        recordingId: params.recordingId,
      }),
    )
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.transcripts.listTranscriptParts, {
        recordingId: params.recordingId,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { recordingId } = Route.useParams()
  const [currentTime, setCurrentTime] = useState(0)
  const [seekTime, setSeekTime] = useState<number | null>(null)
  const { data: rec } = useQuery(
    convexQuery(api.functions.recordings.readRecording, {
      recordingId,
    }),
  )
  const { data: transcript } = useQuery(
    convexQuery(api.functions.transcripts.listTranscriptParts, {
      recordingId,
    }),
  )
  const { data: fileUrl } = useQuery(
    convexQuery(api.functions.cloudflareR2.getUrl, {
      key: rec?.storageId || '',
    }),
  )

  return rec ? (
    <div className="w-full h-full p-6">
      <div className="fixed right-[10px] min-w-sm z-50 shadow-md">
        <AudioPlayerCard
          key={rec._id}
          title={rec.fileName}
          artist={formatDate(rec._creationTime)}
          duration={rec.durationSec || 0}
          audioSrc={fileUrl || ''}
          onTimeUpdate={(time) => {
            setCurrentTime(time)
          }}
          seekTo={seekTime}
          onSeeked={() => setSeekTime(null)}
        />
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-bold">Transcript</h2>
        {transcript ? (
          <div className="pr-100">
            {transcript.map((part) => {
              const isAtTime =
                currentTime >= part.start / 1000 &&
                currentTime < part.end / 1000
              return (
                <p
                  data-status={isAtTime}
                  key={part._id}
                  className="mt-2 data-[status=true]:text-warning-500 grid grid-cols-[auto_1fr] gap-2"
                >
                  <Button
                    className="font-mono bold text-sm focus:outline-solid"
                    size="sm"
                    variant="light"
                    color="secondary"
                    onPress={() => setSeekTime(part.start / 1000)}
                    aria-label={`Jump to ${formatTime(part.start / 1000)}`}
                  >
                    {formatTime(part.start / 1000)} Speaker{part.speaker}:
                  </Button>
                  <span className="basis-auto mt-[0.2em]">{part.text}</span>
                </p>
              )
            })}
          </div>
        ) : (
          <p className="text-default-500">No transcript available.</p>
        )}
      </div>
    </div>
  ) : (
    'Cannot find this recording in your campaign.'
  )
}
