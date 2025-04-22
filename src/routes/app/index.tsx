import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/')({
  loader: async ({ context }) => {
    return { userId: context.userId }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const state = Route.useLoaderData()
  return <div>Hello {state?.userId} "/app/"!</div>
}
