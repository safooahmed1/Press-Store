import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { describe, it } from 'node:test'
import { startDisposableMysql } from './disposable-mysql.js'

function childProcess({ closeOnKill = true, closeSignals, throwOnSignals = [] } = {}) {
  const child = new EventEmitter()
  child.exitCode = null
  child.signalCode = null
  child.kills = []
  child.kill = (signal) => {
    child.kills.push(signal)
    if (throwOnSignals.includes(signal)) throw new Error(`${signal} failed`)
    const shouldClose = closeSignals ? closeSignals.includes(signal) : closeOnKill
    if (shouldClose) queueMicrotask(() => {
      child.signalCode = signal
      child.emit('close', null, signal)
    })
    return true
  }
  child.close = (code = 0) => {
    child.exitCode = code
    child.emit('close', code, null)
  }
  return child
}

function harness({ connect, initializer = childProcess(), server = childProcess(),
  startupAttempts = 1, helperOptions = {} } = {}) {
  const removed = []
  const spawned = []
  const dependencies = {
    spawnProcess: (...args) => {
      const child = spawned.length === 0 ? initializer : server
      spawned.push({ child, args })
      if (child === initializer) queueMicrotask(() => child.close(0))
      return child
    },
    connect: connect || (async () => ({
      query: async () => [[{ version: '8.4.0', comment: 'MySQL Community' }]], destroy() {},
    })),
    makeRoot: async () => '/tmp/owned-disposable-mysql-fixture',
    write: async () => {},
    removeRoot: async (root, options) => { removed.push([root, options]) },
    random: (size) => Buffer.alloc(size, 1),
  }
  return { dependencies, initializer, server, removed, spawned,
    options: { dependencies, startupAttempts, initializationTimeout: 50,
      shutdownTimeout: 10, terminateTimeout: 10, readinessTimeout: 10,
      startupTimeout: 40, retryDelay: 1, ...helperOptions } }
}

describe('disposable MySQL process cleanup', () => {
  it('terminates its initializer and removes its root when initialization is interrupted', async () => {
    const initializer = childProcess()
    const state = harness({ initializer })
    state.dependencies.spawnProcess = () => {
      queueMicrotask(() => initializer.emit('error', new Error('initializer interrupted')))
      return initializer
    }
    await assert.rejects(startDisposableMysql(state.options), /initialization failed/)
    assert.deepEqual(initializer.kills, ['SIGTERM'])
    assert.equal(state.removed.length, 1)
  })

  it('preserves its root when initializer termination cannot be confirmed', async () => {
    const initializer = childProcess({ closeOnKill: false })
    const state = harness({ initializer })
    state.dependencies.spawnProcess = () => {
      queueMicrotask(() => initializer.emit('error', new Error('initializer interrupted')))
      return initializer
    }
    await assert.rejects(startDisposableMysql(state.options), /startup and cleanup failed/)
    assert.deepEqual(initializer.kills, ['SIGTERM', 'SIGKILL'])
    assert.equal(state.removed.length, 0)
  })

  it('terminates only its retained server after readiness/authentication failure', async () => {
    const state = harness({ connect: async () => { throw new Error('authentication failed') } })
    await assert.rejects(startDisposableMysql(state.options), /readiness timed out/)
    assert.deepEqual(state.initializer.kills, [])
    assert.deepEqual(state.server.kills, ['SIGTERM'])
    assert.equal(state.removed.length, 1)
    assert.equal(state.spawned.length, 2)
  })

  for (const failure of ['connect', 'shutdown']) {
    it(`forces bounded server termination and supports repeated cleanup after ${failure} failure`, async () => {
      let connections = 0
      const state = harness({ connect: async () => {
        connections++
        if (connections === 1) return {
          query: async () => [[{ version: '8.4.0', comment: 'MySQL Community' }]], destroy() {},
        }
        if (failure === 'connect') throw new Error('shutdown connection failed')
        return { query: async () => { throw new Error('SHUTDOWN failed') }, destroy() {} }
      } })
      const fixture = await startDisposableMysql(state.options)
      await Promise.all([fixture.stop(), fixture.stop(), fixture.stop()])
      assert.deepEqual(state.server.kills, ['SIGTERM'])
      assert.equal(state.removed.length, 1)
      assert.equal(connections, 2)
    })
  }

  it('preserves its root when SIGTERM and SIGKILL do not confirm server termination', async () => {
    const server = childProcess({ closeOnKill: false })
    const state = harness({ server })
    const fixture = await startDisposableMysql(state.options)
    await assert.rejects(fixture.stop(), /failed to exit/)
    assert.deepEqual(server.kills, ['SIGTERM', 'SIGKILL'])
    assert.equal(state.removed.length, 0)
  })

  it('uses SIGKILL after SIGTERM delivery fails and removes its root after confirmed exit', async () => {
    const server = childProcess({ closeSignals: ['SIGKILL'], throwOnSignals: ['SIGTERM'] })
    const state = harness({ server })
    const fixture = await startDisposableMysql(state.options)
    await fixture.stop()
    assert.deepEqual(server.kills, ['SIGTERM', 'SIGKILL'])
    assert.equal(state.removed.length, 1)
  })

  it('preserves its root when SIGKILL delivery fails and termination is unconfirmed', async () => {
    const server = childProcess({ closeOnKill: false, throwOnSignals: ['SIGKILL'] })
    const state = harness({ server })
    const fixture = await startDisposableMysql(state.options)
    await assert.rejects(fixture.stop(), /failed to exit/)
    assert.deepEqual(server.kills, ['SIGTERM', 'SIGKILL'])
    assert.equal(state.removed.length, 0)
  })

  it('terminates its process once even when disposable-root removal fails', async () => {
    const state = harness()
    let removals = 0
    state.dependencies.removeRoot = async () => { removals++; throw new Error('fixture removal failed') }
    const fixture = await startDisposableMysql(state.options)
    await assert.rejects(fixture.stop(), /fixture removal failed/)
    await assert.rejects(fixture.stop(), /fixture removal failed/)
    assert.deepEqual(state.server.kills, ['SIGTERM'])
    assert.equal(removals, 1)
  })

  it('bounds a hanging readiness query and cleans up before late query completion',
    { timeout: 1000 }, async () => {
      let connectCalls = 0
      let destroyed = 0
      let resolveQuery
      const state = harness({ startupAttempts: 100, connect: async () => {
        connectCalls++
        if (connectCalls > 1) throw new Error('readiness unavailable')
        return {
          query: () => new Promise((resolve) => { resolveQuery = resolve }),
          destroy: () => { destroyed++ },
        }
      } })
      await assert.rejects(startDisposableMysql(state.options), /readiness timed out/)
      assert.equal(destroyed, 1)
      assert.deepEqual(state.server.kills, ['SIGTERM'])
      assert.equal(state.server.signalCode, 'SIGTERM')
      assert.equal(state.removed.length, 1)

      resolveQuery([[{ version: '8.4.0', comment: 'MySQL Community' }]])
      await new Promise((resolve) => setImmediate(resolve))
      assert.equal(destroyed, 1)
      assert.equal(state.removed.length, 1)
    })

  it('bounds connection acquisition and destroys a connection that arrives after startup timeout',
    { timeout: 1000 }, async () => {
      let connectCalls = 0
      let resolveConnection
      let destroyed = 0
      const state = harness({ startupAttempts: 100,
        helperOptions: { readinessTimeout: 200, startupTimeout: 20 }, connect: () => {
        connectCalls++
        if (connectCalls > 1) return Promise.reject(new Error('shutdown unavailable'))
        return new Promise((resolve) => { resolveConnection = resolve })
      } })
      await assert.rejects(startDisposableMysql(state.options), /readiness timed out/)
      assert.deepEqual(state.server.kills, ['SIGTERM'])
      assert.equal(state.server.signalCode, 'SIGTERM')
      assert.equal(state.removed.length, 1)

      resolveConnection({ query: async () => [], destroy: () => { destroyed++ } })
      await new Promise((resolve) => setImmediate(resolve))
      assert.equal(destroyed, 1)
      assert.equal(state.removed.length, 1)
    })

  it('preserves the root when startup times out and server termination remains unconfirmed',
    { timeout: 1000 }, async () => {
      let connectCalls = 0
      let destroyed = 0
      const server = childProcess({ closeOnKill: false })
      const state = harness({ server, startupAttempts: 100, connect: async () => {
        connectCalls++
        if (connectCalls > 1) throw new Error('readiness unavailable')
        return { query: () => new Promise(() => {}), destroy: () => { destroyed++ } }
      } })
      await assert.rejects(startDisposableMysql(state.options), /startup and cleanup failed/)
      assert.equal(destroyed, 1)
      assert.deepEqual(server.kills, ['SIGTERM', 'SIGKILL'])
      assert.equal(server.signalCode, null)
      assert.equal(state.removed.length, 0)
    })
})
