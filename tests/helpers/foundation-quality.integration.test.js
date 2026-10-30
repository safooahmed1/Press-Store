import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { localDatabaseTestsEnabled } from '../../server/src/config/database-config.js'
import { startDisposableMysql } from '../../server/src/platform/db/testing/disposable-mysql.js'
import { createDatabase } from '../../server/src/platform/db/database.js'
import { runMigrations } from '../../server/src/platform/db/migrate.js'
import { countQueries } from './query-counter.js'

describe('foundation bounded query and plan sanity', {
  skip: !localDatabaseTestsEnabled() && 'Requires FND_DISPOSABLE_MYSQL_TESTS=1 and local MySQL binaries',
}, () => {
  it('uses an indexed parameterized lookup and a bounded page without N+1 work', async (t) => {
    const fixture = await startDisposableMysql()
    let database
    t.after(async () => { try { await database?.close() } finally { await fixture.stop() } })
    database = createDatabase(fixture.config)
    await runMigrations({ config: fixture.config, migrations: [{
      name: 'test_001_create_quality_fixtures.sql',
      sql: `-- Owner: FND test only. Recovery: discard the private disposable database.
        -- Primary key supports lookup and ordered bounded reads; no domain schema.
        CREATE TABLE fnd_quality_fixtures (fixture_id BIGINT PRIMARY KEY, label VARCHAR(32) NOT NULL) ENGINE=InnoDB;`,
    }] })
    await database.transaction(async (tx) => {
      for (let id = 1; id <= 100; id++) {
        await tx.query('INSERT INTO fnd_quality_fixtures VALUES (?, ?)', [id, `fixture-${id}`])
      }
    })
    const measured = countQueries(database)
    const [row] = await measured.query('SELECT label FROM fnd_quality_fixtures WHERE fixture_id = ?', [50])
    assert.equal(row.label, 'fixture-50')
    const page = await measured.query('SELECT fixture_id, label FROM fnd_quality_fixtures WHERE fixture_id > ? ORDER BY fixture_id LIMIT ?', [50, 10])
    assert.equal(page.length, 10)
    assert.equal(page[0].fixture_id, '51')
    assert.equal(page[9].fixture_id, '60')
    assert.equal(measured.count, 2)
    const [lookupPlan] = await database.query('EXPLAIN SELECT label FROM fnd_quality_fixtures WHERE fixture_id = ?', [50])
    const [pagePlan] = await database.query('EXPLAIN SELECT fixture_id, label FROM fnd_quality_fixtures WHERE fixture_id > ? ORDER BY fixture_id LIMIT ?', [50, 10])
    assert.equal(lookupPlan.key, 'PRIMARY')
    assert.equal(lookupPlan.type, 'const')
    assert.equal(pagePlan.key, 'PRIMARY')
    assert.equal(pagePlan.type, 'range')
    assert.doesNotMatch(pagePlan.Extra ?? '', /filesort/i)
    t.diagnostic(`MySQL ${fixture.version}; lookup=${lookupPlan.type}/${lookupPlan.key}; page=${pagePlan.type}/${pagePlan.key}; page size=${page.length}; measured queries=${measured.count}`)
  }, { timeout: 60000 })
})
