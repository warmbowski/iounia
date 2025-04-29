import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'

export const generateUploadUrl = mutation({
  handler: async ({ storage, auth }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    return await storage.generateUploadUrl()
  },
})

export const createRecording = mutation({
  args: { storageId: v.id('_storage'), sessionId: v.id('sessions') },
  handler: async ({ db, auth }, args) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    await db.insert('recordings', {
      sessionId: args.sessionId,
      recordingIndex: 0,
      fileUrl: args.storageId,
      fileType: 'audio',
      uploadedBy: user.tokenIdentifier,
    })
  },
})

export const readRecording = query({
  args: { sessionId: v.id('sessions') },
  handler: async ({ db }, { sessionId }) => {
    return await db
      .query('recordings')
      .filter((q) => q.eq(q.field('sessionId'), sessionId))
      .collect()
  },
})

export const deleteRecording = mutation({
  args: { recordingId: v.id('recordings') },
  handler: async ({ db, auth }, { recordingId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const recording = await db.get(recordingId)
    if (!recording) throw new Error('Recording not found')

    if (recording.uploadedBy !== user.tokenIdentifier)
      throw new Error('User not authorized to delete this recording')

    await db.delete(recordingId)
  },
})

export const listRecordings = query({
  args: { sessionId: v.id('sessions') },
  handler: async ({ db }, { sessionId }) => {
    return await db
      .query('recordings')
      .filter((q) => q.eq(q.field('sessionId'), sessionId))
      .collect()
  },
})

export const updateRecording = mutation({
  args: {
    recordingId: v.id('recordings'),
    updates: v.object({
      recordingIndex: v.optional(v.number()),
      fileUrl: v.optional(v.string()),
      fileType: v.optional(v.string()),
    }),
  },
  handler: async ({ db, auth }, { recordingId, updates }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const recording = await db.get(recordingId)
    if (!recording) throw new Error('Recording not found')

    if (recording.uploadedBy !== user.tokenIdentifier)
      throw new Error('User not authorized to update this recording')

    return await db.patch(recordingId, {
      ...updates,
    })
  },
})
