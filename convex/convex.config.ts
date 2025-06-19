import { defineApp } from 'convex/server'
import migrations from '@convex-dev/migrations/convex.config'
import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config'
import presence from '@convex-dev/presence/convex.config'
import r2 from '@convex-dev/r2/convex.config'

const app = defineApp()
app.use(migrations)
app.use(persistentTextStreaming)
app.use(presence)
app.use(r2)

export default app
