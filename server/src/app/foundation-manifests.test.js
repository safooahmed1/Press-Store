import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { registerFeatureRouters } from './feature-manifests.js'

describe('foundation server manifest IDs', () => {
  const feature = { id: 'fixture', path: '/fixtures', router() {} }
  const invalidIds = [
    ['missing', undefined], ['undefined', undefined], ['null', null], ['numeric', 123],
    ['true', true], ['false', false], ['array', ['fixture']],
    ['object', {}], ['coercible object', { toString: () => 'fixture' }],
    ['boxed string', new String('fixture')], ['empty', ''], ['uppercase', 'Fixture'],
    ['digits', 'fixture1'], ['underscore', 'fixture_id'], ['leading hyphen', '-fixture'],
    ['trailing hyphen', 'fixture-'], ['double hyphen', 'fixture--id'],
  ]
  for (const [label, id] of invalidIds) {
    it(`rejects ${label} IDs before attaching any routes`, () => {
      const calls = []
      const api = { use: (...args) => calls.push(args) }
      const invalid = { ...feature, id, path: '/invalid' }
      if (label === 'missing') delete invalid.id
      assert.throws(() => registerFeatureRouters(api, [feature, invalid]),
        /Invalid or duplicate server feature manifest/)
      assert.deepEqual(calls, [])
    })
  }

  it('accepts an empty registry and valid lowercase kebab-case manifests', () => {
    const calls = []
    const api = { use: (...args) => calls.push(args) }
    registerFeatureRouters(api, [])
    assert.deepEqual(calls, [])
    registerFeatureRouters(api, [feature, { ...feature, id: 'other-feature', path: '/other' }])
    assert.deepEqual(calls, [['/fixtures', feature.router], ['/other', feature.router]])
  })
})
