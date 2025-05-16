import { CampaignCard } from '@/components/campaign-card'
import { CreateSessionForm } from '@/components/create-session-form'
import { SessionCard } from '@/components/session-card'
import { convexQuery } from '@convex-dev/react-query'
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  useDisclosure,
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/app/$campaignId/')({
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
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.sessions.listSessions, {
        campaignId: params.campaignId,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { campaignId } = Route.useParams()
  const { data: campaign } = useSuspenseQuery(
    convexQuery(api.functions.campaigns.readCampaign, {
      campaignId: campaignId,
    }),
  )
  const { data: sessions } = useSuspenseQuery(
    convexQuery(api.functions.sessions.listSessions, {
      campaignId: campaignId,
    }),
  )
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const navigate = useNavigate()

  const handleCardClick = (sessionId: Id<'sessions'>) => {
    navigate({
      to: '/app/$campaignId/session/$sessionId',
      params: { campaignId, sessionId },
    })
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-[350px_minmax(350px,_auto)] gap-8">
        <CampaignCard campaign={campaign} />
        <div>
          <h2 className="text-2xl font-bold">Campaign Details</h2>
          <p>{campaign.description || <i>No description available</i>}</p>
          <h3 className="text-xl font-semibold mt-4">Main Characters</h3>
          <p>
            <i>No main characters available</i>
          </p>
          <h3 className="text-xl font-semibold mt-4">Latest Happenings</h3>
          <p>
            <i>No latest happenings available</i>
          </p>
        </div>
      </div>

      <h1 className="text-2xl font-bold w-full mt-8 flex justify-start gap-2">
        <span>Sessions</span>
        <Button isIconOnly variant="light" onPress={onOpen}>
          <Icon icon="lucide:plus" className="text-secondary-500" />
        </Button>
      </h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
        {sessions.map((session) => (
          <SessionCard
            key={session._id}
            session={session}
            onPress={() => handleCardClick(session._id)}
          />
        ))}
      </div>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right">
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Add Session
              </DrawerHeader>
              <DrawerBody>
                <CreateSessionForm campaignId={campaignId} onClose={onClose} />
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
