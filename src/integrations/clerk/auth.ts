import { getAuth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { createClerkClient, type EmailAddress, type User } from '@clerk/backend'
import type { Doc } from 'convex/_generated/dataModel'

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
      console.error('Unauthenticated user from server function')
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    const user = userId ? await clerkClient.users.getUser(userId) : null

    return { user: user, token }
  },
)

export interface MemberUser {
  userId: User['id']
  emailAddress?: EmailAddress['emailAddress']
  fullName?: User['fullName']
  imageUrl?: User['imageUrl']
  role?: Doc<'members'>['role']
  status?: Doc<'members'>['status']
  joined?: Doc<'members'>['_creationTime']
}

export const getUsersListByMembersFn = createServerFn({ method: 'GET' })
  .validator(
    (
      members: Pick<
        Doc<'members'>,
        'userId' | 'role' | 'status' | '_creationTime'
      >[],
    ) => {
      if (!Array.isArray(members)) {
        throw new Error('Invalid input: expected an array of members')
      }
      return members
    },
  )
  .handler(async ({ data: members }): Promise<MemberUser[]> => {
    const request = getWebRequest()
    if (!request) throw new Error('No request found')

    const { userId } = await getAuth(request)
    if (!userId) {
      console.error('Unauthenticated user')
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    const userIds = members.map((member) => {
      // strip out the clerk prefix if it exists
      if (member.userId.includes('|')) {
        return member.userId.split('|')[1]
      }
      return member.userId
    })
    if (!userIds || userIds.length === 0) {
      return []
    }

    const userList = await clerkClient.users.getUserList({ userId: userIds })

    return userList
      ? userList.data.map((user, index) => ({
          userId: user.id,
          emailAddress: user.primaryEmailAddress?.emailAddress,
          fullName: user.fullName || undefined,
          imageUrl: user.imageUrl,
          role: members[index]?.role,
          status: members[index]?.status,
          joined: members[index]?._creationTime,
        }))
      : []
  })
