import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadFeatureManifests, registerFeatureRouters } from './feature-manifests.js'

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

describe('foundation contextual feature factories', () => {
  async function manifest(t, source) {
    const root = await mkdtemp(path.join(tmpdir(), 'press-feature-factory-'))
    t.after(() => rm(root, { recursive: true, force: true }))
    await writeFile(path.join(root, 'package.json'), '{"type":"module"}')
    await mkdir(path.join(root, 'fixture'))
    const url = pathToFileURL(path.join(root, 'fixture/manifest.js'))
    await writeFile(url, source)
    return { root: pathToFileURL(`${root}/`), module: await import(url) }
  }

  it('supports arrays, asynchronous factories and static routers with one explicit runtime context', async (t) => {
    const fixture = await manifest(t, `export const calls = [];
      export const feature = [
        { id: 'fixture', path: '/fixtures', async createRouter(context) { calls.push(context); return () => {} } },
        { id: 'account', path: '/account', createRouter(context) { calls.push(context); return () => {} } },
        { id: 'static', path: '/static', router() {} }
      ];`)
    const database = { fixture: true }
    const config = { nodeEnv: 'test' }
    const result = await loadFeatureManifests(fixture.root, { database, config })
    assert.deepEqual(result.map(({ path }) => path), ['/fixtures', '/account', '/static'])
    assert.equal(result.every(({ router }) => typeof router === 'function'), true)
    assert.equal(fixture.module.calls.length, 2)
    assert.equal(fixture.module.calls[0], fixture.module.calls[1])
    assert.equal(fixture.module.calls[0].database, database)
    assert.equal(fixture.module.calls[0].config, config)
    assert.equal(Object.isFrozen(fixture.module.calls[0]), true)
  })

  it('rejects ambiguous descriptors before any factory runs and propagates invalid results/failures', async (t) => {
    for (const invalid of [
      "{ id: 'other', path: '/fixtures', router() {} }",
      "{ id: 'fixture', path: '/other', router() {} }",
      "{ id: 'other', path: '/other', router() {}, createRouter() {} }",
      "{ id: 'other', path: '/health', router() {} }",
    ]) {
      const fixture = await manifest(t, `export const calls = []; export const feature = [
        { id: 'fixture', path: '/fixtures', createRouter() { calls.push(true); return () => {} } }, ${invalid} ];`)
      await assert.rejects(loadFeatureManifests(fixture.root), /Invalid or duplicate/)
      assert.deepEqual(fixture.module.calls, [])
    }
    for (const implementation of ["return null", "throw new Error('fixture factory failure')"]) {
      const fixture = await manifest(t, `export const feature = {
        id: 'fixture', path: '/fixtures', createRouter() { ${implementation} } };`)
      await assert.rejects(loadFeatureManifests(fixture.root), /Invalid or duplicate|fixture factory failure/)
    }
  })
})
