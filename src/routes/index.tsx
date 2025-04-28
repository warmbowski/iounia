import { createFileRoute } from '@tanstack/react-router'
import { Button, Link } from '@heroui/react'
import logo from '../logo.svg'

export const Route = createFileRoute('/')({
  validateSearch: (search) => {
    if (search.forceSignIn) {
      return { forceSignIn: true }
    }
  },
  component: Home,
})

function Home() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="text-center">
        <header className="min-h-screen flex flex-col items-center justify-center text-[calc(10px+2vmin)]">
          <img
            src={logo}
            className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
            alt="logo"
          />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <div className="flex gap-4">
            <Button
              showAnchorIcon
              as={Link}
              color="primary"
              variant="solid"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </Button>
            <Button
              showAnchorIcon
              as={Link}
              color="primary"
              variant="solid"
              href="https://tanstack.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn TanStack
            </Button>
          </div>
        </header>
      </div>
    </div>
  )
}
