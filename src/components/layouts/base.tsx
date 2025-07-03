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
      <div className="relative h-0 ">
        {isLoading && (
          <Progress
            color="secondary"
            isIndeterminate
            aria-label="Loading page..."
            className="absolute w-full"
            size="sm"
          />
        )}
        <BreadcrumbsBar />
      </div>
      <main
        id="base-layout-scrollable-area"
        className="flex-1 pt-6 overflow-auto bg-gradient-to-br from-default-50 from-20% via-primary-50 via-80% to-secondary-200"
      >
        {children}
      </main>
    </section>
  )
}
