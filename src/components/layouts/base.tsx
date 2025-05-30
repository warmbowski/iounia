import { Progress } from '@heroui/react'
import { TopNav } from '../topnav'
import { useRouterState } from '@tanstack/react-router'
import { BreadcrumbsBar } from '../breadcrumbs'

interface BaseLayoutProps {
  children: React.ReactNode
}

export function BaseLayout({ children }: BaseLayoutProps) {
  const { isLoading, location } = useRouterState()

  return (
    <section
      data-layout="base"
      className="flex flex-col h-screen w-screen bg-content"
    >
      <TopNav forceSignIn={location?.search?.forceSignIn} />
      <BreadcrumbsBar />
      <div>
        {isLoading && (
          <Progress
            color="secondary"
            isIndeterminate
            aria-label="Loading page..."
            className="fixed w-100vw"
            size="sm"
          />
        )}
      </div>
      <div id="base-layout-scrollable-area" className="flex-1 overflow-auto">
        {children}
      </div>
    </section>
  )
}
