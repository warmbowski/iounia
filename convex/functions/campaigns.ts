import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { generateSecureAlphanumericCode } from '../utililties'

export const createCampaign = mutation({
  args: {
    name: v.string(),
    startDate: v.optional(v.string()),
    description: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async ({ db, auth }, { name, startDate, tags, description }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const campaignId = await db.insert('campaigns', {
      name,
      startDate,
      description,
      tags: tags || [],
      ownerId: user.tokenIdentifier,
      joinCode: generateSecureAlphanumericCode(8),
    })
    await db.insert('members', {
      campaignId: campaignId,
      userId: user.tokenIdentifier,
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
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const campaign = await db.get(campaignId)
    if (!campaign) throw new Error('Campaign not found')
    if (campaign.ownerId !== user.tokenIdentifier)
      throw new Error('User not authorized to update this campaign')

    return await db.patch(campaignId, {
      ...updates,
      joinCode: updates.joinCode
        ? generateSecureAlphanumericCode(8)
        : undefined,
    })
  },
})

export const readCampaignWithMembers = query({
  args: {
    campaignId: v.id('campaigns'),
  },
  handler: async ({ db, auth }, { campaignId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const campaign = await db.get(campaignId)
    if (!campaign) throw new Error('Campaign not found')

    const campaignMembers = await db
      .query('members')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect()

    return {
      ...campaign,
      members: campaignMembers,
    }
  },
})

export const listCampaignsWithMembers = query({
  handler: async ({ db, auth }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const myMemberships = await db
      .query('members')
      .withIndex('by_campaign_member', (q) =>
        q.eq('userId', user.tokenIdentifier),
      )
      .collect()

    return await Promise.all(
      myMemberships.map(async (me) => {
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
