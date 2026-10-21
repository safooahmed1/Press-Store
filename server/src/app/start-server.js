import { once } from 'node:events'
import { readRuntimeConfig } from '../config/runtime-config.js'
import { createApp } from './create-app.js'
import { loadFeatureManifests } from './feature-manifests.js'

export async function startServer() {
  const config = readRuntimeConfig()
  const manifests = await loadFeatureManifests()
  const app = await createApp({ config, manifests })
  const server = app.listen(config.port)
  await once(server, 'listening')
  return server
}
