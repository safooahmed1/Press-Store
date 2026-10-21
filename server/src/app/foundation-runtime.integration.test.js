import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { request } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawn } from 'node:child_process'
import { describe, it } from 'node:test'
import express from 'express'
import { createApp } from './create-app.js'
import { loadFeatureManifests } from './feature-manifests.js'

async function temporaryDirectory(t, prefix) {
  const directory = await mkdtemp(path.join(tmpdir(), prefix))
  t.after(() => rm(directory, { recursive: true, force: true }))
  return directory
}

// Use raw request targets so the client does not normalize encoded dot segments.
function probe(origin, route, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request(origin, { path: route, method, headers: { Accept: 'text/html' } }, (res) => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.end()
  })
}

async function listen(t, options) {
  const app = await createApp({ config: { nodeEnv: 'test' }, ...options })
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())))
  return `http://127.0.0.1:${server.address().port}`
}

describe('foundation HTTP runtime', () => {
  it('returns only public health information and a generated request ID', async (t) => {
    const origin = await listen(t)
    const response = await fetch(`${origin}/api/v1/health`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.deepEqual(body.data, { status: 'ready' })
    assert.equal(body.meta.requestId, response.headers.get('x-request-id'))
    assert.match(body.meta.requestId, /^[0-9a-f-]{36}$/)
    assert.equal(response.headers.get('x-powered-by'), null)
  })

  it('fails safely when a readiness dependency fails or throws', async (t) => {
    for (const isReady of [async () => false, async () => { throw new Error('private-detail') }]) {
      const origin = await listen(t, { isReady })
      const response = await fetch(`${origin}/api/v1/health`)
      assert.equal(response.status, 503)
      const body = await response.json()
      assert.equal(body.error.code, 'SERVICE_UNAVAILABLE')
      assert.doesNotMatch(JSON.stringify(body), /private-detail/)
    }
  })

  it('mounts isolated feature routers and safely handles route exceptions', async (t) => {
    const router = express.Router()
    router.get('/', (req, res) => res.json({ data: { fixture: true } }))
    router.get('/fail', async () => { throw new Error('private-detail') })
    const origin = await listen(t, { manifests: [{ id: 'fixture', path: '/fixtures', router }] })
    assert.deepEqual(await (await fetch(`${origin}/api/v1/fixtures`)).json(),
      { data: { fixture: true } })
    const failure = await fetch(`${origin}/api/v1/fixtures/fail`)
    assert.equal(failure.status, 500)
    assert.equal((await failure.json()).error.message, 'An unexpected error occurred')
  })

  it('reserves API paths and missing assets before the production SPA fallback', async (t) => {
    const distRoot = await temporaryDirectory(t, 'press-fnd-dist-')
    const html = '<html><div id="root">fixture</div></html>'
    await writeFile(path.join(distRoot, 'index.html'), html)
    await writeFile(path.join(distRoot, 'asset.js'), 'export const fixture = true')
    await writeFile(path.join(distRoot, '.env'), 'synthetic-fixture-only')
    const origin = await listen(t, { config: { nodeEnv: 'production' }, distRoot })
    for (const route of ['/', '/nested/route']) {
      const response = await fetch(`${origin}${route}`, { headers: { Accept: 'text/html' } })
      assert.equal(response.status, 200)
      assert.equal(await response.text(), html)
    }
    assert.equal((await fetch(`${origin}/asset.js`)).status, 200)
    for (const route of ['/api', '/api/v1/missing', '/api/v2/missing', '/missing.js', '/.env']) {
      const response = await fetch(`${origin}${route}`)
      assert.equal(response.status, 404, route)
      assert.equal((await response.json()).error.code, 'NOT_FOUND')
    }
    assert.equal((await fetch(`${origin}/nested`, { method: 'POST' })).status, 404)
    assert.equal((await fetch(`${origin}/nested`, { headers: { Accept: 'application/json' } })).status, 404)
  })

  it('excludes encoded API, hidden, asset, and malformed paths without normalizing URLs', async (t) => {
    const distRoot = await temporaryDirectory(t, 'press-fnd-encoded-')
    const html = '<html><div id="root">encoded fixture</div></html>'
    await writeFile(path.join(distRoot, 'index.html'), html)
    // An encoded API request must also be excluded from static file serving.
    await mkdir(path.join(distRoot, 'api', 'v1'), { recursive: true })
    await writeFile(path.join(distRoot, 'api', 'v1', 'missing'), html)
    await writeFile(path.join(distRoot, 'asset.js'), 'fixture asset')
    const origin = await listen(t, { config: { nodeEnv: 'production' }, distRoot })
    const excluded = ['/%2eenv', '/nested/%2ehidden', '/%61pi/v1/missing',
      '/%61pi', '/%41PI/v1/missing', '/api%2fv1/missing', '/%61pi%2Fv1/missing',
      '/nested%2F%2Ehidden', '/nested/%2Ehidden/child', '/%2e%2e/nested',
      '/missing%2ejs', '/%', '/%2', '/%GG', '/%C0%AE', '/%E0%A4%A']
    for (const route of excluded) {
      const response = await probe(origin, route)
      assert.equal(response.status, 404, route)
      assert.match(response.headers['content-type'], /application\/json/, route)
      assert.equal(JSON.parse(response.body).error.code, 'NOT_FOUND', route)
    }
    for (const route of ['/nested/route', '/%6eested/route', '/caf%C3%A9',
      '/apiary', '/nested?next=/%2ehidden', '/%252eenv', '/%2561pi/v1/missing']) {
      const response = await probe(origin, route)
      assert.equal(response.status, 200, route)
      assert.equal(response.body, html, route)
    }
    const asset = await probe(origin, '/asset%2ejs')
    assert.equal(asset.status, 200)
    assert.equal(asset.body, 'fixture asset')
    for (const route of ['/%2eenv', '/%61pi/v1/missing', '/%GG']) {
      const response = await probe(origin, route, 'HEAD')
      assert.equal(response.status, 404, route)
      assert.match(response.headers['content-type'], /application\/json/)
      assert.equal(response.body, '')
    }
    const head = await probe(origin, '/%6eested/route', 'HEAD')
    assert.equal(head.status, 200)
    assert.equal(head.body, '')
  })

  for (const method of ['GET', 'HEAD']) {
    it(`rejects repeated leading separators before production static/SPA serving for ${method}`, async (t) => {
      const distRoot = await temporaryDirectory(t, 'press-fnd-separators-')
      const html = '<html>separator fixture</html>'
      await writeFile(path.join(distRoot, 'index.html'), html)
      await writeFile(path.join(distRoot, 'asset.js'), 'fixture asset')
      const origin = await listen(t, { config: { nodeEnv: 'production' }, distRoot })
      for (const route of ['/%2fapi/v1/missing', '//%61pi/v1/missing',
        '/%2F%61pi/v1/missing', '///api/v1/missing', '/%2f%61PI/v1/missing',
        '//api/v1/missing', '//nested/route', '/%2Fasset.js']) {
        await t.test(route, async () => {
          const response = await probe(origin, route, method)
          assert.equal(response.status, 404, route)
          assert.match(response.headers['content-type'], /application\/json/)
          if (method === 'HEAD') assert.equal(response.body, '')
          else {
            const { error } = JSON.parse(response.body)
            assert.equal(error.code, 'NOT_FOUND')
            assert.equal(error.message, 'Resource not found')
            assert.equal(error.requestId, response.headers['x-request-id'])
          }
        })
      }
      for (const route of ['/', '/nested/route', '/%6eested/route', '/%252froute']) {
        const response = await probe(origin, route, method)
        assert.equal(response.status, 200, route)
        assert.match(response.headers['content-type'], /text\/html/)
        assert.equal(response.body, method === 'HEAD' ? '' : html)
      }
      for (const route of ['/asset.js', '/asset%2ejs']) {
        const response = await probe(origin, route, method)
        assert.equal(response.status, 200, route)
        assert.equal(response.body, method === 'HEAD' ? '' : 'fixture asset')
      }
      const health = await probe(origin, '/api/v1/health', method)
      assert.equal(health.status, 200)
      assert.match(health.headers['content-type'], /application\/json/)
      if (method === 'HEAD') assert.equal(health.body, '')
      else assert.deepEqual(JSON.parse(health.body).data, { status: 'ready' })
      for (const route of ['/api/v1/missing', '/%2eenv', '/nested/%2ehidden', '/%GG']) {
        const response = await probe(origin, route, method)
        assert.equal(response.status, 404, route)
        assert.match(response.headers['content-type'], /application\/json/)
        if (method === 'HEAD') assert.equal(response.body, '')
        else assert.equal(JSON.parse(response.body).error.code, 'NOT_FOUND')
      }
    })
  }

  it('refuses to compose production without a built index', async (t) => {
    const distRoot = await temporaryDirectory(t, 'press-fnd-empty-')
    await assert.rejects(createApp({ config: { nodeEnv: 'production' }, distRoot }))
  })

  it('rejects duplicate, reserved, and invalid server manifests before startup', async () => {
    const feature = { id: 'fixture', path: '/fixtures', router: express.Router() }
    for (const manifests of [[undefined], [feature, feature], [{ ...feature, path: '/health' }],
      [{ ...feature, path: '/' }], [{ ...feature, router: null }],
      [feature, { ...feature, id: 'other' }]]) {
      await assert.rejects(createApp({ config: { nodeEnv: 'test' }, manifests }))
    }
  })

  it('rejects non-string manifest IDs during composition before a listener can start', async () => {
    for (const id of [undefined, null, 123, true, false, ['fixture'], {},
      { toString: () => 'fixture' }]) {
      await assert.rejects(createApp({ config: { nodeEnv: 'test' },
        manifests: [{ id, path: '/fixtures', router: express.Router() }] }),
      /Invalid or duplicate server feature manifest/)
    }
  })

  it('discovers and mounts feature manifests without registry edits; invalid exports/imports fail', async (t) => {
    const rootPath = await temporaryDirectory(t, 'press-fnd-features-')
    const root = pathToFileURL(`${rootPath}/`)
    assert.deepEqual(await loadFeatureManifests(new URL('absent/', root)), [])
    await mkdir(new URL('fixture/', root))
    await mkdir(new URL('without-manifest/', root))
    await writeFile(new URL('fixture/manifest.js', root), `export const feature = {
      id: 'fixture', path: '/fixtures', router(req, res) { res.json({ data: { fixture: true } }) }
    }`)
    const manifests = await loadFeatureManifests(root)
    assert.deepEqual(manifests.map((feature) => feature.id), ['fixture'])
    const origin = await listen(t, { manifests })
    assert.deepEqual(await (await fetch(`${origin}/api/v1/fixtures`)).json(),
      { data: { fixture: true } })
    await mkdir(new URL('invalid/', root))
    await writeFile(new URL('invalid/manifest.js', root), 'export const feature = null')
    await assert.rejects(createApp({ config: { nodeEnv: 'test' },
      manifests: await loadFeatureManifests(root) }))
    await mkdir(new URL('broken/', root))
    await writeFile(new URL('broken/manifest.js', root), 'throw new Error("fixture import failure")')
    await assert.rejects(loadFeatureManifests(root), /fixture import failure/)
  })

  it('exits before listening when process configuration is invalid and logs no values', async () => {
    const child = spawn(process.execPath, ['server/src/server.js'], {
      env: { NODE_ENV: 'production', PORT: 'private-invalid-value' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    child.stderr.on('data', (chunk) => { output += chunk })
    const [code] = await once(child, 'close')
    assert.equal(code, 1)
    assert.match(output, /Application startup failed/)
    assert.doesNotMatch(output, /private-invalid-value/)
  })
})
