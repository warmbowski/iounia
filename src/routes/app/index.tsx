import {
  Button,
  Drawer,
  useDisclosure,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { CreateCampaignForm } from '@/components/create-campaign-form'
import { CampaignCard } from '@/components/campaign-card'

export const Route = createFileRoute('/app/')({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/', search: { forceSignIn: true } })
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.campaigns.listCampaigns, {}),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useSuspenseQuery(
    convexQuery(api.functions.campaigns.listCampaigns, {}),
  )
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const navigate = useNavigate()

  const handleCardClick = (campaignId: Id<'campaigns'>) => {
    navigate({
      to: '/app/$campaignId',
      params: { campaignId },
    })
  }

  return (
    <div className="p-6">
      <Button color="primary" onPress={onOpen}>
        Create Campaign
      </Button>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {data.map((campaign) => (
          <CampaignCard
            key={campaign._id}
            campaign={campaign}
            onPress={handleCardClick}
          />
        ))}
      </div>

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right">
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Create Campaign
              </DrawerHeader>
              <DrawerBody>
                <CreateCampaignForm onClose={onClose} />
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
