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
      className="flex flex-col h-screen w-screen max-w-[1440px] mx-auto bg-content relative"
    >
      <TopNav forceSignIn={location?.search?.forceSignIn} />
      <div>
        {isLoading && (
          <Progress
            color="secondary"
            isIndeterminate
            aria-label="Loading page..."
            className="absolute w-full"
            size="sm"
          />
        )}
      </div>
      <BreadcrumbsBar />
      <main id="base-layout-scrollable-area" className="flex-1 overflow-auto">
        {children}
      </main>
    </section>
  )
}
