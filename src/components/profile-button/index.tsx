import { THEME_LS_KEY } from '@/constants'
import { useTheme } from '@/hooks/use-theme'
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'

interface ProfileButtonProps {
  userInfo: {
    fullName: string
    emailAddress: string
    imageUrl: string
  }
  onLogout?: () => void
}

export function ProfileButton({ userInfo, onLogout }: ProfileButtonProps) {
  const { theme, setTheme } = useTheme(undefined, THEME_LS_KEY)
  const isDark = theme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div>
      <Dropdown placement="bottom">
        <DropdownTrigger>
          <Button variant="flat" className="w-full justify-start">
            <div className="flex items-center gap-3">
              <Avatar
                src={userInfo.imageUrl}
                size="sm"
                isBordered
                alt="Profile image"
              />
              <div className="flex flex-col items-start">
                <span className="text-sm">
                  {userInfo.fullName || userInfo.emailAddress}
                </span>
                <span className="text-xs text-default-500">View Profile</span>
              </div>
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions">
          <DropdownItem
            key="settings"
            startContent={<Icon icon="lucide:settings" className="text-lg" />}
          >
            Settings
          </DropdownItem>
          <DropdownItem
            key="theme"
            startContent={
              <Icon
                icon={isDark ? 'lucide:sun' : 'lucide:moon'}
                className="text-lg"
              />
            }
            onPress={handleToggle}
          >
            Theme
          </DropdownItem>
          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            startContent={<Icon icon="lucide:log-out" className="text-lg" />}
            onPress={() => {
              onLogout && onLogout()
            }}
          >
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
