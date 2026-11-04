import { readCatalogStorageConfig, validateCatalogStorageConfig } from '../config/catalog-storage-config.js'
import { once } from 'node:events'
import { readRuntimeConfig } from '../config/runtime-config.js'
import { readDatabaseConfig } from '../config/database-config.js'
import { createDatabase } from '../platform/db/database.js'
import { createApp } from './create-app.js'
import { loadFeatureManifests } from './feature-manifests.js'
import { createLogger } from '../platform/observability/logger.js'
import { readProductionConfig, validateProductionConfig } from '../config/production-config.js'

export async function startServer({ config, databaseConfig, databaseFactory = createDatabase,
  manifestsLoader = loadFeatureManifests, logger, productionConfig, storageConfig } = {}) {
  let runtimeLogger = logger ?? createLogger()
  const log = (event, fields) => {
    try { Promise.resolve(runtimeLogger.log(event, fields)).catch(() => {}) } catch { /* safe sink boundary */ }
  }
  let database
  let server
  try {
    config ??= readRuntimeConfig()
    runtimeLogger = logger ?? createLogger({ environment: config.nodeEnv })
    if (config.nodeEnv === 'production') {
      productionConfig = await validateProductionConfig(productionConfig ?? readProductionConfig())
    }
    if (config.nodeEnv === 'production') {
      if (storageConfig && storageConfig.root !== productionConfig.uploadRoot) throw new Error('Storage root mismatch')
      storageConfig = validateCatalogStorageConfig({ root: productionConfig.uploadRoot })
    } else storageConfig = storageConfig ? validateCatalogStorageConfig(storageConfig) : readCatalogStorageConfig(config.nodeEnv)
    databaseConfig ??= readDatabaseConfig()
    database = databaseFactory(databaseConfig)
    if (!await database.check()) throw new Error('Database unavailable')
    const manifests = await manifestsLoader(undefined, { database, config,
      appOrigin: productionConfig?.appOrigin, storageConfig })
    const app = await createApp({ config, manifests, isReady: () => database.check(),
      logger: runtimeLogger, productionConfig })
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
