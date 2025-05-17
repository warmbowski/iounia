import { defineApp } from 'convex/server'
import r2 from '@convex-dev/r2/convex.config'
import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config'

const app = defineApp()
app.use(persistentTextStreaming)
app.use(r2)

export default app
