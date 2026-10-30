/** Test-only DB-FND-001 decorator. Deliberately retains no SQL text, values or results. */
export function countQueries(database) {
  let count = 0
  const queryFor = (handle) => async (...args) => {
    count++
    return handle.query(...args)
  }
  return Object.freeze({
    get count() { return count },
    query: queryFor(database),
    transaction: (work) => database.transaction((tx) => work(Object.freeze({ query: queryFor(tx) }))),
  })
}
