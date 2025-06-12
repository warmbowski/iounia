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
    <div className="w-full h-full px-6">
      <div className="fixed w-full flex items-center gap-4 bg-background z-50 shadow-md">
        <h2 className="text-xl font-bold">Transcript</h2>
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
      <div className="fixed right-[20px] min-w-sm z-50 shadow-md">
        {
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
        }
      </div>
      <PersistedRecordingTimelineProvider
        recordingId={recordingId}
        cacheVersion={'v1'}
      >
        <div
          className="pt-12"
          onWheel={() => {
            if (scrollToTime) {
              setScrollToTime(false)
            }
          }}
        >
          <RecordingTimeline
            recordingId={recordingId}
            currentTime={currentTime}
            setSeekTime={setSeekTime}
            scrollToSeekTime={scrollToTime}
          />
        </div>
      </PersistedRecordingTimelineProvider>
    </div>
  ) : (
    'Cannot find this recording in your campaign.'
  )
}
