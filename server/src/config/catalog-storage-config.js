import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Config access only; never loads .env. Test mode has no implicit filesystem target. */
export function readCatalogStorageConfig(nodeEnv, env = process.env) {
  if (nodeEnv === 'test') return null
  const root = env.UPLOAD_ROOT ?? (nodeEnv === 'development'
    ? fileURLToPath(new URL('../../../uploads/', import.meta.url)) : undefined)
  return validateCatalogStorageConfig({ root })
}
export function validateCatalogStorageConfig(config) {
  if (!config || typeof config.root !== 'string' || !path.isAbsolute(config.root)
    || config.root.includes('\0') || path.resolve(config.root) === path.parse(config.root).root) {
    throw new Error('Invalid catalog storage configuration')
  }
  return Object.freeze({ root: path.resolve(config.root) })
}
