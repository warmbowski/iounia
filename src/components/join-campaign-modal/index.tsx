import { useState } from 'react'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'

interface JoinCampaignModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function JoinCampaignModal({
  isOpen,
  onOpenChange,
}: JoinCampaignModalProps) {
  const [inputValue, setInputValue] = useState('')
  const {
    mutateAsync: requestMembership,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: useConvexMutation(
      api.functions.members.createMembershipRequest,
    ),
  })

  const handleJoinCampaign = () => {
    if (!inputValue.trim()) return
    requestMembership({ joinCode: inputValue })
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      aria-label="Request to Join a Campaign"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Request to Join a Campaign
            </ModalHeader>
            <ModalBody>
              {isSuccess || isError ? (
                <p className="text-center text-small text-default-500">
                  {isSuccess
                    ? 'Successfully requested to join the campaign!'
                    : 'Failed to request to join the campaign.'}
                  <br />
                  {isSuccess
                    ? 'The campaign owner will review your request.'
                    : error.message || 'Please try again later.'}
                </p>
              ) : (
                <Input
                  classNames={{
                    base: 'max-w-full sm:max-w-[24rem] h-10',
                    mainWrapper: 'h-full',
                    inputWrapper: 'h-full',
                    input: 'text-small',
                  }}
                  placeholder="Enter campaign code..."
                  size="sm"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              )}
            </ModalBody>
            <ModalFooter className="flex flex-col items-center pt-2 pb-4">
              <p className="text-center text-small text-default-500">
                {isSuccess || isError ? (
                  <Button
                    variant="light"
                    className="p-0"
                    onPress={onClose}
                    aria-label="Close dialog"
                  >
                    Close
                  </Button>
                ) : (
                  <Button
                    variant="light"
                    className="p-0"
                    onPress={handleJoinCampaign}
                    disabled={isPending}
                    aria-label="Request to Join Campaign"
                  >
                    Join
                  </Button>
                )}
              </p>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
