import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { collectFeatureRoutes } from './feature-manifests.js'

describe('foundation client manifest seam', () => {
  const load = async () => ({ default: () => null })
  const feature = { id: 'fixture', routes: [{ path: '/fixture', load }] }

  it('accepts no features and discovers valid routes in deterministic order', () => {
    assert.deepEqual(collectFeatureRoutes({}), [])
    assert.deepEqual(collectFeatureRoutes({ 'fixture/manifest.js': { feature } }), feature.routes)
  })

  it('rejects invalid manifests, duplicate IDs/paths, and API-owned routes', () => {
    for (const invalid of [undefined, { ...feature, id: '' }, { ...feature, routes: null },
      { ...feature, routes: [{ path: '/api', load }] },
      { ...feature, routes: [{ path: '/api/v1', load }] },
      { ...feature, routes: [{ path: '//external', load }] },
      { ...feature, routes: [{ path: '/fixture', load: null }] }]) {
      assert.throws(() => collectFeatureRoutes({ a: { feature: invalid } }))
    }
    assert.throws(() => collectFeatureRoutes({ a: { feature }, b: { feature } }))
    assert.throws(() => collectFeatureRoutes({ a: { feature },
      b: { feature: { ...feature, id: 'other' } } }))
  })
})
