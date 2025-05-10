'use node'
import { AssemblyAI } from 'assemblyai'

import { internalAction } from '../_generated/server'
import { v } from 'convex/values'
import { internal } from '../_generated/api'

const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
})

export const submitRecordingForTranscription = internalAction({
  args: {
    storageId: v.id('_storage'),
    recordingId: v.id('recordings'),
    durationSec: v.number(),
  },
  handler: async ({ storage }, { storageId }) => {
    try {
      const audioFile = await storage.get(storageId)
      if (!audioFile) {
        throw new Error('Audio file not found')
      }
      const arrayBuffer = await new Response(audioFile).arrayBuffer()
      if (!arrayBuffer) {
        throw new Error('Failed to read audio file')
      }
      const uint8Array = new Uint8Array(arrayBuffer)

      const response = await assemblyai.transcripts.submit({
        speech_model: 'universal',
        audio: uint8Array,
        speaker_labels: true,
        webhook_url: 'http://example.com/webhooks/assemblyai',
        webhook_auth_header_name: 'x-assemblyai-256',
        webhook_auth_header_value: process.env.ASSEMBLYAI_WEBHOOK_SECRET,
      })

      if (!response) {
        console.error('Transcription error:', response)
        throw new Error('Transcription error')
      }

      return {
        message: 'Audio submitted successfully for processing!',
      }
    } catch (error) {
      console.error('Error during audio submission:', error)
      throw new Error('Audio submission failed')
    }
  },
})

export const processRecordingTranscript = internalAction({
  args: {
    jobId: v.string(),
    recordingId: v.id('recordings'),
  },
  handler: async ({ scheduler, runMutation }, { jobId, recordingId }) => {
    try {
      const response = await assemblyai.transcripts.get(jobId)
      if (!response.utterances) {
        throw new Error('Transcript not found')
      }
      if (response.status !== 'completed') {
        throw new Error('Transcript is not ready yet')
      }

      await Promise.all(
        response.utterances.map(async (item) => {
          return await runMutation(
            internal.functions.transcripts.createTranscriptPart,
            {
              recordingId,
              text: item.text,
              start: item.start,
              end: item.end,
              speaker: item.speaker || 'unknown',
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
        message: 'Transcript processed successfully!',
      }
    } catch (error) {
      console.error('Error during transcript processing:', error)
      throw new Error('Transcript processing failed')
    }
  },
})
