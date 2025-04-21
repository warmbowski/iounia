import { createFileRoute } from '@tanstack/react-router'
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
import { FileUploadForm } from '@/components/file-upload-form'

export const Route = createFileRoute('/app/sessions')({
  component: Sessions,
})

function Sessions() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <div className="p-8">
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
