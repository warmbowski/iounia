import { useState } from 'react'
import { Button, Input, Navbar, NavbarContent, NavbarItem } from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { SignInOrSignUpLoginModal } from '../signin-or-signup-login-modal'
import { ProfileButton } from '../profile-button'
import { useAuth } from '@clerk/tanstack-react-start'
import { RouterLink } from '../router-link'
import { APP_TITLE } from '@/constants'
import { useRouteContext } from '@tanstack/react-router'
import { parseJwtPayload } from '@/utils'

interface TopNavProps {
  forceSignIn?: boolean
}

export function TopNav({ forceSignIn }: TopNavProps) {
  const [isSignUpOpen, setIsSignUpOpen] = useState(forceSignIn || false)
  const { signOut } = useAuth()
  const { auth } = useRouteContext({ from: '/app' })
  const payload = auth?.token ? parseJwtPayload(auth.token) : null

  return (
    <Navbar maxWidth="full" isBordered>
      <NavbarContent className="flex-1" justify="start">
        <NavbarItem>
          <RouterLink to="/app" className="flex items-center gap-2">
            <Icon icon="mdi:orbit" className="text-2xl text-primary" />
            <span className="font-bold text-xl">{APP_TITLE}</span>
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
          {payload ? (
            <ProfileButton
              userInfo={{
                fullName: `${payload.given_name} ${payload.family_name}`,
                emailAddress: payload.email,
                imageUrl: payload.picture || '',
              }}
              onLogout={() => signOut()}
            />
          ) : (
            <Button
              color="primary"
              variant="flat"
              onPress={() => setIsSignUpOpen(true)}
            >
              Login/Sign Up
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
