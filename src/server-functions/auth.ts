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
      //  throw redirect({ to: '/', search: { forceSignIn: true } })
      console.error('Unauthenticated user from server function')
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    const user = userId ? await clerkClient.users.getUser(userId) : null

    return { user, token }
  },
)

export const getAuthTokenFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getWebRequest()
    if (!request) throw new Error('No request found')

    let token: string | null = null
    try {
      const { getToken } = await getAuth(request)
      token = await getToken({ template: 'convex' })
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
    console.log('getAuthTokenFn called', token?.slice(0, 10))

    if (!token) {
      console.error('Unauthenticated user from server function')
    }

    return token || null
  },
)
