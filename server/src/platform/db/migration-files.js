import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function migrationChecksum(sql) {
  return createHash('sha256').update(sql, 'utf8').digest('hex')
}

export function orderedMigrations(migrations) {
  const names = new Set()
  for (const migration of migrations) {
    if (!/^[a-z][a-z0-9-]*_\d{3,}_[a-z][a-z0-9_]*\.sql$/.test(migration.name)
      || migration.name.length > 190 || names.has(migration.name)
      || typeof migration.sql !== 'string' || !migration.sql.trim()) {
      throw new Error('Invalid or duplicate migration')
    }
    names.add(migration.name)
  }
  return migrations.map(({ name, sql }) => ({ name, sql, checksum: migrationChecksum(sql) }))
    .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
}

async function entries(directory) {
  try { return await readdir(directory, { withFileTypes: true }) } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

/** Discover only the documented immediate feature/migrations seam. */
export async function loadMigrations({
  featuresRoot = fileURLToPath(new URL('../../features/', import.meta.url)),
} = {}) {
  const files = []
  for (const feature of await entries(featuresRoot)) {
    if (!feature.isDirectory()) continue
    const directory = path.join(featuresRoot, feature.name, 'migrations')
    for (const entry of await entries(directory)) {
      if (!entry.name.endsWith('.sql')) continue
      if (!entry.isFile()) throw new Error('Migration must be a regular SQL file')
      files.push({ name: entry.name, sql: await readFile(path.join(directory, entry.name), 'utf8') })
    }
  }
  return orderedMigrations(files)
}
