import { once } from 'node:events'
import { readRuntimeConfig } from '../config/runtime-config.js'
import { readDatabaseConfig } from '../config/database-config.js'
import { createDatabase } from '../platform/db/database.js'
import { createApp } from './create-app.js'
import { loadFeatureManifests } from './feature-manifests.js'

export async function startServer({ config = readRuntimeConfig(),
  databaseConfig = readDatabaseConfig(), databaseFactory = createDatabase,
  manifestsLoader = loadFeatureManifests } = {}) {
  const database = databaseFactory(databaseConfig)
  let server
  try {
    if (!await database.check()) throw new Error('Database unavailable')
    const manifests = await manifestsLoader()
    const app = await createApp({ config, manifests, isReady: () => database.check() })
    server = app.listen(config.port)
    await once(server, 'listening')
    server.closeDatabase = () => database.close()
    return server
  } catch (error) {
    if (server?.listening) await new Promise((resolve) => server.close(resolve))
    await database.close()
    throw error
  }
}
