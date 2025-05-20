import { getConvexSiteUrl } from '@/utils'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { useStream } from '@convex-dev/persistent-text-streaming/react'
import { api } from '../../../convex/_generated/api'
import type { Doc } from '../../../convex/_generated/dataModel'
import { useMemo, useEffect } from 'react'

export function ServerMessage({
  message,
  isDriven,
  stopStreaming,
  scrollToBottom,
}: {
  message: Doc<'userMessages'>
  isDriven: boolean
  stopStreaming: () => void
  scrollToBottom: () => void
}) {
  const { text, status } = useStream(
    api.functions.streaming.getStreamBody,
    new URL(
      `${getConvexSiteUrl()}/chat-stream?campaignId=${message.campaignId}`,
    ),
    isDriven,
    message.responseStreamId as StreamId,
  )

  const isCurrentlyStreaming = useMemo(() => {
    if (!isDriven) return false
    return status === 'pending' || status === 'streaming'
  }, [isDriven, status])

  useEffect(() => {
    if (!isDriven) return
    if (isCurrentlyStreaming) return
    stopStreaming()
  }, [isDriven, isCurrentlyStreaming, stopStreaming])

  useEffect(() => {
    if (!text) return
    scrollToBottom()
  }, [text, scrollToBottom])

  return (
    <div className="md-answer">
      <code>{text || 'Thinking...'}</code>
      {status === 'error' && (
        <div className="text-red-500 mt-2">Error loading response</div>
      )}
    </div>
  )
}
