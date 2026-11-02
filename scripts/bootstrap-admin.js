import { pathToFileURL } from 'node:url'
import { readAdminBootstrapConfig } from '../server/src/config/admin-bootstrap-config.js'
import { readDatabaseConfig } from '../server/src/config/database-config.js'
import { createDatabase } from '../server/src/platform/db/database.js'
import { bootstrapAdmin } from '../server/src/features/auth/services/bootstrap-admin.js'

/** Injectable process boundary; importing the command performs no provisioning or env reads. */
export async function runAdminBootstrap({ args = [], readInput = readAdminBootstrapConfig,
  readDatabase = readDatabaseConfig, databaseFactory = createDatabase,
  output = console.log, errorOutput = console.error } = {}) {
  try {
    if (args.length) throw new Error('Arguments are not accepted')
    const input = readInput()
    const database = databaseFactory(readDatabase())
    let result
    try { result = await bootstrapAdmin({ database, input }) }
    finally { await database.close() }
    output(result.status === 'created' ? 'Admin created.' : 'Admin unchanged.')
    return 0
  } catch {
    errorOutput('Admin bootstrap stopped. Check protected configuration and existing admin identity.')
    return 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await runAdminBootstrap({ args: process.argv.slice(2) })
}
