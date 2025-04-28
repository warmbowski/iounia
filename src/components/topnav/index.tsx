import { useState } from 'react'
import { Button, Input, Navbar, NavbarContent, NavbarItem } from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { SignInOrSignUpLoginModal } from '../signin-or-signup-login-modal'
import { ProfileButton } from '../profile-button'
import { useAuth, useUser } from '@clerk/tanstack-react-start'
import { RouterLink } from '../router-link'

interface TopNavProps {
  forceSignIn?: boolean
}

export function TopNav({ forceSignIn }: TopNavProps) {
  const [isSignUpOpen, setIsSignUpOpen] = useState(forceSignIn || false)
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useAuth()

  return (
    <Navbar maxWidth="full" isBordered>
      <NavbarContent className="flex-1" justify="start">
        <NavbarItem>
          <RouterLink to="/app" className="flex items-center gap-2">
            <Icon icon="mdi:orbit" className="text-2xl text-primary" />
            <span className="font-semibold font-bold text-inherit">
              {import.meta.env.VITE_APP_TITLE}
            </span>
          </RouterLink>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="flex-2">
        <NavbarItem className="w-full">
          <Input
            classNames={{
              base: 'max-w-full sm:max-w-[24rem] h-10',
              mainWrapper: 'h-full',
              inputWrapper: 'h-full',
              input: 'text-small',
            }}
            placeholder="Ask a question..."
            size="sm"
            startContent={
              <Icon icon="lucide:search" className="text-default-400" />
            }
            type="search"
          />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="flex-1" justify="end">
        <NavbarItem>
          {user && isSignedIn ? (
            <ProfileButton
              userInfo={{
                fullName: user.fullName || '',
                emailAddress: user.primaryEmailAddress?.emailAddress || '',
                imageUrl: user.imageUrl || '',
              }}
              onLogout={() => signOut()}
            />
          ) : (
            <Button
              color="primary"
              variant="flat"
              onPress={() => setIsSignUpOpen(true)}
              isLoading={!isLoaded}
            >
              {isLoaded ? 'Login/Sign Up' : 'Checking...'}
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
      <SignInOrSignUpLoginModal
        isOpen={isSignUpOpen}
        onOpenChange={setIsSignUpOpen}
      />
    </Navbar>
  )
}
