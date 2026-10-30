import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readRuntimeConfig } from './runtime-config.js'

describe('foundation runtime configuration', () => {
  it('provides a local port and accepts an explicit production port', () => {
    assert.deepEqual(readRuntimeConfig({}), { nodeEnv: 'development', port: 3000 })
    assert.deepEqual(readRuntimeConfig({ NODE_ENV: 'production', PORT: '8123' }),
      { nodeEnv: 'production', port: 8123 })
  })
  it('rejects invalid modes and ports without including supplied values', () => {
    for (const env of [{ NODE_ENV: 'private-value' }, { NODE_ENV: 'production' },
      ...['', '0', '-1', '65536', '12junk', '1.5', ' 3000', 'Infinity']
        .map((PORT) => ({ PORT }))]) {
      assert.throws(() => readRuntimeConfig(env), /^Error: Invalid (NODE_ENV|PORT) configuration$/)
    }
  })
})
