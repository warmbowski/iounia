import { getAuth } from '@clerk/tanstack-react-start/server'
import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createClerkClient } from '@clerk/backend'

export const Route = createAPIFileRoute('/api/auth')({
  GET: async ({ request }) => {
    const { userId, getToken } = await getAuth(request)
    const token = await getToken({ template: 'convex' })

    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    const user = userId ? await clerkClient.users.getUser(userId) : null

    return json({ user, token })
  },
})
