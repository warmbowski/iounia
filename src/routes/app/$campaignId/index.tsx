import { CampaignCard } from '@/components/campaign-card'
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
  const { data: campaign } = useSuspenseQuery(
    convexQuery(api.functions.campaigns.readCampaign, {
      campaignId: campaignId,
    }),
  )
  return (
    <div className="flex gap-4">
      <div className="w-sm">
        <CampaignCard campaign={campaign} />
      </div>
      <div className="basis-auto">
        <h2 className="text-2xl font-bold">Campaign Details</h2>
        <p>{campaign.description}</p>
        <h3 className="text-xl font-semibold mt-4">Main Characters</h3>
        <h3 className="text-xl font-semibold mt-4">Latest Happenings</h3>
      </div>
    </div>
  )
}
