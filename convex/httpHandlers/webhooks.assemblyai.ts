import { internal } from '../_generated/api'
import { httpAction } from '../_generated/server'
import {
  WEBHOOK_AUTH_HEADER_NAME,
  WEBHOOK_AUTH_HEADER_VALUE,
} from '../constants'

export const receiveAssemblyAIWebhook = httpAction(
  async ({ runQuery, runAction }, request) => {
    const signature = request.headers.get(WEBHOOK_AUTH_HEADER_NAME)!
    const bodyString = await request.text()

    if (signature !== WEBHOOK_AUTH_HEADER_VALUE) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = JSON.parse(bodyString)
    const {
      transcript_id,
      status,
    }: {
      transcript_id: string
      status: string
    } = body

    const recording = await runQuery(
      internal.functions.recordings.readRecordingByJobId,
      { jobId: transcript_id },
    )

    await runAction(internal.functions.assemblyai.processRecordingTranscript, {
      jobId: transcript_id,
      recordingId: recording._id,
    })

    return new Response(null, { status: 200 })
  },
)
