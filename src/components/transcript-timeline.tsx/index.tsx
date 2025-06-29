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
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const activeElement = containerRef.current?.querySelector(
      '[data-active="true"]',
    )
    if (activeElement && scrollToSeekTime) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else if (
      currentTime > lastLoadedTimeRef.current &&
      hasNextPage &&
      !isFetching
    ) {
      fetchNextPage()
    }
  }, [currentTime])

  useEffect(() => {
    if (transcript && transcript.length > 0) {
      lastLoadedTimeRef.current = transcript[transcript.length - 1].end / 1000
    }
  }, [transcript])

  return (
    <div className="max-w-4xl my-4 mx-auto">
      <h2 className="text-lg font-semibold mb-4">Transcript Timeline</h2>
      <p className="text-sm text-default-500 mb-2">
        Click on a timestamp to jump to that part of the recording.
      </p>
      {transcript ? (
        <div ref={containerRef}>
          {transcript.map((utterance) => {
            const isAtTime =
              currentTime >= utterance.start / 1000 &&
              currentTime < utterance.end / 1000
            return (
              <p
                key={utterance._id}
                data-active={isAtTime}
                className="mt-2 data-[active=true]:text-warning-500 flex flex-col items-start"
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
                <span className="ml-8">{utterance.text}</span>
              </p>
            )
          })}
          <div
            className="relative w-full h-[50px] flex justify-center text-warning-500 items-center"
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
