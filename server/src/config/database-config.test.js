import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readDatabaseConfig, localDatabaseTestsEnabled } from './database-config.js'

const env = { MYSQL_HOST: '127.0.0.1', MYSQL_PORT: '3306', MYSQL_DATABASE: 'fnd_tests',
  MYSQL_USER: 'test_only', MYSQL_PASSWORD: 'synthetic-test-password' }

describe('foundation database configuration', () => {
  it('requires explicit connection identity, including in development and production', () => {
    for (const key of Object.keys(env)) {
      for (const value of [undefined, '', '\0', '   ']) {
        assert.throws(() => readDatabaseConfig({ ...env, [key]: value }), /Invalid MYSQL_/)
      }
    }
    assert.throws(() => readDatabaseConfig({ NODE_ENV: 'production' }), /Invalid MYSQL_/)
    assert.throws(() => readDatabaseConfig({ ...env, NODE_ENV: 'production' }), /Invalid MYSQL_CONNECTION_LIMIT/)
    const production = { ...env, NODE_ENV: 'production', MYSQL_CONNECTION_LIMIT: '5',
      MYSQL_CONNECT_TIMEOUT_MS: '5000', MYSQL_QUERY_TIMEOUT_MS: '10000',
      MYSQL_MIGRATION_LOCK_TIMEOUT_SECONDS: '10' }
    assert.equal(readDatabaseConfig(production).connectionLimit, 5)
    for (const name of ['MYSQL_CONNECTION_LIMIT', 'MYSQL_CONNECT_TIMEOUT_MS',
      'MYSQL_QUERY_TIMEOUT_MS', 'MYSQL_MIGRATION_LOCK_TIMEOUT_SECONDS']) {
      assert.throws(() => readDatabaseConfig({ ...production, [name]: undefined }), /Invalid MYSQL_/)
    }
  })

  it('validates finite port, pool and time limits without echoing supplied values', () => {
    for (const key of ['MYSQL_PORT', 'MYSQL_CONNECTION_LIMIT', 'MYSQL_CONNECT_TIMEOUT_MS',
      'MYSQL_QUERY_TIMEOUT_MS', 'MYSQL_MIGRATION_LOCK_TIMEOUT_SECONDS']) {
      for (const value of ['0', '-1', '1.2', 'Infinity', '99999999999999999', 'private-invalid-value']) {
        assert.throws(() => readDatabaseConfig({ ...env, [key]: value }), (error) => {
          assert.doesNotMatch(error.message, /private-invalid-value|synthetic-test-password/)
          return error.message === `Invalid ${key} configuration`
        })
      }
    }
    const config = readDatabaseConfig(env)
    assert.equal(config.port, 3306)
    assert.equal(config.connectionLimit, 5)
    assert.equal(config.queryTimeout, 10000)
    assert.ok(Object.isFrozen(config))
  })

  it('requires explicit local disposable integration opt-in', () => {
    assert.equal(localDatabaseTestsEnabled({}), false)
    assert.equal(localDatabaseTestsEnabled({ FND_DISPOSABLE_MYSQL_TESTS: 'true' }), false)
    assert.equal(localDatabaseTestsEnabled({ FND_DISPOSABLE_MYSQL_TESTS: '1' }), true)
  })
})
