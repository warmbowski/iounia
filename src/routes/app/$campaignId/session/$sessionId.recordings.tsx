import { AudioPlayerCard } from '@/components/audio-player-card'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute(
  '/app/$campaignId/session/$sessionId/recordings',
)({
  loader: async ({ context, params }) => {
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
  const { data: recs } = useQuery(
    convexQuery(api.functions.recordings.listRecordings, {
      sessionId,
    }),
  )
  const { data: session } = useQuery(
    convexQuery(api.functions.sessions.readSession, {
      sessionId,
    }),
  )

  return (
    <div>
      <h1 className="text-2xl font-bold">Recordings</h1>
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
    </div>
  )
}
