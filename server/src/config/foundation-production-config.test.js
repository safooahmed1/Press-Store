import assert from 'node:assert/strict'
import { mkdtemp, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { readProductionConfig, validateProductionConfig } from './production-config.js'

describe('foundation production configuration', () => {
  async function fixture(t) {
    const root = await mkdtemp(path.join(tmpdir(), 'press-production-config-'))
    t.after(() => rm(root, { recursive: true, force: true }))
    return { sessionSecret: 'synthetic-test-secret', appOrigin: 'https://example.test', uploadRoot: root }
  }

  it('requires explicit inputs and checks a canonical writable root without leaving probe files', async (t) => {
    const config = await fixture(t)
    const read = readProductionConfig({ SESSION_SECRET: config.sessionSecret,
      APP_ORIGIN: `${config.appOrigin}/`, UPLOAD_ROOT: config.uploadRoot })
    assert.deepEqual(await validateProductionConfig(read), config)
    assert.deepEqual(await readdir(config.uploadRoot), [])
    assert.deepEqual(readProductionConfig({}), {
      sessionSecret: undefined, appOrigin: undefined, uploadRoot: undefined,
    })
  })

  it('rejects missing secret and unsafe origins without echoing supplied values', async (t) => {
    const config = await fixture(t)
    for (const sessionSecret of [undefined, '', '  ', 'private\0secret']) {
      await assert.rejects(validateProductionConfig({ ...config, sessionSecret }),
        { message: 'Invalid SESSION_SECRET configuration' })
    }
    for (const appOrigin of [undefined, '', 'private-origin', 'http://example.test',
      'https://user:private@example.test', 'https://example.test/private',
      'https://example.test/?private=token', 'https://example.test/#private']) {
      await assert.rejects(validateProductionConfig({ ...config, appOrigin }),
        { message: 'Invalid APP_ORIGIN configuration' })
    }
  })

  it('rejects absent, relative, file, source and symlinked-source roots', async (t) => {
    const config = await fixture(t)
    const appRoot = fileURLToPath(new URL('../../../', import.meta.url))
    const file = path.join(config.uploadRoot, 'file')
    await writeFile(file, 'fixture')
    const link = path.join(config.uploadRoot, 'source-link')
    await symlink(appRoot, link)
    for (const uploadRoot of [undefined, 'uploads', '/', appRoot, file, link,
      path.join(config.uploadRoot, 'absent')]) {
      await assert.rejects(validateProductionConfig({ ...config, uploadRoot }),
        { message: 'Invalid UPLOAD_ROOT configuration' })
    }
    assert.deepEqual((await readdir(config.uploadRoot)).sort(), ['file', 'source-link'])
  })
})
