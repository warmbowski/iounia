import { ConvexProviderWithClerk as ConvexProvider } from 'convex/react-clerk'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { useAuth } from '@clerk/tanstack-react-start'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL
if (!CONVEX_URL) {
  console.error('missing envar CONVEX_URL')
}
export const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

export default function ConvexProviderWithClerk({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConvexProvider client={convexQueryClient.convexClient} useAuth={useAuth}>
      {children}
    </ConvexProvider>
  )
}
