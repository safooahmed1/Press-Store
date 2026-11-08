import { readDatabaseConfig } from '../config/database-config.js'
import { loadFeatureJobs } from './job-registry.js'
import { runFeatureJob } from './job-runner.js'

try {
  const [name, ...extra] = process.argv.slice(2)
  const job = extra.length === 0 && (await loadFeatureJobs()).get(name)
  if (!job) throw new Error('Unknown feature job')
  const result = await runFeatureJob({ config: readDatabaseConfig(), job })
  if (result.status === 'failed') process.exitCode = 1
} catch {
  console.error(JSON.stringify({ event: 'job.invocation.failed', errorCode: 'JOB_CONFIGURATION_INVALID' }))
  process.exitCode = 1
}
