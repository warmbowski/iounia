import ChatWindow from '@/components/chat-window'
import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/app/$campaignId/chat')({
  ssr: false,
  parseParams: (params) => {
    const { campaignId } = params
    if (typeof campaignId !== 'string') {
      throw new Error('Invalid campaignId')
    }
    return { campaignId: campaignId as Id<'campaigns'> }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { campaignId } = Route.useParams()
  return (
    <div className="flex flex-col w-full h-full p-6">
      <ChatWindow campaignId={campaignId} />
    </div>
  )
}
