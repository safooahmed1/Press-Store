import { readdir } from 'node:fs/promises'

/** Discover only immediate feature manifests; a missing feature tree is valid. */
export async function loadFeatureManifests(root = new URL('../features/', import.meta.url), context) {
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
  const manifests = await Promise.all(entries.filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(async (entry) => {
      const directory = new URL(`${entry.name}/`, root)
      const files = await readdir(directory)
      if (!files.includes('manifest.js')) return []
      const { feature } = await import(new URL('manifest.js', directory))
      return Array.isArray(feature) ? feature : [feature]
    }))
  const descriptors = manifests.flat()
  validateRegistry(descriptors, true)
  const runtime = context && Object.freeze({ ...context })
  const resolved = []
  for (const descriptor of descriptors) {
    const router = descriptor.createRouter
      ? await descriptor.createRouter(runtime) : descriptor.router
    resolved.push({ id: descriptor.id, path: descriptor.path, router })
  }
  validateRegistry(resolved)
  return resolved
}

function validateRegistry(manifests, factories = false) {
  const ids = new Set()
  const paths = new Set()
  for (const feature of manifests) {
    if (!feature || typeof feature.id !== 'string' || !/^[a-z]+(?:-[a-z]+)*$/.test(feature.id)
      || ids.has(feature.id)
      || !(typeof feature.router === 'function' && feature.createRouter === undefined
        || factories && typeof feature.createRouter === 'function' && feature.router === undefined)
      || typeof feature.path !== 'string'
      || feature.path !== feature.path.trim()
      || !/^\/[a-z]+(?:-[a-z]+)*(?:\/[a-z]+(?:-[a-z]+)*)*$/.test(feature.path)
      || feature.path.split('/')[1] === 'health' || paths.has(feature.path)) {
      throw new Error('Invalid or duplicate server feature manifest')
    }
    ids.add(feature.id)
    paths.add(feature.path)
  }
}

/** Validate the complete registry before attaching any feature routes. */
export function registerFeatureRouters(api, manifests) {
  validateRegistry(manifests)
  for (const feature of manifests) api.use(feature.path, feature.router)
}
