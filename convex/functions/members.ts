import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { memberRole, memberStatus } from '../schema'
import { MAX_ACTIVE_MEMBERS_PER_CAMPAIGN_COUNT } from '../constants'
import { checkUserAuthentication } from '../helpers/auth'
import {
  BadRequestError,
  InvalidError,
  NotFoundError,
  UnauthorizedError,
} from '../helpers/errors'

export const createMembershipRequest = mutation({
  args: {
    joinCode: v.string(),
  },
  handler: async ({ db, auth }, { joinCode }) => {
    const userId = await checkUserAuthentication(auth)

    if (!joinCode || joinCode.trim() === '') {
      throw new BadRequestError('Join code is required')
    }

    const campaign = await db
      .query('campaigns')
      .withIndex('by_join_code', (q) => q.eq('joinCode', joinCode))
      .first()
    if (!campaign) {
      throw new NotFoundError('Campaign not found')
    }

    const membershipList = await db
      .query('members')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaign._id))
      .collect()

    const existingMember = membershipList.find(
      (member) => member.userId === userId,
    )

    if (!existingMember) {
      return await db.insert('members', {
        campaignId: campaign._id,
        userId: userId,
        role: 'member',
        status: 'pending',
      })
    }

    if (existingMember?.status === 'active') {
      throw new InvalidError('User is already a member of this campaign')
    } else if (existingMember?.status === 'pending') {
      throw new InvalidError('Membership request is already pending')
    } else if (existingMember?.status === 'banned') {
      // Maybe make this fail silently so as to not leak information?
      throw new InvalidError('User is banned from this campaign')
    } else if (existingMember?.status === 'inactive') {
      // If the user has previously been declined, we can allow them to re-request
      return await db.patch(existingMember._id, { status: 'pending' })
    }

    throw new InvalidError('Unexpected membership status')
  },
})

export const readMembershipsByCampaignId = query({
  args: {
    campaignId: v.id('campaigns'),
  },
  handler: async ({ db, auth }, { campaignId }) => {
    const userId = await checkUserAuthentication(auth)

    const campaign = await db.get(campaignId)
    if (!campaign) {
      throw new NotFoundError('Campaign not found')
    }

    const membershipList = await db
      .query('members')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect()

    const userMembership = membershipList.find(
      (member) => member.userId === userId,
    )
    if (!userMembership) {
      throw new UnauthorizedError('User is not a member of this campaign')
    }

    return membershipList
  },
})

export const updateMembershipById = mutation({
  args: {
    memberId: v.id('members'),
    campaignId: v.id('campaigns'),
    updates: v.union(
      v.object({
        role: memberRole(),
      }),
      v.object({
        status: memberStatus(),
      }),
    ),
  },
  handler: async ({ db, auth }, { campaignId, memberId, updates }) => {
    const userId = await checkUserAuthentication(auth)

    const campaign = await db.get(campaignId)
    if (!campaign) {
      throw new NotFoundError('Campaign not found')
    }

    const membershipList = await db
      .query('members')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect()
    if (
      membershipList.filter((member) => member.status === 'active').length >=
      MAX_ACTIVE_MEMBERS_PER_CAMPAIGN_COUNT
    ) {
      throw new InvalidError(
        `Maximum number of active members reached. Only ${MAX_ACTIVE_MEMBERS_PER_CAMPAIGN_COUNT} active members allowed.`,
      )
    }

    const memberToUpdate = membershipList.find(
      (member) => member._id === memberId,
    )
    if (!memberToUpdate) {
      throw new NotFoundError('Member not found in the campaign')
    }

    const memberRoleCanBeUpdated =
      memberToUpdate.userId === campaign.ownerId ? false : true
    if (!memberRoleCanBeUpdated) {
      throw new InvalidError('Invalid role update for this member')
    }

    const userCanMakeUpdate = membershipList.some(
      (member) => member.userId === userId && member.role === 'admin',
    )
    if (!userCanMakeUpdate) {
      throw new UnauthorizedError(
        'User does not have permission to update membership',
      )
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
    const userId = await checkUserAuthentication(auth)

    const campaign = await db.get(campaignId)
    if (!campaign) {
      throw new NotFoundError('Campaign not found')
    }

    const membershipList = await db
      .query('members')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect()

    const memberToRemove = membershipList.find(
      (member) => member._id === memberId,
    )
    if (!memberToRemove) {
      throw new NotFoundError('Member not found in the campaign')
    }

    const memberCanBeRemoved =
      memberToRemove.userId === campaign.ownerId ? false : true
    if (!memberCanBeRemoved) {
      throw new InvalidError('Invalid member removal for this campaign')
    }

    const userCanMakeUpdate = membershipList.some(
      (member) => member.userId === userId && member.role === 'admin',
    )
    if (!userCanMakeUpdate) {
      throw new UnauthorizedError(
        'User does not have permission to update membership',
      )
    }

    return await db.delete(memberId)
  },
})

export const listMembersAssociatedWithUser = query({
  handler: async ({ db, auth }) => {
    const userId = await checkUserAuthentication(auth)

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
