import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from '../_generated/server'
import { api, internal } from '../_generated/api'
import z from 'zod'
import { generateObject, embedMany } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { v } from 'convex/values'
import {
  SYSTEM_PROMPT_SHORT_SUMMARIZATION,
  SYSTEM_PROMPT_TRANSCRIPT_SUMMARIZATION,
} from '../constants'
import { ensureEnvironmentVariable } from '../utililties'

const GEMINI_API_KEY = ensureEnvironmentVariable('GEMINI_API_KEY')

const google = createGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
})

export interface TranscriptionItem {
  text: string
  timestamp: string
  speaker: string
  speakerType?: 'GM' | 'Player' | 'PC' | 'NPC'
  characterName?: string
}

export interface BulletItem {
  icon: string
  text: string
}

/** public functions */

export const generateSessionSummary = action({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async ({ runQuery, runMutation, auth }, { sessionId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const transcriptParts = await runQuery(
      api.functions.transcripts.listTranscriptParts,
      { sessionId },
    )

    const prompt = transcriptParts.map((t) => t.text).join('\n')

    try {
      const summary = await generateObject<BulletItem[]>({
        model: google('gemini-2.5-flash-preview-04-17'),
        temperature: 0.7,
        system: SYSTEM_PROMPT_TRANSCRIPT_SUMMARIZATION,
        prompt,
        schema: z.array(
          z.object({
            icon: z.string(),
            text: z.string(),
          }),
        ),
      })

      if (!summary.object) {
        throw new Error('Summary generation failed')
      }
      const bulletItems = summary.object

      const shortSummary = await generateObject<{ text: string }>({
        model: google('gemini-2.5-flash-preview-04-17'),
        temperature: 0.7,
        system: SYSTEM_PROMPT_SHORT_SUMMARIZATION,
        prompt: bulletItems.map((item) => item.text).join('\n'),
        schema: z.object({
          text: z.string(),
        }),
      })
      if (!shortSummary.object) {
        throw new Error('Short summary generation failed')
      }
      const shortSummaryText = shortSummary.object.text

      await runMutation(api.functions.sessions.updateSession, {
        sessionId,
        updates: {
          summary: bulletItems,
          shortSummary: shortSummaryText,
        },
      })

      return { action: 'generateSessionSummary', status: 'success' }
    } catch (error) {
      console.error('Error during summary generation:', error)
      throw new Error('Summary generation failed')
    }
  },
})

export const listTranscriptParts = query({
  args: {
    recordingId: v.optional(v.id('recordings')),
    sessionId: v.optional(v.id('sessions')),
  },
  handler: async ({ db, auth }, { recordingId, sessionId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    if (!recordingId && !sessionId) {
      throw new Error('Either recordingId or sessionId must be provided')
    }
    if (recordingId && sessionId) {
      throw new Error('Only one of recordingId or sessionId can be provided')
    }

    if (sessionId) {
      const session = await db.get(sessionId)
      if (!session) throw new Error('Session not found')

      return await db
        .query('transcripts')
        .withIndex('by_session', (q) => q.eq('sessionId', sessionId))
        .order('asc')
        .collect()
    }

    if (recordingId) {
      const recording = await db.get(recordingId)
      if (!recording) throw new Error('Recording not found')

      return await db
        .query('transcripts')
        .withIndex('by_recording', (q) => q.eq('recordingId', recordingId))
        .order('asc')
        .collect()
    }

    return []
  },
})

export const deleteTranscriptPart = mutation({
  args: {
    transcriptId: v.id('transcripts'),
  },
  handler: async ({ db, auth }, { transcriptId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const transcript = await db.get(transcriptId)
    if (!transcript) throw new Error('Transcript not found')

    return await db.delete(transcriptId)
  },
})

export const deleteAllTranscriptParts = mutation({
  args: {
    recordingId: v.id('recordings'),
  },
  handler: async ({ db, auth }, { recordingId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const recording = await db.get(recordingId)
    if (!recording) throw new Error('Recording not found')

    return await db
      .query('transcripts')
      .withIndex('by_recording', (q) => q.eq('recordingId', recordingId))
      .collect()
      .then((transcripts) => {
        return Promise.all(
          transcripts.map((transcript) => db.delete(transcript._id)),
        )
      })
  },
})

export const hasTranscript = action({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async ({ runQuery }, { sessionId }): Promise<boolean> => {
    const parts = await runQuery(
      api.functions.transcripts.listTranscriptParts,
      {
        sessionId,
      },
    )
    return parts.length > 0
  },
})

/** internal functions */

export const generateTextEmbeddings = internalAction({
  args: {
    texts: v.array(v.string()),
  },
  handler: async ({}, { texts }) => {
    const batchedTexts = []
    // SDK embedMany only accepts 100 texts at a time
    for (let i = 0; i < texts.length; i += 100) {
      batchedTexts.push(texts.slice(i, i + 100))
    }

    const batchedResults = await Promise.all(
      batchedTexts.map(async (textsBatch) => {
        return await embedMany({
          model: google.textEmbeddingModel('text-embedding-004'),
          values: textsBatch,
        })
      }),
    )
    const embeddings = batchedResults.flatMap((result) => result.embeddings)

    if (!embeddings) {
      throw new Error('Embedding generation failed')
    }

    return embeddings
  },
})

export const updateTextEmbeddings = internalAction({
  args: {
    recordingId: v.id('recordings'),
  },
  handler: async ({ runQuery, runAction, runMutation }, { recordingId }) => {
    const transcriptParts: any[] = await runQuery(
      internal.functions.transcripts.listTranscriptPartsByRecordingId,
      { recordingId },
    )

    const textList = transcriptParts.map((item) => item.text)

    const embeddings = await runAction(
      internal.functions.transcripts.generateTextEmbeddings,
      { texts: textList },
    )

    if (!embeddings) {
      throw new Error('Embedding generation failed')
    }

    await Promise.all(
      transcriptParts.map(async (item, idx) => {
        return await runMutation(
          internal.functions.transcripts.updateTranscriptPart,
          {
            transcriptId: item._id,
            updates: {
              embeddings: embeddings[idx] || [],
            },
          },
        )
      }),
    )
  },
})

export const createTranscriptPart = internalMutation({
  args: {
    recordingId: v.id('recordings'),
    text: v.string(),
    start: v.number(),
    end: v.number(),
    speaker: v.string(),
    speakerType: v.optional(v.string()),
    characterName: v.optional(v.string()),
    embeddings: v.array(v.number()),
  },
  handler: async (
    { db },
    { recordingId, text, start, end, speaker, embeddings },
  ) => {
    const recording = await db.get(recordingId)
    if (!recording) throw new Error('Recording not found')

    return await db.insert('transcripts', {
      recordingId,
      sessionId: recording.sessionId,
      text,
      start,
      end,
      speaker,
      embeddings,
    })
  },
})

export const updateTranscriptPart = internalMutation({
  args: {
    transcriptId: v.id('transcripts'),
    updates: v.object({
      text: v.optional(v.string()),
      start: v.optional(v.number()),
      end: v.optional(v.number()),
      speaker: v.optional(v.string()),
      embeddings: v.optional(v.array(v.number())),
    }),
  },
  handler: async ({ db }, { transcriptId, updates }) => {
    const transcript = await db.get(transcriptId)
    if (!transcript) throw new Error('Transcript not found')

    return await db.patch(transcriptId, {
      ...updates,
    })
  },
})

export const listTranscriptPartsByRecordingId = internalQuery({
  args: {
    recordingId: v.id('recordings'),
  },
  handler: async ({ db }, { recordingId }) => {
    return await db
      .query('transcripts')
      .withIndex('by_recording', (q) => q.eq('recordingId', recordingId))
      .order('asc')
      .collect()
  },
})
