# Hostinger Production Runbook — FND-006

## 1. Status and authorization

**Local development only; not release-ready.** FND-DEC-005 permits preparing this code/runbook before
FND-002/FND-005 closeout. It does not authorize production operations, live MySQL test reruns,
commit, push, PR, merge, hosting-resource creation or deployment. Commands below are operator
procedures for a separately approved release, not operations performed by this document.

Keep these gates open until evidence exists:

- [ ] FND-002: actual hosting engine/version, driver compatibility, InnoDB/named locks, TLS,
  connection budget and migration privileges verified on an identified separate test database.
- [ ] FND-005: mandatory documentation validator restored and passed; shared AC-FND-002 accepted.
  The earlier orphan cleanup is resolved by user-executed, host-verified evidence, not still pending.
- [ ] AUTH: real MySQL session persistence, secure cookies, CSRF/origin protection and verified
  reverse-proxy trust behavior. FND-006 validates input presence; it does not implement authentication.
- [ ] Hostinger: plan/runtime, native `sharp` support, writable persistent upload location, restart
  and deployment persistence, HTTPS, process limits, log rotation/retention and backup/restore proven.
- [ ] Full foundation verification, AC-FND-004, explicit acceptance/commit and release authorization.

Do not use the local fake-database tests as evidence for any unchecked host/database/session gate.

## 2. Runtime shape and source

Use the repository root and its single `package.json`/lockfile. Node **24.x** is the approved package
engine; verify the actual hosting selection and native dependencies. Do not package local
`node_modules`, `.env*`, uploads, runtime logs, coverage or local credentials.

| Purpose | Command | Effect |
|---|---|---|
| Clean dependency graph | `npm ci` | Install the committed root lockfile; build requires devDependencies |
| Client build | `npm run build` | Vite writes `dist/`; server source remains JavaScript |
| Runtime start | `npm start` | One `node server/src/server.js` process serves API, SPA/assets and validated image reads |
| Local production verification | `npm run test:production` | Build plus production HTTP tests with explicitly fake DB; no MySQL process |
| Explicit migration step | `npm run migrate` | Writes only the separately authorized target; never runs automatically on startup |

The provider's [Node application guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)
and [runtime selection guide](https://www.hostinger.com/support/how-to-select-the-node-js-version-for-your-application/)
list Node 24 support. They describe managed, versioned build directories; these facts are planning
context, not verification of an account/plan. Select a server-side Express configuration, not static
Vite-only hosting. Confirm provider entry/build/start settings against the actual account before use.
Do not enable deployment-on-push; remote writes and releases remain manual and separately approved.

## 3. Configuration contract

Supply server-only values through the hosting runtime environment. The app does not load environment
files. Never put secrets in `VITE_*`, source, command arguments, screenshots or chat. Configure these
before runtime startup, then follow the provider's verified restart procedure.

| Input | Required production behavior |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | Explicit provider-supplied/configured integer 1–65535; no production default |
| `SESSION_SECRET` | Explicit nonblank value; presence is checked here. AUTH owns entropy, rotation and session use; obtain its approved policy before release |
| `APP_ORIGIN` | One explicit HTTPS origin without credentials/path/query/fragment; normalized for downstream use |
| `UPLOAD_ROOT` | Existing absolute readable/writable directory outside application/release output; see §4 |
| `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` | Explicit identified target and least-privilege runtime credentials; port has no implicit default |
| `MYSQL_CONNECTION_LIMIT` | Explicit 1–100, within verified account budget across all workers/processes |
| `MYSQL_CONNECT_TIMEOUT_MS` | Explicit 1–60000 |
| `MYSQL_QUERY_TIMEOUT_MS` | Explicit 1–300000 |
| `MYSQL_MIGRATION_LOCK_TIMEOUT_SECONDS` | Explicit 1–60 for separately authorized migration operation |

These tuning ranges are implementation bounds, not provider limits. Do not guess TLS settings,
disable certificate verification or silently replace MySQL with MariaDB. Hostinger documentation
uses [MySQL terminology in its Node connection guide](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/)
but [describes MariaDB for Web/Cloud](https://www.hostinger.com/support/1583226-which-database-management-system-is-used-at-hostinger/).
Resolve the actual engine/version and compatibility under FND-002 before acceptance. This runbook
provides neither a database-engine substitution nor a TLS configuration decision.

Startup validates production inputs and the upload root before creating the DB pool/listening.
The root check canonicalizes symlinks, rejects overlap with application source and briefly creates
and removes one exclusive private probe file. Missing/unwritable roots fail startup; the check never
silently provisions a production directory. Next, DB connectivity and built index availability must
pass. Logs are sanitized. Neither schema migration nor data recovery runs during ordinary startup.

`APP_ORIGIN` validation does not itself enforce CORS/CSRF, configure proxy trust, or enable Secure
cookies. These are AUTH/security acceptance requirements, not claimed FND-006 behavior.

## 4. Upload storage and persistence

The operator must obtain a verified persistent location outside deployment-managed directories,
including `hbuilds` and `public_html`, then provision permissions/ownership for the app identity.
No default host path is invented here. Canonical app-tree exclusion is enforced in code; actual
hosting durability, quotas, backup and permissions require host evidence.

Keep the same verified root when changing app versions. STO-FND-001 writes metadata-stripped,
normalized JPEG/PNG/WebP with generated names and private file mode. The same Express process serves
only GET/HEAD for valid existing opaque filenames under `/uploads/`. It rejects symlink files,
directory listings, arbitrary filenames, dotfiles and other methods. Missing uploads return safe
JSON 404, not SPA HTML. No multipart business endpoint is introduced.

On an authorized test deployment: create an image through an implemented owner workflow, record
its opaque URL/checksum, restart the app, then verify the same bytes. Repeat after a deployment
switch and any provider cleanup. Verify backup/restore of that root independently of app artifacts.
If no durable local path can be verified, stop release and request an architecture decision; do
not silently substitute external storage or rely on a versioned release directory.

## 5. Verification before a release

From a clean authorized checkout on Node 24, preserve the exact outputs and observer:

```sh
npm ci
npm run lint
npm run test -- foundation
npm run test:production
git diff --check
python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .
```

The final validator is currently **BLOCKED / NOT RUN** because the prescribed script is absent.
Restore the original script; do not fabricate an alternative, change its command or infer a pass.
There is no typecheck script in this approved JavaScript base.

**Do not execute the following until the user explicitly authorizes live MySQL reruns again:**

```sh
FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- foundation
```

That suite creates its own local MySQL processes and private data directories; it does not use a
hosting database. Run it only with the required local process/socket permissions, not the restrictive
sandbox. Verify all owned processes and temporary roots are gone afterward, including on failure.
It is not authorization to run migrations on an existing database.

For the separately authorized hosting test, start the actual entry point with validated production
configuration and approved test DB. Probe readiness, SPA, referenced built JS asset and safe API 404
from the same process. Verify dependency failure returns 503 without internals; stop traffic until
ready. Check missing assets/uploads, hidden/encoded paths, GET/HEAD and malformed requests. Verify
graceful shutdown and pool cleanup without terminating unrelated MySQL processes. Test real sessions
across restart through AUTH. No such live hosting/session smoke is claimed by local fake-DB tests.

## 6. Migration and release sequence

Only after separate operator approval and all required gates:

1. Identify the exact target/account, current app revision, backup set and schema compatibility.
   Keep runtime and migration credentials separate; verify only the privileges required by reviewed SQL.
2. Take consistent database and upload backups plus a protected configuration inventory. Record
   restore checks and storage location without credentials in logs. No backup is proven merely by
   documenting it; rehearse restore in a separate approved test environment.
3. Review forward migrations and their recovery notes. Run them explicitly under the separately
   approved release step before traffic switches. Follow the FND-002 runner ordering/checksum/lock
   rules. Never reset history or automatically retry unresolved interruption markers.
4. Install/build the reviewed app, verify output and configure the approved persistent root/runtime
   variables. Confirm the provider can enforce the explicit migration/traffic-switch sequence. If
   its deployment workflow cannot do so safely, stop and obtain an approved operational plan.
5. Start and probe the actual production process; confirm HTTPS, cookie/session/CSRF behavior,
   upload/session persistence and readiness. Switch traffic only after those checks pass.
6. Record command/observer/version/time, approved migration names, safe health evidence and backup
   references. Do not record raw SQL parameters, passwords, session IDs or full customer/payment data.

## 7. Failure, rollback and retention

- Invalid config/build/DB health: stop the release. Restore the previous verified configuration or
  schema-compatible app revision, then recheck health. Do not keep routing traffic to a 503 process.
- Migration failure/interruption: stop retries and switching traffic. MySQL DDL may have committed.
  Inspect schema/history/markers and request separate approval under the FND-002 recovery procedure.
  Do not automatically run reverse SQL, remove markers or assume application rollback undoes DDL.
- App rollback: confirm the prior revision works with the current schema before switching. Preserve
  the same upload root and session backing store. If restoration is necessary, require a concrete,
  separately approved restore plan for the matching DB/upload backup pair and verify its result.
- Upload failure: investigate quota/permissions and readiness without deleting the persistent root.
  Owner workflows use storage compensation for new orphaned files; do not delete existing images
  wholesale or rewrite order/catalog data to conceal a storage failure.
- Logs: configure and verify host retention/rotation and access before launch. Retain structured
  request/startup events without secrets. No external analytics/telemetry is introduced.

## 8. Evidence boundary

Record observed local checks in `verification-matrix.md`; keep missing, skipped, unauthorized and
host-dependent checks explicit. FND-006/AC-FND-004, feature merge readiness and release completion
require their own passing gates. This local preparation cannot mark the FND feature complete.
