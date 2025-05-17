import { httpRouter } from 'convex/server'
import { receiveAssemblyAIWebhook } from './httpHandlers/webhooks.assemblyai'
import { streamChat, streamChatOptions } from './httpHandlers/chatStream'

const http = httpRouter()

http.route({
  path: '/webhooks/assemblyai',
  method: 'POST',
  handler: receiveAssemblyAIWebhook,
})

http.route({
  path: '/chat-stream',
  method: 'POST',
  handler: streamChat,
})

http.route({
  path: '/chat-stream',
  method: 'OPTIONS',
  handler: streamChatOptions,
})

export default http
