import { once } from 'node:events'
import { readRuntimeConfig } from '../config/runtime-config.js'
import { readDatabaseConfig } from '../config/database-config.js'
import { createDatabase } from '../platform/db/database.js'
import { createApp } from './create-app.js'
import { loadFeatureManifests } from './feature-manifests.js'
import { createLogger } from '../platform/observability/logger.js'

export async function startServer({ config, databaseConfig, databaseFactory = createDatabase,
  manifestsLoader = loadFeatureManifests, logger } = {}) {
  let runtimeLogger = logger ?? createLogger()
  const log = (event, fields) => {
    try { Promise.resolve(runtimeLogger.log(event, fields)).catch(() => {}) } catch { /* safe sink boundary */ }
  }
  let database
  let server
  try {
    config ??= readRuntimeConfig()
    runtimeLogger = logger ?? createLogger({ environment: config.nodeEnv })
    databaseConfig ??= readDatabaseConfig()
    database = databaseFactory(databaseConfig)
    if (!await database.check()) throw new Error('Database unavailable')
    const manifests = await manifestsLoader()
    const app = await createApp({ config, manifests, isReady: () => database.check(), logger: runtimeLogger })
    server = app.listen(config.port)
    await once(server, 'listening')
    server.closeDatabase = () => database.close()
    log('application.started')
    return server
  } catch (error) {
    log('application.startup.failed', { level: 'error', errorCode: 'STARTUP_FAILED' })
    if (server?.listening) await new Promise((resolve) => server.close(resolve))
    await database?.close()
    throw error
  }
}
