import { components, internal } from '../_generated/api'
import { R2 } from '@convex-dev/r2'
import { DataModel } from '../_generated/dataModel'
import { query } from '../_generated/server'
import { v } from 'convex/values'
import { checkUserAuthentication } from '../helpers/auth'
export const r2 = new R2(components.r2)

export const {
  generateUploadUrl,
  syncMetadata,
  getMetadata,
  listMetadata,
  deleteObject,
} = r2.clientApi<DataModel>({
  // The checkUpload callback is used for both `generateUploadUrl` and
  // `syncMetadata`.
  // In any of these checks, throw an error to reject the request.
  checkUpload: async (ctx, bucket) => {
    // const user = await userFromAuth(ctx);
    // ...validate that the user can upload to this bucket
  },
  checkReadKey: async (ctx, bucket, key) => {
    // const user = await userFromAuth(ctx);
    // ...validate that the user can read this key
  },
  checkReadBucket: async (ctx, bucket) => {
    // const user = await userFromAuth(ctx);
    // ...validate that the user can read this bucket
  },
  checkDelete: async (ctx, bucket, key) => {
    // const user = await userFromAuth(ctx);
    // ...validate that the user can delete this key
  },
  onUpload: async (ctx, bucket, key) => {
    // ...do something with the key
    // This technically runs in the `syncMetadata` mutation, as the upload
    // is performed from the client side. Will run if using the `useUploadFile`
    // hook, or if `syncMetadata` function is called directly. Runs after the
    // `checkUpload` callback.
    //
    // Note: If you want to associate the newly uploaded file with some other
    // data, like a message, useUploadFile returns the key in the client so you
    // can do it there.
    // await ctx.db.insert('images', {
    //   bucket,
    //   key,
    // })
  },
  onDelete: async (ctx, bucket, key) => {
    // Delete related data from your database, etc.
    // Runs after the `checkDelete` callback.
    // Alternatively, you could have your own `deleteImage` mutation that calls
    // the r2 component's `deleteObject` function.
    // const image = await ctx.db
    //   .query('images')
    //   .withIndex('bucket_key', (q) => q.eq('bucket', bucket).eq('key', key))
    //   .unique()
    // if (image) {
    //   await ctx.db.delete(image._id)
    // }
  },
})

export const getUrl = query({
  args: { key: v.string() },
  handler: async ({ auth }, { key }) => {
    await checkUserAuthentication(auth)

    const url = await r2.getUrl(key)
    return url
  },
})
