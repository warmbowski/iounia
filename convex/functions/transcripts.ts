import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from '../_generated/server'
import { internal } from '../_generated/api'
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  Type,
} from '@google/genai'
import { v } from 'convex/values'

const TRANSCRIBE_PROMPT = `
Generate audio diarization for this recording of a table-top role playing game session.
Try to guess the name of the person talking and add it to the speaker property, or use "speaker A", "speaker B", etc.
The only possible values for speakerType are "GM", "Player", "PC", "NPC", or undefined if one of these is not determined.
The characterName property should be used if the speaker is pretending to be player character (PC) or a non-player character (NPC).
The GM is the one who narrates the story and describes the situation the characters are in.
The GM also plays as non-player characters (NPCs) in the story.
The Players are the ones who play the game and act as player characters (PC) in the story.
Always use the format mm:ss for the timestamps.

`
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

interface TranscriptionItem {
  text: string
  timestamp: string
  speaker: string
  speakerType?: 'GM' | 'Player' | 'PC' | 'NPC'
  characterName?: string
}

export const transcribeRecording = internalAction({
  args: {
    storageId: v.id('_storage'),
    recordingId: v.id('recordings'),
  },
  handler: async (
    { storage, auth, runAction, runMutation },
    { storageId, recordingId },
  ) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

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
          TRANSCRIBE_PROMPT,
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
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

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
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

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

export const listTranscripts = query({
  args: {
    recordingId: v.id('recordings'),
  },
  handler: async ({ db, auth }, { recordingId }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    return await db
      .query('transcripts')
      .withIndex('by_recording', (q) => q.eq('recordingId', recordingId))
      .collect()
  },
})
