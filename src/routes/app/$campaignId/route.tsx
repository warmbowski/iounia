import { CampaignLayout } from '@/components/layouts'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/app/$campaignId')({
  parseParams: (params) => {
    const { campaignId } = params
    if (typeof campaignId !== 'string') {
      throw new Error('Invalid campaignId')
    }
    return { campaignId: campaignId as Id<'campaigns'> }
  },
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
  const { data } = useSuspenseQuery(
    convexQuery(api.functions.campaigns.readCampaign, {
      campaignId: Route.useParams().campaignId,
    }),
  )

  return (
    <CampaignLayout campaign={data}>
      <Outlet />
    </CampaignLayout>
  )
}
