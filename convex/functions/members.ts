import { v } from 'convex/values'
import { action, mutation, query } from '../_generated/server'
import { memberRole, memberStatus } from '../schema'
import { MAX_ACTIVE_MEMBERS_PER_CAMPAIGN_COUNT } from '../constants'
import { Doc } from '../_generated/dataModel'
import { createClerkClient, type EmailAddress, type User } from '@clerk/backend'
import { api } from '../_generated/api'
import { getTokenIdentifierParts } from '../utililties'

export const createMembershipRequest = mutation({
  args: {
    joinCode: v.string(),
  },
  handler: async ({ db, auth }, { joinCode }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')
    const userId = getTokenIdentifierParts(user.tokenIdentifier).id

    if (!joinCode || joinCode.trim() === '') {
      throw new Error('Join code is required')
    }

    const campaign = await db
      .query('campaigns')
      .withIndex('by_join_code', (q) => q.eq('joinCode', joinCode))
      .first()
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    const membershipList = await db
      .query('members')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaign._id))
      .collect()

    const existingMember = membershipList.find(
      (member) => member.userId === userId,
    )
    if (existingMember?.status === 'active') {
      throw new Error('User is already a member of this campaign')
    } else if (existingMember?.status === 'pending') {
      throw new Error('Membership request is already pending')
    } else if (existingMember?.status === 'banned') {
      // Maybe make this fail silently so as to not leak information?
      throw new Error('User is banned from this campaign')
    } else if (existingMember?.status === 'inactive') {
      // If the user has previously been declined, we can allow them to re-request
      return await db.patch(existingMember._id, { status: 'pending' })
    }

    return await db.insert('members', {
      campaignId: campaign._id,
      userId: userId,
      role: 'member',
      status: 'pending',
    })
  },
})

export const updateMembershipById = mutation({
  args: {
    memberId: v.id('members'),
    campaignId: v.id('campaigns'),
    updates: v.object({
      role: v.optional(memberRole()),
      status: v.optional(memberStatus()),
    }),
  },
  handler: async ({ db, auth }, { campaignId, memberId, updates }) => {
    const { role, status } = updates
    if (!role && !status) {
      throw new Error('An updatable field must be provided')
    }
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')
    const userId = getTokenIdentifierParts(user.tokenIdentifier).id

    const campaign = await db.get(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    const membershipList = await db
      .query('members')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect()
    if (
      membershipList.filter((member) => member.status === 'active').length >=
      MAX_ACTIVE_MEMBERS_PER_CAMPAIGN_COUNT
    ) {
      throw new Error(
        `Maximum number of active members reached. Only ${MAX_ACTIVE_MEMBERS_PER_CAMPAIGN_COUNT} active members allowed.`,
      )
    }

    const memberToUpdate = membershipList.find(
      (member) => member._id === memberId,
    )
    if (!memberToUpdate) {
      throw new Error('Member not found in the campaign')
    }

    const memberRoleCanBeUpdated =
      memberToUpdate.userId === campaign.ownerId ? false : true
    if (!memberRoleCanBeUpdated) {
      throw new Error('Invalid role update for this member')
    }

    const userCanMakeUpdate = membershipList.some(
      (member) => member.userId === userId && member.role === 'admin',
    )
    if (!userCanMakeUpdate) {
      throw new Error('User does not have permission to update membership')
    }

    return await db.patch(memberId, { ...updates })
  },
})

export const removeMembershipById = mutation({
  args: {
    memberId: v.id('members'),
    campaignId: v.id('campaigns'),
  },
  handler: async ({ db, auth }, { campaignId, memberId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')
    const userId = getTokenIdentifierParts(user.tokenIdentifier).id

    const campaign = await db.get(campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    const membershipList = await db
      .query('members')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect()

    const memberToRemove = membershipList.find(
      (member) => member._id === memberId,
    )
    if (!memberToRemove) {
      throw new Error('Member not found in the campaign')
    }

    const memberCanBeRemoved =
      memberToRemove.userId === campaign.ownerId ? false : true
    if (!memberCanBeRemoved) {
      throw new Error('Invalid member removal for this campaign')
    }

    const userCanMakeUpdate = membershipList.some(
      (member) => member.userId === userId && member.role === 'admin',
    )
    if (!userCanMakeUpdate) {
      throw new Error('User does not have permission to update membership')
    }

    return await db.delete(memberId)
  },
})

interface MemberUser {
  memberId: Doc<'members'>['_id']
  userId: User['id']
  campaignId: Doc<'members'>['campaignId']
  emailAddress?: EmailAddress['emailAddress']
  fullName?: User['fullName']
  imageUrl?: User['imageUrl']
  role?: Doc<'members'>['role']
  status?: Doc<'members'>['status']
  joined?: Doc<'members'>['_creationTime']
}

export const listAllAssociatedMembersWithUserData = action({
  handler: async ({ runQuery, auth }): Promise<MemberUser[]> => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const campaigns = await runQuery(
      api.functions.campaigns.listCampaignsWithMembers,
    )

    const flatMembers = campaigns.flatMap((campaign) =>
      campaign.members.map((member) => member),
    )
    if (flatMembers.length === 0) {
      return []
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    const userIds = flatMembers.map((member) => {
      if (member.userId.includes('|')) {
        return member.userId.split('|')[1]
      }
      return member.userId
    })
    if (!userIds || userIds.length === 0) {
      return []
    }

    const userList = await clerkClient.users.getUserList({
      userId: userIds,
    })

    const userIdMap = new Map(userList.data.map((user) => [user.id, user]))

    return flatMembers.map((member, index) => ({
      memberId: member._id,
      userId: member.userId,
      campaignId: member.campaignId,
      emailAddress: userIdMap.get(member.userId)?.primaryEmailAddress
        ?.emailAddress,
      fullName: userIdMap.get(member.userId)?.fullName || undefined,
      imageUrl: userIdMap.get(member.userId)?.imageUrl,
      role: member?.role,
      status: member?.status,
      joined: member?._creationTime,
    }))
  },
})
