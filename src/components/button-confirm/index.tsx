import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  type ButtonProps,
  type ModalProps,
} from '@heroui/react'

interface ButtonConfirmProps extends Omit<ButtonProps, 'onPress'> {
  modalProps?: ModalProps
  actionType: 'action' | 'deletion' | 'update'
  actionAdditionalInfo?: string
  onConfirm: () => void
}

export const ButtonConfirm = ({
  onConfirm,
  actionType = 'action',
  actionAdditionalInfo,
  ...props
}: ButtonConfirmProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button {...props} onPress={onOpen} />
      <Modal
        {...props.modalProps}
        aria-label="Confirm Action"
        onOpenChange={onOpenChange}
        isOpen={isOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm Action</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to proceed with this {actionType}?</p>
                <p>{actionAdditionalInfo}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button variant="solid" color="primary" onPress={onConfirm}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
