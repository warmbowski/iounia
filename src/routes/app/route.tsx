import { APP_TITLE } from '@/constants'
import { convexAction, convexQuery } from '@convex-dev/react-query'
import {
  createFileRoute,
  Outlet,
  redirect,
  type LinkComponentProps,
} from '@tanstack/react-router'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute('/app')({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/', search: { forceSignIn: true } })
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.campaigns.listCampaignsWithMembers, {}),
    )
    await context.queryClient.prefetchQuery(
      convexAction(
        api.functions.members.listAllAssociatedMembersWithUserData,
        {},
      ),
    )
    return {
      crumb: {
        title: 'Campaigns',
        to: '/app',
      } as LinkComponentProps,
    }
  },
  head: (context) => {
    return {
      meta: [
        {
          title: `${context.loaderData.crumb.title} - ${APP_TITLE}`,
        },
      ],
    }
  },

  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
