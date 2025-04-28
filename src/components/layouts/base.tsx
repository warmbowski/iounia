import { Progress } from '@heroui/react'
import { TopNav } from '../topnav'
import { useRouterState } from '@tanstack/react-router'

interface BaseLayoutProps {
  children: React.ReactNode
}

export function BaseLayout({ children }: BaseLayoutProps) {
  const { isLoading, location } = useRouterState()

  return (
    <div className="flex flex-col h-screen bg-content1">
      <TopNav forceSignIn={location?.search?.forceSignIn} />
      {isLoading && (
        <Progress
          isIndeterminate
          aria-label="Loading page..."
          className="fixed w-100vw"
          size="sm"
        />
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
