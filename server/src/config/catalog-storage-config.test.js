import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readCatalogStorageConfig, validateCatalogStorageConfig } from './catalog-storage-config.js'

describe('foundation catalog storage context configuration', () => {
  it('does not pick an application upload directory in tests and validates explicit roots', () => {
    assert.equal(readCatalogStorageConfig('test', { UPLOAD_ROOT: '/should-not-be-used' }), null)
    assert.deepEqual(readCatalogStorageConfig('development', { UPLOAD_ROOT: '/tmp/catalog-fixture' }), { root: '/tmp/catalog-fixture' })
    for (const root of [undefined, '', 'relative', '/', '/tmp/a\0b']) {
      assert.throws(() => validateCatalogStorageConfig({ root }), /Invalid catalog storage configuration/)
    }
    assert.equal(Object.isFrozen(validateCatalogStorageConfig({ root: '/tmp/catalog-fixture' })), true)
  })
})
