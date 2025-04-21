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
  userInfo: Pick<UserDoc, 'displayName' | 'email' | 'photoURL'>
  onLogout?: () => void
}

export function ProfileButton({ userInfo, onLogout }: ProfileButtonProps) {
  return (
    <div>
      <Dropdown placement="bottom">
        <DropdownTrigger>
          <Button variant="flat" className="w-full justify-start">
            <div className="flex items-center gap-3">
              <Avatar
                src={userInfo.photoURL}
                size="sm"
                isBordered
                alt="Profile image"
              />
              <div className="flex flex-col items-start">
                <span className="text-sm">{userInfo.displayName}</span>
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
          {/* <DropdownItem
            key="theme"
            startContent={<Icon icon="lucide:palette" className="text-lg" />}
          >
            Theme
          </DropdownItem> */}
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
