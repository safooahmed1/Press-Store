import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { runAdminBootstrap } from '../../../../../scripts/bootstrap-admin.js'
import { bootstrapAdmin } from './bootstrap-admin.js'
import { hashPassword } from './passwords.js'

describe('auth bootstrap command safety', () => {
  it('rejects arguments/configuration before constructing a database and emits only safe errors', async () => {
    const lines = []
    let calls = 0
    const options = { databaseFactory: () => { calls++; throw new Error('private connection') },
      output: (line) => lines.push(line), errorOutput: (line) => lines.push(line) }
    assert.equal(await runAdminBootstrap({ ...options, args: ['--unsupported'],
      readInput: () => { throw new Error('private input') } }), 1)
    assert.equal(await runAdminBootstrap({ ...options,
      readInput: () => { throw new Error('private input') } }), 1)
    assert.equal(calls, 0)
    assert.doesNotMatch(lines.join('\n'), /private|unsupported/)
    assert.equal(lines.length, 2)
  })

  it('closes its pool on validation/storage failure and never reports success after close failure', async () => {
    const password = 'synthetic long password'
    const passwordHash = await hashPassword(password)
    for (const failure of ['validation', 'storage', 'close']) {
      let closed = 0
      const lines = []
      const status = await runAdminBootstrap({
        readInput: () => ({ phone: failure === 'validation' ? 'bad' : '01012345678',
          password }), readDatabase: () => ({}),
        databaseFactory: () => ({ query: async () => {
          if (failure === 'close') return [{ admin_id: '1', phone: '+201012345678', password_hash: passwordHash }]
          throw new Error('private storage detail')
        },
          close: async () => { closed++; if (failure === 'close') throw new Error('private close detail') } }),
        output: (line) => lines.push(line), errorOutput: (line) => lines.push(line),
      })
      assert.equal(status, 1)
      assert.equal(closed, 1)
      assert.equal(lines.length, 1)
      assert.doesNotMatch(lines[0], /private|created|unchanged/)
    }
  })

  it('rejects invalid credentials before executing SQL and propagates outages without retry', async () => {
    let calls = 0
    const database = { query: async () => { calls++; throw new Error('storage unavailable') } }
    await assert.rejects(bootstrapAdmin({ database, input: { phone: '01012345678', password: 'short' } }),
      { code: 'VALIDATION_FAILED' })
    assert.equal(calls, 0)
    await assert.rejects(bootstrapAdmin({ database,
      input: { phone: '01012345678', password: 'synthetic long password' } }), /storage unavailable/)
    assert.equal(calls, 1)
  })
})
