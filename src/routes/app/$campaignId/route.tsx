import { APP_TITLE } from '@/constants'
import { convexQuery } from '@convex-dev/react-query'
import {
  createFileRoute,
  Outlet,
  type LinkComponentProps,
} from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/app/$campaignId')({
  parseParams: (params) => {
    const { campaignId } = params
    if (typeof campaignId !== 'string') {
      throw new Error('Invalid campaignId')
    }
    return { campaignId: campaignId as Id<'campaigns'> }
  },
  loader: async ({ context, params }) => {
    const campaign = await context.queryClient.ensureQueryData(
      convexQuery(api.functions.campaigns.readCampaignWithMembers, {
        campaignId: params.campaignId,
      }),
    )
    const crumb: LinkComponentProps = {
      title: campaign.name || 'Campaign',
      to: '/app/$campaignId',
      params,
    }

    return {
      crumb: crumb,
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
  return <Outlet />
}
