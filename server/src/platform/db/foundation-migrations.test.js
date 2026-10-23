import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { loadMigrations, orderedMigrations } from './migration-files.js'
import { runMigrations } from './migrate.js'

describe('foundation migration source discovery', () => {
  it('discovers named feature SQL files and orders immutable checksums deterministically', async (t) => {
    const root = await mkdtemp(path.join(tmpdir(), 'press-fnd-migrations-'))
    t.after(() => rm(root, { recursive: true, force: true }))
    for (const feature of ['beta', 'alpha']) {
      await mkdir(path.join(root, feature, 'migrations'), { recursive: true })
      await writeFile(path.join(root, feature, 'migrations', `${feature}_001_create_fixture.sql`), 'SELECT 1;')
    }
    const migrations = await loadMigrations({ featuresRoot: root })
    assert.deepEqual(migrations.map(({ name }) => name), ['alpha_001_create_fixture.sql', 'beta_001_create_fixture.sql'])
    assert.match(migrations[0].checksum, /^[a-f0-9]{64}$/)
    assert.deepEqual(await loadMigrations({ featuresRoot: path.join(root, 'missing') }), [])
    assert.notEqual(orderedMigrations([{ name: migrations[0].name, sql: 'SELECT 2;' }])[0].checksum,
      migrations[0].checksum)
  })

  it('rejects malformed and duplicate names before any database connection', async () => {
    for (const name of ['../escape.sql', 'missing-order.sql', 'AUTH_001_create.sql', 'a_1_create.sql']) {
      assert.throws(() => orderedMigrations([{ name, sql: 'SELECT 1' }]), /Invalid/)
    }
    const migration = { name: 'fnd_001_create_fixture.sql', sql: 'SELECT 1;' }
    let connected = false
    await assert.rejects(runMigrations({ config: {}, migrations: [migration, migration],
      connect: async () => { connected = true } }), /Invalid/)
    assert.equal(connected, false)
    await assert.rejects(runMigrations({ config: {},
      migrations: [{ name: 'fnd_000_create_migration_metadata.sql', sql: 'SELECT 1;' }],
      connect: async () => { connected = true },
    }), { code: 'MIGRATION_NAME_RESERVED' })
    assert.equal(connected, false)
  })
})
