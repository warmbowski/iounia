import { createRouter as createTanstackRouter } from '@tanstack/react-router'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { addToast } from '@heroui/react'
import { ConvexReactClient } from 'convex/react'
import { ensureViteEnvironmentVariable } from '@/utils'
import { DefaultCatchBoundary } from './components/default-catch-boundary'
import { NotFound } from './components/not-found'

const CONVEX_URL = ensureViteEnvironmentVariable('VITE_CONVEX_URL')

export const convexClient = new ConvexReactClient(CONVEX_URL)
export const convexQueryClient = new ConvexQueryClient(convexClient)
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        addToast({
          title: 'Error',
          description: `${error.message}`,
          color: 'danger',
        })
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
      context: { queryClient, convexQueryClient: convexQueryClient },
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
