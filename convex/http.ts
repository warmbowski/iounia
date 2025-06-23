import { httpRouter } from 'convex/server'
import { receiveAssemblyAIWebhook } from './httpHandlers/webhooks.assemblyai'

const http = httpRouter()

http.route({
  path: '/webhooks/assemblyai',
  method: 'POST',
  handler: receiveAssemblyAIWebhook,
})

export default http
