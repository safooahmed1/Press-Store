import { readdir } from 'node:fs/promises'

/** Discover only immediate feature manifests; a missing feature tree is valid. */
export async function loadFeatureManifests(root = new URL('../features/', import.meta.url)) {
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
      return [feature]
    }))
  return manifests.flat()
}

/** Validate the complete registry before attaching any feature routes. */
export function registerFeatureRouters(api, manifests) {
  const ids = new Set()
  const paths = new Set()
  for (const feature of manifests) {
    if (!feature || typeof feature.id !== 'string' || !/^[a-z]+(?:-[a-z]+)*$/.test(feature.id)
      || ids.has(feature.id) || typeof feature.router !== 'function'
      || !/^\/[a-z]+(?:-[a-z]+)*$/.test(feature.path)
      || feature.path === '/health' || paths.has(feature.path)) {
      throw new Error('Invalid or duplicate server feature manifest')
    }
    ids.add(feature.id)
    paths.add(feature.path)
  }
  for (const feature of manifests) api.use(feature.path, feature.router)
}
