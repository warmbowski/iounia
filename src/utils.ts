/**
 *
 * @param date - date to format
 * @description Formats a date into a string in the format "MMM DD, YYYY"
 * @example formatDate('2023-10-01') => "Oct 01, 2023"
 * @example formatDate(1696118400000) => "Oct 01, 2023"
 * @returns
 */
export function formatDate(date: string | number) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 *
 * @param seconds - seconds to format
 * @description Formats seconds into a string in the format HH:MM:SS
 * @example formatTime(3661) => "01:01:01"
 * @returns
 */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':')
}
