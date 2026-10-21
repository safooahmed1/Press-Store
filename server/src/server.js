import { startServer } from './app/start-server.js'

try {
  const server = await startServer()
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(() => { process.exitCode = 0 })
      setTimeout(() => process.exit(1), 10_000).unref()
    })
  }
} catch {
  console.error('Application startup failed; check runtime configuration and build availability.')
  process.exitCode = 1
}
