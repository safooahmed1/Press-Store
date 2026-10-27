import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

export async function temporaryDirectory(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'press-foundation-test-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  return directory
}
