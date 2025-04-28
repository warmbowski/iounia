import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  useDisclosure,
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { FileUploadForm } from '@/components/file-upload-form'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/app/$campaignId/sessions')({
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.sessions.listSessions, {
        campaignId: params.campaignId,
      }),
    )
  },
  component: Sessions,
})

function Sessions() {
  const { campaignId } = Route.useParams()
  const { data } = useSuspenseQuery(
    convexQuery(api.functions.sessions.listSessions, {
      campaignId: campaignId,
    }),
  )
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleCardClick = (sessionId: Id<'sessions'>) => {
    navigate({
      to: '/app/$campaignId/sessions/$sessionId',
      params: { campaignId, sessionId },
    })
  }

  return (
    <div className="p-6">
      <Button color="primary" onPress={onOpen}>
        Add Session
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {data.map((session) => (
          <Card
            key={session._id}
            isPressable
            onPress={() => handleCardClick(session._id)}
          >
            <CardHeader>
              {session.sessionNumber} - {session.name}
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-500">
                {new Date(session.date).toLocaleDateString()}
              </p>
              <p>{session.summary}</p>
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
                  <Button type="submit" color="primary">
                    Add Session
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
