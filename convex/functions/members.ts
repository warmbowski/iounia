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

export const readMembershipsByCampaignId = query({
  args: {
    campaignId: v.id('campaigns'),
  },
  handler: async ({ db, auth }, { campaignId }) => {
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

    const userMembership = membershipList.find(
      (member) => member.userId === userId,
    )
    if (!userMembership) {
      throw new Error('User is not a member of this campaign')
    }

    return membershipList
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

export const listMembersAssociatedWithUser = query({
  handler: async ({ db, auth }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')
    const { id: userId } = getTokenIdentifierParts(user.tokenIdentifier)

    const myMemberships = await db
      .query('members')
      .withIndex('by_campaign_member', (q) => q.eq('userId', userId))
      .collect()

    const userLists = await Promise.all(
      myMemberships
        .filter((me) => me.status === 'active')
        .map(async (me) => {
          const campaignMembers = await db
            .query('members')
            .withIndex('by_campaign', (q) => q.eq('campaignId', me.campaignId))
            .collect()

          return campaignMembers
        }),
    )
    return userLists.flat().map((member) => member)
  },
})
