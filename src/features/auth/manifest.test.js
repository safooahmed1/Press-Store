import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { feature } from './manifest.js'

describe('AUTH-004 feature manifest', () => {
  it('owns the four frozen customer and admin routes', () => {
    assert.equal(feature.id, 'auth')
    assert.deepEqual(feature.routes.map((route) => route.path), ['/login', '/register', '/account', '/admin/login'])
    assert.equal(feature.routes.every((route) => typeof route.load === 'function'), true)
  })
})
