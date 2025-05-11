import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Button,
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
import { SessionCard } from '@/components/session-card'

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {data.map((session) => (
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
