import { getAuth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { createClerkClient } from '@clerk/backend'

export const authStateFn = createServerFn({ method: 'GET' }).handler(
  // @ts-expect-error
  async () => {
    const request = getWebRequest()
    if (!request) throw new Error('No request found')
    const { userId, getToken } = await getAuth(request)
    const token = await getToken({ template: 'convex' })

    if (!userId) {
      // This will error because you're redirecting to a path that doesn't exist yet
      // You can create a sign-in route to handle this
      // See https://clerk.com/docs/references/tanstack-start/custom-sign-in-or-up-page

      // throw redirect({
      //   to: '/',
      // })
      console.log('Unauthenticated user')
    }

    // Instantiate the Backend SDK
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    // Get the user's full `Backend User` object
    const user = userId ? await clerkClient.users.getUser(userId) : null

    return { user, token }
  },
)
