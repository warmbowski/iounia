import { useState } from 'react'
import { Button, Divider, Input } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useNavigate } from '@tanstack/react-router'
import { useSignIn } from '@clerk/tanstack-react-start'
import { isClerkAPIResponseError } from '@clerk/tanstack-react-start/errors'
import { type ClerkAPIError } from '@clerk/types'

export default function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<ClerkAPIError[]>()

  const handleGoogleAuth = async () => {}

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
    <>
      <Button
        className="w-full mb-4"
        variant="flat"
        color="default"
        startContent={<Icon icon="logos:google-icon" />}
        onPress={handleGoogleAuth}
        isLoading={pending}
        disabled={!isLoaded}
      >
        Sign in with Google
      </Button>

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
          placeholder="Enter your password"
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
          disabled={!isLoaded}
        >
          Sign In
        </Button>
      </form>
      {errors && (
        <ul>
          {errors.map((err, index) => (
            <li key={index}>{err.longMessage}</li>
          ))}
        </ul>
      )}
    </>
  )
}
