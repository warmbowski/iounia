import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const userId = v.string
const isoDate = v.string

export default defineSchema({
  campaigns: defineTable({
    name: v.string(),
    description: v.string(),
    gameSystem: v.string(),
    ownerId: userId(),
    invitations: v.array(v.string()),
  }),
  members: defineTable({
    campaignId: v.id('campaigns'),
    userId: userId(),
  }).index('by_campaign_member', ['userId']),

  sessions: defineTable({
    campaignId: v.id('campaigns'),
    name: v.optional(v.string()),
    sessionNumber: v.number(),
    date: isoDate(),
    summary: v.string(),
    notes: v.optional(v.string()),
  }).index('by_campaign', ['campaignId']),
  attendees: defineTable({
    sessionId: v.id('sessions'),
    userId: userId(),
    role: v.optional(v.string()), // e.g., "DM", "Player"
  }).index('by_session_attendee', ['userId']),

  recordings: defineTable({
    sessionId: v.id('sessions'),
    recordingIndex: v.number(),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    uploadedAt: isoDate(),
    uploadedBy: userId(),
  }),

  transcripts: defineTable({
    sessionId: v.id('sessions'), // References the sessions table id
    recordingId: v.id('recordings'), // References the recordings table id
    chunkIndex: v.number(), // Index of the chunk for ordering
    text: v.string(), // Text content of the transcript chunk
    embeddings: v.array(v.number()), // Embeddings for vector search
  }),
})
