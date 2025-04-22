import { Button, Progress } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useRouterState } from '@tanstack/react-router'

import { RouterLink } from '@/components/router-link'
import { TopNav } from '@/components/topnav'

const navigationItems = [
  { name: 'Home', path: '/app/', icon: 'lucide:home' },
  { name: 'Overview', path: '/app/overview', icon: 'lucide:folder' },
  { name: 'Sessoins', path: '/app/sessions', icon: 'lucide:folder' },
]

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { location, isLoading } = useRouterState()

  return (
    <div>
      {isLoading && (
        <Progress
          isIndeterminate
          aria-label="Loading page..."
          className="fixed w-100vw"
          size="sm"
        />
      )}
      <div className="flex h-screen bg-content1">
        {/* Sidebar */}
        <aside className="w-64 flex flex-col justify-between border-r border-divider">
          {/* Logo */}
          <div className="flex p-4 border-b border-divider">
            <RouterLink to="/app" className="flex items-center gap-2">
              <Icon icon="mdi:orbit" className="text-2xl text-primary" />
              <span className="font-semibold font-bold text-inherit">
                {import.meta.env.VITE_APP_TITLE}
              </span>
            </RouterLink>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Button
                      as={RouterLink}
                      to={item.path}
                      variant="flat"
                      color={isActive ? 'primary' : 'default'}
                      className="w-full justify-start"
                    >
                      <Icon icon={item.icon} className="text-lg mr-2" />
                      {item.name}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <TopNav />

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
