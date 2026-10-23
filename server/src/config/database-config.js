function integer(env, name, fallback, maximum) {
  const value = env[name] ?? String(fallback)
  if (typeof value !== 'string' || !/^\d+$/.test(value)
    || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > maximum) {
    throw new Error(`Invalid ${name} configuration`)
  }
  return Number(value)
}

/** No environment files are loaded. Connection identity is always explicit. */
export function readDatabaseConfig(env = process.env) {
  const production = env.NODE_ENV === 'production'
  for (const name of ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD']) {
    if (typeof env[name] !== 'string' || !env[name].trim() || env[name].includes('\0')) {
      throw new Error(`Invalid ${name} configuration`)
    }
  }
  if (env.MYSQL_PORT === undefined) throw new Error('Invalid MYSQL_PORT configuration')
  return Object.freeze({
    host: env.MYSQL_HOST, port: integer(env, 'MYSQL_PORT', undefined, 65535),
    database: env.MYSQL_DATABASE, user: env.MYSQL_USER, password: env.MYSQL_PASSWORD,
    connectionLimit: integer(env, 'MYSQL_CONNECTION_LIMIT', production ? undefined : 5, 100),
    connectTimeout: integer(env, 'MYSQL_CONNECT_TIMEOUT_MS', production ? undefined : 5000, 60000),
    queryTimeout: integer(env, 'MYSQL_QUERY_TIMEOUT_MS', production ? undefined : 10000, 300000),
    migrationLockTimeout: integer(env, 'MYSQL_MIGRATION_LOCK_TIMEOUT_SECONDS', production ? undefined : 10, 60),
  })
}

/** Explicit opt-in; tests create their own server and never consume application credentials. */
export function localDatabaseTestsEnabled(env = process.env) {
  return env.FND_DISPOSABLE_MYSQL_TESTS === '1'
}
