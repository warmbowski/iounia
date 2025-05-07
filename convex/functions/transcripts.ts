import {
  action,
  internalAction,
  internalMutation,
  mutation,
  query,
} from '../_generated/server'
import { api, internal } from '../_generated/api'
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  Type,
} from '@google/genai'
import { v } from 'convex/values'
import {
  AUDIO_CHUNK_DURATION_SEC,
  SYSTEM_PROMPT_TRANSCRIPT_SUMMARIZATION,
  SYSTEM_PROMPT_TRANSCRIPTION,
} from '../constants'
import { formatTimestamp } from '../utililties'

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

    const transcriptParts = await runQuery(
      api.functions.transcripts.listTranscriptParts,
      { sessionId },
    )

    const prompt = transcriptParts.map((t) => t.text).join('\n')

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

/** internal functions */

export const transcribeRecordingChunk = internalAction({
  args: {
    recordingId: v.id('recordings'),
    uploadUri: v.string(),
    uploadMimeType: v.string(),
    startTimestamp: v.string(),
    endTimestamp: v.string(),
  },
  handler: async (
    {},
    { uploadUri, uploadMimeType, startTimestamp, endTimestamp },
  ) => {
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
                text: { type: Type.STRING },
                timestamp: { type: Type.STRING },
                speaker: { type: Type.STRING },
                speakerType: {
                  type: Type.STRING,
                  enum: ['GM', 'PC', 'NPC', 'Player'],
                },
                characterName: { type: Type.STRING },
              },
              required: ['timestamp', 'speaker', 'text'],
            },
          },
        },
        contents: createUserContent([
          createPartFromUri(uploadUri, uploadMimeType),
          SYSTEM_PROMPT_TRANSCRIPTION(startTimestamp, endTimestamp),
        ]),
      })

      if (!aiResult.text) {
        throw new Error('Empty transcription response from LLM')
      }

      console.log(
        'Transcription usage:',
        startTimestamp,
        endTimestamp,
        aiResult.usageMetadata,
      )
      const parsedItems: TranscriptionItem[] = JSON.parse(aiResult.text)

      return parsedItems
    } catch (error) {
      console.error(
        `Error during chunk transcription (${startTimestamp}, ${endTimestamp}):`,
        error,
      )
      throw new Error(
        `Chunk Transcription failed for chunk ${startTimestamp}, ${endTimestamp}`,
      )
    }
  },
})

export const transcribeRecording = internalAction({
  args: {
    storageId: v.id('_storage'),
    recordingId: v.id('recordings'),
    durationSec: v.number(),
  },
  handler: async (
    { storage, scheduler, runAction, runMutation },
    { storageId, recordingId, durationSec },
  ) => {
    let uploadedFileName: string | undefined = undefined
    const numberOfChunks = Math.ceil(durationSec / AUDIO_CHUNK_DURATION_SEC)

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

      uploadedFileName = upload.name

      const processingResults = []

      for (let i = 0; i < numberOfChunks; i++) {
        const startTimestampSec = i * AUDIO_CHUNK_DURATION_SEC
        const endTimestampSec =
          (i + 1) * AUDIO_CHUNK_DURATION_SEC > durationSec
            ? durationSec
            : (i + 1) * AUDIO_CHUNK_DURATION_SEC
        processingResults.push(
          await runAction(
            internal.functions.transcripts.transcribeRecordingChunk,
            {
              recordingId,
              uploadUri: upload.uri,
              uploadMimeType: upload.mimeType,
              startTimestamp: formatTimestamp(startTimestampSec),
              endTimestamp: formatTimestamp(endTimestampSec),
            },
          ),
        )
      }

      const transcriptParts = await Promise.all(processingResults)
      const transcript = transcriptParts.flatMap((item) => item)

      await Promise.all(
        transcript.flatMap(async (item) => {
          return await runMutation(
            internal.functions.transcripts.createTranscriptPart,
            {
              recordingId,
              text: item.text,
              timestamp: item.timestamp,
              speaker: item.speaker,
              speakerType: item.speakerType,
              characterName: item.characterName,
              embeddings: [],
            },
          )
        }),
      )

      await scheduler.runAfter(
        1000,
        internal.functions.transcripts.updateTextEmbeddings,
        {
          recordingId,
        },
      )

      return {
        message: 'Transcription completed successfully!',
      }
    } catch (error) {
      console.error('Error during transcription:', error)
      throw new Error('Transcription failed')
    } finally {
      await ai.files.delete({ name: uploadedFileName || '' })
    }
  },
})

export const generateTextEmbeddings = internalAction({
  args: {
    texts: v.array(v.string()),
  },
  handler: async ({}, { texts }) => {
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

export const updateTextEmbeddings = internalAction({
  args: {
    recordingId: v.id('recordings'),
  },
  handler: async ({ runQuery, runAction, runMutation }, { recordingId }) => {
    const transcriptParts = await runQuery(
      api.functions.transcripts.listTranscriptParts,
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
              embeddings: embeddings[idx].values || [],
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
    timestamp: v.string(),
    speaker: v.string(),
    speakerType: v.optional(v.string()),
    characterName: v.optional(v.string()),
    embeddings: v.array(v.number()),
  },
  handler: async (
    { db },
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

export const updateTranscriptPart = internalMutation({
  args: {
    transcriptId: v.id('transcripts'),
    updates: v.object({
      text: v.optional(v.string()),
      timestamp: v.optional(v.string()),
      speaker: v.optional(v.string()),
      speakerType: v.optional(v.string()),
      characterName: v.optional(v.string()),
      embeddings: v.optional(v.array(v.number())),
    }),
  },
  handler: async ({ db, auth }, { transcriptId, updates }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    const transcript = await db.get(transcriptId)
    if (!transcript) throw new Error('Transcript not found')

    return await db.patch(transcriptId, {
      ...updates,
    })
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
export const deleteAllTranscripts = mutation({
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
