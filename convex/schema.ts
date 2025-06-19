import { StreamIdValidator } from '@convex-dev/persistent-text-streaming'
import { embed } from 'ai'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const userId = () => v.string()
export const isoDate = () => v.string()
export const attendeeRole = () =>
  v.union(v.literal('gm'), v.literal('player'), v.literal('observer'))
export const memberRole = () =>
  v.union(v.literal('member'), v.literal('admin'), v.literal('session_admin'))
export const memberStatus = () =>
  v.union(
    v.literal('pending'),
    v.literal('active'),
    v.literal('inactive'),
    v.literal('banned'),
  )

export default defineSchema({
  userMessages: defineTable({
    prompt: v.string(),
    campaignId: v.id('campaigns'),
    responseStreamId: StreamIdValidator,
  })
    .index('by_stream', ['responseStreamId'])
    .index('by_campaign', ['campaignId']),

  campaigns: defineTable({
    name: v.string(),
    startDate: v.optional(v.string()),
    description: v.string(),
    joinCode: v.string(), // Unique code for joining the campaign
    tags: v.optional(v.array(v.string())),
    ownerId: userId(),
  })
    .index('by_join_code', ['joinCode'])
    .index('by_owner', ['ownerId']),

  members: defineTable({
    campaignId: v.id('campaigns'),
    userId: userId(),
    role: v.optional(memberRole()),
    status: v.optional(memberStatus()),
    presence: v.optional(v.union(v.literal('online'), v.literal('offline'))),
    lastActive: v.optional(isoDate()),
    joinedAt: v.optional(isoDate()),
  })
    .index('by_campaign_member', ['userId'])
    .index('by_campaign', ['campaignId']),

  sessions: defineTable({
    campaignId: v.id('campaigns'),
    name: v.optional(v.string()),
    sessionNumber: v.optional(v.number()), // TODO: deprecate and remove this field. Use index sorted by date instead.
    date: isoDate(),
    summaryPrompt: v.optional(v.string()),
    summary: v.array(
      v.object({
        icon: v.string(),
        text: v.string(),
      }),
    ),
    shortSummary: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index('by_campaign', ['campaignId', 'date']),

  attendees: defineTable({
    sessionId: v.id('sessions'),
    userId: userId(),
    role: v.optional(attendeeRole()),
  })
    .index('by_session_attendee', ['userId'])
    .index('by_session', ['sessionId']),

  recordings: defineTable({
    sessionId: v.id('sessions'),
    storageId: v.string(),
    processingJobId: v.optional(v.string()),
    recordingIndex: v.optional(v.number()),
    fileUrl: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    durationSec: v.optional(v.number()),
    tokenCount: v.optional(v.number()),
    uploadedBy: userId(),
  })
    .index('by_session', ['sessionId'])
    .index('by_processing_job', ['processingJobId']),

  transcripts: defineTable({
    recordingId: v.id('recordings'),
    sessionId: v.id('sessions'),
    campaignId: v.id('campaigns'),
    text: v.string(),
    start: v.number(),
    end: v.number(),
    speaker: v.string(),
    embeddings: v.array(v.float64()),
  })
    .vectorIndex('by_campaign_embeddings', {
      vectorField: 'embeddings',
      dimensions: 768,
      filterFields: ['campaignId'],
    })
    .index('by_campaign', ['campaignId'])
    .index('by_recording', ['recordingId', 'start'])
    .index('by_session', ['sessionId', 'start']),
})
