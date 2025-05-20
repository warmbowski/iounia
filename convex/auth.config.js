import { ensureEnvironmentVariable } from './utililties'

const CLERK_FRONTEND_API_URL = ensureEnvironmentVariable(
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
