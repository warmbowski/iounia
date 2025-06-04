import { createClerkClient } from '@clerk/backend'
import { api } from '../_generated/api'
import { action } from '../_generated/server'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

const checkUserAuthentication = action({
  handler: async ({ auth }) => {
    const user = await auth.getUserIdentity()
    if (!user) {
      return null
    }
    return user
  },
})

export const getMapOfUsersAssociatedWithUser = action({
  handler: async ({
    runQuery,
    auth,
  }): Promise<{
    [k: string]: {
      emailAddress: string | undefined
      fullName: string | undefined
      imageUrl: string
    }
  }> => {
    const user = await auth.getUserIdentity()
    if (!user) {
      throw new Error('Unauthorized: User not authenticated')
    }

    const members = await runQuery(
      api.functions.members.listMembersAssociatedWithUser,
    )

    const userIds = members.map((member) => member.userId)

    const userList = await clerkClient.users.getUserList({
      userId: userIds,
    })

    return Object.fromEntries(
      userList.data.map((user) => [
        user.id,
        {
          emailAddress: user?.primaryEmailAddress?.emailAddress,
          fullName: user?.fullName || undefined,
          imageUrl: user?.imageUrl,
        },
      ]),
    )
  },
})
