import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { describe, it } from 'node:test'
import { createSessionService } from './sessions.js'
import { createSessionRepository } from './session-repository.js'
import { createSessionCookies } from './session-cookies.js'
import { SESSION_TTL_MS } from './session-policy.js'

function fixture() {
  let now = new Date('2026-11-02T12:00:00Z')
  const rows = new Map()
  const key = (hash) => hash.toString('hex')
  const repository = {
    async rotate(record) {
      if (record.previousHash) {
        const previous = rows.get(key(record.previousHash))
        if (previous?.actorType === record.actorType) rows.delete(key(record.previousHash))
      }
      rows.set(key(record.sessionHash), record)
    },
    async findActive(hash, scope, time) {
      const row = rows.get(key(hash))
      return row?.actorType === scope && row.expiresAt > time ? row : null
    },
    async revoke(hash, scope) {
      if (rows.get(key(hash))?.actorType === scope) rows.delete(key(hash))
    },
  }
  return { rows, repository, service: createSessionService({ repository, clock: () => new Date(now) }),
    setTime(value) { now = value } }
}

describe('auth session lifecycle', () => {
  it('generates independent opaque tokens, stores only hashes, separates scopes and expires at the fixed boundary', async () => {
    const context = fixture()
    const customer = await context.service.create({ actorType: 'customer', actorId: '5' })
    const admin = await context.service.create({ actorType: 'admin', actorId: '1' })
    assert.notEqual(customer.token, admin.token)
    assert.equal(Buffer.from(customer.token, 'base64url').length, 32)
    assert.equal(context.rows.size, 2)
    for (const row of context.rows.values()) {
      assert.equal(row.sessionHash.length, 32)
      assert.equal(Object.hasOwn(row, 'token'), false)
    }
    assert.deepEqual(await context.service.find(customer.token, 'customer'), { actorType: 'customer', actorId: '5' })
    assert.equal(await context.service.find(customer.token, 'admin'), null)
    assert.equal(await context.service.find(admin.token, 'customer'), null)
    assert.equal(admin.expiresAt.getTime() - Date.parse('2026-11-02T12:00:00Z'), SESSION_TTL_MS.admin)
    assert.equal(customer.expiresAt.getTime() - Date.parse('2026-11-02T12:00:00Z'), SESSION_TTL_MS.customer)
    context.setTime(new Date(admin.expiresAt))
    assert.equal(await context.service.find(admin.token, 'admin'), null)
    assert.ok(await context.service.find(customer.token, 'customer'))
    context.setTime(new Date(customer.expiresAt))
    assert.equal(await context.service.find(customer.token, 'customer'), null)
  })

  it('rotates the previous session, keeps unrelated sessions and makes logout idempotent', async () => {
    const { service } = fixture()
    const first = await service.create({ actorType: 'customer', actorId: '5' })
    const unrelated = await service.create({ actorType: 'customer', actorId: '6' })
    const next = await service.create({ actorType: 'customer', actorId: '5', previousToken: first.token })
    assert.notEqual(next.token, first.token)
    assert.equal(await service.find(first.token, 'customer'), null)
    assert.ok(await service.find(unrelated.token, 'customer'))
    assert.ok(await service.find(next.token, 'customer'))
    await service.revoke(next.token, 'admin')
    assert.ok(await service.find(next.token, 'customer'))
    await service.revoke(next.token, 'customer')
    await service.revoke(next.token, 'customer')
    assert.equal(await service.find(next.token, 'customer'), null)
  })

  it('rejects invalid actors/tokens and fails closed when persistence or trusted scope fails', async () => {
    const context = fixture()
    for (const token of [undefined, '', 'x'.repeat(44), `${randomBytes(32).toString('base64url')}\n`]) {
      assert.equal(await context.service.find(token, 'customer'), null)
      await context.service.revoke(token, 'customer')
    }
    for (const actorId of ['0', '1\n', '18446744073709551616', 5]) {
      await assert.rejects(context.service.create({ actorType: 'customer', actorId }), TypeError)
    }
    await assert.rejects(context.service.create({ actorType: 'admin', actorId: '2' }), TypeError)
    const outage = new Error('safe fixture outage')
    const broken = createSessionService({ repository: { rotate: async () => { throw outage },
      findActive: async () => { throw outage }, revoke: async () => { throw outage } } })
    const token = randomBytes(32).toString('base64url')
    await assert.rejects(broken.create({ actorType: 'customer', actorId: '5' }), outage)
    await assert.rejects(broken.find(token, 'customer'), outage)
    await assert.rejects(broken.revoke(token, 'customer'), outage)
    const mismatch = createSessionService({ repository: { findActive: async () => ({ actorType: 'admin', actorId: '1' }) } })
    await assert.rejects(mismatch.find(token, 'customer'), /scope mismatch/)
  })

  it('rolls back a failed rotation and never stores raw tokens in SQL parameters', async () => {
    const committed = new Map()
    const previousHash = createHash('sha256').update('old fixture token').digest()
    committed.set(previousHash.toString('hex'), true)
    const repository = createSessionRepository({ async transaction(work) {
      const staged = new Map(committed)
      await work({ async query(sql, values) {
        if (sql.startsWith('DELETE')) staged.delete(values[0].toString('hex'))
        else {
          assert.equal(Buffer.isBuffer(values[0]), true)
          assert.equal(values[0].length, 32)
          assert.equal(values[2], '5')
          assert.equal(values[3], null)
          throw new Error('synthetic insert failure')
        }
      } })
      committed.clear()
      for (const [key, value] of staged) committed.set(key, value)
    } })
    await assert.rejects(repository.rotate({ actorType: 'customer', actorId: '5', previousHash,
      sessionHash: randomBytes(32), now: new Date(), expiresAt: new Date() }), /insert failure/)
    assert.equal(committed.has(previousHash.toString('hex')), true)
  })
})

describe('auth session cookie boundary', () => {
  it('uses separate production host cookies with secure flags and matching logout attributes', () => {
    const cookies = createSessionCookies({ production: true })
    const session = { token: randomBytes(32).toString('base64url'), expiresAt: new Date('2026-11-03T12:00:00Z') }
    const header = cookies.issue('customer', session)
    assert.match(header, /^__Host-press-customer=/)
    assert.match(header, /; Path=\/; HttpOnly; SameSite=Lax; Secure$/)
    assert.doesNotMatch(header, /Domain|Max-Age/)
    assert.equal(cookies.read('customer', header.split(';')[0]), session.token)
    assert.equal(cookies.read('admin', header.split(';')[0]), null)
    assert.match(cookies.clear('customer'), /^__Host-press-customer=; Expires=.*Max-Age=0; Path=\/; HttpOnly; SameSite=Lax; Secure$/)
    assert.throws(() => createSessionCookies({}), TypeError)
  })

  it('rejects ambiguous/malformed cookies and never accepts a development cookie in production', () => {
    const production = createSessionCookies({ production: true })
    const development = createSessionCookies({ production: false })
    const session = { token: randomBytes(32).toString('base64url'), expiresAt: new Date() }
    assert.equal(production.read('customer', development.issue('customer', session)), null)
    assert.doesNotMatch(development.issue('customer', session), /Secure|__Host-/)
    for (const header of [undefined, {}, 'a'.repeat(8193), '__Host-press-customer=invalid',
      `__Host-press-customer=${session.token}; __Host-press-customer=${session.token}`]) {
      assert.equal(production.read('customer', header), null)
    }
    assert.throws(() => production.issue('customer', { token: 'x', expiresAt: new Date() }), TypeError)
    assert.throws(() => production.clear('other'), TypeError)
  })
})
