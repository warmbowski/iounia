import { TranscribeParams, Transcript } from 'assemblyai'
import { internalAction } from '../_generated/server'
import { v } from 'convex/values'
import { api, internal } from '../_generated/api'
import {
  WEBHOOK_AUTH_HEADER_NAME,
  WEBHOOK_AUTH_HEADER_VALUE,
  WEBHOOK_URL,
} from '../constants'
import { r2 } from './cloudflareR2'
import { ensureEnvironmentVariable } from '../utililties'

const TRANSCRIPTION_URL = 'https://api.assemblyai.com/v2/transcript'
const SPEECH_MODEL = 'universal'
const ASSEMBLYAI_API_KEY = ensureEnvironmentVariable('ASSEMBLYAI_API_KEY')

export const submitRecordingForTranscription = internalAction({
  args: {
    storageId: v.string(),
    recordingId: v.id('recordings'),
  },
  handler: async ({ runMutation }, { storageId, recordingId }) => {
    try {
      const fileUrl = await r2.getUrl(storageId)
      if (!fileUrl) {
        console.error('File URL not found for storageId:', storageId)
        throw new Error('File URL not found')
      }

      const body: TranscribeParams = {
        speech_model: SPEECH_MODEL,
        audio_url: fileUrl,
        speaker_labels: true,
        webhook_url: WEBHOOK_URL,
        webhook_auth_header_name: WEBHOOK_AUTH_HEADER_NAME,
        webhook_auth_header_value: WEBHOOK_AUTH_HEADER_VALUE,
      }

      const response = await fetch(TRANSCRIPTION_URL, {
        method: 'POST',
        headers: {
          Authorization: ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        console.error('Transcription submission error:', response)
        throw new Error('Transcription submission error')
      }

      const transcript = await response.json()
      if (!transcript) {
        console.error('Transcription error:', transcript)
        throw new Error('Transcription error')
      }

      const jobId = transcript.id
      if (!jobId) {
        console.error('Job ID not found in transcription response:', transcript)
        throw new Error('Job ID not found')
      }

      await runMutation(internal.functions.recordings.updateRecordingJobId, {
        recordingId: recordingId,
        updates: {
          processingJobId: jobId,
        },
      })

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
      const response = await fetch(TRANSCRIPTION_URL + '/' + jobId, {
        method: 'GET',
        headers: {
          Authorization: ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        console.error('Transcription retrieval error:', response)
        throw new Error('Transcription retrieval error')
      }
      const transcript: Transcript = await response.json()
      if (!transcript) {
        console.error('Transcription error:', transcript)
        throw new Error('Transcription error')
      }

      if (transcript.status !== 'completed') {
        throw new Error('Transcript is not ready yet')
      }

      await Promise.all(
        (transcript.utterances || []).map(async (item) => {
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
