import { ensureServerEnironmentVariable } from './utililties'

const CLERK_FRONTEND_API_URL = ensureServerEnironmentVariable(
  'CLERK_FRONTEND_API_URL',
)

export default {
  providers: [
    {
      domain: CLERK_FRONTEND_API_URL,
      applicationID: 'convex',
    },
  ],
}
