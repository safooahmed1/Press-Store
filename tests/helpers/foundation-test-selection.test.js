import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, it } from 'node:test'
import { temporaryDirectory } from './temporary-directory.js'

describe('foundation prescribed command selection', () => {
  it('executes every disposable cleanup regression and propagates a cleanup-suite failure', async (t) => {
    const root = await temporaryDirectory(t)
    const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url)))
    await writeFile(path.join(root, 'package.json'), JSON.stringify({
      type: 'module', scripts: { test: packageJson.scripts.test },
    }))
    await copyFile(new URL('../../test.config.js', import.meta.url), path.join(root, 'test.config.js'))
    const directory = path.join(root, 'server/src/platform/db/testing')
    await mkdir(directory, { recursive: true })
    const suite = new URL('../../server/src/platform/db/testing/disposable-mysql.test.js', import.meta.url)
    const testFile = path.join(directory, 'disposable-mysql.test.js')
    await writeFile(testFile, `import ${JSON.stringify(suite.href)}\n`)
    // A separate fixture avoids recursively invoking this selection test. The imported cleanup
    // suite uses injected fake processes/connections only; no MySQL executable is started.
    const env = { ...process.env, FND_DISPOSABLE_MYSQL_TESTS: '0',
      NODE_OPTIONS: '--test-isolation=none --test-reporter=tap' }
    delete env.NODE_TEST_CONTEXT
    const run = () => spawnSync('npm', ['run', 'test', '--', 'foundation'], {
      cwd: root, env, encoding: 'utf8', timeout: 15000,
    })
    const passing = run()
    assert.equal(passing.error, undefined)
    assert.equal(passing.status, 0, passing.stdout + passing.stderr)
    assert.match(passing.stdout, /disposable MySQL process cleanup/)
    assert.match(passing.stdout, /(?:#|ℹ) tests 12\b/)
    assert.match(passing.stdout, /(?:#|ℹ) pass 12\b/)
    await writeFile(testFile, `import ${JSON.stringify(suite.href)}
import { describe, it } from 'node:test'
describe('disposable MySQL process cleanup selection sentinel', () => {
  it('must propagate failure', () => { throw new Error('cleanup-selection-sentinel') })
})
`)
    const failing = run()
    assert.equal(failing.error, undefined)
    assert.equal(failing.status, 1, failing.stdout + failing.stderr)
    assert.match(failing.stdout, /cleanup-selection-sentinel/)
  })
})
