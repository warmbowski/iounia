import { createRouter as createTanstackRouter } from '@tanstack/react-router'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { ConvexReactClient } from 'convex/react'
import { apiErrorToToast, ensureViteEnvironmentVariable } from '@/utils'
import { DefaultCatchBoundary } from './components/default-catch-boundary'
import { NotFound } from './components/not-found'

const CONVEX_URL = ensureViteEnvironmentVariable('VITE_CONVEX_URL')
export const convexClient = new ConvexReactClient(CONVEX_URL)
export const convexQueryClient = new ConvexQueryClient(convexClient, {
  dangerouslyUseInconsistentQueriesDuringSSR: true,
})

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Do not trigger toasts when queryies are run on the server,
      if (typeof window === 'undefined') return

      if (query.state.data !== undefined) {
        console.error('Query Cache error:', error)
        apiErrorToToast(error)
      }
    },
  }),
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
      staleTime: Infinity, // Disable automatic refetching
      gcTime: 10 * 1000, // 10 seconds
    },
  },
})
convexQueryClient.connect(queryClient)

// Create a new router instance
export const createRouter = () => {
  const router = routerWithQueryClient(
    createTanstackRouter({
      routeTree,
      context: {
        queryClient,
        convexQueryClient: convexQueryClient,
        auth: { token: null },
      },
      scrollRestoration: true,
      scrollToTopSelectors: ['#base-layout-scrollable-area'],
      defaultPreload: 'intent',
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
    }),
    queryClient,
  )

  return router
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
