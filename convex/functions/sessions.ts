import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { checkUserAuthentication } from '../helpers/auth'
import { NotFoundError, UnauthorizedError } from '../helpers/errors'

export const createSession = mutation({
  args: {
    campaignId: v.id('campaigns'),
    name: v.optional(v.string()),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async ({ db, auth }, { campaignId, name, date, notes }) => {
    const userId = await checkUserAuthentication(auth)

    const campaign = await db.get(campaignId)
    if (!campaign) throw new NotFoundError('Campaign not found')
    if (campaign.ownerId !== userId)
      throw new UnauthorizedError(
        'User not authorized to create a session for this campaign',
      )

    return await db.insert('sessions', {
      campaignId,
      name,
      date,
      summary: [],
      notes,
    })
  },
})

export const updateSession = mutation({
  args: {
    sessionId: v.id('sessions'),
    updates: v.object({
      name: v.optional(v.string()),
      sessionNumber: v.optional(v.number()),
      date: v.optional(v.string()),
      summaryPrompt: v.optional(v.string()),
      summary: v.optional(
        v.array(
          v.object({
            icon: v.string(),
            text: v.string(),
          }),
        ),
      ),
      shortSummary: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async ({ db, auth }, { sessionId, updates }) => {
    const userId = await checkUserAuthentication(auth)

    const session = await db.get(sessionId)
    if (!session) throw new NotFoundError('Session not found')

    const campaign = await db.get(session.campaignId)
    if (!campaign) throw new NotFoundError('Campaign not found')
    if (campaign.ownerId !== userId)
      throw new UnauthorizedError('User not authorized to update this session')

    return await db.patch(sessionId, {
      ...updates,
    })
  },
})

export const readSession = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async ({ db, auth }, { sessionId }) => {
    await checkUserAuthentication(auth)

    const session = await db.get(sessionId)
    if (!session) throw new NotFoundError('Session not found')

    const sessionAttendees = await db
      .query('attendees')
      .withIndex('by_session', (q) => q.eq('sessionId', session._id))
      .collect()

    return {
      ...session,
      attendees: sessionAttendees.map((attendee) => attendee.userId),
    }
  },
})

export const listSessions = query({
  args: {
    campaignId: v.id('campaigns'),
  },
  handler: async ({ db, auth }, { campaignId }) => {
    await checkUserAuthentication(auth)

    const sessions = await db
      .query('sessions')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .order('desc')
      .collect()

    return Promise.all(
      sessions.map(async (session) => {
        const sessionAttendees = await db
          .query('attendees')
          .withIndex('by_session', (q) => q.eq('sessionId', session._id))
          .collect()

        return {
          ...session,
          attendees: sessionAttendees.map((attendee) => attendee.userId),
        }
      }),
    )
  },
})
