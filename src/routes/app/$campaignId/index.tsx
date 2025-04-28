import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute('/app/$campaignId/')({
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.campaigns.readCampaign, {
        campaignId: params.campaignId,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { campaignId } = Route.useParams()
  const { data } = useSuspenseQuery(
    convexQuery(api.functions.campaigns.readCampaign, {
      campaignId: campaignId,
    }),
  )
  return (
    <div>
      <h1 className="text-2xl font-bold">{data.name}</h1>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="mb-2">
          <strong>{key}:</strong> {JSON.stringify(value)}
        </div>
      ))}
    </div>
  )
}
