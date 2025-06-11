import { TranscribeParams, Transcript } from 'assemblyai'
import { internalAction } from '../_generated/server'
import { ConvexError, v } from 'convex/values'
import { api, internal } from '../_generated/api'
import {
  WEBHOOK_AUTH_HEADER_NAME,
  WEBHOOK_AUTH_HEADER_VALUE,
  WEBHOOK_URL,
} from '../constants'
import { r2 } from './cloudflareR2'
import { ensureServerEnironmentVariable } from '../helpers/utililties'
import { BadRequestError, NotFoundError } from '../helpers/errors'

const ASSEMBLYAI_API_KEY = ensureServerEnironmentVariable('ASSEMBLYAI_API_KEY')
const TRANSCRIPTION_URL = 'https://api.assemblyai.com/v2/transcript'
const SPEECH_MODEL = 'slam-1'
const KEYTERMS_BASE_PROMPT: Array<string> = [
  // 'Scallion Wince',
  // 'Molymdenum Mossback',
  // 'Moly',
  // 'Mala del Testa',
  // 'Lord Vos Fel',
  // 'The Varistor',
  // 'Inma',
  // 'Inmaculada Abyección',
  // 'Sanguine Pearl',
  // 'Vase Stasis',
  // 'Lolth',
  // 'Mount Wewel',
  // 'Haughlin',
  // 'Aervik Narn',
  // 'The Slaughter Club',
  // 'Jeb',
  // 'Geth',
  // 'Lashashana',
  // 'Amadabahara',
]

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
        throw new NotFoundError('File URL not found')
      }

      const body: TranscribeParams = {
        speech_model: SPEECH_MODEL,
        audio_url: fileUrl,
        speaker_labels: true,
        webhook_url: WEBHOOK_URL,
        webhook_auth_header_name: WEBHOOK_AUTH_HEADER_NAME,
        webhook_auth_header_value: WEBHOOK_AUTH_HEADER_VALUE,
        keyterms_prompt: KEYTERMS_BASE_PROMPT,
        entity_detection: false,
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
        throw new ConvexError('Transcription submission error')
      }

      const transcript = await response.json()
      if (!transcript) {
        console.error('Transcription error:', transcript)
        throw new NotFoundError('Transcription error')
      }

      const jobId = transcript.id
      if (!jobId) {
        console.error('Job ID not found in transcription response:', transcript)
        throw new NotFoundError('Job ID not found')
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
      throw new BadRequestError('Audio submission failed')
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
        throw new ConvexError('Transcription retrieval error')
      }
      const transcript: Transcript = await response.json()
      if (!transcript) {
        console.error('Transcription error:', transcript)
        throw new NotFoundError('Transcription error')
      }

      if (transcript.status !== 'completed') {
        throw new ConvexError('Transcript is not ready yet')
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
      throw new ConvexError('Transcript processing failed')
    }
  },
})
