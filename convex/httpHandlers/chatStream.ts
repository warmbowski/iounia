// Create an HTTP action that generates chunks of the chat body

import { internal } from '../_generated/api'
import { httpAction } from '../_generated/server'
import { persistentTextStreaming } from '../functions/streaming'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { ensureServerEnironmentVariable } from '../helpers/utililties'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'
import { Id } from '../_generated/dataModel'
import { TIME_SPAN_CONTEXT_LENGTH_MS } from '../constants'

const GEMINI_API_KEY = ensureServerEnironmentVariable('GEMINI_API_KEY')

const google = createGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
})

export const streamChat = httpAction(async (ctx, request) => {
  const body = (await request.json()) as {
    streamId: string
  }

  const campaignId = new URL(request.url).searchParams.get('campaignId')
  if (!campaignId || !body.streamId) {
    return new Response('Bad Request', { status: 400 })
  }

  const response = await persistentTextStreaming.stream(
    ctx,
    request,
    body.streamId as StreamId,
    async (ctx, request, streamId, append) => {
      const history = await ctx.runQuery(
        internal.functions.messages.getHistory,
        {
          streamId: body.streamId,
        },
      )

      const lastPrompt = history.filter((m) => m.role === 'user')[0].content

      const [embed] = await ctx.runAction(
        internal.functions.transcripts.generateTextEmbeddings,
        {
          texts: [lastPrompt],
        },
      )

      // Perform a vector search to find relevant id/score of transcript utterances based on the embeddings
      const hiScoreTranscriptIds = await ctx
        .vectorSearch('transcripts', 'by_campaign_embeddings', {
          vector: embed || [],
          limit: 25,
          filter: (q) => q.eq('campaignId', campaignId),
        })
        .then((res) => res.filter((r) => r._score > 0.5))

      // get the start times for the transcript utterances
      const transcriptTimes = await ctx
        .runQuery(internal.functions.transcripts.getTranscriptParts, {
          transcriptId: hiScoreTranscriptIds.map((result) => result._id),
        })
        .then((transcriptParts) =>
          transcriptParts.map((part) => ({
            id: part._id,
            recId: part.recordingId,
            atTime: part.start,
          })),
        )

      // generate larger context of 5 minutes around the transcript times
      const context = await Promise.all(
        transcriptTimes.map((time) => {
          return ctx
            .runQuery(
              internal.functions.transcripts.listTranscriptPartsByRecordingId,
              {
                recordingId: time.recId as Id<'recordings'>,
                range: {
                  start: time.atTime - TIME_SPAN_CONTEXT_LENGTH_MS / 2,
                  end: time.atTime + TIME_SPAN_CONTEXT_LENGTH_MS / 2,
                },
              },
            )
            .then((parts) => parts.map((part) => part.text).join('\n'))
        }),
      ).then((texts) => texts.join('\n'))

      const { textStream } = streamText({
        model: google('gemini-2.5-flash-preview-04-17'),
        messages: [
          {
            role: 'system',
            content: `The following messages contain context for an ongoing campaign which consists of a list of relevant messages from the
            campaign's transcripts to inform your response:
            ${context}`,
          },
          {
            role: 'system',
            content: `You are the game master for this campaign and you need to answer questions about the campaign
            including events, characters, and locations. You are not a player in the campaign. Please anser the question based
            the context data passed to you. The context data is a list of relevant messages from the campaign's transcripts.

            You are continuing a conversation. The conversation so far is found in the following JSON-formatted value:`,
          },
          ...history,
        ],
      })

      // Append each chunk to the persistent stream as they come in from openai
      for await (const part of textStream) await append(part || '')
    },
  )

  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Vary', 'Origin')

  return response
})

export const streamChatOptions = httpAction(async (_, request) => {
  const headers = request.headers
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    return new Response(null, {
      headers: new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Digest',
        'Access-Control-Max-Age': '86400',
      }),
    })
  } else {
    return new Response()
  }
})
