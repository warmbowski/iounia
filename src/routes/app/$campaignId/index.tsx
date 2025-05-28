import { CampaignCard } from '@/components/campaign-card'
import { CreateEditSessionForm } from '@/components/create-edit-session-form'
import { MemberGroup } from '@/components/member-group'
import { SessionCard } from '@/components/session-card'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import {
  Button,
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Snippet,
  useDisclosure,
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

// const VITE_CONVEX_URL = import.meta.env.VITE_CONVEX_URL

export const Route = createFileRoute('/app/$campaignId/')({
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.campaigns.readCampaignWithMembers, {
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
  const navigate = useNavigate()
  const { data: campaign } = useSuspenseQuery(
    convexQuery(api.functions.campaigns.readCampaignWithMembers, {
      campaignId: campaignId,
    }),
  )
  const { data: sessions } = useSuspenseQuery(
    convexQuery(api.functions.sessions.listSessions, {
      campaignId: campaignId,
    }),
  )
  const { mutateAsync: updateCampaign } = useMutation({
    mutationFn: useConvexMutation(api.functions.campaigns.updateCampaign),
  })
  const {
    isOpen: drawerOpen,
    onOpen: onDrawerOpen,
    onOpenChange: onDrawerOpenChange,
  } = useDisclosure()

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
          <p className="text-balance">
            {campaign.description || <i>No description available</i>}
          </p>
          <h3 className="text-xl font-semibold mt-4 flex justify-between items-center">
            <span>Members</span>
            <ButtonGroup className="flex items-center gap-1">
              <Snippet
                size="sm"
                symbol=""
                className="h-[40px] rounded-l-[12px] rounded-r-none"
              >
                {campaign.joinCode}
              </Snippet>
              <Button
                variant="flat"
                size="md"
                isIconOnly
                onPress={() =>
                  updateCampaign({ campaignId, updates: { joinCode: true } })
                }
              >
                <Icon icon="lucide:refresh-cw" className="w-[18px] h-[18px]" />
              </Button>
            </ButtonGroup>
          </h3>
          <p>
            {campaign.members.length > 0 ? (
              <MemberGroup
                campaign={campaign}
                statusFilter="active"
                max={10}
                isGrid
              />
            ) : (
              <i>No active members</i>
            )}
          </p>
          <h3 className="text-xl font-semibold mt-4">Latest Happenings</h3>
          <p>
            {sessions[0] ? (
              `${sessions[0].name}: ${sessions[0].shortSummary || 'No session summary available'}`
            ) : (
              <i>No sessions</i>
            )}
          </p>
        </div>
      </div>

      <h1 className="text-2xl font-bold w-full mt-8 flex justify-start gap-2">
        <span>Sessions</span>
        <Button isIconOnly variant="light" onPress={onDrawerOpen}>
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
      <Drawer
        isOpen={drawerOpen}
        onOpenChange={onDrawerOpenChange}
        placement="right"
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Add Session
              </DrawerHeader>
              <DrawerBody>
                <CreateEditSessionForm
                  campaignId={campaignId}
                  onClose={onClose}
                />
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
