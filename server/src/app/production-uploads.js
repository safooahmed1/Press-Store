import { constants } from 'node:fs'
import { open } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createImageStorage, IMAGE_STORAGE_LIMITS } from '../platform/storage/image-storage.js'

/** Serve only STO-FND-001 opaque filenames, never a general-purpose static directory. */
export function productionUploads(root) {
  const storage = createImageStorage({ root })
  return async (req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method)) return next()
    const storedPath = req.path.slice(1)
    try { storage.urlFor(storedPath) } catch { return next() }
    let handle
    try {
      handle = await open(path.join(root, storedPath), constants.O_RDONLY | constants.O_NOFOLLOW)
      const info = await handle.stat()
      if (!info.isFile() || info.size > IMAGE_STORAGE_LIMITS.maxInputBytes) return next()
      res.type(path.extname(storedPath))
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Content-Length', info.size)
      if (req.method === 'HEAD') return res.end()
      await pipeline(handle.createReadStream(), res)
    } catch (error) {
      if (['ENOENT', 'ENOTDIR', 'ELOOP'].includes(error.code)) return next()
      if (!res.destroyed) next(error)
    } finally { await handle?.close().catch(() => {}) }
  }
}
