import { api, internal } from '../_generated/api'
import {
  mutation,
  query,
  internalQuery,
  internalMutation,
  action,
} from '../_generated/server'
import { v } from 'convex/values'
import { r2 } from './cloudflareR2'
import { checkUserAuthentication } from '../helpers/auth'
import { NotFoundError, UnauthorizedError } from '../helpers/errors'
import { getTokenIdentifierParts } from '../helpers/utililties'

export const createRecording = mutation({
  args: {
    storageId: v.string(),
    sessionId: v.id('sessions'),
    fileName: v.string(),
    fileType: v.string(),
    durationSec: v.number(),
  },
  handler: async ({ db, auth, scheduler }, args) => {
    const userId = await checkUserAuthentication(auth)

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
    await checkUserAuthentication(auth)

    const recording = await db.get(recordingId)
    if (!recording) throw new NotFoundError('Recording not found')

    return recording
  },
})

export const deleteRecording = mutation({
  args: { recordingId: v.id('recordings') },
  handler: async ({ db, auth }, { recordingId }) => {
    const userId = await checkUserAuthentication(auth)

    const recording = await db.get(recordingId)
    if (!recording) throw new NotFoundError('Recording not found')

    const session = await db.get(recording.sessionId)
    if (!session) throw new NotFoundError('Session not found')

    const campaign = await db.get(session.campaignId)
    if (!campaign) throw new NotFoundError('Campaign not found')

    if (
      campaign.ownerId !== userId ||
      getTokenIdentifierParts(recording.uploadedBy).id !== userId
    ) {
      throw new UnauthorizedError(
        'User not authorized to delete this recording',
      )
    }

    // TODO: Delete from R2
    await db.delete(recordingId)
  },
})

export const deleteRecordingAndTranscript = action({
  args: { recordingId: v.id('recordings') },
  handler: async ({ auth, runMutation }, { recordingId }) => {
    const userId = await checkUserAuthentication(auth)

    // remove recording first as gatekeeper function
    await runMutation(api.functions.recordings.deleteRecording, { recordingId })

    // TODO: turn this into a schedule job to delete transcript parts that don't have a recording
    await runMutation(api.functions.transcripts.deleteAllTranscriptParts, {
      recordingId,
    })
  },
})

export const listRecordings = query({
  args: { sessionId: v.id('sessions') },
  handler: async ({ db, auth }, { sessionId }) => {
    await checkUserAuthentication(auth)

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
    const userId = await checkUserAuthentication(auth)

    const recording = await db.get(recordingId)
    if (!recording) throw new NotFoundError('Recording not found')

    if (recording.uploadedBy !== userId)
      throw new UnauthorizedError(
        'User not authorized to update this recording',
      )

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

    if (!recording) throw new NotFoundError('Recording not found')

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
    if (!recording) throw new NotFoundError('Recording not found')

    return await db.patch(recordingId, {
      ...updates,
    })
  },
})
