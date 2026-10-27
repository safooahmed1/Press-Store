# Foundation verification helpers

- `startTestApp(t, options)` creates a real loopback server and captures safe JSON logs per test.
  Test teardown closes connections and the server; options can override app dependencies or logger.
- `temporaryDirectory(t)` creates a unique OS temporary root and removes it through test teardown.
- `countQueries(database)` wraps the existing `query`/`transaction` surface for assertions. Its
  `count` includes failed attempts and transaction queries, and retains no SQL, values or results.
  It counts application calls, not connection/session/control statements inside the driver layer.

Run from the repository root:

```sh
node --test --test-isolation=none server/src/platform/observability/foundation-observability.test.js tests/helpers/foundation-quality.test.js
node --test --test-isolation=none server/src/platform/observability/foundation-observability.integration.test.js
npm run test -- foundation
FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- foundation
npm run lint
npm run build
```

HTTP and MySQL tests require permission to bind local sockets. Run the opt-in database suite outside
the restrictive Codex sandbox; the existing disposable MySQL helper requires `mysqld` on PATH. It
creates its own database, random test-only credentials and datadir; never use application environment
files or an existing database. The two DB suites use independent fixtures. A failed startup must
also be inspected for owned processes/directories before claiming cleanup.

The quality fixture inserts 100 synthetic rows through a forward test migration. A primary-key
lookup and a page of ten rows use two measured prepared queries total; EXPLAIN must show
`const/PRIMARY` and `range/PRIMARY`, with no page filesort. This is a foundation sanity check, not
a Hostinger latency benchmark or evidence for future catalog/order queries. Each feature must
verify its own bounds, query count and indexes with representative data.

Client checks execute the existing React Query client: simultaneous reads deduplicate, an explicitly
fresh query can reuse cache, transient reads attempt at most twice and validation failures/mutations
attempt once. Manifest collection does not eagerly load pages. No production freshness or rendering
policy is changed; UI/business rendering performance stays with the corresponding feature owner.
