import { Migrations } from '@convex-dev/migrations'
import { components } from './_generated/api.js'
import { DataModel } from './_generated/dataModel.js'

export const migrations = new Migrations<DataModel>(components.migrations)

/**
 * Migration to populate the `campaignId` field to all transcript parts.
 * CLI command: `pnpx convex run migrations:runner '{fn: "migrations:addCampaignIdToTranscriptParts"}'
 *
 * This migration is deprecated because the `campaignId` field has been populated.
 */
export const addCampaignIdToTranscriptParts = migrations.define({
  table: 'transcripts',
  migrateOne: async (ctx, doc) => {
    if (doc.campaignId === undefined) {
      const campaignId = await ctx.db
        .query('sessions')
        .withIndex('by_id', (q) => q.eq('_id', doc.sessionId))
        .first()
        .then((session) => session?.campaignId)

      console.info(
        `Adding campaignId ${campaignId} to transcript part ${doc._id}`,
      )

      if (campaignId) {
        return {
          ...doc,
          campaignId,
        }
      }
    }
  },
})

export const runner = migrations.runner()
