import { time } from 'console'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const userId = v.string
const isoDate = v.string

export default defineSchema({
  campaigns: defineTable({
    name: v.string(),
    description: v.string(),
    gameSystem: v.optional(v.string()), // TODO: deprecated - remove data from db then remove this
    tags: v.optional(v.array(v.string())),
    ownerId: userId(),
    invitations: v.optional(v.array(v.string())),
  }),

  members: defineTable({
    campaignId: v.id('campaigns'),
    userId: userId(),
  })
    .index('by_campaign_member', ['userId'])
    .index('by_campaign', ['campaignId']),

  sessions: defineTable({
    campaignId: v.id('campaigns'),
    name: v.optional(v.string()),
    sessionNumber: v.number(),
    date: isoDate(),
    summary: v.array(
      v.object({
        icon: v.string(),
        text: v.string(),
      }),
    ),
    notes: v.optional(v.string()),
  }).index('by_campaign', ['campaignId']),

  attendees: defineTable({
    sessionId: v.id('sessions'),
    userId: userId(),
    role: v.optional(v.string()), // e.g., "DM", "Player"
  })
    .index('by_session_attendee', ['userId'])
    .index('by_session', ['sessionId']),

  recordings: defineTable({
    sessionId: v.id('sessions'),
    storageId: v.id('_storage'),
    recordingIndex: v.optional(v.number()),
    fileUrl: v.string(),
    fileType: v.string(),
    durationSec: v.optional(v.number()),
    tokenCount: v.optional(v.number()),
    uploadedBy: userId(),
  }).index('by_session', ['sessionId']),

  transcripts: defineTable({
    recordingId: v.id('recordings'),
    sessionId: v.id('sessions'),
    text: v.string(),
    timestamp: v.string(),
    speaker: v.string(),
    speakerType: v.optional(v.string()), // e.g., "Player", "GM", "PC", "NPC"
    characterName: v.optional(v.string()),
    embeddings: v.array(v.number()),
  })
    .index('by_recording', ['recordingId', 'timestamp'])
    .index('by_session', ['sessionId', 'timestamp']),
})
