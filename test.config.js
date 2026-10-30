import { spawnSync } from 'node:child_process'
import { globSync } from 'node:fs'

// Forward an optional suite name without introducing a second test framework.
const args = process.argv.slice(2)
const integration = args.includes('--integration')
const filter = args.find((arg) => arg !== '--integration')
// The legacy cleanup suite predates the Foundation naming convention. It uses fake
// processes/connections and must run with the prescribed Foundation unit command.
const pattern = filter === 'foundation' ? 'foundation|disposable MySQL process cleanup' : filter
const files = [...globSync(['src/**/*.test.js', 'server/src/**/*.test.js', 'tests/**/*.test.js'], { exclude: ['**/node_modules/**'] })]
  .filter((file) => file.endsWith('.integration.test.js') === integration).sort()
const result = spawnSync(process.execPath, [
  '--test', ...(pattern ? [`--test-name-pattern=${pattern}`] : []), ...files,
], { stdio: 'inherit' })
process.exitCode = result.status ?? 1
