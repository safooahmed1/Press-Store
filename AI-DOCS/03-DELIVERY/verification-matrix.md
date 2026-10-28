# Verification Matrix

## 1. Task Verification

| Task ID | Requirement IDs | Acceptance Criteria | Focused Checks | Broader Checks | Manual Evidence | Required for Done |
|---|---|---|---|---|---|---|
| FND-001 | REQ-FND-001/002/003/010/025 | AC-FND-001 | runtime/manifest tests | lint | dev/prod route smoke | yes |
| FND-002 | REQ-FND-012/020/023/027 | AC-FND-002 | migration/transaction tests | DB integration | query/upgrade notes | yes |
| FND-003 | REQ-FND-005/007/011/014/021/022/024/028; REQ-SCOPE-001 | AC-FND-001/002 | HTTP/error/validation tests | lint/integration | response inspection | yes |
| FND-004 | REQ-FND-018/026 | AC-FND-003 | storage/security tests | integration | file path/compensation inspection | yes |
| FND-005 | REQ-FND-019/020/029 | AC-FND-002 | harness/redaction tests | platform suite | representative logs/query plans | yes |
| FND-006 | REQ-FND-013/024/025/029 | AC-FND-004 | config/build/start, secret-bundle and `npm run test:production` (fake DB) | full FND/build still required | actual Hostinger/DB/session/persistence/backup runbook smoke still required | yes |
| UI-001 | REQ-FND-004/008, REQ-UI-001/002/003 | AC-UI-001 | token/style tests | build | frontend-design visual evidence | yes |
| UI-002 | REQ-FND-015, REQ-UI-001 | AC-UI-002 | component/a11y tests | UI suite | keyboard/contrast | yes |
| UI-003 | REQ-FND-016, REQ-UI-004/005 | AC-UI-002 | shell/navigation tests | UI+SET integration | mobile nav/footer | yes |
| UI-004 | REQ-FND-016, REQ-UI-006/007 | AC-UI-003 | layout/a11y tests | build | viewport/zoom matrix | yes |
| AUTH-001 | REQ-AUTH-001/002/010/012 | AC-AUTH-003 | schema/hash/session tests | migration | cookie/config inspection | yes |
| AUTH-002 | REQ-AUTH-003/004/005/011 | AC-AUTH-001 | customer API tests | auth integration | response/cookie flow | yes |
| AUTH-003 | REQ-AUTH-006/007/013, REQ-SCOPE-002 | AC-AUTH-002 | bootstrap/admin API tests | auth integration | no registration/secret check | yes |
| AUTH-004 | REQ-AUTH-003/004/005 | AC-AUTH-001 | UI/form tests | build | mobile/keyboard forms | yes |
| AUTH-005 | REQ-AUTH-008/009/014 | AC-AUTH-002/003 | isolation/CSRF/rate tests | full auth suite | security inspection | yes |
| CAT-001 | REQ-CAT-001/002/003/006/017/018 | AC-CAT-001 | schema/money/variant tests | migration | data invariant review | yes |
| CAT-002 | REQ-CAT-005/009–013/015/019 | AC-CAT-002 | API/filter matrix | catalog integration | pagination/query plan | yes |
| CAT-003 | REQ-CAT-004/016–019 | AC-CAT-001/003 | admin/upload/conflict tests | auth/storage integration | admin response inspection | yes |
| CAT-004 | REQ-CAT-007–015, REQ-SCOPE-006/008/009/016 | AC-CAT-002 | UI/filter/gallery tests | build | responsive/keyboard/no-scope check | yes |
| CAT-005 | REQ-CAT-004/016–018 | AC-CAT-003 | admin UI/form tests | catalog suite | responsive CRUD flow | yes |
| CAT-006 | REQ-CAT-020, REQ-FND-020, REQ-SCOPE-020 | AC-CAT-001/003 | availability/consumer tests | full CAT/build | contract/query review | yes |
| SET-001 | REQ-SET-001/002/003 | AC-SET-001/002 | schema/API/projection tests | auth integration | response/privacy inspection | yes |
| SET-002 | REQ-SET-001/002 | AC-SET-001 | form/conflict tests | build | mobile/keyboard form | yes |
| SET-003 | REQ-SET-003/004 | AC-SET-002 | consumer/privacy tests | UI/ORD contract checks | log/response inspection | yes |
| HOME-001 | REQ-HOME-002–005/007/009 | AC-HOME-002 | schema/API/limit tests | CAT/storage integration | admin invariant review | yes |
| HOME-002 | REQ-FND-009, REQ-HOME-001/002/005/006/008/009 | AC-HOME-001 | public UI/carousel tests | build | section/viewport/a11y evidence | yes |
| HOME-003 | REQ-HOME-003–007/009/010 | AC-HOME-002 | admin UI/form tests | HOME/CAT integration | responsive admin flow | yes |
| HOME-004 | REQ-HOME-010 | AC-HOME-001/002 | full HOME regression | build | order/limit visual review | yes |
| CART-001 | REQ-CART-001/002/003 | AC-CART-001 | schema/API/isolation tests | AUTH/CAT integration | persistence flow | yes |
| CART-002 | REQ-CART-003/004/005 | AC-CART-002 | price/availability/concurrency tests | CAT contract suite | stale-item review | yes |
| CART-003 | REQ-CART-001/003/004 | AC-CART-001/002 | UI/quantity/state tests | build | responsive/keyboard cart | yes |
| CART-004 | REQ-CART-002/004 | AC-CART-001/002 | full persistence/isolation tests | CART feature suite | logout/return scenario | yes |
| ORD-001 | REQ-PAY-009/010/012, REQ-ORD-002/013/015 | AC-ORD-002 | migration/state/snapshot tests | DB integration | lifecycle review | yes |
| ORD-002 | REQ-PAY-001/003–008/011, REQ-SCOPE-010/013 | AC-ORD-001 | quote/payment matrix | CAT/CART/SET integration | copy/data inspection | yes |
| ORD-003 | REQ-PAY-001/010/011, REQ-ORD-013/014 | AC-ORD-001 | transaction/idempotency/race tests | order integration | duplicate-response recovery | yes |
| ORD-004 | REQ-PAY-001–008 | AC-ORD-001 | checkout UI/a11y tests | E2E/build | payment/copy/viewport flow | yes |
| ORD-005 | REQ-ORD-001/002/003/005, REQ-SCOPE-017 | AC-ORD-003 | API isolation/UI tests | order integration | active/cancelled visibility | yes |
| ORD-006 | REQ-PAY-009/010, REQ-ORD-007/008/009/011/012/015 | AC-ORD-002/004 | admin action/state/link tests | auth/order integration | manual verification flow | yes |
| ORD-007 | REQ-ORD-007–012 | AC-ORD-004 | admin UI/action tests | build | daily mobile/desktop flow | yes |
| ORD-008 | REQ-PAY-012, REQ-ORD-004/005/006 | AC-ORD-005 | clock/job/race tests | full ORD E2E/build | rerun/log/visibility review | yes |
| CUS-001 | REQ-CUS-001/002 | AC-CUS-001 | API/projection/auth tests | AUTH/ORD integration | query count/plan | yes |
| CUS-002 | REQ-CUS-001/002/003 | AC-CUS-001/002 | UI/pagination tests | build | responsive list/detail | yes |
| CUS-003 | REQ-CUS-003, REQ-SCOPE-007 | AC-CUS-002 | privacy/no-write/scope tests | full CUS suite | source/response inspection | yes |
| ADM-001 | REQ-ADM-001/004 | AC-ADM-001 | route/nav/auth tests | admin integration | drawer/keyboard/viewport | yes |
| ADM-002 | REQ-ADM-002/003, REQ-SCOPE-011/021 | AC-ADM-002 | projection/UI/scope tests | owner-contract integration | no-chart/revenue inspection | yes |
| ADM-003 | REQ-ADM-004 | AC-ADM-001/002 | admin E2E | lint/build/full admin | complete navigation matrix | yes |

## 2. Observed UI-001 Evidence — 2026-10-28

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused UI tests | `npm run test -- ui` using Node 24; the existing child-process regression helper required authorized elevated execution because sandbox `spawnSync npm` returned EPERM | 23 passed, 0 failed; includes five UI token/style tests and the foundation selection regressions |
| Foundation regression | `npm run test -- foundation` using Node 24 with the same elevated execution boundary | 93 passed, 0 failed |
| Lint | `npm run lint` | Exit 0 |
| Build | `npm run build` | Exit 0; Vite 8.3.5 emitted 9.00 kB CSS, 34.92 kB Archivo WOFF2, and 165.96 kB Noto Sans Arabic WOFF2 before gzip |
| Visual QA | Chrome headless against a temporary UI specimen importing `/src/styles/index.css` at 390×844, 768×1024, and 1440×900; English-first copy plus long Arabic RTL sample | All three viewports rendered without horizontal overflow; screenshots saved under `AI-DOCS/02-FEATURES/design-system-app-shell/evidence/` |
| Whitespace | `git diff --check` | Pass |
| Documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Required final check; run again after all documentation edits before commit |

UI-001 is task-complete at 1/4. AC-UI-001 remains a shared feature criterion until UI-002 primitives render representative consumers. No push, merge, deployment, or UI-002 implementation was performed.

## 3. Feature Verification

| Feature | Full Suite | Integration Scenarios | Build Required | Merge-Ready Evidence |
|---|---|---|---|---|
| FND | platform/migration/storage/error suite | one-process runtime and failure recovery | yes | AC-FND-001–004 plus runbook |
| UI | component/a11y/responsive suite | representative feature consumers | yes | AC-UI-001–003 plus visual matrix |
| AUTH | auth/security/isolation suite | CART/ORD/admin guards | yes | AC-AUTH-001–003 |
| CAT | catalog/filter/admin/upload suite | HOME/CART/ORD contracts | yes | AC-CAT-001–003 |
| SET | settings/privacy suite | footer/checkout/WhatsApp projections | yes | AC-SET-001–002 |
| HOME | public/admin/limit suite | CAT navigation/flags and UI shell | yes | AC-HOME-001–002 |
| CART | persistence/readiness/isolation suite | CAT changes and ORD handoff | yes | AC-CART-001–002 |
| ORD | order/payment/state/job/E2E suite | all eight scenarios in integration plan | yes | AC-ORD-001–005 |
| CUS | projection/privacy/query suite | AUTH/ORD read contracts | yes | AC-CUS-001–002 |
| ADM | route/metric/admin E2E suite | all admin owner routes/contracts | yes | AC-ADM-001–002 |

## 4. Project and Release Verification

Run clean install, lint, all unit/component/integration/E2E tests, migrations on empty and prior schema, production build/start, health/SPA/API probes, responsive/accessibility/security smoke matrices, upload/session persistence checks, backup/rollback review, and the documentation validator. Confirm the source tree contains no accidental generated scaffold from planning work.

## 5. Unavailable Checks and Required Blockers

No check is assumed available until its FND task creates the command. A task requiring a missing command remains `blocked` or `in-progress`; it cannot be marked done. Hostinger deployment smoke and production backups require credentials/environment and explicit user authorization. A-001 through A-007 must be confirmed or explicitly accepted before the task that depends on each.

## 5. Observed FND-001 Development Evidence — 2026-10-20

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused unit | `npm run test -- foundation` | 4 tests passed, 0 failed; rerun outside process sandbox for complete test output |
| Focused HTTP integration | `npm run test:integration -- foundation` | 8 tests passed, 0 failed; loopback access required outside sandbox |
| Lint | `npm run lint` | Exit 0 |
| Client build | `npm run build` | Exit 0; 17 modules; generated HTML and JS in ignored `dist/`; server stays source JavaScript |
| Runtime smoke | `node /tmp/press-fnd-smoke.mjs`; reproduction procedure in FND handoff | Dev Vite entry/discovery/API proxy and empty React render pass; actual production entry serves build/assets/SPA/health; API, missing assets and hidden paths excluded; SIGTERM shutdown exit 0 |
| Typecheck | No typecheck script exists in approved JavaScript base | Not run; no TypeScript added |
| Supplemental audit | `npm audit --json` | Exit 1; one moderate pre-existing Vite advisory GHSA-698v-4r3x-3vcv |
| Documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2: script absent; mandatory BLOCKER; command unchanged |

Evidence covers FND-001 runtime development only. Database integration, complete HTTP/security/configuration infrastructure, storage, observability, feature-wide acceptance, and deployment verification remain with later tasks. A-008 records the initial manifest filename/export convention. No acceptance checkbox or task completion is inferred from these passing checks.

## 6. Observed FND-001 Backend Fix Evidence — 2026-10-21

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Unit | `npm run test -- foundation` | 22/22, 3 suites, no skips; 18 new server manifest tests plus 4 existing tests; elevated rerun for individual results |
| HTTP integration | `npm run test:integration -- foundation` | 10/10, no skips; includes invalid ID composition and encoded API/hidden/malformed/single-decoding regressions; temporary fixture teardown hooks |
| Lint/build | `npm run lint`; `npm run build` | Both exit 0; 17 Vite modules; no server compilation step |
| Production smoke | `node /tmp/press-fnd-backend-fix-smoke.mjs` | 17 actual production entry probes pass; graceful SIGTERM exit 0; initial sandbox EPERM followed by authorized elevated pass |
| Whitespace/environment | `git diff --check`; untracked server source whitespace inspection; `git check-ignore server/.env`; `git ls-files -- server/.env`; `git diff --cached --name-only` | Pass; ignored and untracked environment file; empty index; no environment contents accessed |
| Typecheck | No script | Unavailable; not run |
| Documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2: script absent; still mandatory blocker; command unchanged |

This supersedes only runtime-fix verification counts, not prior historical evidence or feature completion status. FND-001 remains blocked, no completion commit, no frontend fixes, no later-task work. Full details and raw request reproduction guidance: FND development handoff addendum.

## 7. Observed FND-001 Backend Review Round 2 Evidence — 2026-10-21

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Backend unit | `node --test --test-isolation=none server/src/app/foundation-manifests.test.js server/src/config/foundation.test.js` | 20/20, 2 suites, no skips |
| Backend integration | `npm run test:integration -- foundation` | Before fix: 16 target/method subtests returned 200; 18 failures including parents. After fix: 28/28 including 16 nested subtests; no skips |
| Production routing | `node /tmp/press-fnd-round2-smoke.mjs` | 36 assertions passed, all four confirmed targets GET/HEAD, valid API/SPA/assets, hidden/malformed controls, clean shutdown; authorized elevated rerun after sandbox EPERM |
| Lint/build | `npm run lint`; `npm run build` | Both exit 0 |
| Whitespace/preservation | `git diff --check`; source whitespace inspection; baseline hash and environment metadata comparisons; Git ignore/tracking/index checks | Pass; unrelated work preserved; ignored/untracked environment unchanged; index empty; no environment contents accessed |
| Documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Unavailable, exit 2; script absent; command unchanged; mandatory blocker persists |
| Typecheck | No script | Not run |

This evidence addresses only the repeated-leading-separator routing defect. FND-001 remains blocked/uncommitted and 0/6 complete. See development handoff Round 2 addendum for request targets, policy, and reproduction.

## 8. FND-002 Approved Verification Obligations — 2026-10-23

FND-DEC-002 approves backend early-start decisions only; the current instruction is documentation only. FND-001 remains `blocked`, FND-002 remains `not-started`, and completion stays 0/6. The checks below are future obligations, not passing evidence. AC-FND-002 is shared with later owner tasks; this exception does not authorize those tasks or mark the full criterion passed.

| Check | Required Future Procedure | Current Evidence/Status |
|---|---|---|
| Driver/hosting compatibility | Verify exact `mysql2` version against Node and hosting MySQL engine/version, TLS requirements, connection limits, migration privileges, named locks, and InnoDB support | Open; no database connection or hosting verification performed; no values assumed |
| Configuration/pool lifecycle | Test invalid settings, bounded pool/time options, acquisition failure, release, cleanup, and test-database isolation | Not run; use explicitly designated disposable DB/test credentials; never load existing environment files |
| Queries/transactions | Verify parameterized values, commit/rollback, failure cleanup, and safe credential-free errors | Not run; no business schema authorized |
| Migration execution | Empty/upgrade DB tests, deterministic ordering, checksum drift, matching-record skip, and concurrent lock ownership | Not run; ordering must be documented/tested before acceptance |
| Migration interruption/recovery | Verify persistent marker survives failure/interruption, blocks automatic retries, and success finalization is atomic; test recovery only on disposable fixtures | Not run; actual recovery requires explicit inspection, documented evidence, and separate user approval; do not assume DDL rollback |
| Runtime integration | Test initial DB failure before listening, injected health readiness, runtime failure/recovery, and HTTP/pool shutdown cleanup | Not run; only exact paths in FND contracts §2 approved; startup must not run migrations |
| Regression/static checks | Existing `npm run test -- foundation`, `npm run test:integration -- foundation`, `npm run lint`, and `npm run build` during authorized implementation | Not run for this documentation-only change; historical evidence above is not a new run |
| Mandatory documentation validation | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Attempted for this documentation change: exit 2, script absent; did not run/pass; mandatory completion blocker unchanged |

Manual consistency/diff review does not replace the mandatory validator. No completion claim or completion commit is authorized. FND-003 HTTP/validation, FND-005 shared observability/performance, authentication, frontend, and feature-specific scenarios remain outside this exception.

## 9. Observed FND-002 Fix Round 1 Evidence — 2026-10-23

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused transaction/cleanup | `node --test --test-isolation=none server/src/platform/db/foundation-database.test.js server/src/platform/db/testing/disposable-mysql.test.js` | 16 passed, 0 failed, 2 suites; terminal deadlock-shaped failure, caught failure, queued cancellation, nested/concurrent context, and cleanup failure paths |
| Foundation unit regression | `npm run test -- foundation`; detailed rerun with `node --test --test-isolation=none` and the seven unit files | Exit 0; detailed rerun 43 passed, 0 failed, 7 suites, no skips |
| Real DB + HTTP integration | `env FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- foundation` | 43 passed, 0 failed, 2 suites, no skips; isolated MySQL 8.4.11; nested writes absent after outer rollback; caught transaction failure remains terminal |
| Disposable cleanup inspection | Post-run `/tmp/press-fnd002-mysql-*` and owned-process inspection | No directory or matching MySQL process remained after passing unrestricted run |
| Lint/build/whitespace | `npm run lint`; `npm run build`; `git diff --check` | Exit 0; Vite built 17 modules; whitespace clean |
| Environment/index protection | `git check-ignore server/.env`; `git ls-files -- server/.env`; `git diff --cached --name-only` | Environment file ignored and untracked; index empty; contents never accessed or loaded |
| Documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2; prescribed script absent; validation did not run or pass; command unchanged |

The first sandboxed integration attempt was interrupted after loopback denial and left one private test directory; after confirming no associated process, that exact directory was removed. This is failure-path evidence, not a passing run. The unrestricted rerun above is the passing integration evidence and cleaned up completely. FND-002 remains `in-progress` pending independent re-review and mandatory documentation validation; no completion or commit.

## 10. FND-002 Independent Review and User-Observed Host Verification — 2026-10-23

Evidence provenance is explicit below. Earlier records remain historical evidence. This entry records results already reported in this chat; no application tests, build, database connection, migration, or cleanup were executed during this documentation update.

| Check | Exact command/procedure | Observer and observed result |
|---|---|---|
| Host disposable MySQL + HTTP integration | From project root: `env TMPDIR=/tmp FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- foundation` | User executed on the Ubuntu host and reported MySQL 8.4.11; 43 passed, 0 failed, 0 skipped, 2 integration suites, exit 0. Codex did not execute or directly observe this host run. |
| Host cleanup | User independently checked host processes, temporary directories, and integration-test workers after the run; exact inspection commands/output were not supplied | User reported system MySQL still running as PID 1661; no disposable MySQL processes, `/tmp/press-fnd002-mysql-*` directories, or integration-test Node workers remained. These are user-observed results, not a fresh Codex host inspection. |
| Independent unit regressions | `node --test --test-isolation=none server/src/app/foundation-manifests.test.js server/src/config/database-config.test.js server/src/config/foundation.test.js server/src/platform/db/foundation-database.test.js server/src/platform/db/foundation-migrations.test.js server/src/platform/db/testing/disposable-mysql.test.js src/app/foundation.test.js` | Previously executed directly by Codex in this review chat: 49 passed, 0 failed, 0 skipped, 7 suites. Includes terminal transaction failure, queued cancellation, nested rejection, concurrent top-level transactions, and mocked cleanup/deadline regressions. Not rerun for this documentation update. |
| Independent lint | `npm run lint` | Previously executed directly by Codex: exit 0. Not rerun for this documentation update. |
| Independent production build | `node --input-type=module -e 'import { build } from "vite"; await build({ build: { write: false } });'` | Previously executed directly by Codex: exit 0, 17 modules; production build in memory with artifact writing disabled. This was not an execution of `npm run build`. Not rerun for this documentation update. |
| Independent code review | FND-002 independent re-review Round 3 and mocked failure-path reproductions | Codex verdict PASS WITH WARNINGS; confirmed findings resolved. Live execution remained unavailable to Codex because loopback binding failed with EPERM. The host results above have separate provenance. |
| Mandatory documentation validation | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Executed directly by Codex for this documentation update: exit 2, prescribed script absent. Validation did not run or pass; no replacement or bypass. |

The user's initial report transcribed the host command as `env TMPDIR=/tmp FND_DISPOSABLE_MYSQL_TESTS=1 npm run test -- foundation`. Codex inspected `package.json` and `test.config.js`, identified that this selects unit files, and requested clarification. The user explicitly confirmed the successful run used `test:integration`; the confirmed command is recorded above. The opt-in variable alone does not make the unit command run integration tests.

Coverage boundary: the real-MySQL suite checks transaction rollback/caught failure, nested rejection, migration locking, checksums, interruption markers, and recovery using disposable fixtures. An actual MySQL deadlock is not generated; deadlock-shaped failure is covered by the unit regression. Local MySQL 8.4.11 success does not establish Hostinger engine/version, TLS requirements, connection limits, migration privileges, named-lock/InnoDB support, or deployment compatibility.

FND-002 remains `in-progress`, uncommitted, and formally incomplete. Mandatory documentation validation and the documented hosting/acceptance gates remain unresolved; shared AC-FND-002 and all feature acceptance checkboxes remain unchecked. FND-001 remains `blocked`, completion remains 0/6, and FND-DEC-002 authorizes no FND-003 work.

## 11. Backend Git Handoff Checkpoint — 2026-10-23

User authorization permits a checkpoint and non-force push for frontend handoff only. Section 10 remains the canonical existing verification evidence: 49 prior unit passes (the recorded seven-file suite includes the existing client manifest tests), user-host MySQL 8.4.11 integration 43/43 and cleanup pass, prior independent lint and in-memory production-build pass. No test/build/database/cleanup check is rerun during this Git handoff. Safe Git whitespace, staged-scope and sensitive-file checks are performed separately before commit.

The exact mandatory command remains `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .`; its script is still absent and validation did not run or pass. No substitute, bypass, or waiver is introduced. This backend checkpoint is not formal FND-001/FND-002 acceptance: statuses remain `blocked` and `in-progress`, respectively, completed 0/6, with acceptance checkboxes and hosting/other blockers unchanged. No FND-003 implementation is authorized.

## 12. Observed FND-001 Client Foundation Evidence — 2026-10-26

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Foundation unit regression | `npm run test -- foundation` | 8 passed, 0 failed, 8 test files; includes FeatureActionRegistry invalid/duplicate registration, cleanup, unavailable, pending, success, and failure paths. |
| Foundation integration | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- foundation` with Oracle MySQL 8.4.11 `bin` on `PATH` | 43 passed, 0 failed, 2 suites; includes the real disposable database and HTTP runtime checks. Executed outside sandbox because it binds loopback. |
| Lint/build/whitespace | `npm run lint`; `npm run build`; `git diff --check` | All passed; Vite built 21 modules. |
| Mandatory documentation validation | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Passed. This supersedes the validator availability blocker for current completion work but does not rewrite prior historical failures. |
| Production smoke | Build, start `server/src/server.js` in production with synthetic configuration and an isolated MySQL 8.4.11 fixture; probe health, SPA fallback, referenced asset and API 404; send SIGTERM | Passed: MySQL 8.4.11; health 200; SPA 200; asset 200; canonical JSON API 404; graceful exit 0; fixture shutdown/cleanup passed. Temporary smoke harness remained outside the repository. |

FND-001 passed its required completion gate and AC-FND-001 is checked. The completion commit uses the
planned subject `feat(FND-001): establish modular runtime seams`; its hash is reported after Git creates
it rather than recorded through a circular documentation commit. FND-003 and UI-owned implementation
remain outside this completed task.

## 13. Observed FND-003 HTTP Boundary Evidence — 2026-10-26

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Foundation unit | `npm run test -- foundation` | 11 passed, 0 failed; includes server HTTP, Axios normalization, React Query retry, runtime, database and APP-FND-001 regressions. |
| HTTP integration | `npm run test:integration -- foundation` | 32 passed, 0 failed, 3 suites; disposable MySQL suite explicitly skipped without opt-in. HTTP coverage includes canonical 200/400/404/409/413/422/500 responses. |
| Lint/build | `npm run lint`; `npm run build` | Both passed; Vite 8.3.5 built 68 modules, output JavaScript 248.14 kB (77.08 kB gzip). |
| Dependency audit | `npm audit --json` | Initial three high advisories remediated by compatible body-parser 2.4.0, zod 4.6.7 and Vite 8.3.5 updates; final result 0 vulnerabilities. |
| Response/scope inspection | Integration assertions inspect content types, field errors, request-ID header/body correlation, client-supplied ID rejection, unknown-error sanitization and `/api/v1/shipping` 404. | Passed; no private error detail or shipping implementation observed. |
| Documentation/whitespace | Prescribed documentation validator; `git diff --check` | Passed. |

FND-003 is complete without checking shared AC-FND-002: database completion/acceptance and later
observability evidence remain owned by FND-002/FND-005. The completion commit uses the planned subject
`feat(FND-003): add REST validation and errors`; report its hash after creation rather than adding a
circular documentation-only commit.

## 14. Observed FND-004 Storage Evidence — 2026-10-26

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused storage | `node --test --test-isolation=none server/src/platform/storage/image-storage.test.js server/src/platform/storage/image-storage.integration.test.js` | 11 passed, 0 failed across validation and real-filesystem suites. |
| Security fixtures | JPEG/PNG/WebP fixtures plus malformed bytes, MIME/extension spoofing, GIF, animated WebP, oversized input, strict dimension/pixel limits, traversal paths and unsafe generated IDs | Accepted formats were normalized; every malicious/over-limit case rejected before persistence; temporary roots cleaned. |
| Filesystem/compensation inspection | Persist two images, inspect opaque paths/0600 mode, delete one, run failed and successful owning operations | Exclusive generated paths remained inside the root; targeted delete preserved the sibling; failed owning work removed its new file; successful work retained it. |
| Foundation unit | `npm run test -- foundation` | 12 passed, 0 failed; includes all prior runtime/DB/HTTP/client checks and the storage validation suite. |
| Foundation integration | `npm run test:integration -- foundation` outside the loopback sandbox | 36 passed, 0 failed across four suites; disposable MySQL explicitly skipped without opt-in. Initial sandbox attempt failed only because HTTP listeners received EPERM; storage integration passed in both runs. |
| Lint/build/whitespace | `npm run lint`; `npm run build`; `git diff --check` | Passed; Vite 8.3.5 built 68 modules. |
| Dependency audit | `npm audit --json` | `sharp` 0.35.5 and the complete graph report zero vulnerabilities. The initial sandboxed audit could not resolve the registry; the authorized network rerun passed. |
| Documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Passed. |

FND-004 and AC-FND-003 are complete. The completion commit uses the planned subject
`feat(FND-004): add local image storage adapter`; report its hash after creation rather than adding a
circular documentation-only commit. FND-002 remains in progress, so FND-005 is not ready.

## 15. Observed FND-005 Quality Evidence — 2026-10-27

FND-DEC-004 supersedes only the development dependency restriction above: the user explicitly
approved FND-005 against locally tested FND-002 persistence. FND-002 remains formally incomplete,
shared AC-FND-002 stays unchecked, and FND-006 is not authorized.

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused unit | `node --test --test-isolation=none server/src/platform/observability/foundation-observability.test.js tests/helpers/foundation-quality.test.js` | 8 passed, 0 failed, 2 suites. Covers sensitive-field omission, malformed metadata, sync/async sink failure, exactly-once disconnect logging, temporary cleanup, query counts and actual client loading behavior. |
| Focused HTTP | `node --test --test-isolation=none server/src/platform/observability/foundation-observability.integration.test.js` outside sandbox | Final run: 5 passed, 0 failed. Actual correlation/template/500/404/503/recovery inspection, real mid-response disconnect, startup outcomes, sync/async logger failure isolation. |
| Foundation unit | `npm run test -- foundation` | 14 test-file checks passed, exit 0. Node default file isolation reports files here; the focused row reports individual new unit cases. |
| Full foundation integration | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- foundation > /tmp/press-fnd005-integration.log 2>&1` outside sandbox | Final run: 54 passed, 0 failed, 0 skipped, 6 suites, exit 0. Uses isolated MySQL 8.4.11-0ubuntu0.26.04.1. Earlier intermediate run was 52/52 before adding real disconnect/injected logger cases. |
| Representative logs | Inspect captured JSON in focused HTTP tests and real-process foundation output | Timestamp/level/environment, generated request ID, declared `/api/v1/fixture/items/:id`, status/duration and canonical error codes observed. Request values, inbound IDs, cookies, authorization, private exception/SQL strings absent; abort emits 499/REQUEST_ABORTED once. Error-unwound/nested routes may use safe `<unresolved>` rather than a resolved URL. |
| Representative query plans | Disposable-only 100-row quality fixture, two measured parameterized read calls, EXPLAIN of lookup and ten-row page | `const/PRIMARY` lookup and `range/PRIMARY` page; ten rows returned, no filesort; no per-row extra queries. Includes pool/timeout/transaction/migration regressions from existing DB suite. No business-query, hosting-performance or production-data claim. |
| Client performance sanity | Existing React Query client and route manifest through shared harness | Two simultaneous reads execute one query function; explicitly fresh cached read does not refetch; transient failure executes twice, 422 and mutation execute once; manifest collection invokes no page loader. No UI rendering benchmark claimed. |
| Dependencies | `npm ci` | Installed the existing lockfile graph; 238 packages added, 239 audited, zero vulnerabilities reported. Initial focused client test/build failed because local dependencies were stale/missing; both passed after installation. No dependency manifest/lockfile changes. |
| Lint/build | `npm run lint`; `npm run build` | Passed; Vite 8.3.5, 68 modules, JS 248.14 kB / 77.08 kB gzip. |
| Typecheck | Inspect package scripts | No typecheck script in approved JavaScript base; not run. |
| Mandatory documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | **BLOCKED / NOT RUN:** command invocation exited 2 because the script is absent; validation itself did not execute. User confirmed no verified alternative is available and prohibited inventing a path or bypassing validation. Historical passing runs remain unchanged; no substitute or waiver. |

### Failed sandbox run and unresolved cleanup

The initial focused HTTP run failed with `listen EPERM`; the unrestricted rerun passed. The initial
opt-in quality MySQL run inside the sandbox failed after initialization timeout (~32 seconds) and
the Node session did not exit. It was interrupted (exit 130). This is not passing test evidence.
Host process inspection found only the system MySQL PID 1721 plus the test initializer PID 10626:
`mysqld --no-defaults --initialize-insecure --datadir=/tmp/press-fnd002-mysql-pXE2jY/data ...`.
The private root `/tmp/press-fnd002-mysql-pXE2jY` remained. Non-sandbox `kill -TERM 10626` and
`kill -KILL 10626` both failed with Permission denied; `sudo -n kill -KILL 10626` failed because
interactive authentication is required. Do not remove the directory while the initializer is active.
Host-owner intervention must re-check that exact PID/command, stop only this test initializer, then
remove its exact unused private root. No system MySQL signal, application database, environment-file
access, or production operation was performed.

The subsequent unrestricted suites passed and their fixtures returned through normal teardown;
this does not resolve or conceal the earlier sandbox initializer. FND-005 remains `in-progress`
pending the canonical validator and verified cleanup. Planned completion subject is
`feat(FND-005): add safe observability and quality harness`; no completion commit is created.

Final second pass: re-read FND-005/AC-FND-002 and inspected the full tracked diff plus all new
source/tests/helper documentation for scope, secrets, error handling and cleanup. Final unit-file
checks and lint passed again; `git diff --check` passed and index stayed empty. The final prescribed
validator attempt still exited 2. Final unrestricted `ps -C mysqld -o pid,ppid,args` showed only the
unchanged system PID 1721 and the earlier sandbox initializer PID 10626; neither successful suite
left an additional MySQL process. No production smoke/release execution or typecheck is claimed.

The user's subsequent instruction confirms the validator is unavailable and has no verified alternate
path. Record it as BLOCKED / NOT RUN; do not invent a path, bypass validation or mark FND-005 done.
Implementation work has stopped. The user also requires explicit approval for any commit or push,
superseding the normal local completion-commit preauthorization for this task. No commit or push
has occurred; the planned subject above is a reference only, not current authorization.

### FND-005 closeout retry — 2026-10-27

- `git status --short` confirmed the existing unfinished FND-005 changes; branch remains
  `feature/FND-application-foundation`. Existing work was preserved.
- The unchanged prescribed validator invocation again exited 2: script absent. Validation remains
  **BLOCKED / NOT RUN**; no replacement path, new validator or waiver was introduced.
- Unrestricted `ps -C mysqld -o pid,ppid,args` again identified system MySQL PID 1721 and the exact
  test initializer PID 10626 using `/tmp/press-fnd002-mysql-pXE2jY/data`. A directory-only inspection
  confirmed that private root remains. No signals were repeated after the previously documented
  permission denials; no active datadir was deleted.
- FND-005 is `blocked`. Previously passing application checks were not rerun because no code changed
  and those checks cannot resolve the two blockers. No new pass, completion, commit or push claimed.

## 16. FND-002 Closeout Preflight — 2026-10-27

- `git status --short`, current branch and recent history: clean worktree on
  `feature/FND-application-foundation`, HEAD at FND-005 checkpoint `6b8675e`.
- Read FND-002 blockers, DB implementation notes, configuration, connection options and existing
  verification records. No application test rerun is claimed; existing local MySQL 8.4.11 results
  do not verify a hosting provider. No Hostinger account/database connector is available in-session.
- User explicitly answered that hosting is not ready. Hosting engine/version, TLS, connection limits,
  migration-account privileges and named-lock/InnoDB compatibility are **BLOCKED / NOT RUN**.
  No application environment file was read and no existing database was contacted or changed.
- Public documentation research is contextual only: Hostinger's [database-engine article](https://www.hostinger.com/support/1583226-which-database-management-system-is-used-at-hostinger/)
  identifies MariaDB for Web/Cloud, while its [Node.js connection guide](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/)
  uses MySQL terminology. These pages do not establish this project's actual plan/engine/version.
  Verify the actual target before accepting compatibility; do not silently replace approved MySQL.
- The unchanged prescribed documentation-validator invocation exited 2 because the script is absent.
  Validation itself is **BLOCKED / NOT RUN**, with no alternate path or bypass.
- FND-002 becomes `blocked`. This is a documentation-only blocker record; no code, dependencies,
  TLS settings, database recovery, migrations, application tests/build, commit, push or later task.

## 17. FND-005 Cleanup Resolution and Checkpoint Review — 2026-10-27

### Cleanup provenance

| Item | Observer/executor | Reported result | Current disposition |
|---|---|---|---|
| Node test PID 10580 and disposable initializer PID 10626 | User executed on host and verified | Both safely terminated; neither process remained running | Cleanup process blocker resolved |
| Associated processes/open files for `/tmp/press-fnd002-mysql-pXE2jY` | User inspected on host | Checked before removing the specific private directory | Safe-cleanup verification reported by user |
| Exact private directory | User removed and verified on host | Final verification confirmed directory no longer exists | Directory blocker resolved |

This is **user-executed and host-verified** evidence supplied in chat, not a fresh Codex process,
open-file or filesystem inspection. Exact host commands/output were not supplied. Historical failure
and permission-denial records remain intact; their cleanup-outstanding status is superseded here.

### Static review and remaining gates

- Reviewed exact checkpoint `6b8675e80b4b2252faa97ff17290d1b9a57c00ec` (25-file preservation
  checkpoint), its source/test/tooling changes and FND-005 task/contracts/acceptance records.
  Reviewed allowlisted metadata, request correlation, resolved-path suppression, exactly-once abort
  handling, sync/async sink failure isolation, startup cleanup wiring, test-helper lifecycle,
  client deduplication/retry bounds and disposable fixture query-count/EXPLAIN assertions.
- No additional blocking code issue identified by this static review. This does not establish new
  runtime/host compatibility or replace required checks. Previous 8 focused unit, 5 focused HTTP,
  14 unit-file and 54 integration passes plus lint/build remain prior evidence, not new runs.
- **FND-005 mandatory-check blocker:** original documentation validator unavailable,
  **BLOCKED / NOT RUN**. No alternative script/path, bypass or inferred pass.
- **Shared foundation acceptance:** AC-FND-002 remains unchecked pending FND-002 acceptance,
  including unavailable-hosting verification. FND-DEC-004 permits FND-005 development only; it does
  not complete FND-002 or shared/full-feature acceptance. No new dependency waiver is inferred.
- **Completion procedure:** `6b8675e` is a checkpoint, not the completion commit. Mandatory gates
  must pass before completion documentation/commit, and explicit user approval remains required.
- Live MySQL tests must not be rerun until explicitly authorized again. No tests were rerun for this
  review. No application code, commit, push or FND-006 changes/actions. Existing uncommitted FND-002
  documentation changes are preserved. Recommended next action: restore the original validator and
  run its exact prescribed command; reconcile the open acceptance gates before completion approval.
- Documentation-only checks: `git diff --check` passed. The prescribed validator command was
  attempted unchanged and exited 2 because the file is absent; validation itself remains
  **BLOCKED / NOT RUN**. No test, MySQL process or database connection was started.

## 18. FND-006 Local Production Preparation — 2026-10-27

FND-DEC-005 records explicit local-development approval while FND-002/FND-005 remain blocked.
Scope is code/runbook preparation, not acceptance or release. The earlier user-executed,
host-verified FND-005 cleanup remains resolved. Existing uncommitted FND-002/FND-005 delivery notes
were preserved. No live MySQL rerun, remote operation, commit or deployment was authorized/performed.

| Check | Exact command/procedure | Observed result and boundary |
|---|---|---|
| Clean dependency installation | `npm ci` | Exit 0; 238 packages added, 239 audited; zero vulnerabilities reported. Existing lockfile/dependency versions retained. This is install evidence in the current working checkout, not a claim of a clean-checkout release. |
| Focused config | `node --test --test-isolation=none server/src/config/foundation-production-config.test.js` | 3 passed, 0 failed. Explicit inputs, canonical writable-root/probe cleanup; missing secret, unsafe origin, relative/absent/file/source/symlinked-source roots rejected without echoing inputs. |
| Local production | `npm run test:production` outside sandbox | 4 passed, 0 failed; builds actual Vite output and uses production startup/HTTP with an explicitly fake DB. One process serves built SPA/asset/API readiness; missing assets/uploads and encoded upload namespace yield safe 404. Valid opaque image GET/HEAD returns original normalized bytes across two local starts; symlink/directory/private files and unsupported methods rejected. |
| Secret-boundary check | Production test launches Vite into a separate temporary output with synthetic SESSION_SECRET/MYSQL_PASSWORD/APP_ORIGIN/UPLOAD_ROOT | Build passed; produced HTML/assets contain neither the synthetic values nor inspected server-only import/config markers. No real credentials/environment file was used. This is a bounded fixture check, not a universal static security proof. |
| Foundation unit regression | `npm run test -- foundation` after clean install | 15 test-file checks passed, exit 0. Default Node isolated-run summaries report files here, not individual cases. Includes the new production config suite. |
| Foundation HTTP/platform regression without live MySQL | `FND_DISPOSABLE_MYSQL_TESTS=0 npm run test:integration -- foundation > /tmp/press-fnd006-no-mysql-integration.log 2>&1` outside sandbox | 45 passed, 0 failed, 7 suites; the disposable MySQL and quality query-plan suites explicitly skipped with their opt-in explanations. The Node summary says skipped 0 because skipped suites have no instantiated tests; this is not evidence that real DB checks ran. No live MySQL tests executed. |
| Lint/build | `npm run lint`; `npm run build` | Exit 0. Vite 8.3.5, 68 modules, JS 248.14 kB / 77.08 kB gzip. Production script also rebuilt successfully. |
| Sandbox limitation | Initial `npm run test:production`, then detailed `node --test --test-isolation=none tests/e2e/foundation-production.integration.test.js` | Initial file-level failure; detailed run showed two HTTP cases blocked by `listen EPERM`, while config-failure/bundle cases passed. Authorized unrestricted rerun passed all four. No MySQL initialization was attempted. |
| Typecheck | Inspect approved root scripts | No typecheck script; not run. No TypeScript/framework/dependency migration. |
| Mandatory documentation validator | Unchanged `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Invocation exits 2, file absent; validation **BLOCKED / NOT RUN**. No fabricated path/script or waiver. |

### Still unverified / not accepted

- FND-002 hosting engine/version, driver/TLS/connection/privilege/InnoDB/named-lock acceptance;
  shared AC-FND-002 and FND-005 mandatory-validator closeout.
- Real DB empty/upgrade migrations and actual production-entry smoke under current production
  configuration. Live MySQL reruns require fresh explicit user authorization; local fake wiring
  cannot substitute for them, and prior live results are not represented as fresh runs.
- Actual hosting selection, native module compatibility, runtime port/proxy behavior, HTTPS,
  quotas, durable upload location and persistence through provider deployment cleanup.
- AUTH secure-cookie/CSRF/origin behavior and actual sessions persisting across restart. FND-006
  only validates session-secret presence/origin shape; it implements no auth/session behavior.
- Real database/upload backup, restore and schema-compatible rollback execution, plus host log
  retention/rotation/access. The [runbook](hostinger-runbook.md) is a procedure, not executed evidence.

FND-006 remains `blocked`, AC-FND-004 unchecked, completed 3/6, feature not merge-ready. Planned
subject `chore(FND-006): add Hostinger production shape` is a reference only; no commit authorized.

Second pass: re-read FND-006/AC-FND-004 and reviewed tracked changes plus new configuration,
upload-serving code, tests and runbook for ownership, secret exposure, path handling and cleanup.
`node --version` reported v24.18.1; `git diff --check` passed. Lockfile, DB/AUTH/client source
unchanged; index empty. The final unchanged validator invocation still exited 2. No new dependency,
live MySQL, real hosting/session smoke, full-feature acceptance or completion claim.
