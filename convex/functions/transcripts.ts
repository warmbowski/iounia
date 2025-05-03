import {
  action,
  internalAction,
  internalMutation,
  query,
} from '../_generated/server'
import { api, internal } from '../_generated/api'
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  Type,
} from '@google/genai'
import { GenericId, v } from 'convex/values'
import {
  SYSTEM_PROMPT_TRANSCRIPT_SUMMARIZATION,
  SYSTEM_PROMPT_TRANSCRIPTION,
} from '../constants'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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

    const transcriptChunks = await runQuery(
      api.functions.transcripts.listTranscriptChunks,
      { sessionId },
    )

    const prompt = transcriptChunks.map((t) => t.text).join('\n')

    try {
      const aiResult = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        config: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                icon: { type: Type.STRING },
                text: { type: Type.STRING },
              },
              required: ['icon', 'text'],
            },
          },
          systemInstruction: SYSTEM_PROMPT_TRANSCRIPT_SUMMARIZATION,
        },
        contents: prompt,
      })

      if (!aiResult.text) {
        throw new Error('Summary generation failed')
      }

      const parsedSummary: BulletItem[] = JSON.parse(aiResult.text)

      await runMutation(api.functions.sessions.updateSession, {
        sessionId,
        updates: {
          summary: parsedSummary,
        },
      })
      return parsedSummary
    } catch (error) {
      console.error('Error during summary generation:', error)
      throw new Error('Summary generation failed')
    }
  },
})

export const listTranscriptChunks = query({
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
        .collect()
    }

    if (recordingId) {
      const recording = await db.get(recordingId)
      if (!recording) throw new Error('Recording not found')

      return await db
        .query('transcripts')
        .withIndex('by_recording', (q) => q.eq('recordingId', recordingId))
        .collect()
    }

    return [] // Fallback in case of unexpected conditions
  },
})

/** internal functions */

export const transcribeRecording = internalAction({
  args: {
    storageId: v.id('_storage'),
    recordingId: v.id('recordings'),
  },
  handler: async (
    { storage, auth, runAction, runMutation },
    { storageId, recordingId },
  ) => {
    // const user = await auth.getUserIdentity()
    // if (!user) throw new Error('User not authenticated')

    try {
      const audioFile = await storage.get(storageId)
      if (!audioFile) {
        throw new Error('Audio file not found')
      }

      const upload = await ai.files.upload({
        file: audioFile,
        config: { mimeType: 'audio/mp3' },
      })

      if (!upload || !upload.uri || !upload.mimeType) {
        throw new Error('File upload failed')
      }

      const aiResult = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        config: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                timestamp: { type: Type.STRING },
                speaker: { type: Type.STRING },
                speakerType: { type: Type.STRING },
                characterName: {
                  type: Type.STRING,
                  enum: ['GM', 'PC', 'NPC', 'Player'],
                },
              },
              required: ['timestamp', 'speaker', 'text'],
            },
          },
        },
        contents: createUserContent([
          createPartFromUri(upload.uri, upload.mimeType),
          SYSTEM_PROMPT_TRANSCRIPTION,
        ]),
      })

      if (!aiResult.text) {
        throw new Error('Transcription failed')
      }

      const parsedItems: TranscriptionItem[] = JSON.parse(aiResult.text)

      const embeddings = await runAction(
        internal.functions.transcripts.generateTextEmbedding,
        { texts: parsedItems.map((item) => item.text) },
      )

      await Promise.all(
        parsedItems.map(async (item, idx) => {
          return await runMutation(
            internal.functions.transcripts.createTranscriptChunk,
            {
              recordingId,
              text: item.text,
              timestamp: item.timestamp,
              speaker: item.speaker,
              speakerType: item.speakerType,
              characterName: item.characterName,
              embeddings: embeddings[idx].values || [],
            },
          )
        }),
      )

      return {
        message: 'Transcription completed successfully!',
        ...aiResult.usageMetadata,
      }
    } catch (error) {
      console.error('Error during transcription:', error)
      throw new Error('Transcription failed')
    }
  },
})

export const generateTextEmbedding = internalAction({
  args: {
    texts: v.array(v.string()),
  },
  handler: async ({ auth }, { texts }) => {
    // const user = await auth.getUserIdentity()
    // if (!user) throw new Error('User not authenticated')

    const { embeddings } = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: texts,
      config: {
        // autoTruncate: true,
      },
    })

    if (!embeddings) {
      throw new Error('Embedding generation failed')
    }

    return embeddings
  },
})

export const createTranscriptChunk = internalMutation({
  args: {
    recordingId: v.id('recordings'),
    text: v.string(),
    timestamp: v.string(),
    speaker: v.string(),
    speakerType: v.optional(v.string()),
    characterName: v.optional(v.string()),
    embeddings: v.array(v.number()),
  },
  handler: async (
    { db, auth },
    {
      recordingId,
      text,
      timestamp,
      speaker,
      speakerType,
      characterName,
      embeddings,
    },
  ) => {
    // const user = await auth.getUserIdentity()
    // if (!user) throw new Error('User not authenticated')

    const recording = await db.get(recordingId)
    if (!recording) throw new Error('Recording not found')

    return await db.insert('transcripts', {
      recordingId,
      sessionId: recording.sessionId,
      text,
      timestamp,
      speaker,
      speakerType,
      characterName,
      embeddings,
    })
  },
})
