import { constants as fsConstants } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'

export const IMAGE_STORAGE_LIMITS = Object.freeze({
  maxInputBytes: 5 * 1024 * 1024,
  maxWidth: 8000,
  maxHeight: 8000,
  maxPixels: 40_000_000,
})

const IMAGE_TYPES = Object.freeze({
  jpeg: Object.freeze({ contentType: 'image/jpeg', extensions: ['.jpg', '.jpeg'], outputExtension: '.jpg' }),
  png: Object.freeze({ contentType: 'image/png', extensions: ['.png'], outputExtension: '.png' }),
  webp: Object.freeze({ contentType: 'image/webp', extensions: ['.webp'], outputExtension: '.webp' }),
})

const STORED_PATH_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/i

export class ImageStorageError extends Error {
  constructor(code, message, options) {
    super(message, options)
    this.name = 'ImageStorageError'
    this.code = code
  }
}

function storageError(code, message, cause) {
  return new ImageStorageError(code, message, cause ? { cause } : undefined)
}

function assertPositiveInteger(value, name, maximum) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new TypeError(`${name} must be a positive integer within the approved storage limit`)
  }
}

function validateOptions({ root, publicBasePath, maxInputBytes, maxWidth, maxHeight, maxPixels }) {
  if (typeof root !== 'string' || !path.isAbsolute(root)) {
    throw new TypeError('Image storage root must be an absolute path')
  }
  if (typeof publicBasePath !== 'string'
    || !/^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/i.test(publicBasePath)) {
    throw new TypeError('Image storage public base path must be a safe absolute URL path')
  }
  assertPositiveInteger(maxInputBytes, 'maxInputBytes', IMAGE_STORAGE_LIMITS.maxInputBytes)
  assertPositiveInteger(maxWidth, 'maxWidth', IMAGE_STORAGE_LIMITS.maxWidth)
  assertPositiveInteger(maxHeight, 'maxHeight', IMAGE_STORAGE_LIMITS.maxHeight)
  assertPositiveInteger(maxPixels, 'maxPixels', IMAGE_STORAGE_LIMITS.maxPixels)
}

function assertStoredPath(storedPath) {
  if (typeof storedPath !== 'string' || !STORED_PATH_PATTERN.test(storedPath)
    || path.basename(storedPath) !== storedPath) {
    throw storageError('UNSAFE_STORAGE_PATH', 'Unsafe image storage path')
  }
}

function assertUpload(upload, maxInputBytes) {
  if (!upload || typeof upload !== 'object' || !Buffer.isBuffer(upload.buffer)
    || typeof upload.originalName !== 'string' || typeof upload.contentType !== 'string') {
    throw storageError('INVALID_IMAGE', 'Invalid image upload')
  }
  if (upload.buffer.length === 0) throw storageError('INVALID_IMAGE', 'Invalid image upload')
  if (upload.buffer.length > maxInputBytes) {
    throw storageError('IMAGE_TOO_LARGE', 'Image exceeds the configured size limit')
  }
}

function normalizeInputType(upload, decodedFormat) {
  const imageType = IMAGE_TYPES[decodedFormat]
  const extension = path.extname(upload.originalName).toLowerCase()
  if (!imageType || upload.contentType.toLowerCase() !== imageType.contentType
    || !imageType.extensions.includes(extension)) {
    throw storageError('UNSUPPORTED_IMAGE_TYPE', 'Image type is not allowed or does not match')
  }
  return imageType
}

function validateMetadata(metadata, limits) {
  if (!metadata.width || !metadata.height) throw storageError('INVALID_IMAGE', 'Invalid image upload')
  if ((metadata.pages ?? 1) !== 1) {
    throw storageError('ANIMATED_IMAGE_NOT_ALLOWED', 'Animated or multipage images are not allowed')
  }
  if (metadata.width > limits.maxWidth || metadata.height > limits.maxHeight
    || metadata.width * metadata.height > limits.maxPixels) {
    throw storageError('IMAGE_DIMENSIONS_EXCEEDED', 'Image dimensions exceed the configured limit')
  }
}

async function normalizeImage(upload, limits) {
  let metadata
  try {
    metadata = await sharp(upload.buffer, { animated: true, failOn: 'warning', limitInputPixels: false })
      .metadata()
  } catch (error) {
    throw storageError('INVALID_IMAGE', 'Invalid image upload', error)
  }
  const imageType = normalizeInputType(upload, metadata.format)
  validateMetadata(metadata, limits)

  let pipeline = sharp(upload.buffer, {
    animated: false,
    failOn: 'warning',
    limitInputPixels: limits.maxPixels,
  }).rotate()
  if (metadata.format === 'jpeg') pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true })
  if (metadata.format === 'png') pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true })
  if (metadata.format === 'webp') pipeline = pipeline.webp({ quality: 82, effort: 4 })

  try {
    const result = await pipeline.toBuffer({ resolveWithObject: true })
    if (result.data.length > limits.maxInputBytes) {
      throw storageError('IMAGE_TOO_LARGE', 'Normalized image exceeds the configured size limit')
    }
    validateMetadata(result.info, limits)
    return { data: result.data, imageType, info: result.info }
  } catch (error) {
    if (error instanceof ImageStorageError) throw error
    throw storageError('INVALID_IMAGE', 'Invalid image upload', error)
  }
}

async function writeExclusive(filePath, data) {
  // Keep staging on the same filesystem, outside the adapter's public filename grammar.
  const stagingPath = path.join(path.dirname(filePath), `.${randomUUID()}.tmp`)
  let handle
  let created = false
  try {
    handle = await fs.open(stagingPath, fsConstants.O_CREAT | fsConstants.O_EXCL | fsConstants.O_WRONLY, 0o600)
    created = true
    await handle.writeFile(data)
    await handle.sync()
    await handle.close()
    handle = undefined
    // Unlike rename, link atomically publishes the complete inode without replacing a collision.
    await fs.link(stagingPath, filePath)
  } catch (error) {
    await handle?.close().catch(() => {})
    if (created) await fs.unlink(stagingPath).catch(() => {})
    throw error
  }

  // Successful link is the publication boundary: cleanup must neither roll it back nor
  // reach put's collision retry loop. A failed unlink leaves only a private staging link.
  try {
    await fs.unlink(stagingPath)
  } catch {
    try {
      process.emitWarning('Published image staging cleanup failed', { code: 'IMAGE_STAGING_CLEANUP_FAILED' })
    } catch {
      // Diagnostics must not turn a committed publication into a failed put either.
    }
  }
}

export function createImageStorage({
  root,
  publicBasePath = '/uploads',
  maxInputBytes = IMAGE_STORAGE_LIMITS.maxInputBytes,
  maxWidth = IMAGE_STORAGE_LIMITS.maxWidth,
  maxHeight = IMAGE_STORAGE_LIMITS.maxHeight,
  maxPixels = IMAGE_STORAGE_LIMITS.maxPixels,
  createId = randomUUID,
} = {}) {
  validateOptions({ root, publicBasePath, maxInputBytes, maxWidth, maxHeight, maxPixels })
  if (typeof createId !== 'function') throw new TypeError('createId must be a function')
  const configuredRoot = path.resolve(root)
  const limits = Object.freeze({ maxInputBytes, maxWidth, maxHeight, maxPixels })

  async function storageRoot() {
    await fs.mkdir(configuredRoot, { recursive: true, mode: 0o750 })
    return fs.realpath(configuredRoot)
  }

  function urlFor(storedPath) {
    assertStoredPath(storedPath)
    return `${publicBasePath}/${storedPath}`
  }

  async function put(upload) {
    assertUpload(upload, limits.maxInputBytes)
    const normalized = await normalizeImage(upload, limits)
    const canonicalRoot = await storageRoot()

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const storedPath = `${createId()}${normalized.imageType.outputExtension}`.toLowerCase()
      assertStoredPath(storedPath)
      const filePath = path.resolve(canonicalRoot, storedPath)
      if (path.dirname(filePath) !== canonicalRoot) {
        throw storageError('UNSAFE_STORAGE_PATH', 'Unsafe image storage path')
      }
      try {
        await writeExclusive(filePath, normalized.data)
        return Object.freeze({
          path: storedPath,
          publicUrl: urlFor(storedPath),
          contentType: normalized.imageType.contentType,
          width: normalized.info.width,
          height: normalized.info.height,
          size: normalized.data.length,
        })
      } catch (error) {
        if (error?.code === 'EEXIST') continue
        throw storageError('STORAGE_WRITE_FAILED', 'Image could not be stored', error)
      }
    }
    throw storageError('STORAGE_WRITE_FAILED', 'Image could not be stored')
  }

  async function remove(storedPath) {
    assertStoredPath(storedPath)
    const canonicalRoot = await storageRoot()
    const filePath = path.resolve(canonicalRoot, storedPath)
    if (path.dirname(filePath) !== canonicalRoot) {
      throw storageError('UNSAFE_STORAGE_PATH', 'Unsafe image storage path')
    }
    try {
      await fs.unlink(filePath)
      return true
    } catch (error) {
      if (error?.code === 'ENOENT') return false
      throw storageError('STORAGE_DELETE_FAILED', 'Image could not be deleted', error)
    }
  }

  async function withCompensation(upload, operation) {
    if (typeof operation !== 'function') throw new TypeError('operation must be a function')
    const storedImage = await put(upload)
    try {
      return await operation(storedImage)
    } catch (operationError) {
      try {
        await remove(storedImage.path)
      } catch (compensationError) {
        throw new AggregateError(
          [operationError, compensationError],
          'Image operation failed and storage compensation did not complete',
          { cause: compensationError },
        )
      }
      throw operationError
    }
  }

  return Object.freeze({ put, delete: remove, urlFor, withCompensation, limits })
}
