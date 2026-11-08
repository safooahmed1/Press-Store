import { readdir } from 'node:fs/promises'

async function entries(directory) {
  try {
    return await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

export function validJobName(name) {
  return typeof name === 'string' && name.length <= 64 && name.trim() === name
    && /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+$/.test(name)
}

export async function loadFeatureJobs(features = new URL('../features/', import.meta.url)) {
  const jobs = new Map()
  for (const feature of await entries(features)) {
    if (!feature.isDirectory()) continue
    const directory = new URL(`${feature.name}/jobs/`, features)
    if (!(await entries(directory)).some((entry) => entry.name === 'manifest.js' && entry.isFile())) continue
    const { job } = await import(new URL('manifest.js', directory))
    if (!validJobName(job?.name) || typeof job.run !== 'function' || jobs.has(job.name)) {
      throw new TypeError('Invalid or duplicate feature job')
    }
    jobs.set(job.name, Object.freeze({ name: job.name, run: job.run }))
  }
  return jobs
}
