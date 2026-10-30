import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { after, describe, it } from 'node:test'
import { createAppQueryClient } from '../../src/shared/api/query-client.js'
import { collectFeatureRoutes } from '../../src/app/feature-manifests.js'
import { temporaryDirectory } from './temporary-directory.js'
import { countQueries } from './query-counter.js'

describe('foundation shared harness and client loading sanity', () => {
  let temporaryRoot
  after(async () => {
    if (temporaryRoot) await assert.rejects(access(temporaryRoot), { code: 'ENOENT' })
  })

  it('cleans its private directory through test teardown', async (t) => {
    temporaryRoot = await temporaryDirectory(t)
    await access(temporaryRoot)
  })

  it('counts transaction and failed query attempts without retaining inputs', async () => {
    const query = async (sql) => { if (sql === 'private-failure') throw new Error('failed'); return [1] }
    const counter = countQueries({ query, transaction: (work) => work({ query }) })
    assert.deepEqual(await counter.query('private-sql', ['private-value']), [1])
    await assert.rejects(counter.transaction((tx) => tx.query('private-failure')))
    assert.equal(counter.count, 2)
    assert.doesNotMatch(JSON.stringify(counter), /private/)
  })

  it('does not load feature pages while collecting the route manifest', () => {
    let calls = 0
    const routes = collectFeatureRoutes({ fixture: { feature: { id: 'fixture', routes: [
      { path: '/fixture', load: () => { calls++; return Promise.resolve({}) } },
    ] } } })
    assert.equal(routes.length, 1)
    assert.equal(calls, 0)
  })

  it('deduplicates simultaneous reads and reuses explicitly fresh cached results', async () => {
    const client = createAppQueryClient()
    let calls = 0
    let release
    const pending = new Promise((resolve) => { release = resolve })
    const query = { queryKey: ['foundation', 'fixture'], staleTime: 10000,
      queryFn: async () => { calls++; await pending; return { value: 1 } } }
    try {
      const reads = [client.fetchQuery(query), client.fetchQuery(query)]
      release()
      assert.deepEqual(await Promise.all(reads), [{ value: 1 }, { value: 1 }])
      await client.fetchQuery(query)
      assert.equal(calls, 1)
    } finally { release(); client.clear() }
  })

  it('executes at most two transient read attempts and one invalid read or mutation attempt', async () => {
    const client = createAppQueryClient()
    try {
      for (const status of [503, 422]) {
        let attempts = 0
        await assert.rejects(client.fetchQuery({ queryKey: ['failure', status], retryDelay: 0,
          queryFn: async () => { attempts++; throw Object.assign(new Error('fixture'), { status }) } }))
        assert.equal(attempts, status === 503 ? 2 : 1)
      }
      let mutations = 0
      const mutation = client.getMutationCache().build(client, {
        mutationFn: async () => { mutations++; throw new Error('fixture') },
      })
      await assert.rejects(mutation.execute({}))
      assert.equal(mutations, 1)
    } finally { client.clear() }
  })
})
