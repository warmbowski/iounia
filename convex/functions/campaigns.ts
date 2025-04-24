import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'

export const createCampaign = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    gameSystem: v.string(),
  },
  handler: async ({ db, auth }, { name, description, gameSystem }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const campaign = await db.insert('campaigns', {
      name,
      description,
      gameSystem,
      ownerId: user.tokenIdentifier,
      invitations: [],
    })
    await db.insert('members', {
      campaignId: campaign,
      userId: user.tokenIdentifier,
    })

    return campaign
  },
})

export const updateCampaign = mutation({
  args: {
    campaignId: v.id('campaigns'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      gameSystem: v.optional(v.string()),
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
    })
  },
})

export const readCampaign = query({
  args: {
    campaignId: v.id('campaigns'),
  },
  handler: async ({ db }, { campaignId }) => {
    const campaign = await db.get(campaignId)
    if (!campaign) throw new Error('Campaign not found')

    return campaign
  },
})

export const listCampaigns = query({
  handler: async ({ db, auth }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const campaignMembers = await db
      .query('members')
      .withIndex('by_campaign_member', (q) =>
        q.eq('userId', user.tokenIdentifier),
      )
      .collect()
    return await Promise.all(
      campaignMembers.map(async (member) => db.get(member.campaignId)),
    )
  },
})
