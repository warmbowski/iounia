/**
 * Formats a timestamp in seconds into a string in HH:MM:SS format.
 *
 * @param timestampSec - A timestamp in seconds to format.
 * @returns A formatted string representing the timestamp in HH:MM:SS format.
 */
export function formatTimestamp(timestampSec: number) {
  const hours = Math.floor(timestampSec / 3600)
  const minutes = Math.floor(timestampSec / 60)
  const seconds = Math.floor(timestampSec % 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    seconds,
  ).padStart(2, '0')}`
}

/**
 * Generates a SHA-1 hash for a given file.
 *
 * @param file - The file to generate the SHA-1 hash for.
 * @returns {Promise<string>} A promise that resolves to the SHA-1 hash of the file as a hexadecimal string.
 */
export async function generateSha1Hash(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Ensures that an environment variable is set, throwing an error if it is not.
 *
 * @param name - The name of the environment variable to check.
 * @throws {Error} If the environment variable is not set.
 * @returns {string} The value of the environment variable.
 */
export function ensureEnvironmentVariable(name: string): string {
  const value = process.env[name]
  if (value === undefined) {
    throw new Error(`missing environment variable ${name}`)
  }
  return value
}

/**
 * Generates a short random alphanumeric code using crypto.getRandomValues().
 * This provides cryptographically stronger randomness.
 *
 * @param {number} length - The desired length of the code (default: 6).
 * @returns {string} The generated alphanumeric code.
 */
export function generateSecureAlphanumericCode(length = 8) {
  // Note: Ambiguous characters like 'O', '0', 'l', '1', 'I' are excluded to avoid user confusion.
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let result = ''
  const charactersLength = characters.length
  const randomBytes = new Uint8Array(length)

  crypto.getRandomValues(randomBytes)

  for (let i = 0; i < length; i++) {
    result += characters[randomBytes[i] % charactersLength]
  }

  return result
}
