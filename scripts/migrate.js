import { readDatabaseConfig } from '../server/src/config/database-config.js'
import { loadMigrations } from '../server/src/platform/db/migration-files.js'
import { runMigrations } from '../server/src/platform/db/migrate.js'

try {
  const config = readDatabaseConfig()
  const result = await runMigrations({ config, migrations: await loadMigrations() })
  console.log(`Migrations applied: ${result.applied.length}; skipped: ${result.skipped}`)
} catch {
  console.error('Migration execution stopped. Check configuration and inspect migration state; do not retry unresolved migrations.')
  process.exitCode = 1
}
