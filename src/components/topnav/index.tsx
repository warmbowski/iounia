import { useState } from 'react'
import { Button, Input, Navbar, NavbarContent, NavbarItem } from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { AccessModal } from '../access-modal'
import { ProfileButton } from '../profile-button'
import { useAuth, useUser } from '@clerk/tanstack-react-start'
import { RouterLink } from '../router-link'
import { APP_TITLE } from '@/constants'
import { useLocation, useRouter } from '@tanstack/react-router'

interface TopNavProps {
  forceSignIn?: boolean
}

export function TopNav({ forceSignIn }: TopNavProps) {
  const [accessModalOpen, setAccessModalOpen] = useState(forceSignIn || false)
  const router = useRouter()
  const location = useLocation()
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useAuth()

  const handleCloseAccessModal = () => {
    setAccessModalOpen(false)
    if (forceSignIn) {
      router.navigate({ to: '/' })
    }
  }

  return (
    <Navbar maxWidth="full" isBordered>
      <NavbarContent
        className="sm:flex-1 flex-none sm:data-[justify=start]:grow-1 data-[justify=start]:grow-0"
        justify="start"
      >
        <NavbarItem>
          <RouterLink to="/app" className="flex items-center gap-2">
            <Icon icon="lucide:orbit" className="text-2xl text-primary" />
            <span className="font-bold text-xl sm:inline hidden">
              {APP_TITLE}
            </span>
          </RouterLink>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="flex-auto sm:flex-3">
        <NavbarItem className="w-full">
          {isSignedIn && location.pathname.startsWith('/app/') && (
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
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent
        className="sm:flex-1 flex-none sm:data-[justify=end]:grow-1 data-[justify=end]:grow-0"
        justify="end"
      >
        <NavbarItem>
          {user && isSignedIn ? (
            <ProfileButton
              userInfo={{
                fullName: user.fullName || '',
                emailAddress: user.primaryEmailAddress?.emailAddress || '',
                imageUrl: user.imageUrl || '',
              }}
              onLogout={() => {
                signOut()
                router.invalidate()
              }}
            />
          ) : (
            <Button
              color="primary"
              variant="flat"
              onPress={() => setAccessModalOpen(true)}
              isLoading={!isLoaded}
            >
              {isLoaded ? 'Login/Sign Up' : 'Checking...'}
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
      <AccessModal
        isOpen={accessModalOpen}
        onOpenChange={handleCloseAccessModal}
      />
    </Navbar>
  )
}
