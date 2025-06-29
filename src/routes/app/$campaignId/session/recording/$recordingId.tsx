import { AudioPlayerCard } from '@/components/audio-player-card'
import {
  RecordingTimeline,
  PersistedRecordingTimelineProvider,
} from '@/components/transcript-timeline.tsx'
import { APP_TITLE } from '@/constants'
import { formatDate } from '@/utils'
import { convexQuery } from '@convex-dev/react-query'
import { Button } from '@heroui/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  type LinkComponentProps,
} from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useState } from 'react'

export const Route = createFileRoute(
  '/app/$campaignId/session/recording/$recordingId',
)({
  ssr: false,
  parseParams: (params) => {
    const { recordingId } = params

    if (typeof recordingId !== 'string') {
      throw new Error('Invalid recordingId')
    }
    return {
      recordingId: recordingId as Id<'recordings'>,
    }
  },
  loader: async ({ context, params }) => {
    const recording = await context.queryClient.ensureQueryData(
      convexQuery(api.functions.recordings.readRecording, {
        recordingId: params.recordingId,
      }),
    )
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.transcripts.hasTranscript, {
        recordingId: params.recordingId,
      }),
    )
    const crumb: LinkComponentProps = {
      title: recording.fileName || 'Recording',
      to: '/app/$campaignId/session/recording/$recordingId',
      params,
    } as LinkComponentProps
    return {
      crumb,
    }
  },
  head: (context) => {
    return {
      meta: [
        {
          title: `${context.loaderData?.crumb.title} - ${APP_TITLE}`,
        },
      ],
    }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { recordingId } = Route.useParams()
  const [currentTime, setCurrentTime] = useState(0)
  const [seekTime, setSeekTime] = useState<number | null>(null)
  const [scrollToTime, setScrollToTime] = useState<boolean>(true)

  const { data: rec } = useSuspenseQuery(
    convexQuery(api.functions.recordings.readRecording, {
      recordingId,
    }),
  )

  const { data: fileUrl } = useQuery({
    ...convexQuery(api.functions.cloudflareR2.getUrl, {
      key: rec?.storageId || '',
    }),
    enabled: !!rec?.storageId,
  })

  return rec ? (
    <div className="w-full h-full">
      <div className="absolute top-12 right-12 flex items-center gap-4 bg-background shadow-md">
        <Button
          className=""
          size="sm"
          variant={scrollToTime ? 'bordered' : 'solid'}
          color="secondary"
          aria-label="Follow time"
          disabled={scrollToTime}
          onPress={() => setScrollToTime(!scrollToTime)}
        >
          {scrollToTime ? 'Following' : 'Follow'}
        </Button>
      </div>
      <div
        className="w-full h-auto pb-32 px-4"
        onWheel={() => {
          if (scrollToTime) {
            setScrollToTime(false)
          }
        }}
      >
        <PersistedRecordingTimelineProvider
          recordingId={recordingId}
          cacheVersion={'v1'}
        >
          <RecordingTimeline
            recordingId={recordingId}
            currentTime={currentTime}
            setSeekTime={setSeekTime}
            scrollToSeekTime={scrollToTime}
          />
        </PersistedRecordingTimelineProvider>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-50">
        {
          <AudioPlayerCard
            key={rec._id}
            title={rec.fileName}
            date={formatDate(rec._creationTime)}
            duration={rec.durationSec || 0}
            audioSrc={fileUrl || ''}
            onTimeUpdate={(time) => {
              setCurrentTime(time)
            }}
            seekTo={seekTime}
            onSeeked={() => setSeekTime(null)}
          />
        }
      </div>
    </div>
  ) : (
    'Cannot find this recording in your campaign.'
  )
}
