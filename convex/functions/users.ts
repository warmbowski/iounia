import { createClerkClient } from '@clerk/backend'
import { api } from '../_generated/api'
import { action } from '../_generated/server'
import { checkUserAuthentication } from '../helpers/auth'
import { ensureServerEnironmentVariable } from '../helpers/utililties'

const CLERK_SECRET_KEY = ensureServerEnironmentVariable('CLERK_SECRET_KEY')

const clerkClient = createClerkClient({
  secretKey: CLERK_SECRET_KEY,
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
    await checkUserAuthentication(auth)

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
