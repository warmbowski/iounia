export const formatTimestamp = (timestampSec: number) => {
  const hours = Math.floor(timestampSec / 3600)
  const minutes = Math.floor(timestampSec / 60)
  const seconds = Math.floor(timestampSec % 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    seconds,
  ).padStart(2, '0')}`
}
