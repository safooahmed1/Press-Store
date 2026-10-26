import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises'
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
