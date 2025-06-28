import { APP_TITLE } from '@/constants'
import { apiErrorToToast } from '@/utils'
import { convexAction, convexQuery } from '@convex-dev/react-query'
import {
  createFileRoute,
  Outlet,
  redirect,
  type LinkComponentProps,
} from '@tanstack/react-router'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute('/app')({
  validateSearch: (search) => {
    if (search.__clerk_handshake) {
      return { token: search.__clerk_handshake }
    }
    return {}
  },
  beforeLoad: async ({ context, search }) => {
    const token = context.auth.token || search.token
    if (!token) {
      throw redirect({ to: '/', search: { forceSignIn: true } })
    }
  },
  onError: (error) => {
    console.error('Error in app route:', error)
    apiErrorToToast(error)
  },
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.campaigns.listCampaignsWithMembersByUser, {}),
    )
    await context.queryClient.prefetchQuery(
      convexAction(api.functions.users.getMapOfUsersAssociatedWithUser, {}),
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
