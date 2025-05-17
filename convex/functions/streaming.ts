import { v } from 'convex/values'
import { components } from '../_generated/api'
import { mutation, query } from '../_generated/server'
import {
  PersistentTextStreaming,
  StreamIdValidator,
  StreamId,
} from '@convex-dev/persistent-text-streaming'

export const persistentTextStreaming = new PersistentTextStreaming(
  components.persistentTextStreaming,
)

// Create a query that returns the chat body.
export const getStreamBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await persistentTextStreaming.getStreamBody(
      ctx,
      args.streamId as StreamId,
    )
  },
})
