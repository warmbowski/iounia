import { getTokenIdentifierParts } from './utililties'
import { Auth } from 'convex/server'
import { UnauthenticatedError } from './errors'

/**
 * Helper function to check authenticate of a user and return their user ID
 * Throws a standardized ConvexError if user is not authenticated
 *
 * @param auth - The auth object from Convex context
 * @returns The authenticated user's ID
 */
export async function checkUserAuthentication(auth: Auth) {
  const user = await auth.getUserIdentity()

  if (!user) {
    throw new UnauthenticatedError('User not authenticated')
  }

  // Use the existing utility function to get the user ID
  const { id: userId } = getTokenIdentifierParts(user.tokenIdentifier)

  return userId
}
