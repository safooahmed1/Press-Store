import assert from 'node:assert/strict'
import { once } from 'node:events'
import { spawn } from 'node:child_process'
import { mkdir, readFile, readdir, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import sharp from 'sharp'
import { startServer } from '../../server/src/app/start-server.js'
import { createLogger } from '../../server/src/platform/observability/logger.js'
import { createImageStorage } from '../../server/src/platform/storage/image-storage.js'
import { temporaryDirectory } from '../helpers/temporary-directory.js'

describe('foundation local production wiring (fake database; no live MySQL)', () => {
  const config = { nodeEnv: 'production', port: 0 }
  const logger = createLogger({ environment: 'test', sink: () => {} })
  async function fixture(t) {
    const uploadRoot = await temporaryDirectory(t)
    return { sessionSecret: 'synthetic-private-secret', appOrigin: 'https://example.test', uploadRoot }
  }
  async function serve(t, productionConfig) {
    let ready = true
    let closed = false
    const server = await startServer({ config, productionConfig, databaseConfig: {}, logger,
      manifestsLoader: async () => [], databaseFactory: () => ({
        check: async () => ready, close: async () => { closed = true },
      }),
    })
    const stop = async () => {
      if (server.listening) {
        server.closeAllConnections()
        await new Promise((resolve) => server.close(resolve))
      }
      if (!closed) await server.closeDatabase()
    }
    t.after(stop)
    return { origin: `http://127.0.0.1:${server.address().port}`, stop,
      setReady(value) { ready = value }, get closed() { return closed } }
  }

  it('serves the built SPA/assets and canonical API/readiness from one process', async (t) => {
    const server = await serve(t, await fixture(t))
    const html = await (await fetch(`${server.origin}/`)).text()
    assert.match(html, /id="root"/)
    const asset = html.match(/src="([^"]+\.js)"/)[1]
    assert.equal((await fetch(`${server.origin}${asset}`)).status, 200)
    assert.equal((await fetch(`${server.origin}/customer/orders`, { headers: { Accept: 'text/html' } })).status, 200)
    for (const route of ['/api/v1/unknown', '/missing.js', '/uploads/not-an-image', '/%75ploads/private']) {
      const response = await fetch(`${server.origin}${route}`)
      assert.equal(response.status, 404)
      assert.equal((await response.json()).error.code, 'NOT_FOUND')
    }
    const health = await fetch(`${server.origin}/api/v1/health`)
    assert.equal(health.status, 200)
    assert.deepEqual((await health.json()).data, { status: 'ready' })
    server.setReady(false)
    const unavailable = await fetch(`${server.origin}/api/v1/health`)
    assert.equal(unavailable.status, 503)
    assert.doesNotMatch(await unavailable.text(), /mysql|synthetic-private|password/i)
    await server.stop()
    assert.equal(server.closed, true)
  })

  it('retains an adapter image across local restarts and restricts file reads', async (t) => {
    const productionConfig = await fixture(t)
    const storage = createImageStorage({ root: productionConfig.uploadRoot })
    const buffer = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#abcdef' } }).png().toBuffer()
    const image = await storage.put({ originalName: 'fixture.png', contentType: 'image/png', buffer })
    const expected = await readFile(path.join(productionConfig.uploadRoot, image.path))
    await writeFile(path.join(productionConfig.uploadRoot, 'private.txt'), 'private-file')
    await writeFile(path.join(productionConfig.uploadRoot, '.env'), 'private-config')
    const link = 'd47ab993-179e-4be5-8fd3-174483a9b807.png'
    await symlink(path.join(productionConfig.uploadRoot, 'private.txt'), path.join(productionConfig.uploadRoot, link))
    const directory = 'd47ab993-179e-4be5-8fd3-174483a9b808.png'
    await mkdir(path.join(productionConfig.uploadRoot, directory))
    for (let run = 0; run < 2; run++) {
      const server = await serve(t, productionConfig)
      const response = await fetch(`${server.origin}${image.publicUrl}`)
      assert.equal(response.status, 200)
      assert.equal(response.headers.get('content-type'), 'image/png')
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected)
      const head = await fetch(`${server.origin}${image.publicUrl}`, { method: 'HEAD' })
      assert.equal(head.status, 200)
      assert.equal(await head.text(), '')
      for (const suffix of ['private.txt', '.env', link, directory, '', `${image.path}/extra`,
        'd47ab993-179e-4be5-8fd3-174483a9b809.png']) {
        assert.equal((await fetch(`${server.origin}/uploads/${suffix}`)).status, 404, suffix)
      }
      assert.equal((await fetch(`${server.origin}${image.publicUrl}`, { method: 'POST' })).status, 404)
      await server.stop()
    }
    assert.deepEqual(await readFile(path.join(productionConfig.uploadRoot, image.path)), expected)
  })

  it('rejects missing production inputs before acquiring any database connection', async (t) => {
    const productionConfig = await fixture(t)
    let acquired = false
    for (const key of ['sessionSecret', 'appOrigin', 'uploadRoot']) {
      await assert.rejects(startServer({ config, productionConfig: { ...productionConfig, [key]: undefined },
        logger, databaseConfig: {}, databaseFactory: () => { acquired = true; throw new Error('must not run') },
      }), /Invalid (SESSION_SECRET|APP_ORIGIN|UPLOAD_ROOT) configuration/)
    }
    assert.equal(acquired, false)
  })

  it('builds with synthetic private configuration without embedding it or server modules', async (t) => {
    const outDir = await temporaryDirectory(t)
    const sentinel = 'FND006_SYNTHETIC_PRIVATE_VALUE_7d2c'
    const vite = fileURLToPath(new URL('../../node_modules/vite/bin/vite.js', import.meta.url))
    const child = spawn(process.execPath, [vite, 'build', '--outDir', outDir, '--emptyOutDir'], {
      env: { NODE_ENV: 'production', SESSION_SECRET: sentinel, MYSQL_PASSWORD: sentinel,
        APP_ORIGIN: `https://${sentinel.toLowerCase()}.test`, UPLOAD_ROOT: `/tmp/${sentinel}` },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    t.after(() => { if (child.exitCode === null) child.kill('SIGTERM') })
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })
    const [code] = await once(child, 'close')
    assert.equal(code, 0, output)
    const files = await readdir(path.join(outDir, 'assets'))
    assert.ok(files.some((file) => file.endsWith('.js')))
    for (const file of ['index.html', ...files.map((name) => `assets/${name}`)]) {
      const content = await readFile(path.join(outDir, file), 'utf8')
      assert.ok(content.length > 0)
      assert.doesNotMatch(content, new RegExp(`${sentinel}|${sentinel.toLowerCase()}|mysql2|node:fs|SESSION_SECRET|MYSQL_PASSWORD`))
    }
  }, { timeout: 15000 })
})
