import { mutation } from '../_generated/server'

export const generateUploadUrl = mutation({
  handler: async ({ storage, auth }) => {
    const user = await auth.getUserIdentity()
    if (!user) throw new Error('User not authenticated')

    return await storage.generateUploadUrl()
  },
})
