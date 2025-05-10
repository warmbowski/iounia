import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'

const http = httpRouter()

http.route({
  path: '/webhooks/assemblyai',
  method: 'POST',
  handler: httpAction(async ({ runQuery, runAction }, request) => {
    const signature = request.headers.get('x-assemblyai-256')!
    const bodyString = await request.text()

    if (signature !== process.env.ASSEMBLYAI_WEBHOOK_SECRET) {
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
  }),
})

export default http
