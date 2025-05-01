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
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { Id } from 'convex/_generated/dataModel'
import { CreateSessionForm } from '@/components/create-session-form'

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
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const navigate = useNavigate()

  const handleCardClick = (sessionId: Id<'sessions'>) => {
    console.log('navigate to:', campaignId, sessionId)
    navigate({
      to: '/app/$campaignId/session/$sessionId',
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
              <p>{session.notes}</p>
              <p className="text-sm text-gray-500">
                {new Date(session.date).toLocaleDateString()}
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
