import { spawnSync } from 'node:child_process'
import { globSync } from 'node:fs'

// Forward an optional suite name without introducing a second test framework.
const args = process.argv.slice(2)
const integration = args.includes('--integration')
const filter = args.find((arg) => arg !== '--integration')
const files = [...globSync(['src/**/*.test.js', 'server/src/**/*.test.js', 'tests/**/*.test.js'], { exclude: ['**/node_modules/**'] })]
  .filter((file) => file.endsWith('.integration.test.js') === integration).sort()
const result = spawnSync(process.execPath, [
  '--test', ...(filter ? [`--test-name-pattern=${filter}`] : []), ...files,
], { stdio: 'inherit' })
process.exitCode = result.status ?? 1
