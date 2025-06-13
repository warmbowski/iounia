import { Migrations } from '@convex-dev/migrations'
import { api, components } from './_generated/api.js'
import { DataModel } from './_generated/dataModel.js'
import { run } from 'node:test'

export const migrations = new Migrations<DataModel>(components.migrations)

/**
 * Migration to remove all transcript parts with recordings that don't exist anymore.
 * CLI command: `pnpx convex run migrations:runner '{fn: "migrations:addCampaignIdToTranscriptParts"}'
 *
 * This migration can be run in cron to make sure orphaned transcripts are removed.
 */
export const deleteOrphanedTranscriptParts = migrations.define({
  table: 'transcripts',
  migrateOne: async (ctx, doc) => {
    const recordingExists = await ctx.db
      .query('recordings')
      .withIndex('by_id', (q) => q.eq('_id', doc.recordingId))
      .first()

    if (!recordingExists) {
      console.info(
        `Deleting transcript part ${doc._id} because recording ${doc.recordingId} does not exist`,
      )

      console.info(`Transcript part ${doc._id} will be deleted.`)
      const result = ctx.db.delete(doc._id)
    }
  },
})

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
