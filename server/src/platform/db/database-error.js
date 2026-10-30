const messages = {
  DB_UNAVAILABLE: 'Database unavailable',
  DB_QUERY_FAILED: 'Database operation failed',
  DB_CONSTRAINT_FAILED: 'Database constraint violated',
  DB_TRANSACTION_FAILED: 'Database transaction failed',
  DB_TIMEOUT: 'Database operation timed out',
}

export class DatabaseError extends Error {
  constructor(code) {
    super(messages[code])
    this.name = 'DatabaseError'
    this.code = code
  }
}

export function safeDatabaseError(error, fallback = 'DB_QUERY_FAILED') {
  if (error instanceof DatabaseError) return error
  const constraint = error?.sqlState?.startsWith('23')
    || ['ER_DUP_ENTRY', 'ER_NO_REFERENCED_ROW_2', 'ER_ROW_IS_REFERENCED_2',
      'ER_CHECK_CONSTRAINT_VIOLATED'].includes(error?.code)
  // Never retain the driver's message, SQL, parameters, credentials, or cause.
  return new DatabaseError(constraint ? 'DB_CONSTRAINT_FAILED' : fallback)
}
