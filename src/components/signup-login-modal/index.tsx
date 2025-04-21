import { useState } from 'react'
import {
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import { Icon } from '@iconify/react'
import type { FormEvent } from 'react'

interface SignUpLoginModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function SignUpLoginModal({
  isOpen,
  onOpenChange,
}: SignUpLoginModalProps) {
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      await login(email, password)
    } else {
      await register(email, password)
    }
    onOpenChange(false)
  }

  const handleGoogleAuth = async () => {
    const userCred = await loginWithGoogle()
    console.log('Logged in with Google:', userCred)
    onOpenChange(false)
  }

  const toggleMode = () => {
    if (pending) return
    setIsLogin((prev) => !prev)
    setPassword('')
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </ModalHeader>
            <ModalBody>
              <Button
                className="w-full mb-4"
                variant="flat"
                color="default"
                startContent={<Icon icon="logos:google-icon" />}
                onPress={handleGoogleAuth}
                isLoading={pending}
              >
                {isLogin ? 'Log in with Google' : 'Sign up with Google'}
              </Button>

              <div className="relative my-4">
                <Divider className="my-4" />
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-content1">
                  OR
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onValueChange={setEmail}
                  isRequired
                />
                <Input
                  label="Password"
                  placeholder={
                    isLogin ? 'Enter your password' : 'Create a password'
                  }
                  type="password"
                  value={password}
                  onValueChange={setPassword}
                  isRequired
                />
                <Button
                  type="submit"
                  color="primary"
                  className="w-full"
                  isLoading={pending}
                >
                  {isLogin ? 'Log In' : 'Create Account'}
                </Button>
              </form>
            </ModalBody>
            <ModalFooter className="flex flex-col items-center pt-2 pb-4">
              <p className="text-center text-small text-default-500">
                {isLogin ? (
                  <>
                    Don't have an account?{' '}
                    <Button
                      variant="light"
                      className="p-0"
                      onPress={toggleMode}
                      disabled={pending}
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
                      disabled={pending}
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
