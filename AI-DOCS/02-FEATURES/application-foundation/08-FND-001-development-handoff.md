# FND-001 Development Handoff — 2026-10-20

## Status and Authorization

FND-001 development is implemented for independent review, but the task remains **blocked** by the missing mandatory documentation validator. Branch: `feature/FND-application-foundation`, created from local `main`. No commit, staging, merge, remote write, deployment, or database command was performed. Completed tasks remain **0/6**. FND-002 and later tasks were not started and are not authorized by this handoff.

The prior implementation plan was unavailable in this chat. The plan was reconstructed from root and AI-DOCS agent rules, project overview/architecture/blueprint/decisions, all seven FND documents, applicable foundation rules, and delivery workstream/branch/dependency/integration/verification records. FND-001 has no task dependencies. A-002 remains relevant only before FND-002.

## Files Created

- `src/app/App.jsx`: discovery/composition with lazy pages and minimal loading/error infrastructure.
- `src/app/RuntimeBoundary.jsx`: safe React render failure boundary.
- `src/app/feature-manifests.js`: validated client registry collection.
- `src/app/foundation.test.js`: focused client manifest tests.
- `server/src/app/create-app.js`: Express composition, runtime health, safe minimal failures, API/static/SPA boundaries.
- `server/src/app/feature-manifests.js`: deterministic discovery and validated router registration.
- `server/src/app/start-server.js`: validated configuration, manifest loading, composition, and listener creation.
- `server/src/app/foundation-runtime.integration.test.js`: real loopback HTTP, discovery, and startup tests using synthetic fixtures/configuration.
- `server/src/config/runtime-config.js`: the only production source environment reader; mode and port validation.
- `server/src/config/foundation.test.js`: runtime configuration tests.
- `server/src/server.js`: process entry point, sanitized startup failure, graceful shutdown.
- `test.config.js`: minimum Node built-in unit/integration runner with optional suite-name filtering.
- This handoff document.

## Files Modified

- `.gitignore`: recursive environment file exclusion and generated coverage/upload exclusion.
- `package.json`, `package-lock.json`: approved Express runtime; Node 24 engine range; minimal dev-server/start/test scripts. One root dependency graph remains.
- `eslint.config.js`: browser/React linting for client source, Node globals for server/config/tests.
- `vite.config.js`: local `/api` proxy to port 3000; environment-file loading disabled for client builds.
- `src/main.jsx`: foundation bootstrap import; old demo/style files remain intact and inactive.
- FND `01-feature-brief.md`, `03-technical-contracts.md`, `04-backlog.md`, `05-change-log.md`: current development status, implementation seam, blocker, evidence, planned commit subject.
- `AI-DOCS/00-PROJECT/assumptions-register.md`: A-008, the noncritical manifest filename/export convention.
- Delivery `branch-plan.md`, `workstreams.md`, `verification-matrix.md`, `build-log.md`: branch/workstream state and exact observed evidence.

Generated `node_modules/` and `dist/` are ignored. Synthetic test directories and the local smoke script are under `/tmp`, outside the deliverable. No files were deleted. No business feature, shared UI, styles/assets, AUTH platform, database, storage, observability, or jobs source paths were modified.

## Implemented Behavior and Scope Boundaries

Client and server discover immediate feature manifests without central feature registration edits. See the canonical FND contract §13 for exact exports, route restrictions, and A-008. Duplicate/invalid manifests fail; server import failures stop startup. No business manifest is installed. The client currently renders an empty application, deliberately leaving pages/design to their owners. The initial client seam supports exact path matching and native document navigation; it is not a complete client routing/navigation framework.

Runtime config validates mode and provider port before listening. Production requires a port and an existing built index. Health uses the documented envelope and an opaque generated request ID; dependency failures can return safe 503 responses through an injected readiness callback. Current default readiness is process-only because no database is installed. A minimal safe error boundary prevents raw server errors from reaching responses. Full HTTP middleware, request validation, transport, authentication/CSRF, and observability remain future owner tasks.

In production, one Express process serves built Vite assets and HTML deep links. The entire `/api` namespace is handled before SPA fallback. Unknown API paths, missing assets, hidden paths, non-document requests, and unsupported fallback methods do not receive SPA HTML. This verifies the runtime seam, not the FND-006 release package or Hostinger deployment.

No React Query provider, Axios transport, Zustand store, Tailwind/style system, Swiper component, MySQL driver, migration, upload adapter, session behavior, or business action dispatch was introduced. These are outside the selected runtime task or have no current consumer. Existing JavaScript/React/Vite technology remains; Express is the only added dependency. The server executes source JavaScript and does not require a compilation artifact.

## Environment Preservation

Before work, Git reported only untracked `server/`; `server/.env` existed. Its values were never opened, printed, loaded, copied, staged, or modified. Metadata-only checks before and after observed size 77 bytes and mode 664. No claim of a content hash comparison is made because the file was not read. `git check-ignore server/.env` confirms protection; root/nested `.env` variants and `example.env` are also ignored. No environment files are tracked or staged. Runtime tests and smoke processes use synthetic explicit environment values and do not load environment files.

## Verification Evidence

| Check | Observed result |
|---|---|
| `npm install express@5` | Added 208 packages including existing project dependencies; approved Express 5.3.0 recorded in root lockfile. First sandbox attempt failed with registry EAI_AGAIN; authorized elevated rerun succeeded. |
| `npm run test -- foundation` | 4 tests passed, 0 failed, 2 suites, no skips. |
| `npm run test:integration -- foundation` | 8 tests passed, 0 failed, 1 suite, no skips. |
| `npm run lint` | Exit 0. |
| `npm run build` | Exit 0, Vite 8.3.2, 17 modules, HTML 0.38 kB and JavaScript 220.62 kB (69.04 kB gzip). |
| `node /tmp/press-fnd-smoke.mjs` | Exit 0; actual dev/prod entry points, route probes, compiled Vite discovery, empty React server render, and graceful shutdown passed. |
| `git diff --check` | Exit 0 at development review; repeated after documentation updates. |
| Typecheck | Unavailable in approved JavaScript scaffold; not run. |
| `npm audit --json` | Exit 1: one moderate existing Vite development-tool advisory GHSA-698v-4r3x-3vcv, concerning Windows command escaping. No automatic fix run. |
| Mandatory documentation validator | Exit 2, script missing; validation did not run and did not pass. |

Initial sandboxed HTTP tests failed with `listen EPERM`; default sandboxed Node subprocess output did not expose full suite details. Authorized reruns outside those restrictions produced the full passing counts above. No sandbox failure is represented as an application pass. One test was tightened to await child process `close` so stderr is drained before assertions; final test results are recorded after this change.

The final second pass found that a `null` manifest export could be confused with an absent manifest and skipped. Discovery now retains invalid exports for registration to reject. The discovery integration case verifies actual dispatch through a discovered router and rejection of null exports. After this server-only correction, integration remained 8/8 passing, lint and whitespace checks passed. Lockfile review confirmed no existing package version changes or removals; 63 dependency packages were added for Express. The Git index remained empty and `server/.env` remained ignored.

Unit tests cover missing/valid/invalid runtime config and client manifest validation. Integration tests cover health shape/request IDs, readiness rejection/exception, isolated feature router dispatch, sanitized async errors, production SPA/API/static isolation, missing build failure, invalid/duplicate server registration, manifest discovery/import failure, and invalid-config process exit. No database test was required or run for this runtime-only task.

## Reproduce the Runtime Checks

Run from the repository with Node 24 and installed locked dependencies:

```sh
npm run test -- foundation
npm run test:integration -- foundation
npm run lint
npm run build
```

For development, start `npm run dev:server` with default local mode/port, then `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` in another terminal. Probe `/`, `/foundation-smoke`, `/src/main.jsx`, `/src/app/App.jsx`, `/api/v1/health`, and `/api/v1/missing` through port 5173. Expect Vite HTML/module responses, API health JSON 200, and API JSON 404. The React application is intentionally empty with no feature manifests. The observed smoke additionally used Vite SSR to verify empty React output. If the server port is changed, the currently fixed local proxy must be adjusted deliberately.

After stopping development, run `NODE_ENV=production PORT=43127 npm start`. Probe `/`, `/foundation-smoke`, and the built asset URL referenced by returned HTML; expect 200. Probe `/api/v1/health`; expect only `{data:{status:"ready"},meta:{requestId:"..."}}`. Probe `/api`, `/api/v1/missing`, `/api/v2/missing`, `/missing.js`, `/.env`, and `/server/.env`; expect JSON 404 responses. These hidden-path probes target the server's reserved/static routing behavior, not file reads. Send SIGTERM and confirm exit 0. Use only synthetic environment values; do not source `server/.env`. Local listener/process permissions may require execution outside the sandbox.

## Acceptance Assessment

| Criterion | Assessment |
|---|---|
| AC-FND-001: modular runtime boots | FND-001 portions observed: client dev transform/bootstrap, server startup, manifest discovery/dispatch, health, production SPA/static behavior, and invalid mode/port/build rejection. Checkbox remains unchecked: mandatory documentation verification missing; full config/dependency readiness and later HTTP integration remain outside this task. |
| AC-FND-002: persistence/errors safe | Not satisfied as a feature criterion; FND-002/003/005 are not implemented. Minimal runtime safe-error tests are not persistence evidence. |
| AC-FND-003: bounded uploads | Not satisfied; FND-004 not started. |
| AC-FND-004: release/Hostinger shape | Partial local one-process evidence only. Complete database/session/upload config, clean-release/full-suite/Hostinger runbook checks remain future work. Not marked passed. |

## Documentation Validator Blocker

The required command remains exactly:

```sh
python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .
```

Observed: `python3: can't open file '/home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py': [Errno 2] No such file or directory`, exit 2. No replacement validator was fabricated, no requirement was waived, and the command in `AI-DOCS/AGENTS.md` was not changed. Documentation is updated but **unvalidated**. Restore the prescribed tooling, or explicitly authorize a different command, then rerun validation. This does not authorize a commit or another task.

## Independent Review and Remaining Risks

Ready for independent code review as an uncommitted development change; not ready for task completion, merge, release, or deployment. Review all tracked diffs plus new files from `git status --short --untracked-files=all`; ordinary `git diff` alone omits new files. Preserve the ignored user environment file and avoid force-adding environment paths.

Review the initial manifest convention A-008 before the FND-003 freeze. Exact-only client routing and native navigation are deliberate current limitations; parameterized feature routes/navigation need the owner integration work before use. Process-only health and mode/port validation must not be mistaken for database readiness or complete production configuration. The Vite advisory remains visible for a separately scoped remediation decision. No real browser interaction/a11y/visual QA or Hostinger deployment was performed; no designed UI is present. Original demo files remain inactive on disk per the no-deletion restriction.

Planned future subject from branch plan: `feat(FND-001): establish modular runtime seams`. Commit reference: **None; explicitly prohibited for this development session**. Stop after this handoff and await user instructions.

## 2026-10-21 — Backend Independent Review Fix Addendum

The confirmed findings supplied in the backend fix request were the review input; no separate independent review artifact was found in the repository. Scope was FIX-001 and FIX-002 only, on the expected/current `feature/FND-application-foundation` branch. Existing uncommitted FND-001 work was preserved. No task dependencies, shared contract changes, new dependencies, frontend edits, or later-task implementation were needed.

Files changed for this fix: `server/src/app/feature-manifests.js`, `server/src/app/create-app.js`, new `server/src/app/foundation-manifests.test.js`, and `server/src/app/foundation-runtime.integration.test.js`; documentation updates are this handoff, FND backlog/change log, delivery build log, and verification matrix.

FIX-001 checks `typeof feature.id === 'string'` before the existing regex. Eighteen new unit cases cover absent/undefined/null/numeric/boolean/array/object/coercible/boxed IDs, invalid string formats, an empty registry, valid lowercase kebab-case IDs, and no route attachment for an invalid registry. Integration additionally confirms invalid ID types reject app composition; `startServer` still awaits composition before calling `listen`.

FIX-002 decodes `req.path` once for classification before static serving. API namespace matching is case-insensitive and segment-bounded; decoded hidden segments and malformed encoding return safe JSON `NOT_FOUND` 404 responses. The URL is never rewritten or normalized, and static middleware receives the original URL. SPA extension checks use the same decoded pathname. Double-encoded strings are treated literally after one decode. Existing ordinary API dispatch/404 handling remains before static/SPA composition.

Raw HTTP regression requests avoid client-side normalization. Cases include all three confirmed examples, encoded separators/case, nested hidden paths, encoded traversal, encoded missing extensions, malformed percent/UTF-8, GET/HEAD, legitimate encoded/Unicode routes, query strings, `/apiary`, existing encoded assets, and double encoding. A synthetic static API file proves encoded API exclusion also precedes static serving. All integration-created temporary fixture directories have cleanup hooks; listeners are closed.

| Verification | Exact command | Observed result |
|---|---|---|
| Unit | `npm run test -- foundation` | 22 passed, 0 failed, 3 suites, no skips: 18 new server manifest + 2 existing server config + 2 existing client tests. Elevated rerun exposed individual results; sandbox output showed only 3 passing file-level results. |
| HTTP integration | `npm run test:integration -- foundation` | 10 passed, 0 failed, 1 suite, no skips. |
| Lint | `npm run lint` | Exit 0. |
| Build | `npm run build` | Exit 0; Vite 8.3.2, 17 modules; server runs source JavaScript. |
| Production entry smoke | `node /tmp/press-fnd-backend-fix-smoke.mjs` | 17 health/static/SPA/API/path probes passed; SIGTERM exit 0 and no stderr. Initial sandbox attempt failed with loopback `EPERM`; authorized elevated rerun passed. Uses an ephemeral port and synthetic explicit configuration, never loads an environment file. |
| Documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2: prescribed script absent. Documentation validation did not run or pass; no substitute or command change. |
| Typecheck | No repository script | Not run; JavaScript scaffold unchanged. |
| Whitespace | `git diff --check` plus whitespace check for untracked server source | Exit 0. |
| Environment protection | `git check-ignore server/.env`; `git ls-files -- server/.env`; `git diff --cached --name-only` | Ignored; no tracked environment file; index empty. No environment file contents read, loaded, modified, or staged. |

Production smoke can be repeated using the handoff's existing production start procedure and the raw encoded targets above with `curl --path-as-is`; expect JSON 404 for exclusions and HTML 200 for legitimate SPA navigation. The temporary smoke script is a local verification artifact, not a committed deliverable.

No further backend issue identified within FIX-001/FIX-002 after second-pass review. Process-only readiness, partial configuration, and future HTTP/database/storage/deployment work remain the previously documented later-task limitations. Frontend manifest validation findings and frontend Zustand/action-registry/routing work remain with the frontend owner and were not fixed here. Backend fixes are ready for independent backend re-review. FND-001 remains **blocked**, AC checkboxes unchanged, completion **0/6**. No commit, merge, push, deploy, or FND-002 work; await user approval.

## 2026-10-21 — Backend Review Round 2 Addendum

Root cause: after one decode, the API regex required exactly one leading slash. Repeated literal/encoded leading slashes therefore missed the API exclusion and reached SPA handling; repeated slashes could also reach static serving. User-authorized policy is to reject repeated leading separators consistently, rather than normalize them.

Code change is one added condition in `server/src/app/create-app.js`: `pathname.startsWith('//')` joins the existing rejection guard after decoding and before static serving. It returns existing safe JSON `NOT_FOUND` 404. The request URL remains intact, decoding remains exactly once, and malformed encoding handling remains unchanged. No manifest/frontend/dependency changes.

`server/src/app/foundation-runtime.integration.test.js` adds two GET/HEAD groups with eight raw targets each: `/%2fapi/v1/missing`, `//%61pi/v1/missing`, `/%2F%61pi/v1/missing`, `///api/v1/missing`, `/%2f%61PI/v1/missing`, `//api/v1/missing`, `//nested/route`, and `/%2Fasset.js`. Tests assert JSON 404 and safe GET envelopes/request IDs; HEAD has no body. Additional controls assert ordinary/encoded SPA routes, double-encoded literal routes, static/encoded assets, valid API health and unknown API responses, existing hidden-path exclusions, malformed percent encoding, and HEAD semantics. Temporary directory cleanup remains registered.

Before the production change, `npm run test:integration -- foundation` exited 1: 10 existing tests passed; all 16 new target/method subtests returned 200 instead of 404, giving 18 failures including the two parent groups. This demonstrates all four confirmed examples fail for both methods against the previous implementation. After the one-condition fix:

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused backend unit | `node --test --test-isolation=none server/src/app/foundation-manifests.test.js server/src/config/foundation.test.js` | 20 passed, 0 failed, 2 suites, no skips; existing approved Node runner, no test tooling/configuration changes |
| Backend integration | `npm run test:integration -- foundation` | 28 passed, 0 failed, 1 suite, no skips; 12 top-level tests plus 16 nested subtests |
| Lint | `npm run lint` | Exit 0 |
| Build | `npm run build` | Exit 0, 17 modules; server remains source JavaScript |
| Production entry smoke | `node /tmp/press-fnd-round2-smoke.mjs` | 36 routing assertions passed against actual production entry process with synthetic environment, including all four confirmed targets for both methods; SIGTERM exit 0 and empty stderr. Sandbox loopback EPERM required authorized elevated rerun. Prior-session temporary smoke artifact was absent, so a new local smoke script was prepared. |
| Whitespace | `git diff --check`; changed untracked backend source whitespace inspection | Passed |
| Preservation | Baseline hashes of Git-listed non-environment files; metadata-only `server/.env` stat comparison; `git check-ignore server/.env`; `git ls-files -- server/.env`; `git diff --cached --name-only` | Changes confined to two backend files and these five evidence documents; other existing work preserved. Environment metadata unchanged, ignored/untracked; index empty. Environment contents never accessed, loaded, staged, or modified. |
| Mandatory documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Still unavailable, exits 2 because script is absent; validation did not pass, command unchanged |
| Typecheck | No script exists | Not run |

Smoke reproduction: use the existing production-mode startup procedure and raw `curl --path-as-is` requests with GET and HEAD for the four confirmed targets; expect 404 `application/json`, with no HEAD body. Raw HTTP integration tests provide the durable executable regression artifact; `/tmp` smoke scripts are local verification aids only.

Second pass: added guard runs before static and SPA, preserves exactly-once classification and original request URLs, and rejects repeated leading slashes independently of route type. No remaining issue identified within this confirmed defect; prior process-only readiness/configuration and later-task limitations remain unchanged. Ready for independent **Review Round 3**, not task completion. FND-001 stays blocked, completion 0/6, no acceptance checkbox changed. No commit/merge/push/deploy, frontend work, or FND-002 implementation.

## 2026-10-21 — Authorized WIP Checkpoint Addendum

The user reports that the backend passed independent review and explicitly approves preservation of the current FND-001 work, including unfinished client foundation, through one WIP commit and branch-only publication. The exact approved subject is `chore(FND-001): WIP checkpoint of application foundation`. This authorization supersedes prior session-specific no-commit restrictions only for this checkpoint under AGENTS.md §10; it does not authorize a completion commit.

The approved staging scope is the 29 files reviewed in the preservation preflight, including this handoff and checkpoint notes in the FND backlog, delivery branch plan, and build log. No source, dependency, configuration, or other documentation changes are introduced by this preservation operation. Existing staged work is retained; only those four approved documentation files are edited. `server/.env` and all environment files remain excluded, and environment values are not accessed or loaded. Before committing, recheck exact staged filenames, complete staged diff, whitespace, credential indicators, and exclusion of unrelated files.

Live remote preflight found `origin` at `git@github.com:safooahmed1/Press-Store.git`, with both feature branch and `main` at the local base `4bffbb0560a4cdbe35ed55c5ce27e2afca1fb7eb`; the feature upstream is already configured. Push only `feature/FND-application-foundation:refs/heads/feature/FND-application-foundation` to `origin`, without force. Stop on unexpected remote commits, history-overwrite requirements, or security/ownership concerns. No PR, merge, deployment, release, or additional fixes/features are authorized.

FND-001 remains **BLOCKED** (`blocked`), completion **0/6**, acceptance checkboxes unchanged. The prescribed documentation validator is still missing; its unchanged command was attempted for these notes and did not pass. No new unit/integration/build verification is claimed for this documentation-only checkpoint operation; prior evidence remains historical. Frontend limitations and the recorded Vite advisory remain unresolved. Report the resulting commit hash, remote branch URL, final Git status, and blockers in chat; do not create a second commit solely to record this checkpoint's own hash.
