import { paginationOptsValidator } from 'convex/server'
import { Agent, vStreamArgs } from '@convex-dev/agent'
import { components, internal } from '../../_generated/api'
import {
  ActionCtx,
  internalAction,
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from '../../_generated/server'
import { v } from 'convex/values'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { ensureServerEnironmentVariable } from '../../helpers/utililties'
import { checkUserAuthentication } from '../../helpers/auth'

const GEMINI_API_KEY = ensureServerEnironmentVariable('GEMINI_API_KEY')

const google = createGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
})

export const campaignAgent = new Agent(components.agent, {
  name: 'CampaignChat',
  chat: google('gemini-2.5-flash-lite-preview-06-17'),
  textEmbedding: google.textEmbeddingModel('text-embedding-004'),
  instructions: `You are the game master for this campaign and you need to answer questions about the campaign
    including events, characters, and locations. You are not a player in the campaign. Please answer the question based
    onthe context data passed to you. The context data is a list of relevant messages from the campaign's transcripts.`,
  storageOptions: { saveMessages: 'promptAndOutput' },
})

async function authorizeThreadAccess(
  ctx: QueryCtx | MutationCtx | ActionCtx,
  threadId: string,
) {
  const userId = await checkUserAuthentication(ctx.auth)
}

export const createCampaignThread = mutation({
  args: {
    campaignId: v.id('campaigns'),
    threadScope: v.optional(v.union(v.literal('campaign'), v.literal('npc'))),
  },
  handler: async (ctx, { threadScope = 'campaign', campaignId }) => {
    const userId = await checkUserAuthentication(ctx.auth)
    const { threadId } = await campaignAgent.createThread(ctx, {
      userId,
      title: 'New Campaign Thread',
    })
    await ctx.db.insert('threadTracker', {
      threadId,
      campaignId,
      threadScope,
      userId,
    })

    return threadId
  },
})

// Streaming, where generate the prompt message first, then asynchronously
// generate the stream response.
export const streamChatAsynchronously = mutation({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    campaignId: v.id('campaigns'),
  },
  handler: async (ctx, { prompt, threadId, campaignId }) => {
    await authorizeThreadAccess(ctx, threadId)
    await campaignAgent.saveMessage(ctx, {
      threadId,
      prompt,
      // we're in a mutation, so skip embeddings for now. They'll be generated
      // lazily when streaming text.
      skipEmbeddings: true,
    })
    await ctx.scheduler.runAfter(
      0,
      internal.functions.agents.campaign.streamChat,
      {
        threadId,
        prompt,
        campaignId,
      },
    )
  },
})

export const streamChat = internalAction({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    campaignId: v.id('campaigns'),
  },
  handler: async (ctx, { prompt, threadId, campaignId }) => {
    const { thread } = await campaignAgent.continueThread(ctx, { threadId })
    const context = await ctx.runAction(
      internal.functions.transcripts.getTranscriptVectorSearch,
      { prompt, campaignId },
    )
    const result = await thread.streamText(
      {
        messages: [
          {
            role: 'user',
            content: `The following text contains context for an ongoing campaign which consists of relevant text from the
            campaign's transcripts to inform your response:
            ${context}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      { saveStreamDeltas: true },
    )
    await result.consumeStream()
  },
})

export const listThreadsByCampaign = query({
  args: {
    campaignId: v.id('campaigns'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { campaignId, paginationOpts }) => {
    const userId = await checkUserAuthentication(ctx.auth)

    const threadList = await ctx.db
      .query('threadTracker')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .paginate(paginationOpts)

    const threads = await Promise.all(
      threadList.page.map((tl) => {
        return ctx.runQuery(components.agent.threads.getThread, {
          threadId: tl.threadId,
        })
      }),
    ).then((threads) => threads.filter((t) => t !== null))

    return { ...threadList, page: threads }
  },
})

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const { threadId, paginationOpts, streamArgs } = args
    await authorizeThreadAccess(ctx, threadId)

    const streams = await campaignAgent.syncStreams(ctx, {
      threadId,
      streamArgs,
    })
    // Here you could filter out / modify the stream of deltas / filter out
    // deltas.

    const paginated = await campaignAgent.listMessages(ctx, {
      threadId,
      paginationOpts,
    })

    return {
      ...paginated,
      streams,
    }
  },
})
