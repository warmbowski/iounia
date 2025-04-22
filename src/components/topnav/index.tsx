import { useState } from 'react'
import { Button, Input, Navbar, NavbarContent, NavbarItem } from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { ModeToggle } from '../mode-toggle'
import { SignUpLoginModal } from '../signup-login-modal'
import { ProfileButton } from '../profile-button'
import { useAuth, useUser } from '@clerk/tanstack-react-start'

interface TopNavProps {
  showSignIn?: boolean
}

export function TopNav({ showSignIn }: TopNavProps) {
  const [isSignUpOpen, setIsSignUpOpen] = useState(showSignIn || false)
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useAuth()

  return (
    <div>
      <Navbar maxWidth="full" isBordered>
        <NavbarContent className="flex-1" justify="start">
          <NavbarItem>
            <Input
              classNames={{
                base: 'max-w-full sm:max-w-[24rem] h-10',
                mainWrapper: 'h-full',
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

        <NavbarContent justify="end">
          <NavbarItem>
            <ModeToggle />
          </NavbarItem>
          <NavbarItem>
            {user && isSignedIn ? (
              <ProfileButton
                userInfo={{
                  displayName: user.fullName || '',
                  email: user.emailAddresses[0] || '',
                  photoURL: user.imageUrl || '',
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
      </Navbar>

      <SignUpLoginModal isOpen={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
    </div>
  )
}
