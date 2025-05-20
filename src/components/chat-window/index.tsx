import { useQuery, useMutation } from 'convex/react'
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react'
import MessageItem from './message-item'
import { ServerMessage } from './server-message'
import { api } from '../../../convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

interface ChatWindowProps {
  campaignId: Id<'campaigns'>
}

export default function ChatWindow({ campaignId }: ChatWindowProps) {
  const [drivenIds, setDrivenIds] = useState<Set<string>>(new Set())
  const [isStreaming, setIsStreaming] = useState(false)
  const messages = useQuery(api.functions.messages.listMessages, {
    campaignId,
  })
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sendMessage = useMutation(api.functions.messages.sendMessage)
  const clearAllMessages = useMutation(api.functions.messages.clearMessages)

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior })
      }
    },
    [messagesEndRef],
  )

  const windowSize = useWindowSize()

  useEffect(() => {
    scrollToBottom()
  }, [windowSize, scrollToBottom])

  if (!messages) return null

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto py-6 px-4 md:px-8 lg:px-12"
      >
        <div className="w-full max-w-5xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-500">
              No messages yet. Start the conversation!
            </div>
          )}
          {messages.map((message) => (
            <React.Fragment key={message._id}>
              <MessageItem message={message} isUser={true}>
                {message.prompt}
              </MessageItem>
              <MessageItem message={message} isUser={false}>
                <ServerMessage
                  message={message}
                  isDriven={drivenIds.has(message._id)}
                  stopStreaming={() => {
                    setIsStreaming(false)
                    focusInput()
                  }}
                  scrollToBottom={scrollToBottom}
                />
              </MessageItem>
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 py-6 px-4 md:px-8 lg:px-12">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!inputValue.trim()) return

            setInputValue('')

            const chatId = await sendMessage({
              prompt: inputValue,
              campaignId: campaignId,
            })

            setDrivenIds((prev) => {
              prev.add(chatId)
              return prev
            })

            setIsStreaming(true)
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="flex-1 p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-base text-black"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isStreaming}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:text-gray-200 font-medium"
            >
              Send
            </button>
            <button
              type="button"
              disabled={isStreaming}
              onClick={() => {
                clearAllMessages({ campaignId })
                setInputValue('')
                setIsStreaming(false)
                focusInput()
              }}
              className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:text-gray-200 font-medium"
            >
              Clear Chat
            </button>
          </div>
          {isStreaming && (
            <div className="text-xs text-gray-500 mt-2">
              AI is responding...
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export function useWindowSize() {
  const [size, setSize] = useState([0, 0])
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return size
}
