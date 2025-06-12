import { useState } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import { useAuth } from '@clerk/tanstack-react-start'
import SignInForm from './signin-form'
import SignUpForm from './signup-form'

interface AccessModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function AccessModal({ isOpen, onOpenChange }: AccessModalProps) {
  const { isLoaded } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  const toggleMode = () => {
    setIsLogin((prev) => !prev)
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      aria-label={
        isLogin ? 'Sign in to your account' : 'Sign up for a new account'
      }
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </ModalHeader>
            <ModalBody>{isLogin ? <SignInForm /> : <SignUpForm />}</ModalBody>
            <ModalFooter className="flex flex-col items-center pt-2 pb-4">
              <p className="text-center text-small text-default-500">
                {isLogin ? (
                  <>
                    Don't have an account?{' '}
                    <Button
                      variant="light"
                      className="p-0"
                      onPress={toggleMode}
                      disabled={!isLoaded}
                      aria-label="Switch to sign-up form"
                    >
                      Sign up
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Button
                      variant="light"
                      className="p-0"
                      onPress={toggleMode}
                      disabled={!isLoaded}
                      aria-label="Switch to login form"
                    >
                      Log in
                    </Button>
                  </>
                )}
              </p>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
