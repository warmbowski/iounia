// Create an HTTP action that generates chunks of the chat body

import { internal } from '../_generated/api'
import { httpAction } from '../_generated/server'
import { persistentTextStreaming } from '../functions/streaming'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { ensureEnvironmentVariable } from '../utililties'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'
import { Id } from '../_generated/dataModel'

const GEMINI_API_KEY = ensureEnvironmentVariable('GEMINI_API_KEY')

const google = createGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
})

export const streamChat = httpAction(async (ctx, request) => {
  const body = (await request.json()) as {
    streamId: string
    campaignId: Id<'campaigns'>
  }

  const response = await persistentTextStreaming.stream(
    ctx,
    request,
    body.streamId as StreamId,
    async (ctx, request, streamId, append) => {
      const history = await ctx.runQuery(
        internal.functions.messages.getHistory,
        {
          campaignId: body.campaignId,
        },
      )

      const [embed] = await ctx.runAction(
        internal.functions.transcripts.generateTextEmbeddings,
        {
          texts: [history.filter((m) => m.role === 'user')[0].content],
        },
      )

      const results = await ctx.vectorSearch('transcripts', 'by_embedding', {
        vector: embed,
        limit: 10,
        filter: (q) => q.eq('cuisine', 'French'),
      })

      const { textStream } = streamText({
        model: google('gemini-2.5-flash-preview-04-17'),
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that can answer questions and help with tasks.
          Please provide your response in markdown format.
          
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
