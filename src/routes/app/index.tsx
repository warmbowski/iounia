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
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { CreateEditCampaignForm } from '@/components/create-edit-campaign-form'
import { CampaignCard } from '@/components/campaign-card'

export const Route = createFileRoute('/app/')({
  component: Campaigns,
})

function Campaigns() {
  const router = useRouter()
  const { data: campaigns } = useSuspenseQuery(
    convexQuery(api.functions.campaigns.listCampaignsWithMembersByUser, {}),
  )
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const navigate = useNavigate()

  const handleCardClick = (campaignId: Id<'campaigns'>) => {
    navigate({
      to: '/app/$campaignId',
      params: { campaignId },
    })
  }

  const handleCardHover = (campaignId: Id<'campaigns'>) => {
    try {
      router.preloadRoute({
        to: '/app/$campaignId',
        params: { campaignId },
      })
    } catch (err) {
      // Failed to preload route
    }
  }

  return (
    <div className="p-6">
      <Button color="primary" onPress={onOpen}>
        Create Campaign
      </Button>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 mt-6">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign._id}
            campaign={campaign}
            onPress={handleCardClick}
            onHover={handleCardHover}
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
                <CreateEditCampaignForm onClose={onClose} />
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
