import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { mkdtemp, open, readFile, readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, it } from 'node:test'
import sharp from 'sharp'
import {
  createImageStorage,
  IMAGE_STORAGE_LIMITS,
  ImageStorageError,
} from './index.js'

const roots = new Set()

afterEach(async () => {
  await Promise.all([...roots].map((root) => rm(root, { force: true, recursive: true })))
  roots.clear()
})

async function temporaryRoot() {
  const root = await mkdtemp(path.join(tmpdir(), 'press-fnd004-unit-'))
  roots.add(root)
  return root
}

async function imageUpload(format, { width = 3, height = 2, withMetadata = false } = {}) {
  let pipeline = sharp({
    create: { width, height, channels: 4, background: { r: 20, g: 90, b: 150, alpha: 0.7 } },
  })
  if (withMetadata) pipeline = pipeline.withMetadata({ orientation: 6 })
  if (format === 'jpeg') pipeline = pipeline.jpeg()
  if (format === 'png') pipeline = pipeline.png()
  if (format === 'webp') pipeline = pipeline.webp()
  const extension = format === 'jpeg' ? 'jpeg' : format
  return {
    buffer: await pipeline.toBuffer(),
    contentType: format === 'jpeg' ? 'image/jpeg' : `image/${format}`,
    originalName: `fixture.${extension}`,
  }
}

async function expectStorageError(action, code) {
  await assert.rejects(action, (error) => error instanceof ImageStorageError && error.code === code)
}

describe('foundation image storage validation', () => {
  for (const { code, warningFails = false } of [
    { code: 'EIO' }, { code: 'EEXIST' }, { code: 'EIO', warningFails: true },
  ]) {
    it(`retains a successful publication after cleanup ${code}${warningFails ? ' and warning failure' : ''}`, async (t) => {
      const root = await temporaryRoot()
      const upload = await imageUpload('png')
      const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
      const createId = t.mock.fn(() => id)
      const link = t.mock.method(fs, 'link')
      const originalUnlink = fs.unlink
      const unlink = t.mock.method(fs, 'unlink', async (filePath) => {
        if (path.basename(filePath).startsWith('.')) {
          throw Object.assign(new Error('private filesystem detail'), { code })
        }
        return originalUnlink(filePath)
      })
      const warning = t.mock.method(process, 'emitWarning', () => {
        if (warningFails) throw new Error('synthetic warning sink failure')
      })
      const [result] = await Promise.allSettled([createImageStorage({ root, createId }).put(upload)])
      const finalPath = path.join(root, `${id}.png`)
      const bytes = await readFile(finalPath)
      assert.equal(result.status, 'fulfilled')
      const stored = result.value
      assert.equal(stored.path, `${id}.png`)
      assert.equal(stored.publicUrl, `/uploads/${stored.path}`)
      assert.equal(Object.isFrozen(stored), true)
      assert.equal(bytes.length, stored.size)
      assert.deepEqual(await sharp(bytes).raw().toBuffer(), await sharp(upload.buffer).raw().toBuffer())
      assert.equal(createId.mock.callCount(), 1)
      assert.equal(link.mock.callCount(), 1)
      assert.equal(unlink.mock.callCount(), 1)
      const stagingPath = unlink.mock.calls[0].arguments[0]
      assert.match(path.basename(stagingPath), /^\.[0-9a-f-]+\.tmp$/)
      assert.deepEqual(link.mock.calls[0].arguments, [stagingPath, finalPath])
      const [stagingInfo, publishedInfo] = await Promise.all([stat(stagingPath), stat(finalPath)])
      assert.equal(stagingInfo.ino, publishedInfo.ino)
      assert.equal(stagingInfo.dev, publishedInfo.dev)
      assert.equal(publishedInfo.mode & 0o777, 0o600)
      assert.deepEqual((await readdir(root)).sort(), [path.basename(stagingPath), stored.path].sort())
      assert.equal(warning.mock.callCount(), 1)
      assert.deepEqual(warning.mock.calls[0].arguments, [
        'Published image staging cleanup failed', { code: 'IMAGE_STAGING_CLEANUP_FAILED' },
      ])
    })
  }

  it('rejects a pre-publication link failure and removes only its staging file', async (t) => {
    const root = await temporaryRoot()
    const upload = await imageUpload('png')
    const cause = Object.assign(new Error('synthetic link failure'), { code: 'EIO' })
    const link = t.mock.method(fs, 'link', async () => { throw cause })
    const unlink = t.mock.method(fs, 'unlink')
    const warning = t.mock.method(process, 'emitWarning')
    const createId = t.mock.fn(() => 'dddddddd-dddd-4ddd-8ddd-dddddddddddd')
    await assert.rejects(createImageStorage({ root, createId }).put(upload), (error) =>
      error instanceof ImageStorageError && error.code === 'STORAGE_WRITE_FAILED' && error.cause === cause)
    assert.equal(link.mock.callCount(), 1)
    assert.equal(unlink.mock.callCount(), 1)
    assert.equal(createId.mock.callCount(), 1)
    assert.match(path.basename(unlink.mock.calls[0].arguments[0]), /^\.[0-9a-f-]+\.tmp$/)
    assert.equal(warning.mock.callCount(), 0)
    assert.deepEqual(await readdir(root), [])
  })

  it('still compensates an owning-operation failure after a staging cleanup error', async (t) => {
    const root = await temporaryRoot()
    const upload = await imageUpload('png')
    const originalUnlink = fs.unlink
    t.mock.method(fs, 'unlink', async (filePath) => {
      if (path.basename(filePath).startsWith('.')) {
        throw Object.assign(new Error('synthetic staging cleanup failure'), { code: 'EIO' })
      }
      return originalUnlink(filePath)
    })
    t.mock.method(process, 'emitWarning', () => {})
    const failure = new Error('synthetic owning-operation failure')
    let operationCalls = 0
    let storedPath
    await assert.rejects(createImageStorage({ root }).withCompensation(upload, async (stored) => {
      operationCalls++
      storedPath = stored.path
      const bytes = await readFile(path.join(root, stored.path))
      assert.equal(bytes.length, stored.size)
      throw failure
    }), (error) => error === failure)
    assert.equal(operationCalls, 1)
    await assert.rejects(readFile(path.join(root, storedPath)), { code: 'ENOENT' })
    const remaining = await readdir(root)
    assert.equal(remaining.length, 1)
    assert.match(remaining[0], /^\.[0-9a-f-]+\.tmp$/)
  })

  it('keeps concurrent readers from seeing a partial image at its final path', { timeout: 3000 }, async (t) => {
    const root = await temporaryRoot()
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const finalPath = path.join(root, `${id}.png`)
    const upload = await imageUpload('png')
    const probe = await open(path.join(root, '.probe'), 'wx')
    const prototype = Object.getPrototypeOf(probe)
    await probe.close()
    await rm(path.join(root, '.probe'))
    const originalWrite = prototype.writeFile
    const writing = Promise.withResolvers()
    const resume = Promise.withResolvers()
    t.mock.method(prototype, 'writeFile', async function (data) {
      const split = Math.floor(data.length / 2)
      await originalWrite.call(this, data.subarray(0, split))
      writing.resolve()
      await resume.promise
      await originalWrite.call(this, data.subarray(split))
    })
    const pending = createImageStorage({ root, createId: () => id }).put(upload)
    try {
      await writing.promise
      await Promise.all(Array.from({ length: 8 }, () =>
        assert.rejects(readFile(finalPath), { code: 'ENOENT' })))
    } finally {
      resume.resolve()
      await pending
    }
    const stored = await pending
    const bytes = await readFile(finalPath)
    assert.equal(bytes.length, stored.size)
    assert.deepEqual(await sharp(bytes).raw().toBuffer(), await sharp(upload.buffer).raw().toBuffer())
    assert.deepEqual(await readdir(root), [stored.path])
  })

  for (const failure of ['writeFile', 'sync']) {
    it(`removes staged bytes without publishing after a ${failure} failure`, async (t) => {
      const root = await temporaryRoot()
      const upload = await imageUpload('png')
      const probe = await open(path.join(root, '.probe'), 'wx')
      const prototype = Object.getPrototypeOf(probe)
      await probe.close()
      await rm(path.join(root, '.probe'))
      const originalWrite = prototype.writeFile
      const cause = Object.assign(new Error('synthetic disk failure'), { code: 'ENOSPC' })
      t.mock.method(prototype, failure, async function (data) {
        if (failure === 'writeFile') await originalWrite.call(this, data.subarray(0, 8))
        throw cause
      })
      await assert.rejects(createImageStorage({ root }).put(upload), (error) =>
        error.code === 'STORAGE_WRITE_FAILED' && error.cause === cause)
      assert.deepEqual(await readdir(root), [])
    })
  }

  it('publishes exactly one complete image when concurrent writers exhaust the same filename', async () => {
    const root = await temporaryRoot()
    const storage = createImageStorage({
      root, createId: () => 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    })
    const uploads = await Promise.all(['png', 'png'].map((format, index) =>
      imageUpload(format, { width: index + 2 })))
    const results = await Promise.allSettled(uploads.map((upload) => storage.put(upload)))
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
    const winner = results.findIndex((result) => result.status === 'fulfilled')
    const stored = results[winner].value
    assert.equal(results[1 - winner].reason.code, 'STORAGE_WRITE_FAILED')
    const bytes = await readFile(path.join(root, stored.path))
    assert.equal(bytes.length, stored.size)
    assert.deepEqual(await sharp(bytes).raw().toBuffer(), await sharp(uploads[winner].buffer).raw().toBuffer())
    assert.deepEqual(await readdir(root), [stored.path])
  })

  it('exposes the user-approved upper bounds and rejects unsafe configuration', async () => {
    assert.deepEqual(IMAGE_STORAGE_LIMITS, {
      maxInputBytes: 5 * 1024 * 1024,
      maxWidth: 8000,
      maxHeight: 8000,
      maxPixels: 40_000_000,
    })
    assert.throws(() => createImageStorage({ root: 'relative/uploads' }), /absolute path/)
    assert.throws(() => createImageStorage({ root: '/tmp/uploads', maxWidth: 8001 }), /approved storage limit/)
    assert.throws(() => createImageStorage({ root: '/tmp/uploads', publicBasePath: '//host/path' }), /safe absolute URL path/)
  })

  it('accepts JPEG, PNG, and WebP only when filename, MIME, and decoded type agree', async () => {
    const root = await temporaryRoot()
    const ids = [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
    ]
    const storage = createImageStorage({ root, createId: () => ids.shift() })

    for (const format of ['jpeg', 'png', 'webp']) {
      const stored = await storage.put(await imageUpload(format))
      assert.equal(stored.contentType, format === 'jpeg' ? 'image/jpeg' : `image/${format}`)
      assert.match(stored.path, new RegExp(`\\.${format === 'jpeg' ? 'jpg' : format}$`))
      assert.equal(stored.publicUrl, `/uploads/${stored.path}`)
      const metadata = await sharp(await readFile(path.join(root, stored.path))).metadata()
      assert.equal(metadata.format, format)
      assert.equal(metadata.width, 3)
      assert.equal(metadata.height, 2)
    }
  })

  it('fully decodes, auto-orients, strips metadata, and does not retain source bytes', async () => {
    const root = await temporaryRoot()
    const upload = await imageUpload('jpeg', { withMetadata: true })
    const storage = createImageStorage({
      root,
      createId: () => '44444444-4444-4444-8444-444444444444',
    })
    const stored = await storage.put(upload)
    const output = await readFile(path.join(root, stored.path))
    const metadata = await sharp(output).metadata()

    assert.notDeepEqual(output, upload.buffer)
    assert.equal(metadata.width, 2)
    assert.equal(metadata.height, 3)
    assert.equal(metadata.orientation, undefined)
    assert.equal(metadata.exif, undefined)
    assert.equal((await stat(path.join(root, stored.path))).mode & 0o777, 0o600)
  })

  it('rejects empty, oversized, malformed, spoofed, and unsupported input', async () => {
    const root = await temporaryRoot()
    const storage = createImageStorage({ root })
    const jpeg = await imageUpload('jpeg')

    await expectStorageError(() => storage.put({ ...jpeg, buffer: Buffer.alloc(0) }), 'INVALID_IMAGE')
    await expectStorageError(() => storage.put({
      ...jpeg,
      buffer: Buffer.alloc(IMAGE_STORAGE_LIMITS.maxInputBytes + 1),
    }), 'IMAGE_TOO_LARGE')
    await expectStorageError(() => storage.put({
      buffer: Buffer.from('not an image'), contentType: 'image/jpeg', originalName: 'fake.jpg',
    }), 'INVALID_IMAGE')
    await expectStorageError(() => storage.put({ ...jpeg, contentType: 'image/png' }), 'UNSUPPORTED_IMAGE_TYPE')
    await expectStorageError(() => storage.put({ ...jpeg, originalName: 'photo.png' }), 'UNSUPPORTED_IMAGE_TYPE')

    const gif = await sharp({
      create: { width: 2, height: 2, channels: 4, background: 'red' },
    }).gif().toBuffer()
    await expectStorageError(() => storage.put({
      buffer: gif, contentType: 'image/gif', originalName: 'photo.gif',
    }), 'UNSUPPORTED_IMAGE_TYPE')
    assert.deepEqual(await readdir(root), [])
  })

  it('rejects configured width, height, and pixel limits before writing', async () => {
    const root = await temporaryRoot()
    const widthStorage = createImageStorage({ root, maxWidth: 4 })
    const wideImage = await imageUpload('png', { width: 5, height: 1 })
    await expectStorageError(
      () => widthStorage.put(wideImage),
      'IMAGE_DIMENSIONS_EXCEEDED',
    )
    const pixelStorage = createImageStorage({ root, maxPixels: 20 })
    const highPixelImage = await imageUpload('webp', { width: 5, height: 5 })
    await expectStorageError(
      () => pixelStorage.put(highPixelImage),
      'IMAGE_DIMENSIONS_EXCEEDED',
    )
    assert.deepEqual(await readdir(root), [])
  })

  it('rejects animated WebP and multipage images', async () => {
    const root = await temporaryRoot()
    const storage = createImageStorage({ root })
    const frameOne = await sharp({
      create: { width: 2, height: 2, channels: 4, background: 'red' },
    }).png().toBuffer()
    const frameTwo = await sharp({
      create: { width: 2, height: 2, channels: 4, background: 'blue' },
    }).png().toBuffer()
    const animated = await sharp([frameOne, frameTwo], { join: { animated: true } })
      .webp({ loop: 0, delay: [100, 100] }).toBuffer()
    const metadata = await sharp(animated, { animated: true }).metadata()
    assert.equal(metadata.pages, 2)
    await expectStorageError(() => storage.put({
      buffer: animated, contentType: 'image/webp', originalName: 'animated.webp',
    }), 'ANIMATED_IMAGE_NOT_ALLOWED')
    assert.deepEqual(await readdir(root), [])
  })

  it('rejects traversal and untrusted generated names without touching outside files', async () => {
    const root = await temporaryRoot()
    const storage = createImageStorage({ root })
    await expectStorageError(() => storage.delete('../outside.jpg'), 'UNSAFE_STORAGE_PATH')
    await expectStorageError(() => storage.delete('/tmp/outside.jpg'), 'UNSAFE_STORAGE_PATH')

    const unsafeIds = createImageStorage({ root, createId: () => '../outside' })
    const jpeg = await imageUpload('jpeg')
    await expectStorageError(() => unsafeIds.put(jpeg), 'UNSAFE_STORAGE_PATH')
    assert.deepEqual(await readdir(root), [])
  })
})
