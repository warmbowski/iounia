import { CampaignCard } from '@/components/campaign-card'
import { CreateEditSessionForm } from '@/components/create-edit-session-form'
import { MemberGroup } from '@/components/member-group'
import { SessionCard } from '@/components/session-card'
import { useUser } from '@clerk/tanstack-react-start'
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
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

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
  const router = useRouter()
  const { user } = useUser()
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
  const { mutateAsync: updateCampaign, isPending: isUpdating } = useMutation({
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

  const handleCardHover = (sessionId: Id<'sessions'>) => {
    try {
      router.preloadRoute({
        to: '/app/$campaignId/session/$sessionId',
        params: { campaignId, sessionId },
      })
    } catch (err) {
      // Failed to preload route
    }
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-[350px_minmax(350px,_auto)] gap-8">
        <CampaignCard campaign={campaign} />
        <div>
          <h2 className="text-xl font-bold">Campaign Details</h2>
          <p className="text-balance">
            {campaign.description || <i>No description available</i>}
          </p>
          <h3 className="text-xl font-semibold mt-4">Latest Happenings</h3>
          <p>
            {sessions[0] ? (
              `${sessions[0].name}: ${sessions[0].shortSummary || 'No session summary available'}`
            ) : (
              <i>No sessions</i>
            )}
          </p>
          <h3 className="text-xl font-semibold mt-4 flex justify-between items-center">
            <span>Active Members</span>
          </h3>

          {campaign.members.length > 0 ? (
            <MemberGroup
              className="mt-2"
              members={campaign.members}
              filter={(member) => member.status === 'active'}
              max={10}
              isGrid
            />
          ) : (
            <p>
              <i>No active members</i>
            </p>
          )}

          {campaign.ownerId === user?.id && (
            <>
              <h3 className="text-xl font-semibold mt-4 flex justify-between items-center">
                <span>Join Requests</span>
              </h3>
              <div className="flex items-center justify-between">
                <MemberGroup
                  className="mt-2"
                  members={campaign.members}
                  filter={(member) => member.status !== 'active'}
                  max={10}
                  isGrid
                />
                <ButtonGroup className="flex items-center">
                  <Snippet
                    size="sm"
                    symbol="code"
                    className="h-[40px] rounded-l-[12px] rounded-r-none"
                  >
                    {campaign.joinCode}
                  </Snippet>
                  <Button
                    variant="flat"
                    size="md"
                    isIconOnly
                    disabled={
                      user?.id ? !campaign.ownerId.endsWith(user.id) : true
                    }
                    isLoading={isUpdating}
                    onPress={() =>
                      updateCampaign({
                        campaignId,
                        updates: { joinCode: true },
                      })
                    }
                  >
                    <Icon
                      icon="lucide:refresh-cw"
                      className="w-[18px] h-[18px]"
                    />
                  </Button>
                </ButtonGroup>
              </div>
            </>
          )}
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
            onPress={handleCardClick}
            onHover={handleCardHover}
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
                  type="create"
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
