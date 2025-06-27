import { formatTime } from '@/utils'
import { Button } from '@heroui/react'
import { useMatch } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { useEffect, useRef } from 'react'
import { useInfiniteLoader, useInfiniteTranscript } from './hooks'

export { PersistedRecordingTimelineProvider } from './provider'

interface RecordingTimelineProps {
  recordingId: Id<'recordings'>
  currentTime: number
  setSeekTime: (time: number) => void
  scrollToSeekTime?: boolean
}

export function RecordingTimeline({
  recordingId,
  currentTime,
  setSeekTime,
  scrollToSeekTime = false,
}: RecordingTimelineProps) {
  const { context } = useMatch({ from: '/app' })

  const {
    data: transcript,
    fetchNextPage,
    hasNextPage,
    isPending,
    isFetching,
  } = useInfiniteTranscript({
    recordingId,
    authToken: context.auth.token ?? '',
    itemsPerPage: 100,
  })

  const loadMoreRef = useInfiniteLoader(fetchNextPage, hasNextPage, 500)
  const lastLoadedTimeRef = useRef<number>(0)
  const focusRef = useRef<HTMLButtonElement>(null)

  if (focusRef.current && scrollToSeekTime) {
    focusRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  } else if (
    currentTime > lastLoadedTimeRef.current &&
    hasNextPage &&
    !isFetching
  ) {
    fetchNextPage()
  }

  useEffect(() => {
    if (transcript && transcript.length > 0) {
      lastLoadedTimeRef.current = transcript[transcript.length - 1].end / 1000
    }
  }, [transcript])

  return (
    <div className="my-4">
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
                className="mt-2 data-[status=true]:text-warning-500 flex flex-col items-start"
              >
                <Button
                  ref={isAtTime ? focusRef : null}
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
                <span className="ml-8">{utterance.text}</span>
              </p>
            )
          })}
          <div
            className="relative w-[100vw] h-[50px] flex justify-center text-warning-500 items-center"
            ref={loadMoreRef}
          >
            {hasNextPage && isFetching && 'Loading more...'}
          </div>
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
