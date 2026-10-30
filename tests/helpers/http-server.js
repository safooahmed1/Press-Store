import { once } from 'node:events'
import { createApp } from '../../server/src/app/create-app.js'
import { createLogger } from '../../server/src/platform/observability/logger.js'

/** Real loopback HTTP with per-test log capture; no application env or credentials. */
export async function startTestApp(t, options = {}) {
  const logs = []
  const logger = createLogger({ environment: 'test', sink: (line) => logs.push(JSON.parse(line)) })
  const app = await createApp({ config: { nodeEnv: 'test' }, logger, ...options })
  const server = app.listen(0, '127.0.0.1')
  // Register cleanup before awaiting listening so failed startup also has teardown.
  t.after(async () => {
    server.closeAllConnections()
    if (server.listening) await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
    })
  })
  await once(server, 'listening')
  return { server, logs, origin: `http://127.0.0.1:${server.address().port}` }
}
