import assert from 'node:assert/strict'
import { access, mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, it } from 'node:test'
import sharp from 'sharp'
import { createImageStorage } from './index.js'

const roots = new Set()

afterEach(async () => {
  await Promise.all([...roots].map((root) => rm(root, { force: true, recursive: true })))
  roots.clear()
})

async function fixture() {
  return {
    buffer: await sharp({
      create: { width: 8, height: 6, channels: 3, background: '#80542f' },
    }).png().toBuffer(),
    contentType: 'image/png',
    originalName: 'catalog-image.png',
  }
}

async function storageFixture(ids) {
  const root = await mkdtemp(path.join(tmpdir(), 'press-fnd004-integration-'))
  roots.add(root)
  return {
    root,
    storage: createImageStorage({ root, createId: () => ids.shift() }),
  }
}

describe('foundation image storage filesystem integration', () => {
  it('persists generated opaque paths and deletes only the named stored image', async () => {
    const { root, storage } = await storageFixture([
      '55555555-5555-4555-8555-555555555555',
      '66666666-6666-4666-8666-666666666666',
    ])
    const first = await storage.put(await fixture())
    const second = await storage.put(await fixture())

    assert.deepEqual((await readdir(root)).sort(), [first.path, second.path].sort())
    assert.equal(storage.urlFor(first.path), first.publicUrl)
    assert.equal(await storage.delete(first.path), true)
    await assert.rejects(access(path.join(root, first.path)), { code: 'ENOENT' })
    await access(path.join(root, second.path))
    assert.equal(await storage.delete(first.path), false)
  })

  it('removes a newly written image when the owning operation fails', async () => {
    const { root, storage } = await storageFixture([
      '77777777-7777-4777-8777-777777777777',
    ])
    const databaseFailure = new Error('synthetic database failure')

    await assert.rejects(
      storage.withCompensation(await fixture(), async (stored) => {
        await access(path.join(root, stored.path))
        throw databaseFailure
      }),
      (error) => error === databaseFailure,
    )
    assert.deepEqual(await readdir(root), [])
  })

  it('retains the image when the owning operation succeeds', async () => {
    const { root, storage } = await storageFixture([
      '88888888-8888-4888-8888-888888888888',
    ])
    const result = await storage.withCompensation(await fixture(), async (stored) => stored.path)

    assert.equal(result, '88888888-8888-4888-8888-888888888888.png')
    assert.deepEqual(await readdir(root), [result])
  })

  it('never overwrites an existing generated path when identifiers collide', async () => {
    const repeatedId = '99999999-9999-4999-8999-999999999999'
    const { root, storage } = await storageFixture([repeatedId, repeatedId, repeatedId, repeatedId])
    const first = await storage.put(await fixture())
    const original = await readFile(path.join(root, first.path))

    await assert.rejects(
      storage.put(await fixture()),
      (error) => error.code === 'STORAGE_WRITE_FAILED',
    )
    assert.deepEqual(await readdir(root), [first.path])
    assert.deepEqual(await readFile(path.join(root, first.path)), original)
  })
})
