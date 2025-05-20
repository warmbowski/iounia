import { query, mutation, internalQuery } from '../_generated/server'
import {
  StreamId,
  StreamIdValidator,
} from '@convex-dev/persistent-text-streaming'
import { v } from 'convex/values'
import { persistentTextStreaming } from './streaming'

export const listMessages = query({
  args: {
    campaignId: v.id('campaigns'),
  },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query('userMessages')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect()
  },
})

export const clearMessages = mutation({
  args: {
    campaignId: v.id('campaigns'),
  },
  handler: async (ctx, { campaignId }) => {
    const chats = await ctx.db
      .query('userMessages')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect()
    await Promise.all(chats.map((chat) => ctx.db.delete(chat._id)))
  },
})

export const sendMessage = mutation({
  args: {
    prompt: v.string(),
    campaignId: v.id('campaigns'),
  },
  handler: async (ctx, args) => {
    const responseStreamId = await persistentTextStreaming.createStream(ctx)
    const chatId = await ctx.db.insert('userMessages', {
      prompt: args.prompt,
      responseStreamId,
      campaignId: args.campaignId,
    })
    return chatId
  },
})

export const getHistory = internalQuery({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, { streamId }) => {
    // Grab all the user messages
    const allMessages = await ctx.db
      .query('userMessages')
      .withIndex('by_stream', (q) => q.eq('responseStreamId', streamId))
      .collect()

    // Lets join the user messages with the assistant messages
    const joinedResponses = await Promise.all(
      allMessages.map(async (userMessage) => {
        return {
          userMessage,
          responseMessage: await persistentTextStreaming.getStreamBody(
            ctx,
            userMessage.responseStreamId as StreamId,
          ),
        }
      }),
    )

    return joinedResponses.flatMap((joined) => {
      const user = {
        role: 'user' as const,
        content: joined.userMessage.prompt,
      }

      const assistant = {
        role: 'assistant' as const,
        content: joined.responseMessage.text,
      }

      // If the assistant message is empty, its probably because we have not
      // started streaming yet so lets not include it in the history
      if (!assistant.content) return [user]

      return [user, assistant]
    })
  },
})
