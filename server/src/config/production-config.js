import { constants } from 'node:fs'
import { access, open, realpath, stat, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APPLICATION_ROOT = fileURLToPath(new URL('../../../', import.meta.url))

/** Production-only inputs; never loads .env or exposes secrets to Vite. */
export function readProductionConfig(env = process.env) {
  return { sessionSecret: env.SESSION_SECRET, appOrigin: env.APP_ORIGIN, uploadRoot: env.UPLOAD_ROOT }
}

function overlaps(first, second) {
  const relative = path.relative(first, second)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

export async function validateProductionConfig(config, { applicationRoot = APPLICATION_ROOT } = {}) {
  if (typeof config?.sessionSecret !== 'string' || !config.sessionSecret.trim()
    || config.sessionSecret.includes('\0')) throw new Error('Invalid SESSION_SECRET configuration')
  let origin
  try {
    origin = new URL(config.appOrigin)
    if (origin.protocol !== 'https:' || origin.username || origin.password
      || origin.pathname !== '/' || origin.search || origin.hash) throw new Error()
  } catch { throw new Error('Invalid APP_ORIGIN configuration') }
  let uploadRoot
  try {
    if (typeof config.uploadRoot !== 'string' || !path.isAbsolute(config.uploadRoot)) throw new Error()
    uploadRoot = await realpath(config.uploadRoot)
    const appRoot = await realpath(applicationRoot)
    if (overlaps(appRoot, uploadRoot) || overlaps(uploadRoot, appRoot)
      || !(await stat(uploadRoot)).isDirectory()) throw new Error()
    await access(uploadRoot, constants.R_OK | constants.W_OK | constants.X_OK)
    const probe = path.join(uploadRoot, `.fnd-write-check-${randomUUID()}`)
    let handle
    let created = false
    try {
      handle = await open(probe, 'wx', 0o600)
      created = true
      await handle.writeFile('foundation storage check')
    } finally {
      try { await handle?.close() } finally { if (created) await unlink(probe) }
    }
  } catch { throw new Error('Invalid UPLOAD_ROOT configuration') }
  return Object.freeze({ sessionSecret: config.sessionSecret, appOrigin: origin.origin, uploadRoot })
}
