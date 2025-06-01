import { createClerkClient } from '@clerk/backend'
import { api } from '../_generated/api'
import { action } from '../_generated/server'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export const getAllAssociatedUsersDataMap = action({
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
    if (!user) return {}

    const campaigns = await runQuery(
      api.functions.campaigns.listCampaignsWithMembers,
    )

    const flatMembers = campaigns.flatMap((campaign) =>
      campaign.members.map((member) => member),
    )

    const userIds = flatMembers.map((member) => member.userId)

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
