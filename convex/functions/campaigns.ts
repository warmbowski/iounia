import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { generateSecureAlphanumericCode } from '../helpers/utililties'
import { MAX_CAMPAIGNS_PER_USER_COUNT } from '../constants'
import { checkUserAuthentication } from '../helpers/auth'
import {
  InvalidError,
  NotFoundError,
  UnauthorizedError,
} from '../helpers/errors'

export const createCampaign = mutation({
  args: {
    name: v.string(),
    startDate: v.optional(v.string()),
    description: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async ({ db, auth }, { name, startDate, tags, description }) => {
    const userId = await checkUserAuthentication(auth)

    const campaignsCount = await db
      .query('campaigns')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .collect()
      .then((campaigns) => campaigns.length)
    if (campaignsCount >= MAX_CAMPAIGNS_PER_USER_COUNT) {
      throw new InvalidError(
        `User has reached the maximum number of campaigns (${MAX_CAMPAIGNS_PER_USER_COUNT})`,
      )
    }

    const campaignId = await db.insert('campaigns', {
      name,
      startDate,
      description,
      tags: tags || [],
      ownerId: userId,
      joinCode: generateSecureAlphanumericCode(12),
    })

    const prefix = campaignId.toString().slice(0, 4)
    await db.patch(campaignId, {
      joinCode: `${prefix}${generateSecureAlphanumericCode(8)}`,
    })

    await db.insert('members', {
      campaignId: campaignId,
      userId,
      status: 'active',
      role: 'admin',
    })

    return campaignId
  },
})

export const updateCampaign = mutation({
  args: {
    campaignId: v.id('campaigns'),
    updates: v.object({
      name: v.optional(v.string()),
      startDate: v.optional(v.string()),
      description: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      gameSystem: v.optional(v.string()),
      joinCode: v.optional(v.boolean()),
    }),
  },
  handler: async ({ db, auth }, { campaignId, updates }) => {
    const userId = await checkUserAuthentication(auth)

    const campaign = await db.get(campaignId)
    if (!campaign) throw new NotFoundError('Campaign not found')
    if (campaign.ownerId !== userId)
      throw new UnauthorizedError('User not authorized to update this campaign')

    const prefix = campaignId.toString().slice(0, 4)
    return await db.patch(campaignId, {
      ...updates,
      joinCode: updates.joinCode
        ? `${prefix}${generateSecureAlphanumericCode(8)}`
        : undefined,
    })
  },
})

export const readCampaignWithMembers = query({
  args: {
    campaignId: v.id('campaigns'),
  },
  handler: async ({ db, auth }, { campaignId }) => {
    const userId = await checkUserAuthentication(auth)

    const campaign = await db.get(campaignId)
    if (!campaign) throw new NotFoundError('Campaign not found')

    const campaignMembers = await db
      .query('members')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect()

    if (!campaignMembers.find((member) => member.userId === userId)) {
      throw new UnauthorizedError('User is not a member of this campaign')
    }

    return {
      ...campaign,
      members: [...campaignMembers],
    }
  },
})

export const listCampaignsWithMembersByUser = query({
  handler: async ({ db, auth }) => {
    const userId = await checkUserAuthentication(auth)

    const myMemberships = await db
      .query('members')
      .withIndex('by_campaign_member', (q) => q.eq('userId', userId))
      .collect()

    return await Promise.all(
      myMemberships
        .filter((me) => me.status === 'active')
        .map(async (me) => {
          const campaign = await db.get(me.campaignId)
          if (!campaign) return null

          const campaignMembers = await db
            .query('members')
            .withIndex('by_campaign', (q) => q.eq('campaignId', campaign._id))
            .collect()

          return {
            ...campaign,
            members: campaignMembers,
          }
        }),
    ).then((campaigns) => campaigns.filter((campaign) => !!campaign))
  },
})
