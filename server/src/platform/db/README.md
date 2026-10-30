# FND-002 implementation notes

These notes describe the implementation submitted for independent review. `AI-DOCS/`
remains the specification. No formal task completion, hosting compatibility, or
documentation validation is claimed.

## Database boundary

`createDatabase(readDatabaseConfig())` owns one bounded pool. Repositories use
`await database.query(sql, values)` for result rows or write-result packets, and
`await database.transaction(async (tx) => { ... await tx.query(sql, values) })` for
multi-statement application transactions. Await all work within the callback; do
not retain its handle. The pool is closed with `await database.close()`.

Values use prepared parameters. SQL text and identifiers must be owned source,
never request input. Do not run DDL, transaction-control, session mutation, or
cross-owner writes through repository queries. Transactions do not promise DDL
rollback. Transaction callbacks retain their domain errors; driver errors are
replaced with safe `DatabaseError` codes without raw SQL, values, or causes.
Owners map constraint errors to domain errors at their own boundary. FND-003
retains ownership of HTTP mapping; today's runtime sanitizes unknown failures.

Transaction queries are serialized on their connection. The first failed query
makes the handle terminal: queued and later queries reject without reaching the
driver, the transaction cannot commit even if its callback catches the failure,
and rollback still runs. Nested `database.transaction()` calls on the same
database instance are unsupported and reject before acquiring a connection.
Independent top-level transactions remain concurrent; no savepoints or retries
are introduced.

BIGINT values are strings to preserve precision. Driver dates and database
sessions use UTC. Exhausted pools fail immediately rather than queueing without
a bound. Deadlines destroy the affected connection; queries and transactions are
never automatically retried, including ambiguous commit outcomes.

Only configuration code reads environment variables; no environment file is
loaded. All five connection inputs are mandatory: `MYSQL_HOST`, `MYSQL_PORT`,
`MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`. Finite optional tuning inputs:

| Input | Development default | Allowed range |
|---|---:|---:|
| `MYSQL_CONNECTION_LIMIT` | 5 | 1–100 |
| `MYSQL_CONNECT_TIMEOUT_MS` | 5000 | 1–60000 |
| `MYSQL_QUERY_TIMEOUT_MS` | 10000 | 1–300000 |
| `MYSQL_MIGRATION_LOCK_TIMEOUT_SECONDS` | 10 | 1–60 |

Production requires all tuning inputs explicitly, with no defaults. These are
implementation bounds, not verified Hostinger limits. Hosting engine,
version, TLS configuration, privileges, and actual connection budget still need
operator verification before production acceptance. No TLS settings are invented
or certificate verification disabled. The pinned driver is `mysql2@3.24.6`.

Startup checks the database before listening; public readiness checks the actual
database on each request. Startup failures close the pool. Signals close HTTP
before closing the pool, with the existing ten-second shutdown deadline.
Startup never invokes migrations.

## Migration execution and ordering

Operators explicitly run `npm run migrate` against an identified target using
separately supplied migration credentials. The CLI has no reset, force, repair,
rollback, seed, or automatic recovery operation. Application startup never runs it.

Files are discovered only in immediate `server/src/features/*/migrations/*.sql`
directories. They follow `<feature>_<sequence>_<imperative_description>.sql`,
with at least three sequence digits and globally unique names. Execution is in
binary lexical filename order. Keep sequence widths consistent and coordinate
cross-feature dependencies in that ordering. Adding an unapplied file before
completed history is rejected; neither completed files nor their checksums may
be edited or removed. Renaming a completed file also fails history validation.

The FND-owned `fnd_000_create_migration_metadata.sql` bootstraps the infrastructure
tables under the same lock; its own checksum is retained in history. User
migrations cannot use that reserved name. Metadata tables use plural snake_case
as explicitly required by the user and original database rules.
An incomplete metadata bootstrap also stops for operator inspection; it is not
silently recreated over existing partial history.

Migration source is trusted, reviewed SQL, not request input. The dedicated
migration connection permits complete multi-statement SQL scripts through MySQL's
own parser, without a custom SQL splitter. Never include mysql-client commands
such as `DELIMITER`, session/transaction mutation, changes to migration metadata,
named-lock calls, `USE`, or external input in migration source. Separate schema
and data migrations. Each migration must document owner, indexes, and forward
recovery implications. Later owners supply their own business migrations;
FND-002 creates no business schema.

A database-scoped named lock is held on one dedicated connection for the entire
run. Matching history is skipped; missing or modified applied files fail closed.
An autocommitted name/checksum/UTC marker precedes each migration. Success records
the completed migration and deletes its marker in one InnoDB transaction. Failure,
connection loss, and interruption leave a marker; later runs stop before executing
pending migrations. MySQL DDL may already have committed. Failed or interrupted
queries can also continue server-side until MySQL terminates that session, so the
named lock can remain temporarily unavailable after client death.

## Recovery procedure (separate approval required)

1. Stop further migration attempts. Identify the exact database and unresolved
   marker, source checksum, completed history, active migration session, and lock.
2. Inspect actual schema, indexes, constraints, and data. Record evidence and
   backup/recovery implications. Never infer rollback from a failed DDL script.
3. Obtain separate approval for a concrete recovery plan: either finish the
   intended migration and verify its complete post-state, or restore and verify
   the pre-migration state before retrying unchanged source.
4. Under exclusive operator control, execute only that approved plan and its
   specifically approved metadata reconciliation. Retain completed history.
5. Verify the intended state and ordering, then resume normal migration execution.

The runner implements no shortcut for these steps. Recovery tests inspect and
restore only their newly created disposable fixtures; they authorize no operator
recovery against another database.

## Verification

Unit/regression assertions can be run explicitly with Node's
`--test-isolation=none` flag if isolated test workers produce only file-level
summaries in the execution environment:

```sh
node --test --test-isolation=none server/src/config/*.test.js server/src/app/foundation-manifests.test.js server/src/platform/db/*.test.js
FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/app/foundation-runtime.integration.test.js server/src/platform/db/foundation-database.integration.test.js
npm run lint
npm run build
git diff --check
```

The opt-in database suite initializes a brand-new MySQL datadir under a private
temporary directory, binds only to loopback on a random port, generates credentials,
and shuts down/removes that instance afterward. It retains only the initializer
and server child handles it created, uses bounded shutdown/TERM/KILL waits, and
makes repeated cleanup calls idempotent. It never reads application DB
credentials or connects to an existing instance. MySQL binaries and permission
to create local listeners are required. Without explicit opt-in, real DB tests
are visibly skipped. No skipped DB suite is acceptance evidence.
