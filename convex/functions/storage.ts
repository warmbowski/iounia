import { mutation } from '../_generated/server'
import { checkUserAuthentication } from '../helpers/auth'

export const generateUploadUrl = mutation({
  handler: async ({ storage, auth }) => {
    await checkUserAuthentication(auth)

    return await storage.generateUploadUrl()
  },
})
