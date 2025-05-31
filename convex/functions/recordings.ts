import { internal } from '../_generated/api'
import {
  mutation,
  query,
  internalQuery,
  internalMutation,
} from '../_generated/server'
import { v } from 'convex/values'
import { r2 } from './cloudflareR2'
import { getTokenIdentifierParts } from '../utililties'

export const createRecording = mutation({
  args: {
    storageId: v.string(),
    sessionId: v.id('sessions'),
    fileName: v.string(),
    fileType: v.string(),
    durationSec: v.number(),
  },
  handler: async ({ db, auth, scheduler }, args) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')
    const userId = getTokenIdentifierParts(user.tokenIdentifier).id

    const fileUrl = await r2.getUrl(args.storageId)

    const recordingId = await db.insert('recordings', {
      sessionId: args.sessionId,
      storageId: args.storageId,
      recordingIndex: 0,
      fileUrl,
      fileName: args.fileName,
      fileType: args.fileType,
      durationSec: args.durationSec,
      uploadedBy: userId,
    })

    await scheduler.runAfter(
      1000,
      internal.functions.assemblyai.submitRecordingForTranscription,
      {
        storageId: args.storageId,
        recordingId: recordingId,
      },
    )

    return recordingId
  },
})

export const readRecording = query({
  args: { recordingId: v.id('recordings') },
  handler: async ({ db, auth }, { recordingId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const recording = await db.get(recordingId)
    if (!recording) throw new Error('Recording not found')

    return recording
  },
})

export const deleteRecording = mutation({
  args: { recordingId: v.id('recordings') },
  handler: async ({ db, auth }, { recordingId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')
    const userId = getTokenIdentifierParts(user.tokenIdentifier).id

    const recording = await db.get(recordingId)
    if (!recording) throw new Error('Recording not found')

    if (recording.uploadedBy !== userId)
      throw new Error('User not authorized to delete this recording')

    await db.delete(recordingId)
  },
})

export const listRecordings = query({
  args: { sessionId: v.id('sessions') },
  handler: async ({ db, auth }, { sessionId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    return await db
      .query('recordings')
      .withIndex('by_session', (q) => q.eq('sessionId', sessionId))
      .collect()
  },
})

export const updateRecording = mutation({
  args: {
    recordingId: v.id('recordings'),
    updates: v.object({
      processingJobId: v.optional(v.string()),
      recordingIndex: v.optional(v.number()),
      tokenCount: v.optional(v.number()),
      fileUrl: v.optional(v.string()),
      fileType: v.optional(v.string()),
    }),
  },
  handler: async ({ db, auth }, { recordingId, updates }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')
    const userId = getTokenIdentifierParts(user.tokenIdentifier).id

    const recording = await db.get(recordingId)
    if (!recording) throw new Error('Recording not found')

    if (recording.uploadedBy !== userId)
      throw new Error('User not authorized to update this recording')

    return await db.patch(recordingId, {
      ...updates,
    })
  },
})

// internal functions
export const readRecordingByJobId = internalQuery({
  args: { jobId: v.string() },
  handler: async ({ db }, { jobId }) => {
    const recording = await db
      .query('recordings')
      .withIndex('by_processing_job', (q) => q.eq('processingJobId', jobId))
      .first()

    if (!recording) throw new Error('Recording not found')

    return recording
  },
})

export const updateRecordingJobId = internalMutation({
  args: {
    recordingId: v.id('recordings'),
    updates: v.object({
      processingJobId: v.string(),
    }),
  },
  handler: async ({ db }, { recordingId, updates }) => {
    const recording = await db.get(recordingId)
    if (!recording) throw new Error('Recording not found')

    return await db.patch(recordingId, {
      ...updates,
    })
  },
})
