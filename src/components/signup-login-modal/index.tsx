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
import { useNavigate } from '@tanstack/react-router'
import { useSignIn } from '@clerk/tanstack-react-start'
import { isClerkAPIResponseError } from '@clerk/tanstack-react-start/errors'
import { type ClerkAPIError } from '@clerk/types'

interface SignUpLoginModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function SignUpLoginModal({
  isOpen,
  onOpenChange,
}: SignUpLoginModalProps) {
  const { isLoaded, signIn, setActive } = useSignIn()
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<ClerkAPIError[]>()

  const toggleMode = () => {
    if (pending) return
    setIsLogin((prev) => !prev)
    setEmail('')
    setPassword('')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any errors that may have occurred during previous form submission
    setErrors(undefined)
    setPending(true)

    if (!isLoaded) {
      setPending(false)
      return
    }

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      })
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        navigate({
          to: '/app',
        })
        onOpenChange(false)
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setErrors(err.errors)
      }
      console.error(JSON.stringify(err, null, 2))
    } finally {
      // Set pending to false after the sign-in attempt is complete
      setPending(false)
    }
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
              {/* <Button
                className="w-full mb-4"
                variant="flat"
                color="default"
                startContent={<Icon icon="logos:google-icon" />}
                onPress={handleGoogleAuth}
                isLoading={pending}
              >
                {isLogin ? 'Log in with Google' : 'Sign up with Google'}
              </Button> */}

              <div className="relative my-4">
                <Divider className="my-4" />
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-content1">
                  OR
                </p>
              </div>

              <form onSubmit={handleSignIn} className="flex flex-col gap-4">
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
              {errors && (
                <ul>
                  {errors.map((err, index) => (
                    <li key={index}>{err.longMessage}</li>
                  ))}
                </ul>
              )}
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
