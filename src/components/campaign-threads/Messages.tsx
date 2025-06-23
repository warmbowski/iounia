import { useRef, useLayoutEffect } from 'react'
import { Card, CardBody, Avatar, ScrollShadow } from '@heroui/react'
import { Icon } from '@iconify/react'
import { toUIMessages, useThreadMessages } from '@convex-dev/agent/react'
import { api } from 'convex/_generated/api'

interface MessagesProps {
  threadId: string
}

export function Messages({ threadId }: MessagesProps) {
  const threadMessages = useThreadMessages(
    api.functions.agents.campaign.listThreadMessages,
    { threadId },
    { initialNumItems: 20, stream: true },
  )

  const messages = toUIMessages(threadMessages.results ?? [])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 mx-4 my-2">
      <Card className="h-full" radius="lg">
        <CardBody className="p-0">
          <ScrollShadow className="h-full p-4">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.key}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role !== 'user' && (
                      <Avatar
                        icon={<Icon icon="lucide:bot" />}
                        className="bg-primary/10 text-primary flex-shrink-0"
                        size="sm"
                      />
                    )}
                    <div
                      className={`max-w-[70%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-default-100'
                      } rounded-large px-4 py-3`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {typeof message.content === 'string'
                          ? message.content
                          : JSON.stringify(message.content)}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <Avatar
                        icon={<Icon icon="lucide:user" />}
                        className="bg-secondary/10 text-secondary flex-shrink-0"
                        size="sm"
                      />
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Icon
                  icon="lucide:message-square"
                  className="text-default-300 text-4xl mb-4"
                />
                <h4 className="font-semibold text-lg mb-2">
                  Start the conversation
                </h4>
                <p className="text-default-500 text-sm max-w-md">
                  Send a message to begin chatting with the AI assistant about
                  this campaign.
                </p>
              </div>
            )}
          </ScrollShadow>
        </CardBody>
      </Card>
    </div>
  )
}
