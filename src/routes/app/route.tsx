import {
  createFileRoute,
  Outlet,
  redirect,
  type LinkComponentProps,
} from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/', search: { forceSignIn: true } })
    }
  },
  loader: () => ({
    crumb: {
      title: 'Campaigns',
      to: '/app',
    } as LinkComponentProps,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
