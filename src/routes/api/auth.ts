import { getAuth } from '@clerk/tanstack-react-start/server'
import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createClerkClient } from '@clerk/backend'

export const Route = createAPIFileRoute('/api/auth')({
  GET: async ({ request }) => {
    // Use `getAuth()` to retrieve the user's ID
    const { userId } = await getAuth(request)

    // Protect the API route by checking if the user is signed in
    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Instantiate the Backend SDK
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    // Get the user's full `Backend User` object
    const user = userId ? await clerkClient.users.getUser(userId) : null

    return json({ user })
  },
})
