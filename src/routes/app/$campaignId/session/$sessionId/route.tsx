import { APP_TITLE } from '@/constants'
import { convexQuery } from '@convex-dev/react-query'
import {
  createFileRoute,
  Outlet,
  type LinkComponentProps,
} from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/app/$campaignId/session/$sessionId')({
  parseParams: (params) => {
    const { sessionId } = params

    if (typeof sessionId !== 'string') {
      throw new Error('Invalid sessionId')
    }
    return {
      sessionId: sessionId as Id<'sessions'>,
    }
  },
  loader: async ({ context, params }) => {
    const session = await context.queryClient.ensureQueryData(
      convexQuery(api.functions.sessions.readSession, {
        sessionId: params.sessionId,
      }),
    )
    const crumb: LinkComponentProps = {
      title: session.name || 'Session',
      to: '/app/$campaignId/session/$sessionId',
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
