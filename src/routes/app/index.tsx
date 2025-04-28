import {
  Button,
  Drawer,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  useDisclosure,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from '@heroui/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from 'convex/_generated/api'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/app/')({
  beforeLoad: async ({ context }) => {
    if (!context.userId) {
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
  const createCampaign = useMutation({
    mutationFn: useConvexMutation(api.functions.campaigns.createCampaign),
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [gameSystem, setGameSystem] = useState('')
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createCampaign.mutateAsync({ name, description, gameSystem })
    setName('')
    setDescription('')
    setGameSystem('')
    onClose()
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {data.map((campaign) => (
          <Card
            key={campaign._id}
            isPressable
            onPress={() => handleCardClick(campaign._id)}
          >
            <CardHeader>{campaign.name}</CardHeader>
            <CardBody>
              <p>{campaign.description}</p>
              <p className="text-sm text-gray-500">
                Game System: {campaign.gameSystem}
              </p>
            </CardBody>
          </Card>
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
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter campaign name"
                    label="Campaign Name"
                    required
                  />

                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter campaign description"
                    label="Description"
                    required
                  />

                  <Input
                    id="gameSystem"
                    value={gameSystem}
                    onChange={(e) => setGameSystem(e.target.value)}
                    placeholder="Enter game system"
                    label="Game System"
                    required
                  />

                  <Button type="submit" color="primary">
                    Create Campaign
                  </Button>
                </form>
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
