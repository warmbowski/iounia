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

/**
 * Migration to convert session dates to ISO dates.
 * CLI command: `pnpx convex run migrations:runner '{fn: "migrations:convertSessionDatesToIsoDates"}'
 *
 * This migration is deprecated because the `date` field has been converted to ISO format.
 */
export const convertSessionDatesToIsoDates = migrations.define({
  table: 'sessions',
  migrateOne: async (ctx, doc) => {
    if (doc.date && !doc.date.includes('T')) {
      const tz = 'T07:00:00.000Z'
      const isoDate = doc.date + tz
      console.info(
        `Converting date of session ${doc._id} to ISO Date ${isoDate}`,
      )
      return {
        ...doc,
        date: isoDate,
      }
    }
  },
})

export const runner = migrations.runner()
