/** Read only runtime inputs here; later platform tasks own their config validation. */
export function readRuntimeConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV ?? 'development'
  const portValue = env.PORT ?? (nodeEnv === 'production' ? '' : '3000')
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('Invalid NODE_ENV configuration')
  }
  if (!/^\d+$/.test(portValue) || Number(portValue) < 1 || Number(portValue) > 65535) {
    throw new Error('Invalid PORT configuration')
  }
  return Object.freeze({ nodeEnv, port: Number(portValue) })
}
