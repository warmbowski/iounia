import { useState } from 'react'
import { Button, Input, Navbar, NavbarContent, NavbarItem } from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { ModeToggle } from '../mode-toggle'
import { SignUpLoginModal } from '../signup-login-modal'
import { ProfileButton } from '../profile-button'

export function TopNav() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const userInfo = null // Replace with actual user info from context or state

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
            {userInfo ? (
              <ProfileButton
                userInfo={{
                  displayName: userInfo.displayName || '',
                  email: userInfo.email || '',
                  photoURL: userInfo.photoURL || '',
                }}
                onLogout={() => logout()}
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
      </Navbar>

      <SignUpLoginModal isOpen={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
    </div>
  )
}
