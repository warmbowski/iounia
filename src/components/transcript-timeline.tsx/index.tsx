import { formatTime } from '@/utils'
import { convexQuery } from '@convex-dev/react-query'
import { Button } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export { PersistedRecordingTimelineProvider } from './provider'

interface RecordingTimelineProps {
  recordingId: Id<'recordings'>
  currentTime: number
  setSeekTime: (time: number) => void
}

export function RecordingTimeline({
  recordingId,
  currentTime,
  setSeekTime,
}: RecordingTimelineProps) {
  const {
    data: transcript,
    isPending,
    isFetching,
  } = useQuery({
    ...convexQuery(api.functions.transcripts.listTranscriptParts, {
      recordingId,
    }),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  })

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Transcript</h2>
      {transcript ? (
        <div className="pr-100">
          {transcript.map((utterance) => {
            const isAtTime =
              currentTime >= utterance.start / 1000 &&
              currentTime < utterance.end / 1000
            return (
              <p
                data-status={isAtTime}
                key={utterance._id}
                className="mt-2 data-[status=true]:text-warning-500 grid grid-cols-[auto_1fr] gap-2"
              >
                <Button
                  className="font-mono bold text-sm focus:outline-solid"
                  size="sm"
                  variant="light"
                  color="secondary"
                  onPress={() => setSeekTime(utterance.start / 1000)}
                  aria-label={`Jump to ${formatTime(utterance.start / 1000)}`}
                >
                  {formatTime(utterance.start / 1000)} Speaker
                  {utterance.speaker}:
                </Button>
                <span className="basis-auto mt-[0.2em]">{utterance.text}</span>
              </p>
            )
          })}
        </div>
      ) : (
        <p className="text-default-500">
          {isPending || isFetching
            ? 'Loading transcript...'
            : 'No transcript available.'}
        </p>
      )}
    </div>
  )
}
