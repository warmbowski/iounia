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
      // throw redirect({
      //   to: '/',
      // })
      console.error('Unauthenticated user')
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    const user = userId ? await clerkClient.users.getUser(userId) : null

    return { user: user, token }
  },
)

export const getUsersListByIdsFn = createServerFn({ method: 'GET' })
  .validator((userIds: string[]) => {
    const ids = userIds.map((id) => {
      if (id.includes('|')) {
        return id.split('|')[1]
      }
      return id
    })
    return ids
  })
  .handler(async (ctx) => {
    const request = getWebRequest()
    if (!request) throw new Error('No request found')

    const { userId } = await getAuth(request)
    if (!userId) {
      console.error('Unauthenticated user')
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    const userIds = ctx.data
    if (!userIds || userIds.length === 0) {
      return null
    }

    const userList = await clerkClient.users.getUserList({ userId: userIds })

    return userList
      ? userList.data.map((user) => ({
          userId: user.id,
          emailAddress: user.primaryEmailAddress?.emailAddress,
          fullName: user.fullName || undefined,
          imageUrl: user.imageUrl,
        }))
      : null
  })
