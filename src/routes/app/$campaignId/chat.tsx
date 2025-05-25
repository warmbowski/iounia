import ChatWindow from '@/components/chat-window'
import {
  createFileRoute,
  type LinkComponentProps,
} from '@tanstack/react-router'

export const Route = createFileRoute('/app/$campaignId/chat')({
  ssr: false,
  loader: ({ params }) => ({
    crumb: {
      title: 'Chat',
      to: '/app/$campaignId/chat',
      params,
    } as LinkComponentProps,
  }),
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
