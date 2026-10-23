import { startServer } from './app/start-server.js'

try {
  const server = await startServer()
  let stopping = false
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      if (stopping) return
      stopping = true
      server.close(async () => {
        try { await server.closeDatabase(); process.exitCode = 0 } catch {
          console.error('Database shutdown failed.')
          process.exitCode = 1
        }
      })
      setTimeout(() => process.exit(1), 10_000).unref()
    })
  }
} catch {
  console.error('Application startup failed; check configuration, database readiness, and build availability.')
  process.exitCode = 1
}
