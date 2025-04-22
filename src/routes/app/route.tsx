import { MainLayout } from '@/components/layouts'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { authStateFn } from '@/integrations/clerk/auth'

export const Route = createFileRoute('/app')({
  beforeLoad: async (ctx) => {
    const { userId, token } = await authStateFn()
    if (token) {
      ctx.context.convexClient.serverHttpClient?.setAuth(token)
    }
    return { userId }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
