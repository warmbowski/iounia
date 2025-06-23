import { useState, useLayoutEffect } from 'react'
import type { Id } from 'convex/_generated/dataModel'
import { api } from 'convex/_generated/api'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Avatar,
  Chip,
  ScrollShadow,
  Listbox,
  ListboxItem,
  Spacer,
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useMutation, usePaginatedQuery } from 'convex/react'
import { Messages } from './Messages'
import { optimisticallySendMessage } from '@convex-dev/agent/react'

interface CampaignThreadsProps {
  campaignId: Id<'campaigns'>
}

export default function CampaignThreads({ campaignId }: CampaignThreadsProps) {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  const createThread = useMutation(
    api.functions.agents.campaign.createCampaignThread,
  )
  const sendMessage = useMutation(
    api.functions.agents.campaign.streamChatAsynchronously,
  ).withOptimisticUpdate(
    optimisticallySendMessage(api.functions.agents.campaign.listThreadMessages),
  )
  const { results: allThreads, isLoading } = usePaginatedQuery(
    api.functions.agents.campaign.listThreadsByCampaign,
    {
      campaignId,
    },
    { initialNumItems: 20 },
  )

  const selectedThread = allThreads?.find((thread) => thread._id === threadId)

  const handleNewThread = async () => {
    const newThreadId = await createThread({ campaignId })
    if (newThreadId) {
      setThreadId(newThreadId)
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || !threadId) return
    // TODO: Implement message sending
    sendMessage({ threadId, prompt: inputValue, campaignId }).catch(() =>
      setInputValue(inputValue),
    )

    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Thread List */}
      <div className="w-80 border-r border-divider flex flex-col">
        <Card className="m-4 mb-2" radius="lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon
                icon="lucide:message-circle"
                className="text-primary text-xl"
              />
              <div>
                <h2 className="text-lg font-semibold">Chat Threads</h2>
                <p className="text-small text-default-500">
                  {allThreads?.length || 0} conversations
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex-1 px-4 pb-4">
          <ScrollShadow className="h-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Icon
                  icon="lucide:loader-2"
                  className="animate-spin text-primary text-xl"
                />
              </div>
            ) : allThreads?.length ? (
              <Listbox
                aria-label="Chat threads"
                variant="flat"
                selectionMode="single"
                selectedKeys={threadId ? [threadId] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string
                  if (key) setThreadId(key)
                }}
              >
                {allThreads.map((thread) => (
                  <ListboxItem
                    key={thread._id}
                    className="mb-2"
                    textValue={thread.title}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-sm truncate">
                        {thread.title}
                      </div>
                      <div className="text-xs text-default-500">
                        {/* You can add last message preview or timestamp here */}
                        Thread ID: {thread._id.slice(-6)}
                      </div>
                    </div>
                  </ListboxItem>
                ))}
              </Listbox>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Icon
                  icon="lucide:message-circle"
                  className="text-default-300 text-3xl mb-2"
                />
                <p className="text-default-500 text-sm">No threads yet</p>
              </div>
            )}
          </ScrollShadow>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {threadId && selectedThread ? (
          <>
            {/* Chat Header */}
            <Card className="m-4 mb-0" radius="lg">
              <CardHeader className="justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    icon={<Icon icon="lucide:bot" />}
                    className="bg-primary/10 text-primary"
                    size="sm"
                  />
                  <div>
                    <h3 className="font-semibold">{selectedThread.title}</h3>
                    <p className="text-small text-default-500">AI Assistant</p>
                  </div>
                </div>
                <Chip color="success" variant="dot" size="sm">
                  Online
                </Chip>
              </CardHeader>
            </Card>

            <Messages threadId={threadId} />

            <div className="p-4">
              <Card radius="lg">
                <CardBody className="p-4">
                  <div className="flex gap-3 items-end">
                    <Input
                      placeholder="Type your message..."
                      value={inputValue}
                      onValueChange={setInputValue}
                      onKeyPress={handleKeyPress}
                      variant="bordered"
                      size="lg"
                      className="flex-1"
                      startContent={
                        <Icon icon="lucide:type" className="text-default-400" />
                      }
                      aria-label="Message input"
                    />
                    <Button
                      color="primary"
                      size="lg"
                      isIconOnly
                      onPress={handleSendMessage}
                      isDisabled={!inputValue.trim()}
                      aria-label="Send message"
                    >
                      <Icon icon="lucide:send" className="text-lg" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        ) : (
          /* No Thread Selected State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Icon
              icon="lucide:message-circle"
              className="text-default-300 text-6xl mb-6"
            />
            <h3 className="text-2xl font-semibold mb-4">
              Select a conversation
            </h3>
            <p className="text-default-500 text-lg max-w-md">
              Choose a thread from the sidebar to continue chatting, or start a
              new conversation thread.
            </p>
            <Spacer y={6} />
            <Button
              color="primary"
              size="lg"
              startContent={<Icon icon="lucide:plus" />}
              aria-label="Start new conversation"
              onPress={handleNewThread}
            >
              Start New Conversation
            </Button>
          </div>
        )}
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
