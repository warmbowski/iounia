import { FileUploadForm } from '@/components/file-upload-form'
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
import { Icon } from '@iconify/react/dist/iconify.js'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/app/$campaignId/sessions/$sessionId')({
  parseParams: (params) => {
    const { sessionId } = params
    if (typeof sessionId !== 'string') {
      throw new Error('Invalid sessionId')
    }
    return { sessionId: sessionId as Id<'sessions'> }
  },
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      convexQuery(api.functions.sessions.readSession, {
        campaignId: params.campaignId,
        sessionId: params.sessionId,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { campaignId, sessionId } = Route.useParams()
  const { data } = useSuspenseQuery(
    convexQuery(api.functions.sessions.readSession, {
      campaignId: campaignId,
      sessionId: sessionId,
    }),
  )
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <div className="p-8">
      <div className="mb-8">{JSON.stringify(data)}</div>

      <Button
        color="primary"
        startContent={<Icon icon="lucide:upload" />}
        onPress={onOpen}
      >
        Upload Audio
      </Button>

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right">
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Upload Audio
              </DrawerHeader>
              <DrawerBody>
                <FileUploadForm onClose={onClose} />
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
