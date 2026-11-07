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
| ORD-005 | REQ-ORD-001/002/003/005, REQ-SCOPE-017 | AC-ORD-003 | API-ORD-002/client contract match | live customer-history integration/build | active/cancelled visibility against real API | yes |
| ORD-006 | REQ-PAY-009/010, REQ-ORD-007/008/009/011/012/015 | AC-ORD-002/004 | admin action/state/link tests | auth/order integration | manual verification flow | yes |
| ORD-007 | REQ-ORD-007–012 | AC-ORD-004 | admin UI/action tests | build | daily mobile/desktop flow | yes |
| ORD-008 | REQ-PAY-012, REQ-ORD-004/005/006 | AC-ORD-005 | live expiry/client projection integration | full ORD E2E/build | rerun/log/visibility review | yes |
| ORD-009 | REQ-ORD-001/002/003/005, REQ-SCOPE-017 | AC-ORD-003 | customer API isolation/pagination tests | order backend suite | response/privacy inspection | yes |
| ORD-010 | REQ-ORD-001/002/003/005, REQ-SCOPE-017 | AC-ORD-003 | customer history component/a11y tests with contract fixtures | client build | responsive/empty/error fixture matrix | yes |
| ORD-011 | REQ-PAY-012, REQ-ORD-004/005/006 | AC-ORD-005 | clock/race/rerun job tests | order backend suite | job log/state inspection | yes |
| CUS-001 | REQ-CUS-001/002 | AC-CUS-001 | API/projection/auth tests | AUTH/ORD integration | query count/plan | yes |
| CUS-002 | REQ-CUS-001/002/003 | AC-CUS-001/002 | UI/pagination tests | build | responsive list/detail | yes |
| CUS-003 | REQ-CUS-003, REQ-SCOPE-007 | AC-CUS-002 | privacy/no-write/scope tests | full CUS suite | source/response inspection | yes |
| ADM-001 | REQ-ADM-001/004 | AC-ADM-001 | route/nav/auth tests | admin integration | drawer/keyboard/viewport | yes |
| ADM-002 | REQ-ADM-002/003, REQ-SCOPE-011/021 | AC-ADM-002 | API-ADM-001/client contract match | live owner-contract integration | no-chart/revenue inspection against real API | yes |
| ADM-003 | REQ-ADM-004 | AC-ADM-001/002 | admin E2E | lint/build/full admin | complete navigation matrix | yes |
| ADM-004 | REQ-ADM-002/003, REQ-SCOPE-011/021 | AC-ADM-002 | projection/auth/scope API tests | owner-contract backend checks | bounded count/list inspection | yes |
| ADM-005 | REQ-ADM-002/003, REQ-SCOPE-011/021 | AC-ADM-002 | dashboard component/a11y tests with fixtures | client build | responsive/loading/error/no-chart matrix | yes |

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

## 7. Observed UI-002 Partial Evidence — 2026-10-28

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused UI tests | `PATH=<Node 24 runtime> npm run test -- ui` with the existing child-process helper under the authorized elevated boundary | 24 passed, 0 failed; includes UI-002 static contract tests and all foundation/UI regressions |
| Lint/build | `PATH=<Node 24 runtime> npm run lint`; `PATH=<Node 24 runtime> npm run build` | Both passed; Vite built 69 modules |
| DOM/component/a11y tooling | Install `@testing-library/react`, `@testing-library/user-event`, `jsdom`, and `axe-core` as dev dependencies using Node 24 | **BLOCKED:** repeated npm registry attempts ended with `ETIMEDOUT` on a transitive package; manifests remained unchanged |
| Completion status | Re-read UI-002 acceptance and completion gate | Remains `in-progress`; no completion commit or done claim |

## 8. Observed UI-002 Completion Evidence — 2026-10-28

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Component interaction/accessibility | `node --test src/shared/ui/ui-002.component.test.js` using Node 24 | 6 passed, 0 failed; Button pending, Field ARIA, Price/Image recovery, Dialog focus return, state recovery, and axe checks |
| Focused UI suite | `PATH=<Node 24 runtime> npm run test -- ui` with the existing child-process helper under the authorized elevated boundary | 30 passed, 0 failed |
| Foundation regression | `PATH=<Node 24 runtime> npm run test -- foundation` | 94 passed, 0 failed |
| Lint/build/audit | Node 24 `npm run lint`; `npm run build`; `npm audit --json` | Passed; zero vulnerabilities; Vite built 69 modules |
| Whitespace/docs | `git diff --check`; required documentation validator | Passed |
| Completion status | UI-002 acceptance/completion gate review | Done; UI feature remains 2/4 and AC-UI-002 remains shared until UI-003 shell behavior is implemented |

## 9. Observed UI-003 Partial Evidence — 2026-10-28

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Customer shell component/a11y | `node --test src/shared/ui/shell/customer/ui-003.component.test.js` using Node 24 | 5 passed, 0 failed; landmarks/skip link, mobile menu focus return, safe optional links, loading contact, axe, and main focus |
| Scope review | Inspect changed paths against UI-003 ownership | Customer shell path and focused tests only; no feature/server/admin/route changes |
| Completion status | Re-read UI-003 acceptance and completion gate | In-progress until full suite and task commit |

## 10. Observed UI-003 Completion Evidence — 2026-10-28

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Customer shell component/a11y | `node --test src/shared/ui/shell/customer/ui-003.component.test.js` using Node 24 | 5 passed, 0 failed |
| Focused UI suite | `PATH=<Node 24 runtime> npm run test -- ui` with the existing child-process helper under the authorized elevated boundary | 35 passed, 0 failed |
| Foundation regression | `PATH=<Node 24 runtime> npm run test -- foundation` | 96 passed, 0 failed |
| Lint/build/audit | Node 24 `npm run lint`; `npm run build`; `npm audit --json` | Passed; zero vulnerabilities; Vite built 69 modules |
| Whitespace/docs | `git diff --check`; required documentation validator | Passed |
| Completion status | UI-003 acceptance/completion gate review | Done; UI feature remains 3/4 and AC-UI-002 remains shared until UI-004 completes the responsive matrix |

## 11. Observed UI-003 Remediation Evidence — 2026-10-28

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Customer breakpoint/focus behavior | `node --test src/shared/ui/shell/customer/ui-003.component.test.js` using Node 24 | 6 passed, 0 failed; includes an open mobile menu transitioning at `md` with focus moved to `#main-content` |
| Focused UI suite | `PATH=<Node 24 runtime> npm run test -- ui` | 40 passed, 0 failed |
| Foundation regression | `PATH=<Node 24 runtime> npm run test -- foundation` | 97 passed, 0 failed |
| Lint/build | Node 24 `npm run lint`; `npm run build` | Passed; Vite built 69 modules |
| Visual QA | Local Vite specimen and browser inspection at 390×844, 768×1024, 1440×900, plus CSS 200% zoom with English and long Arabic copy | Menu opened/closed with Escape, no observed horizontal overflow, screenshots saved under `AI-DOCS/02-FEATURES/design-system-app-shell/evidence/ui-003-remediation-*` |
| Completion status | Re-read UI-003 remediation scope and acceptance | Corrective UI-003 work is ready for its local commit; UI-004 remediation is not included |

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
### DOCS-BEFE-001 — Delivery-lane documentation refactor

Required evidence: documentation validator passes; every planned task appears in workstreams and branch plan; AUTH and later tasks map to exactly one BE, FE, or INT workstream; parallel BE/FE allowed paths are disjoint; each feature has an INT gate; API-delayed FE behavior remains fixture-only and cannot make a feature merge-ready; `git diff --check` passes; no application source or dependency file changes.

## 4. Unavailable Checks and Required Blockers

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

## 19. Observed FND-001 React Router Amendment Evidence — 2026-10-30

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Manifest and RouterView unit checks | `npm run test -- foundation` | 94 passed, 0 failed across 16 suites. Covers dynamic route validation, ambiguous signature rejection, static and dynamic React Router rendering, unknown blank route, and lazy manifest collection. |
| Runtime integration | `npm run test:integration -- foundation` | 48 passed, 0 failed across 7 suites; disposable-MySQL/query-plan suites were explicitly skipped without opt-in. Production fallback verifies `/products/fixture` and `/admin/orders/fixture` with GET and HEAD while API paths remain reserved. |
| Local production wiring | `npm run test:production` | 4 passed, 0 failed. Fake-database production test rebuilt and served the SPA/assets/API boundary; it is not hosting or live-MySQL acceptance evidence. |
| Static checks | `npm run lint`; `npm run build`; `npm audit --json` | All exit 0. Vite 8.3.5 built 77 modules (286.04 kB JS, 89.97 kB gzip); audit reports zero vulnerabilities after adding `react-router-dom` 7.18.5. |
| Whitespace and documentation | `git diff --check`; `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Both exit 0; documentation validator reports `PASS: generated project documentation is structurally valid`. |

This corrective FND-001 amendment preserves the feature's 3/6 completion count. It does not resolve the
existing FND-002, FND-005, or FND-006 blockers and does not authorize a merge or release.

Second pass: re-read FND-006/AC-FND-004 and reviewed tracked changes plus new configuration,
upload-serving code, tests and runbook for ownership, secret exposure, path handling and cleanup.
`node --version` reported v24.18.1; `git diff --check` passed. Lockfile, DB/AUTH/client source
unchanged; index empty. The final unchanged validator invocation still exited 2. No new dependency,
live MySQL, real hosting/session smoke, full-feature acceptance or completion claim.

## 20. FND-005 Closeout Attempt and FND-002 Acceptance — 2026-11-02

Branch: `feature/FND-application-foundation`, baseline `aa61d3f`. Node v24.18.1.
FND-DEC-007 records explicit user acceptance of FND-002; this is not a newly observed hosting pass.
The branch is behind main; no merge/rebase or removal of main's later UI/routing changes occurred.
Existing stash was inspected read-only and remains untouched.

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused logger/helpers/HTTP | `node --test --test-isolation=none server/src/platform/observability/foundation-observability.test.js tests/helpers/foundation-quality.test.js server/src/platform/observability/foundation-observability.integration.test.js` | Initial sandbox: 9 pass, 8 HTTP failures due to listen EPERM. Authorized unrestricted rerun: 17 passed, 0 failed, 3 suites. |
| Foundation unit | `npm run test -- foundation` | Initial sandbox: 15 files pass, selection test fails. Detailed `node --test --test-isolation=none tests/helpers/foundation-test-selection.test.js` identified spawnSync npm EPERM. Authorized unrestricted rerun: 92 tests passed, 0 failed, 16 suites. Cleanup selection uses fake processes only. |
| Non-live integration | `FND_DISPOSABLE_MYSQL_TESTS=0 npm run test:integration -- foundation` outside sandbox | 48 passed, 0 failed, 7 suites. Disposable MySQL and query-plan suites explicitly skipped; no live database operation. Includes four production fake-DB cases and synthetic secret-bundle fixture. |
| Lint | `npm run lint` | Exit 0. |
| Build | `npm run build` | Exit 0; Vite 8.3.5, 68 modules, JS 248.14 kB / gzip 77.08 kB. |
| Typecheck | Inspect package scripts | No typecheck script in approved JavaScript base; not run. |
| Original documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Invocation exit 2: script absent; validation BLOCKED / NOT RUN. No alternate validator invented. |

Second pass: reviewed the complete seven-document diff, task acceptance criteria and remaining
runbook gates. `git diff --check` passes. Only FND documentation changed; application source,
dependencies, acceptance checkboxes and the existing stash are unchanged. No staging or commit.

No FND-005 completion commit. AC-FND-002 remains unchecked pending the mandatory closeout.
FND-006 production wiring is locally tested; actual host/database/session persistence,
backup/restore and remaining runbook checks are not executed evidence. AC-FND-004 remains unchecked.

## 21. User Acceptance Boundary — 2026-11-02

FND-DEC-008 records the user's acceptance of remaining FND task accounting for AUTH development.
No new verification ran for this decision. Original documentation validation remains BLOCKED / NOT RUN;
no acceptance checkbox, live hosting/session check, backup/restore check or release gate is marked passed.
Commit and push still require explicit user approval. Historical evidence above remains unchanged.

## 22. AUTH-001 Local Implementation Evidence — 2026-11-02

Baseline: frozen `origin/feature/AUTH-integration` at `4e92f8f`; working branch `work/AUTH-backend`.
User accepts all FND tasks for downstream development under FND-DEC-007/008, reconfirms A-005 and
approves AUTH-DEC-003. FND acceptance notes were preserved in a separate named stash and copied into
the dependency documentation without rewriting this baseline's newer history. Both stashes remain.

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused primitives/source migration discovery | `node --test --test-isolation=none server/src/features/auth/repositories/auth-identities.test.js server/src/features/auth/services/auth-core.test.js server/src/features/auth/services/auth-core.integration.test.js server/src/platform/auth/auth-sessions.test.js` | 12 passed, 0 failed, 6 suites. Covers phone/password boundaries, scrypt salts/verification/cost parsing, scoped hashed-token lifecycle, fixed expiry, logout, cookie attributes/duplicates, persistence failure/rotation rollback with a fake repository, safe summaries and source migration discovery. Real-MySQL suite explicitly skipped. |
| Prescribed auth unit | `npm run test -- auth` | Final exit 0: 25 file checks passed, 0 failed. Test-name filter selects AUTH cases; other loaded files are not evidence of all their cases running. Initial attempt failed to import react-router-dom/jsdom because local dependencies belonged to the older FND checkout. |
| Existing dependency restoration | `npm ci` | Exit 0; 316 packages installed from the existing lockfile, 317 audited; six moderate vulnerabilities reported in that locked graph. No audit fix, version or manifest/lockfile change. This is dependency restoration, not a new dependency decision. |
| Non-live auth integration selection | `FND_DISPOSABLE_MYSQL_TESTS=0 npm run test:integration -- auth` | Exit 0, 8 file checks; actual DB constraint/persistence scenario explicitly skipped. Direct focused row above reports the migration-source case separately. |
| Foundation regression | `FND_DISPOSABLE_MYSQL_TESTS=0 npm run test:integration -- foundation` outside sandbox | Exit 0: 49 passed, 0 failed, 7 suites/file groups, including the filtered AUTH file load. Foundation real-MySQL/query-plan suites explicitly skipped; no new live-DB result claimed. |
| Lint/build | `npm run lint`; `npm run build` | Both exit 0. Vite 8.3.5, 78 modules; JS 286.04 kB / gzip 90.00 kB. |
| Typecheck | Inspect approved package scripts | No typecheck script; not run. |
| Live migration/constraint/persistence | Opt-in AUTH MySQL scenario, not executed | NOT RUN; requires explicit authorization and disposable MySQL. Unit/fake transaction checks do not establish actual SQL compatibility, FK/CHECK enforcement or restart persistence. |
| Original documentation validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Invocation exit 2: original script absent; validation BLOCKED / NOT RUN. No replacement path or tool installed; requirements unchanged. |

Reviewed the complete source and documentation changes for ownership, secrets, fixed work factors,
cookie scope, parameterized SQL, atomic rotation and accidental route/bootstrap installation.
AUTH-004 owner acknowledgement and fixture reconciliation for AUTH-DEC-003 are required before INT;
no FE source was modified. AUTH-002/003 endpoints and AUTH-005 live guards/CSRF/rate limits remain
future tasks. AUTH-001 is in-progress, not done; no completion commit or push is authorized.
`git diff --check` passes; dependency manifests/lockfile and acceptance checkboxes are unchanged.

## 23. AUTH-001 Actual Disposable MySQL Evidence — 2026-11-02

Scope: remaining AUTH-001 verification authorized by the user's request after the missing actual
MySQL tests were reported. Branch remains work/AUTH-backend with all prior work preserved.
No existing/application database or environment file was used. Only a private synthetic fixture
was initialized through the existing helper; no platform/helper code was modified.

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Runtime / database binary | `node --version`; `mysqld --version` | Node v24.18.1; MySQL 8.4.11-0ubuntu0.26.04.1, Ubuntu build. |
| Initial actual DB verification | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/auth/services/auth-core.integration.test.js` outside sandbox | 2 passed, 0 failed, 0 skipped, 2 suites. Empty identity schema, populated upgrade/session migration, repeat migrations, constraints, scoped session lifecycle and failed-rotation rollback passed. |
| Final focused suite | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/auth/repositories/auth-identities.test.js server/src/features/auth/services/auth-core.test.js server/src/features/auth/services/auth-core.integration.test.js server/src/platform/auth/auth-sessions.test.js` outside sandbox | 13 passed, 0 failed, 0 skipped, 6 suites. Real-DB case now closes/recreates the pool as well as the service before reading the persisted session; diagnostic confirms MySQL 8.4.11. |
| Fixture cleanup | `ps -C mysqld -o pid,ppid,comm`; `ls -d /tmp/press-fnd002-mysql-*` before/after runs | No mysqld process before or after; after each completed run, no matching temporary root. Commands with no matches return nonzero; those results establish absence, not a test failure. Fixture teardown itself completed without error. |
| Lint after test improvement | `npm run lint` | Exit 0. No application source or dependency change in this closeout attempt; previous build and local regression evidence remains in §22 and was not rerun. |
| Original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Invocation exit 2: original script still absent. Validation BLOCKED / NOT RUN; no fabricated tool/path or acceptance-requirement change. |

The real-DB NOT RUN status in §22 is historical and superseded for the tested local MySQL scenarios.
This is not actual Hostinger compatibility, production backup/restore or full HTTP AUTH acceptance.
AUTH-001 remains blocked on the original mandatory documentation validator and has no completion
commit; explicit no-commit/no-push restriction remains in force. AUTH-002 was not started.

## 24. AUTH-002 Customer APIs and FND Composition Amendment — 2026-11-02

Branch: work/AUTH-backend; baseline published AUTH-001 checkpoint 9b86081. User approved the
AUTH-002 development exception AUTH-DEC-004 and coordinated FND owner/AUTH consumer amendment
AUTH-DEC-005 / FND-DEC-009. Shared source changes are limited to the loader/startServer and their
existing tests. No FND DB interface, dependency, FE source or unrelated feature source changed.

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused manifests/validation/repositories | `node --test --test-isolation=none server/src/app/foundation-manifests.test.js server/src/features/auth/services/auth-customer-input.test.js server/src/features/auth/repositories/auth-identities.test.js` | 24 passed, 0 failed, 4 suites. Static/array/factory/context compatibility, pre-factory rejection and input boundaries. Subsequent full unit run includes the lint-corrected validator. |
| Initial actual customer HTTP/DB | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/auth/routes/auth-customer.integration.test.js` outside sandbox | 3 passed, 0 failed, 0 skipped, 2 suites on MySQL 8.4.11. Default manifest/startServer mounts and app restart; duplicate registration/race; atomic identity/session rollback; origin/media/validation and storage outage boundary. |
| Final AUTH actual HTTP/DB regression | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/auth/routes/auth-customer.integration.test.js server/src/features/auth/services/auth-core.integration.test.js` outside sandbox | 5 passed, 0 failed, 0 skipped, 4 suites. Includes added real admin-token rejection/customer-logout isolation and existing core migrations/FK/session constraints. MySQL 8.4.11 diagnostic emitted; no application DB. |
| Full unit suite | `npm run test` outside sandbox | 136 passed, 0 failed, 24 suites. Includes existing UI/foundation and AUTH units. Existing JSDOM canvas-not-implemented notices appeared during axe tests; assertions passed, no dependency added. |
| Foundation non-live HTTP/platform regression | `FND_DISPOSABLE_MYSQL_TESTS=0 npm run test:integration -- foundation` outside sandbox | 50 reported passing checks, 0 failures. AUTH integration files loaded under the foundation name filter; actual AUTH scenarios are evidenced by the final focused row instead. Foundation live-MySQL/query-plan suites explicitly skipped here. |
| Lint | `npm run lint` | Initial no-control-regex violation in name validation was corrected using bounded code-point checks; rerun exit 0. No rule disabled. |
| Build | `npm run build` | Exit 0; Vite 8.3.5, 78 modules, JS 286.04 kB / gzip 90.00 kB. |
| Typecheck | Inspect approved package scripts | Not available; JavaScript base retained. |
| Cleanup | `ps -C mysqld -o pid,ppid,comm`; `ls -d /tmp/press-fnd002-mysql-*` after final focused live suite | No running mysqld process or matching private MySQL fixture root remained. Test teardown completed without failure. |
| Original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Required original script remains unavailable; validation BLOCKED / NOT RUN. No alternative installed or acceptance requirement changed. |

Verification covers customer API behavior and explicit development exceptions only. AC-AUTH-001
still requires client/UI integration evidence; AC-AUTH-002/003, admin APIs/bootstrap, full abuse
rate limits, browser CSRF/origin and cross-feature security remain their later owner tasks/gates.
No acceptance checkbox or task completion claim. AUTH-002 is blocked on original documentation
validation, not the now-approved shared amendment. No completion commit or additional push.

Second pass: re-read AUTH-002 and AC-AUTH-001/003, reviewed the full tracked diff and new manifest,
router, service, validator and tests for scope, safe DTOs/errors, transaction rollback, cookie/origin
handling and debug/secret artifacts. `git diff --check` passes; package/lockfile and client source
are unchanged. Existing stashes remain untouched. No further task or remote write was performed.

## 25. User-Requested Full Code Verification — 2026-11-02

Scope: explicit user request to test the current AUTH/FND work on work/AUTH-backend. Existing
uncommitted implementation/documentation was preserved; no source/test or dependency changes.
All database scenarios used their own synthetic disposable MySQL fixtures, not an application DB.

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Full unit | `npm run test > /tmp/press-auth002-full-unit-20261102.log 2>&1` outside sandbox | Exit 0; 136 tests passed, 0 failed, 0 skipped, 24 suites. |
| Full integration with actual disposable MySQL | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration > /tmp/press-auth002-full-integration-20261102.log 2>&1` outside sandbox | Exit 0; 66 tests passed, 0 failed, 0 skipped, 11 suites. AUTH customer HTTP/core scenarios, FND real DB migrations/transactions/lifecycle, HTTP/errors/observability/storage, fake-DB local production and real DB indexed query-plan sanity all ran. MySQL 8.4.11-0ubuntu0.26.04.1. |
| Lint | `npm run lint` | Exit 0. |
| Build | `npm run build` | Exit 0; Vite 8.3.5, 78 modules; JS 286.04 kB / gzip 90.00 kB. |
| Cleanup | `ps -C mysqld -o pid,ppid,comm`; `ls -d /tmp/press-fnd002-mysql-*` | No mysqld process before/after; no matching private fixture root after completion. No unrelated process was signaled or existing DB modified. |
| Whitespace | `git diff --check` | Exit 0. |
| Original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Invocation exit 2: original script absent. Validation remains BLOCKED / NOT RUN; no replacement/waiver. |
| Typecheck | Inspect package scripts | No typecheck command in approved JavaScript base; not run. |

This supersedes earlier skipped local-MySQL regression evidence only for scenarios actually present
in this suite. It is not AUTH-003/004/005 acceptance, live browser/Hostinger/backup verification or
permission to advance tasks. AUTH-001/AUTH-002 remain blocked on original docs validation, no
acceptance checkboxes promoted, no completion commit/checkpoint/push or subsequent implementation.

## 26. AUTH-003 Implementation and Verification — 2026-11-02

Scope: only AUTH-003 BE on work/AUTH-backend, HEAD 7f3849fa333bf19c9b0381dad00a04662e7b5e0e.
User-approved AUTH-DEC-007/008 and FND-DEC-010 permit early development and bounded config/ESLint
amendments. AUTH-001/002 remain blocked; no acceptance requirement is waived. No completion,
commit, push, merge, deploy, dependency, migration file, frontend implementation or later task.
All executed DB operations targeted newly created disposable fixtures with synthetic inputs;
no existing application database connection or server/.env read was performed.

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Focused AUTH-003 | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/config/admin-bootstrap-config.test.js server/src/features/auth/services/auth-admin-bootstrap.test.js server/src/features/auth/routes/auth-admin.integration.test.js > /tmp/press-auth003-focused-final-20261102.log 2>&1` outside sandbox | Exit 0; 9 tests, 4 suites, 0 failures/skips. |
| Full unit | `npm run test > /tmp/press-auth003-full-unit-20261102.log 2>&1` outside sandbox | Exit 0; 140 tests, 26 suites, 0 failures/skips. |
| Full integration | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration > /tmp/press-auth003-full-integration-20261102.log 2>&1` outside sandbox | Exit 0; 71 tests, 13 suites, 0 failures/skips, including actual MySQL, HTTP and CLI subprocesses. |
| Lint | `npm run lint` | Exit 0, including authorized bootstrap CLI coverage. Log /tmp/press-auth003-lint-20261102.log. |
| Build | `npm run build > /tmp/press-auth003-build-20261102.log 2>&1` | Exit 0; Vite 8.3.5, 78 modules, existing JS bundle 286.04 kB / gzip 90.00 kB. |
| Whitespace | `git diff --check` and inspection of new files | Passed at implementation review; rechecked after documentation update. |
| Original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2, original script absent; BLOCKED / NOT RUN. No replacement installed or waiver. |
| Typecheck | Existing package scripts inspected | No typecheck in approved JavaScript project; not run. |
| Host cleanup | Host `ps` with exact task PIDs and /tmp fixture-root inventory | BLOCKED for initial sandbox attempt; details below. Successful unrestricted runs did not leave additional fixtures. |

### Verified behavior and second pass

Real CLI creates and repeats without exposing protected values; argument/config errors are rejected
before DB construction, pools close on validation/storage failures, and close failure suppresses
success output. Real DB checks confirm unchanged hashes/timestamps/sessions on matching rerun or
mismatched phone/password, normalized-phone idempotency, concurrent same-identity reconciliation,
and refusal of a competing identity without overwriting the winner.

HTTP checks cover absent/wrong credentials, safe adminId-only DTO, separate customer/admin
credentials/cookies, 401 absent/expired vs 403 valid customer-only current-session, admin precedence,
wrong-scope/duplicate cookies, eight-hour absolute expiry, transactional rotation and rollback on
session-insert failure, actual application restart persistence, idempotent logout, unrelated-session
preservation, customer/admin logout isolation, production clear-cookie flags, origin/media/body
validation, no public admin registration, no-store router responses, and safe storage failures with
no premature cookie issuance/clearing. Existing unit cookie tests cover production issuance flags.
Log assertions exclude credential values, raw tokens and DB failure detail. Static review confirms
no password arguments, credential interpolation, automatic bootstrap, migration invocation,
credential UPDATE path or new runtime pool. Re-read AUTH-003, AC-AUTH-002 and linked policies;
reviewed complete source/test/tooling diff and new files for scope, debug artifacts and regressions.
Rate limiting, reusable cross-feature guards and full browser/security acceptance remain AUTH-005.
No AUTH acceptance checkbox is marked passed.

### Initial failures and outstanding cleanup

The initial sandbox command was:
`FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/auth/routes/auth-admin.integration.test.js > /tmp/press-auth003-focused-integration-20261102.log 2>&1`.
HTTP failed with listen EPERM. Four MySQL initializer attempts timed out (about 32 seconds each)
and left confined initializer processes alive; successful unrestricted reruns are separate evidence.
An unrestricted initial run also exposed an incorrect test expectation (422 for null JSON); corrected
the test to expect FND's existing strict-parser 400, then focused/full runs passed. No FND transport
behavior was changed. Parser failures occur before feature middleware; no-store assertions apply
to responses within the AUTH routers, as in AUTH-002.

Verified ownership before attempting cleanup:

| Initializer PID | Parent test runner | Exact owned fixture root |
|---:|---:|---|
| 52655 | 52638 | /tmp/press-fnd002-mysql-NF6qMt |
| 52757 | 52638 | /tmp/press-fnd002-mysql-wUt0ZN |
| 53141 | 52638 | /tmp/press-fnd002-mysql-CISByl |
| 53386 | 52638 | /tmp/press-fnd002-mysql-mW63M8 |

All four command lines are mysqld --initialize-insecure for the matching root/data, not running
application DB instances. Host signal attempt failed PermissionError (errno 13). The initializer
security label is /usr/sbin/mysqld//&bwrap//&unpriv_bwrap (enforce). `sudo -n kill -TERM 52655 52757
53141 53386` failed because interactive authentication is required. Interrupting the original tool
session returned exit 130 but subsequent host inspection still found parent 52638 and four active
initializers. No active fixture directory was removed. Unrelated system MySQL PID 1719 (mysql user,
started before this work) was neither connected to nor signaled. No passwords were requested,
provided as arguments or printed. No unrelated process was terminated.

Host operator action remains: re-identify these exact task-owned PIDs/command lines to avoid PID
reuse, stop only those initializers/test runner with appropriate privileges, then remove only these
four roots after confirming their processes have stopped. Re-run the host process/root inventory.
Do not terminate PID 1719 or delete another test's fixtures. Until observed cleanup succeeds,
AUTH-003 remains blocked on cleanup as well as the original documentation validator.

### Files and independent-review handoff

New files:
- scripts/bootstrap-admin.js
- server/src/config/admin-bootstrap-config.js
- server/src/config/admin-bootstrap-config.test.js
- server/src/features/auth/services/bootstrap-admin.js
- server/src/features/auth/services/admins.js
- server/src/features/auth/services/auth-admin-bootstrap.test.js
- server/src/features/auth/routes/admin-routes.js
- server/src/features/auth/routes/auth-admin.integration.test.js

Modified source/tests/tooling:
- server/src/features/auth/manifest.js
- server/src/features/auth/repositories/identities.js
- server/src/features/auth/routes/customer-routes.js (export existing boundaries for reuse)
- server/src/features/auth/routes/auth-customer.integration.test.js (remove obsolete absent-admin-login expectation)
- server/src/features/auth/README.md
- eslint.config.js

Modified documentation: AUTH technical contracts/backlog/change log/decisions; FND technical
contracts/change log/decisions; delivery backend-track, branch-plan, workstreams, integration-plan,
build-log and this verification matrix. Historical evidence is retained; current amendments are
explicit. No new assumption or FE change.

Review the uncommitted diff against HEAD 7f3849f, including untracked files. Prioritize insert-only
bootstrap/concurrency, CLI secret/error/lifecycle boundaries, customer/admin separation and
rotation rollback. Reuse the exact focused/full commands above only under authorized fixture
conditions. No independent review has been performed by another agent; this is the author's second
pass and a handoff for review. AUTH-003 blocked, AUTH 0/5, no acceptance/completion/commit claim.

## 27. Requested AUTH-003 Full Test Rerun and Cleanup Resolution — 2026-11-02

Scope: user requested TEST for current uncommitted AUTH-003. No implementation, dependency,
migration or frontend source changed. Existing changes and both stashes preserved. DB tests used
only newly created disposable MySQL with synthetic input; no existing application DB or server/.env.

| Check | Exact command/procedure | Observed result |
|---|---|---|
| Full unit | `npm run test > /tmp/press-auth003-rerun-unit-20261102.log 2>&1` outside sandbox | Exit 0; 140 passed, 26 suites, 0 failed/skipped. |
| Full integration | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration > /tmp/press-auth003-rerun-integration-20261102.log 2>&1` outside sandbox | Exit 0; 71 passed, 13 suites, 0 failed/skipped. Includes actual MySQL, CLI, HTTP, bootstrap races, rollback, restart and scope isolation. |
| Lint | `npm run lint > /tmp/press-auth003-rerun-lint-20261102.log 2>&1` | Exit 0. |
| Build | `npm run build > /tmp/press-auth003-rerun-build-20261102.log 2>&1` | Exit 0; Vite 8.3.5, 78 modules. |
| Diff | `git diff --check` | Exit 0; rechecked after recording this evidence. |
| Original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2; original script absent, BLOCKED / NOT RUN. No replacement/waiver. |
| Typecheck | Existing approved JavaScript script surface | No typecheck script; not run. |
| Cleanup | Host `ps -C mysqld -o pid,ppid,user,stat,comm` and Python Path('/tmp').glob('press-fnd002-mysql-*') before/after | Final inventory contains only unrelated system MySQL PID 1719 and zero disposable fixture roots. No unrelated process signaled or DB accessed. |

Before rerun, host inventory showed the four §26 initializer processes had already stopped; this
turn did not stop them and does not attribute how they exited. The four documented directories
remained. Confirmed every old initializer PID absent under /proc, rejected symlinks, then removed
only the exact inactive task-owned roots NF6qMt, wUt0ZN, CISByl and mW63M8. Inventory was empty
before new tests and after successful rerun. No privileged signaling or sudo retry was needed.
This observed result resolves §26's cleanup blocker; its earlier failure evidence remains historical.

AUTH-003 remains blocked solely on the original mandatory documentation validator. AUTH-001/002
statuses unchanged; AUTH remains 0/5. No acceptance boxes promoted, independent review claimed,
commit, push, merge, deployment or later task. §26 retains the source inventory and review handoff;
reviewers should use §27 as the latest full test and cleanup evidence.

## 28. AUTH-003 Independent Review and Checkpoint Authorization — 2026-11-02

A separate reviewer agent, auth003_independent_review, inspected the uncommitted diff and untracked
AUTH-003 source, tests, approved contracts and relevant persistence/runtime dependencies. Verdict:
PASS WITH WARNINGS; no confirmed actionable implementation defects within approved scope.
Checked bootstrap singleton/concurrency and insert-only semantics, secret/password handling,
admin/customer authentication and session isolation, transactional rotation/rollback, Origin/cookies,
and safe DTO/errors. Reviewer ran read-only inspection and git diff --check (pass); no tests,
MySQL connection, server/.env access, file writes or publication. Earlier §26/27 no-independent-review
statements are historical and superseded only by this actual separate review.

Warning W1: high residual deployment risk from absent login abuse controls at admin-routes.js:19
and fixed-cost password verification in services/admins.js:18. This is the explicit AUTH-005
allocation in AUTH-DEC-008, not an AUTH-003 scope defect or full security acceptance. Complete
browser/CSRF integration, reusable cross-feature guards and rate limits remain AUTH-005.
Reviewer did not rerun or independently reproduce the existing §27 unit/integration evidence.
Original missing documentation validator remains a formal completion blocker, not a code defect.

The user explicitly requested commit and push after receiving the review. Planned subject:
`chore(AUTH-003): checkpoint reviewed admin authentication`. Authorizes one preservation checkpoint of the reviewed AUTH-003 source/tests/docs
and approved FND-DEC-010 amendments, then non-force push to origin/work/AUTH-backend. No PR,
merge, deployment, next task, acceptance change or completion claim. AUTH-003 stays blocked,
AUTH remains 0/5. Source/test/dependency content is unchanged since §27; no application test
rerun is claimed for this documentation/Git-only step. Whitespace/staging inventory reviewed
before commit; resulting hash and remote verification reported in chat without follow-up commit.


## CAT-001 — Isolated Catalog Domain Verification — 2026-11-04

**Scope:** CAT-001 / WS-CAT-BE only. Branch work/CAT-backend from 7e3ca00152afc3181a1ae2eaf3beff9f7888b6f1 under user-approved CAT-DEC-002, not an integrated/frozen CAT baseline. CAT-DEC-003 approves exact rounding/precision; A-010 records bounded implementation choices. FND-002/FND-004 accepted for downstream development; their unrun hosting/release checks remain unrun. No AUTH-005 guard or frontend changes are carried into this branch.

| Check | Exact command / evidence | Observed result |
|---|---|---|
| Focused domain/MySQL | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/catalog/services/catalog.test.js server/src/features/catalog/services/catalog-domain.integration.test.js > /tmp/press-cat001-focused.log 2>&1` | 14 passed, 4 suites, 0 failed/skipped; exit 0 |
| Full unit | `npm run test > /tmp/press-cat001-full-unit.log 2>&1` | 148 passed, 28 suites, 0 failed/skipped; exit 0 |
| Full integration | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration > /tmp/press-cat001-full-integration.log 2>&1` | 77 passed, 15 suites, 0 failed/skipped; exit 0 |
| Lint | `npm run lint > /tmp/press-cat001-lint.log 2>&1` | Exit 0 |
| Build | `npm run build > /tmp/press-cat001-build.log 2>&1` | Exit 0 |
| Diff | `git diff --check` | Exit 0 |
| Required original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2, missing script; BLOCKED / NOT RUN. No replacement validator or invented pass. |
| Typecheck | package.json inspection | No typecheck script; approved JavaScript/ESM remains unchanged. |
| Host cleanup | `ps -eo pid,uid,args` and exact /tmp directory inventories after tests | Only unrelated system /usr/sbin/mysqld PID 1714 UID 124; no disposable mysqld or press-fnd002-mysql-* / press-cat001-images-* directory. No system/application DB touched. |

All authoritative tests ran in /home/tarek/projects/Press-Store-CAT-backend. Focused/MySQL and full runners were outside sandbox for actual subprocess/socket execution. Initial focused result was 12/14: two assertions incorrectly expected numeric COUNT instead of FND BIGINT strings; corrected tests and successful rerun retained in this history. A sandbox default isolated-runner wrapper count is not claimed as coverage.

**Meaningful coverage:** migration discovery; empty classification schema then upgrade with retained category/brand data; complete migration rerun; unique names; single main/bounded additional slots; FK references; unique pairs and true boolean availability; 0/100-percent/half-minor/maximum-safe-money cases; strict unknown-field/Unicode validation; real transaction rollback after a later child failure; real file compensation on invalid FK and later malformed image; inactive/soft-deleted availability rejection; referenced classification protection; optimistic concurrent classification edits; post-commit old-file deletion and explicit cleanup-pending behavior.

**Second pass:** re-read CAT-001 and AC-CAT-001/003; reviewed all new source, SQL, tests and tracked documentation for ownership, parameterization, integer precision, rollback, storage limits, safe error boundaries and generated artifacts. No routes/manifests, numeric stock, dependency/environment reading, frontend or other-feature source writes added. New files stay under server/src/features/catalog/**. Existing node_modules is linked for local test execution only; link/build output is ignored and not staged. Original AUTH working checkout and both preserved stashes remain unchanged in scope/status.

**Limits and recovery:** this task is not CAT public/admin API, UI, max-eight curation, full consumer availability transaction contract or security integration. SQL slot uniqueness enforces image upper bounds, while the service transaction enforces mandatory main-image existence. Existing FND file compensation is not a distributed transaction: ambiguous commit acknowledgement/process crashes require explicit file/DB reconciliation without blind retries. A committed classification delete can report server-internal cleanupPending; CAT-003 must handle reconciliation without exposing paths or mistaking it for rollback. Production engine/proxy/hosting/release checks are not claimed.

**Disposition:** CAT-001 implemented and locally verified; formal status blocked solely by unavailable mandatory original documentation validator. CAT 0/6, all three feature acceptance Passed checkboxes remain unchecked. Planned completion subject feat(CAT-001): add catalog domain foundation; completion commit None. No next task, commit, push, merge, deployment or frontend implementation performed.


## CAT-002 — Public Catalog API Verification — 2026-11-04

**Authorization/baseline:** User-approved CAT-002-only early start (CAT-DEC-004) on work/CAT-backend at published CAT-001 checkpoint 2c6bb4fb5f18ab8cb278a7510b93a5f3641da829. CAT-001 remains formally blocked. FND DB/HTTP/storage interfaces are unchanged. CAT-DEC-005 transparently records the final-price interpretation and actual user-directed continuation, without attributing an explicit price-option choice to the user or to the PRD. A-011 records bounded presentation choices. No full CAT contract freeze/FE acknowledgement/consumer integration claimed.

| Check | Exact command / procedure | Observed result |
|---|---|---|
| Focused HTTP/MySQL/unit | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/catalog/services/public-input.test.js server/src/features/catalog/routes/catalog-public.integration.test.js > /tmp/press-cat002-focused-final.log 2>&1` | Exit 0; 13 passed, 4 suites, 0 failed/skipped |
| Full unit | `npm run test > /tmp/press-cat002-full-unit.log 2>&1` | Exit 0; 153 passed, 30 suites, 0 failed/skipped |
| Full integration | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration > /tmp/press-cat002-full-integration.log 2>&1` | Exit 0; 85 passed, 17 suites, 0 failed/skipped |
| Lint | `npm run lint > /tmp/press-cat002-lint.log 2>&1` | Exit 0 |
| Build | `npm run build > /tmp/press-cat002-build.log 2>&1` | Exit 0 |
| Diff | `git diff --check` | Exit 0 |
| Required original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2, original script absent; BLOCKED / NOT RUN. No substitute or acceptance waiver. |
| Typecheck | package.json | No typecheck script; project remains JavaScript/ESM. |
| Host cleanup | Read-only `ps -eo pid,ppid,uid,args` plus exact /tmp fixture-directory inventories | Only unrelated /usr/sbin/mysqld PID 1714 UID 124. No CAT test runner or press-fnd002-mysql-* / press-cat001-images-* directory remains. No system service or existing application DB touched. |

**Coverage:** Actual loopback HTTP and new disposable MySQL schema/fixtures. Runtime discovery of all three mounts with lifecycle-owned DB; anonymous reads; safe DTOs and no cookies; default/bounded pagination and deterministic empty/out-of-range results; every supported filter and their conjunction; same-active-pair color/size logic; inactive variants/deleted products excluded appropriately; ordered full gallery; paginated categories/brands; canonical 422/404/500 errors and request IDs; unknown/repeated/nested/unsafe query rejection before DB work; quoted SQL payload treated as a literal; exact inclusive final-price filters matching integer price calculations at half-minor, 100% discount, zero final price and maximum safe base price; nonempty product page performs three domain queries (count/page/batched variants), verified by injected query counting. EXPLAIN shows the existing category-price index eligible; this is not a production-scale discounted-filter benchmark or a claim that computed-price filters use an index.

**Initial test-harness failure and recovery:** The first focused run incorrectly passed a before-hook context to startTestApp, whose helper requires t.after; setup failed with TypeError and cancelled the six dependent tests while leaving the owned HTTP runner alive. Before retry, host PID/UID/command inspection verified the exact owned node test process (117137, UID 1000), no disposable MySQL process/root remained, and SIGTERM stopped only that process. Fixed the CAT-owned suite by explicitly capturing its HTTP cleanup and running it in suite teardown before DB/fixture cleanup. The successful final focused run uses a separate fresh logfile; the original intermediate log contains termination output and is not authoritative successful evidence. No helper/source outside CAT was modified, no force kill/sudo used.

**Second pass/scope:** Re-read CAT-002 requirements and linked AC-CAT-002 API/AC-CAT-003 security boundaries; reviewed complete new production source and tests plus documentation. New source is only server/src/features/catalog/{manifest.js,repositories/public-catalog.js,routes/public-routes.js,services/public-catalog.js,services/public-input.js} plus CAT-owned tests. Parameterization, precise IDs/money, safe projections/errors, page/query bounds and storage URL validation were inspected. No admin mutation, auth/session modification, new migration/dependency, shared config change, server/.env read, frontend write, source from another feature, or application database operation. Original AUTH checkout/stashes remain outside this change. Ignored build output/node_modules link are not source changes.

**Remaining gates:** Mandatory original docs validator missing; CAT-001 and CAT-002 formal completion blocked, CAT still 0/6. CAT-DEC-005 interpretation is visible for owner review before freeze; no explicit option approval is invented. Actual FE/browser/consumer/admin integration, production isolation/concurrent snapshot proof, discounted-filter load performance and hosting/release checks remain unrun. No feature AC checkbox is marked passed. Planned subject feat(CAT-002): add public catalog read APIs; completion commit None. No commit/push/merge/deploy, CAT-003 or frontend task started.


## CAT-003 — Protected Admin Catalog Verification — 2026-11-04

**Authorization:** CAT-003 only, including the explicit preflight-approved early start, unchanged AUTH guard transfer, bounded FND storage configuration/context, one parser dependency and additive coordination migration. Canonical CAT-DEC-006/FND-DEC-011, CAT contracts §16 and A-012 record the final boundaries. Branch work/CAT-backend still at published CAT-001 checkpoint 2c6bb4fb5f18ab8cb278a7510b93a5f3641da829; pre-existing uncommitted CAT-002 work is preserved. No completion/validator waiver, frontend or next task authorization.

| Check | Exact command / procedure | Observed result |
|---|---|---|
| Focused CAT/admin/AUTH/FND | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/catalog/services/admin-catalog.test.js server/src/features/catalog/routes/catalog-admin.integration.test.js server/src/platform/auth/auth-guards.test.js server/src/config/catalog-storage-config.test.js > /tmp/press-cat003-focused-final.log 2>&1` | Exit 0; 18 passed, 4 suites, 0 failed/skipped |
| Full unit | `npm run test > /tmp/press-cat003-full-unit.log 2>&1` | Exit 0; 161 passed, 33 suites, 0 failed/skipped |
| Full integration | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration > /tmp/press-cat003-full-integration.log 2>&1` | Exit 0; 95 passed, 18 suites, 0 failed/skipped |
| Lint | `npm run lint > /tmp/press-cat003-lint.log 2>&1` | Exit 0 |
| Build | `npm run build > /tmp/press-cat003-build.log 2>&1` | Exit 0 |
| Diff | `git diff --check` | Exit 0 |
| Runtime dependency audit | `npm audit --omit=dev --json > /tmp/press-cat003-runtime-audit.json` | Exit 0; 0 total reported runtime vulnerabilities. This is registry evidence, not a guarantee of complete security. |
| Required original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2, original script missing; BLOCKED / NOT RUN. No substitute or invented pass. |
| Typecheck | package.json inspection | No typecheck script; remains approved JavaScript/ESM. |
| Host cleanup | Read-only process and exact /tmp directory inventories after suites | Only unrelated system /usr/sbin/mysqld PID 1718 UID 124. No press-fnd002-mysql-*, press-cat003-images-* or press-cat001-images-* fixture directory; no disposable mysqld remains. System service untouched. |
| Preservation / dependency scope | Original AUTH package diff and stash list; compare old/new lockfile package maps | AUTH package/lock unchanged, both original stashes preserved. All existing lockfile package entries unchanged; only busboy and streamsearch added. CAT has its own node_modules install. |
| AUTH transfer | SHA-256 source/copy comparisons | guards.js both 3348541025e194543f5566051d59bef3dcfa40e9b6a877143206b6a36b1b4ee6; auth-guards.test.js both 87de4015bbea568ac8c975f3ede0d616a391d5e725b75c7e7f9a216106518869. Original AUTH source untouched. |

**Observed coverage:** Actual startServer/runtime composition with explicitly injected temporary storage root and the same lifecycle DB. New disposable MySQL only: upgrade from prior migrations to cat_004 and full rerun. Anonymous/expired 401; customer-only 403; valid admin precedence with both cookies; duplicate admin cookies fail closed; production Origin uses configured HTTPS origin despite different request/forwarded host, rejects cross-site fetch metadata. No admin response issues/clears cookies; cache no-store. Safe DTOs include required list brand/category names, current prices and active variants; no hashes/tokens/internal paths in JSON/logs.

CRUD evidence covers category/brand creation/read/rename/delete, category image replacement and deletion of obsolete files after commit, unique-name constraint handling, stale versions and referenced classifications. Product evidence covers complete create/read/list/update/delete, four images including exactly 5 MiB input accepted through real FND decode/normalization; fifth image, oversize input, malformed multipart, fake bytes, wrong media, unknown actor fields, duplicate pairs and invalid FKs rejected with safe statuses. Failed product image/FK update rolls back image records and retains original files while compensating new files. Existing image IDs can be retained/reordered only for the same product; arbitrary unknown image IDs fail. Removed/readded pairs preserve variantId; concurrent edits using one version yield one 200 and one 409. Soft deletion preserves product/variant/image history and files while public/admin active reads hide the resource and class FKs remain protected.

Curation evidence creates seven flagged products, concurrently attempts two more, observes one success and one CURATION_LIMIT_EXCEEDED with exactly eight active rows for each flag, one new product/file total and no partial loser state. The same limit rejects a ninth flag on update; existing flagged product may keep flags at eight through CMD-CAT-001 setFlags. Unit tests additionally verify new-file compensation on rejected commit, no old-file deletion before commit, unused upload rejection and post-commit cleanup failure returning a boolean while retaining committed new files even if diagnostics fail. Full runtime origin/expiry test uses synthetic fixture sessions only.

**Problems resolved:** Initial focused run was 17/18: expiry fixture attempted setting expires_at before created_at and correctly hit the session CHECK. Corrected only fixture created_at/last_seen_at/expiry ordering; no auth policy/schema change. Source review of busboy's limit events identified inclusive boundaries: partsLimit fires when its configured count is reached and fileSize limit fires at equality. Parser thresholds now permit the approved four files and inclusive 5 MiB while rejecting extra parts/files/bytes. The final authoritative focused run includes these boundary cases; prior logs preserve the initial failure history. No rule disabled.

**Second pass:** Re-read CAT-003/AC-CAT-001/003 and ownership boundaries. Reviewed all new source/tests, package/lock delta, additive SQL, changed runtime/config tests and canonical docs for parameterization, actor derivation, exact money, version/curation lock order, history preservation, image ownership/compensation, bounds, safe errors, debug artifacts and scope drift. No existing SQL migration modified, only the discovery regression expectation extended for cat_004. No code outside approved CAT paths, two transferred AUTH files, bounded FND runtime/config/test paths and parser manifests; no frontend implementation. All tests used new fixture databases and temporary upload directories, never server/.env or an existing application DB. This is implementation self-verification, not a claimed independent review.

**Limits / remaining acceptance:** Original docs validator remains missing; CAT-001/002/003 are formally blocked and CAT 0/6. Actual FE/browser/consumer integration/normal frozen baseline, hosting request/decode-memory budgets, production proxy/isolation/load verification and full CAT-006/AUTH security acceptance remain open. Only the AUTH guard is transferred; root AUTH-005 abuse controls remain separate. Admin detail retains historical inactive variants and its long-lived history-size/load behavior is not a production benchmark. Filesystem/MySQL are not a distributed crash-atomic transaction: cleanupPending requires explicit inventory/reconciliation after old-file deletion failure, and lost commit acknowledgement/crash recovery has no blind retry or automatic cleanup job. Existing full graph install still reported six moderate advisories; only the runtime-only audit is zero and no automatic fix/upgrade was applied.

**Disposition / review handoff:** Local code verified, formal CAT-003 completion blocked by original docs validation. Planned subject feat(CAT-003): add protected admin catalog management; completion commit None. Review server/src/features/catalog admin repository/service/routes/parser/migration/manifest and approved FND/AUTH seams against CAT contracts §16 and this evidence. CAT-002 and CAT-003 remain uncommitted together; distinguish CAT-002 public files/evidence from this task when reviewing/publishing. No commit/push/PR/merge/deploy or next task performed.


## CAT-002/CAT-003 — User-Accepted Task Closeout — 2026-11-04

CAT-DEC-007 records explicit user acceptance for task tracking, after implementation/testing and the unresolved original validator were explained. Only CAT-002 and CAT-003 are done by acceptance. CAT-001 remains blocked; CAT count 2/6, BE 2/3. Historical blocked statements/tests/failures remain preserved, superseded only for current statuses. Feature stays in-progress, no merge-ready/release/security acceptance claim.

Source evidence remains the CAT-002/CAT-003 appendices: latest unit 161/161, integration 95/95, lint/build/diff passed. No new tests/lint/build were run for documentation-only closeout. Both implementations are local/uncommitted; completion commit None. User acceptance overrides task-accounting gates only, not requirements or mandatory feature acceptance. Original docs validator remains BLOCKED / NOT RUN; its original command still cannot execute because the prescribed script is missing. Manual consistency/diff checks are not a substitute validator. Existing three feature Passed boxes remain unchecked; all FE/INT/owner/proxy/hosting/recovery/source-publication gates stay visible.

Bounded closeout checks: task rows CAT-002/003 done by acceptance; CAT-001 blocked; overall 2/6. Source/test/package hashes checked unchanged across this documentation edit. Git diff whitespace check pass. No source/DB/env/frontend change, new task, commit/push/merge/deploy or independent review performed.


## 2026-11-04 — Current checkpoint publication disposition

CAT-DEC-008 authorizes separate CAT-002/CAT-003 checkpoint commits and non-force push. CAT-002 checkpoint is 43ebb117945afe60babd86c12a55cd4091ea1514. CAT-003 planned subject is chore(CAT-003): checkpoint verified admin catalog management; resulting hash/push confirmation are reported from Git after execution, not invented in this record. Earlier local/uncommitted/no-authorization entries remain historical and are superseded for this publication only. Task accounting remains CAT-002/003 accepted done (2/6, BE 2/3); CAT-001 blocked. Original docs validation BLOCKED / NOT RUN; feature remains in-progress, all three Passed boxes unchecked. No new code tests run for publication, no PR/merge/deploy/next task.


## CART-001 verification appendix — 2026-11-06 independent backend portion

### Authorized scope and preflight

- Selected task CART-001 / WS-CART-BE only. AC-CART-001 persistence/self-ownership/merge rules
  are tested at the independent backend boundary; full AC-CART-001 UI/live integration remains unchecked.
  AC-CART-002 and READ-CART-001/CMD-CART-001 full readiness/order handoff remain CART-002/INT scope.
- User approved baseline a6603ca5f2b5eb54b75e530906cee42821ec371e, quantity 1–99, 100 lines and
  expectedCartVersion for all mutations (CART-DEC-002). User explicitly declined the required CAT
  batch-read amendment and chose independent work with linking stopped (CART-DEC-003).
- Expected/current branch work/CART-backend, isolated worktree
  /home/tarek/.codex/worktrees/cart-backend/Press-Store. Started clean. Existing AUTH/CAT/SET/HOME
  worktree changes preserved; no transfers, source merges, stashes or remote operations.
- Owned source: server/src/features/cart/** including co-located tests. Owned docs: CART feature
  brief/contracts/backlog/change-log/decisions and named delivery records. Forbidden source: src/**,
  CAT/AUTH/FND/HOME/SET/ORD implementations, root/package/lock/config, existing DB/env and uploads.
- Existing dependency tree reused via node_modules symlink to the CAT worktree; no install or package change.
  JavaScript/ESM, existing mysql2/Express, DB-FND-001, AUTH guards/Origin, HTTP-FND-001 unchanged.
- Schema is staged outside automatic discovery under cart/schemas/. Tests explicitly apply it through
  runMigrations(), verifying fresh and baseline-upgrade ordering/FKs without changing owner histories.
  No manifest, production mock/default reader, cart application route or real CAT adapter exists.

### Exact commands and final observations

Commands below ran in /home/tarek/.codex/worktrees/cart-backend/Press-Store except the explicitly named
temporary source mirror. Unrestricted execution was approved where Vite writes/loopback/MySQL required it.
No check used server/.env or an existing application database.

| Check | Exact command/procedure | Observed result | Evidence |
|---|---|---|---|
| Focused CART unit | node --test server/src/features/cart/services/cart-input.test.js | PASS 5/5, 1 suite, no failures/skips | /tmp/press-cart001-focused-unit-final.log |
| Prescribed unit selector | npm run test -- cart | PASS reported 37/37 at initial four-unit stage; includes unrelated unselected-file wrappers and one matched UI case, not 37 CART tests | execution output; superseded CART count is 5 direct tests above |
| Focused CART MySQL/API | FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- cart | PASS 14 real CART cases in 2 suites; runner reports 27 pass including 13 unrelated unselected-file wrappers; zero failures/cancellations/skips | /tmp/press-cart001-focused-integration-final.log |
| Full unit | npm run test | PASS 166/166, 34 suites, no failures/skips | /tmp/press-cart001-full-unit-final.log |
| Full actual-MySQL integration, non-hidden exact-source mirror | FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration | PASS 109/109, 20 suites, zero failures/cancellations/skips | cwd /tmp/press-cart001-verification-0ne_ipdo; /tmp/press-cart001-mirror-full-integration.log |
| Lint | npm run lint | PASS exit 0 | command output, final run after source review |
| Build | npm run build | PASS exit 0, Vite 8.3.5, 78 transformed modules | /tmp/press-cart001-build.log |
| Whitespace/scope | git diff --check plus review of all tracked diffs and every new CART source/test/SQL file | PASS; changes limited to CART source and named docs | final git status/review |
| Typecheck | No typecheck script exists in package.json | NOT AVAILABLE; no TypeScript migration added | unchanged script surface |
| Original documentation validator | python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py . | exit 2: file absent, BLOCKED / NOT RUN; no substitute used | observed missing-file error |
| Production-path diagnosis, no features | node /tmp/press-cart001-production-check.mjs | Default .codex dist root => 500/no React root; identical build in non-hidden temporary root => 200/React root; /api/v1/cart => 404 in both, zero manifests | /tmp/press-cart001-production-check.log |
| Host cleanup | ps -C mysqld -o pid,uid,args and temporary-fixture directory inventory after tests | Only unrelated /usr/sbin/mysqld PID 1713 UID 124; no /tmp/press-fnd002-mysql-* roots or disposable processes; production-check temporary directory removed | approved host inventory; system server untouched |

The source mirror was generated by /tmp/press-cart001-source-mirror.py: copied 283 tracked-source/new
CART files byte-for-byte and reused the unchanged dependency tree and built dist. Snapshot SHA256
55ab4e7d8432fe22020e5c4227c6b1974dc30f037226afa811a19a77a5ec7359 covers ordered file names and
bytes, before this final evidence-only annotation. No source/test change occurred between mirror creation
and full integration. This mirror run is not a pass of the worktree-path-specific static serving behavior.

### Behavior actually exercised

- Unique lazy cart under concurrent first reads; one row per variant; add/merge/patch/remove/clear;
  no-op semantics and current-version conflict response before mutation.
- Quantity 1–99, maximum 100 distinct lines, existing-row merge at capacity, safe exact totals,
  over-limit and version-exhaustion rollback, no partial writes on late database failure.
- Real AUTH session guard, anonymous/admin/duplicate-cookie/expired-session rejection, self-owned
  resources, other-account isolation and no caller owner/price/availability override.
- Strict query/body/ID validation, JSON requirements, same-origin/Fetch-Metadata rejection and configured
  production Origin despite spoofed forwarded headers. Canonical safe envelopes, no-store/no new cookie.
- Real logout/login and reconstruction of the MySQL pool preserve the customer cart.
- Real MySQL unique/check/FK constraints and preserved pre-existing owner data during staged upgrade.
- Test-only catalog batch injection receives the existing transaction, updates cached display prices,
  retains unavailable rows, rejects unavailable additions/updates and fails closed on malformed/missing
  provider data. This is explicitly NOT evidence of live CAT changes or full READ-CAT-001 consistency.
- No stock fields or CAT writes; no frontend, readiness calculation, order creation or ORD handoff.

### Failed attempts retained; not reported as passes

1. Initial sandbox npm run test -- cart: Vite could not write .vite-temp (EROFS); approved unrestricted
   rerun passed. A direct sandbox test invocation reported only a file wrapper and is not used as unit evidence.
2. First full integration, /tmp/press-cart001-full-integration.log: 107 total, 95 pass, 2 fail, 10 cancelled.
   Auto-discovered CART SQL sorted after a CAT test's assumed fixed migration prefix; its second step
   correctly stopped with MIGRATION_OUT_OF_ORDER. Production tests also lacked dist/index.html before build.
   Resolved entirely inside CART scope by staging SQL outside discovery while real linking is stopped;
   tests apply it explicitly, without editing FND history, bypassing ordering or changing CAT tests. Build passed.
3. Next worktree full integration, /tmp/press-cart001-full-integration-final.log: 109 total, 107 pass,
   2 fail, no cancellations/skips. Expired-session fixture had moved expiry before creation, correctly
   violating AUTH's time constraint; fixed via AUTH's existing clock injection, not by changing constraints.
   Remaining FND production HTML failure is independently reproduced with zero feature manifests and
   isolated to hidden .codex build-root serving. No FND change authorized or made. Final focused CART
   rerun passes all 14; final full non-hidden source-mirror rerun passes all 109.

### Disposition

CART-001 is blocked/incomplete, CART feature 0/4, BE 0/2 complete. Independent portion verified only.
Real CAT owner batch contract/adapter, manifest activation and staged migration registration remain
explicitly stopped by user; original documentation validation remains BLOCKED / NOT RUN.
Worktree-path production static serving remains an observed environmental limitation, not a claimed pass.
No required feature Passed checkbox changed, no completion/checkpoint commit, push, merge, deployment,
application DB/env access, CART-002 or next task. Planned completion subject remains informational:
feat(CART-001): add persistent customer cart APIs. Completion commit: None.


## CART-001 real backend activation appendix — 2026-11-06

### Authorization, scope and current contract

The user selected remaining item 1 after the independent stage: complete CART-001's CAT batch
service binding, routes and migration activation. CART-DEC-004 and CAT-DEC-012 supersede the
previous real-linking stop. Earlier results/decisions remain historical, not rewritten.

Selected task remains CART-001 / WS-CART-BE, branch work/CART-backend at the approved a6603ca
baseline with the existing local CART work preserved. FND/AUTH accepted development prerequisites
and the approved CAT snapshot remain the baseline; no formal CAT-006 or feature/INT gate is waived.

Owned code is server/src/features/cart/** plus the specifically authorized CAT amendment:
services/catalog.js, repositories/catalog.js, new catalog-variants unit/integration tests and
only the historical-prefix selection in routes/catalog-admin.integration.test.js. CAT owns
READ-CAT-001 in its technical contract; CART's manifest consumes it on the caller transaction.
Named owner/consumer and delivery docs/requirement evidence pointers are updated together.
No src/**, AUTH/FND implementation, dependency/lock/config, old migration, other worktree or
existing application DB/env source changed. No branch merge, remote write or deployment.

The SQL moved into normal migration discovery byte-for-byte with SHA256
5e138e7a5c07866c02244e2f1dc29121654020fe99afa72e1f7ca687c8c9a192. No old history changed.
Fresh and upgraded disposable fixtures apply it through the unchanged FND runner. The bounded
CAT admin fixture now applies the complete prefix before its withheld cat_004 upgrade, then
all discovered migrations; out-of-order protections are retained rather than bypassed.
The discovered app verifies startup does not change migration history.

### Final commands and observed evidence

Commands run in /home/tarek/.codex/worktrees/cart-backend/Press-Store unless noted. MySQL and
Vite commands were explicitly approved outside the sandbox where required; only newly created
disposable databases and temporary upload roots were used. No server/.env/application DB access.

| Check | Exact command/procedure | Final observation | Log/artifact |
|---|---|---|---|
| Focused boundaries | node --test server/src/features/catalog/services/catalog-variants.test.js server/src/features/cart/services/cart-input.test.js | PASS 10/10, 2 suites, no failures/skips | /tmp/press-cart001-wired-focused-unit-final2.log |
| Focused real MySQL/HTTP | FND_DISPOSABLE_MYSQL_TESTS=1 node --test server/src/features/catalog/services/catalog-variants.integration.test.js server/src/features/cart/routes/cart-catalog-live.integration.test.js server/src/features/cart/routes/cart-core.integration.test.js | PASS 21/21, 4 suites, no failures/cancellations/skips | /tmp/press-cart001-wired-focused-integration.log |
| Full unit | npm run test | PASS 171/171, 35 suites, no failures/skips | /tmp/press-cart001-wired-full-unit-final.log |
| Full actual-MySQL integration | FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration | PASS 116/116, 22 suites, zero failures/cancellations/skips | cwd /tmp/press-cart001-wired-verification-yt7me0n2; /tmp/press-cart001-wired-full-integration-final.log |
| Lint | npm run lint | PASS exit 0 after final source review | /tmp/press-cart001-wired-lint-final.log |
| Build | npm run build | PASS exit 0, Vite 8.3.5, 78 modules | /tmp/press-cart001-wired-build.log |
| Diff/whitespace | git diff --check plus explicit new-file whitespace/scope review | PASS; 12 new CART/contract files checked, no trailing whitespace | final review/status |
| Typecheck | No typecheck script exists | NOT AVAILABLE; existing JavaScript stack unchanged | package script surface |
| Original docs validator | python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py . | exit 2, original file absent; BLOCKED / NOT RUN, no substitute | observed missing-file output |
| Host cleanup | ps -C mysqld -o pid,uid,args plus directory inventory after final tests | Only unrelated /usr/sbin/mysqld PID 1713 UID 124; no disposable MySQL roots/processes or press-cart001-live-images directories | approved read-only host inventory |

Final source mirror contains 287 tracked/new task files, byte-verified against the worktree,
plus the unchanged dependencies and built dist. Snapshot SHA256 over ordered file names/bytes:
1c20d489d74395709bd62704957a326442b9204774a7c3b4fdcbe624ab167ac0. Metadata:
/tmp/press-cart001-wired-mirror.json. Only evidence documentation changed after this final
source snapshot. The non-hidden mirror is required because the earlier independently proved
FND static-page serving failure remains with a .codex build root; no FND fix is authorized.
This mirror pass is not a pass of that worktree-path-specific behavior.

### New real contract coverage and second pass

Five live scenarios start the actual app using normal manifest discovery (no catalog read fixture),
real AUTH registration/sessions and CAT admin HTTP APIs. They verify customer-only CRUD/isolation,
current exact price after admin edit, retained inactive and soft-deleted variants, unknown variant
rejection, safe removal, concurrent same-version writers, CSRF and owner/price overrides, plus
real logout/login and full application/database-pool restart persistence. Existing 14 independent
CART cases remain explicitly fixture-injected fault/limit/rollback evidence, not reclassified as live CAT.

Two CAT actual-MySQL cases prove a 100-ID batch uses one domain query and sees transaction-local
price/deletion changes that roll back with the caller. Unit tests reject malformed/duplicate/sparse/
oversized ID arrays before SQL and forbid separate queries/nested transactions. Existing exact
price calculation is reused; no stock field or stock write added.

Re-read CART-001 and AC-CART-001, the feature ownership/API contracts and approved amendment.
Reviewed the complete pre-existing CART diff, every new manifest/service/test and CAT owner delta
for session-derived actors, parameterization, bounded reads, exact money/overflow rollback, variant
history, error envelopes, transaction reuse, no production mocks, debug artifacts and scope drift.
Reviewed immutable SQL checksum and upgrade ordering. Source review tightened sparse-array ID
validation with Array.from and added that boundary case; final focused/full unit and full integration
were rerun after it. Final full source mirror was stable during the final run. No independent agent
review is claimed. This is a backend task check, not FE/browser/full-feature or CAT-006 acceptance.

### Earlier attempts and remaining disposition

The restricted direct-unit invocation reported only two file wrappers with no test suites and is
not used as behavioral evidence; approved unrestricted execution ran all ten actual tests.
An earlier full integration run also passed 116/116 before the final boundary hardening; only
the final stable-source run above is used for closeout. All earlier independent-stage failures
and the worktree-path FND limitation remain recorded in the preceding appendix.

Real CAT linking, route discovery and migration registration blockers are resolved. Original
mandatory documentation validation remains BLOCKED / NOT RUN: CART-001 stays blocked, feature
0/4 and BE 0/2 complete, completion commit None. Planned subject remains
feat(CART-001): add persistent customer cart APIs. No acceptance Passed box is promoted;
CART-002 (including CAT-006 dependency), checkout readiness, ORD handoff, FE/INT, production
DB migration, commit/checkpoint, push, PR, merge or deployment is claimed/started.


## CART-002 verification appendix — 2026-11-06 early backend development

### Approved preflight and source scope

User explicitly approved the proposed development exception and CAT checkout-lock amendment.
CART-DEC-005/CAT-DEC-013/ORD-DEC-003 document that authorization. Selected task CART-002, lane
WS-CART-BE, expected/current branch work/CART-backend. The existing uncommitted verified CART-001
and CAT-DEC-012 work was inventoried and preserved. CART-001/CAT-006 formal completion and the
original documentation gate are not waived. This is not a new frozen integration baseline.

Owned runtime delta for this task: new cart/services/checkout-carts.js; added checkout methods in
cart/repositories/carts.js; bounded CAT checkout service/repository method and shared validation/
projection helpers preserving the display method; new cart-checkout unit/MySQL tests and two CAT
locking unit cases. CART/CAT canonical and ORD consumer docs plus named delivery/requirement
pointers are coordinated. No ORD implementation, HTTP endpoint, FE, AUTH/FND implementation,
new schema/migration, dependency/lock/config, old migration, other worktree or existing DB/env edit.

Before-source copies of the three extended runtime files are under /tmp/press-cart002-before.
Their SHA256 values before this task were: cart repository
793437c1962eb01c54775dc9ecde05eaf4cd3cc32c67e90229bc406adfd7aafb; CAT repository
75c2679944349defca27ebcf0717ed99173aa0ed4ac775d2828c802cd811b2cd; CAT service
5e37e588c1eae76d5199e6533c7dd4924cb0197a080b694a13ba97fd732da9c6.
Reviewed task-only comparisons against those copies alongside the complete worktree diff.

Acceptance scope: AC-CART-002 backend current price/availability, rejection of empty/unavailable
carts, exact version and transaction-bound clear, customer isolation, rollback and concurrency
without stock mutation. Public CRUD remains unchanged; full feature/browser/ORD integration is not run.

### Exact commands and observed final results

Default cwd /home/tarek/.codex/worktrees/cart-backend/Press-Store. MySQL and Vite commands were
approved outside sandbox where needed. Only fresh disposable MySQL fixtures and synthetic
customer/product data were used; server/.env and existing application DBs were not accessed.

| Check | Exact command/procedure | Observed result | Evidence |
|---|---|---|---|
| Focused unit/contracts | node --test server/src/features/cart/services/cart-checkout.test.js server/src/features/catalog/services/catalog-variants.test.js | PASS 13/13, 3 suites, zero failures/skips; includes six new CART and two new CAT cases plus five existing display-contract cases | /tmp/press-cart002-focused-unit.log |
| Focused actual MySQL | FND_DISPOSABLE_MYSQL_TESTS=1 node --test server/src/features/cart/services/cart-checkout.integration.test.js | PASS 13/13, 1 suite, zero failures/cancellations/skips | /tmp/press-cart002-focused-integration.log |
| Full unit | npm run test | PASS 179/179, 37 suites, no failures/skips | /tmp/press-cart002-full-unit.log |
| Full actual-MySQL integration | FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration | PASS 129/129, 23 suites, zero failures/cancellations/skips | cwd /tmp/press-cart002-verification-j88k46z_; /tmp/press-cart002-full-integration.log |
| Lint | npm run lint | PASS exit 0 | /tmp/press-cart002-lint.log |
| Build | npm run build | PASS exit 0, Vite 8.3.5, 78 modules | /tmp/press-cart002-build.log |
| Diff/new-file review | git diff --check plus all 15 new CART/CAT contract files scanned for whitespace | PASS, no trailing whitespace or scope drift | final review/status |
| Typecheck | No script exists | NOT AVAILABLE; existing JavaScript stack unchanged | package script surface |
| Original docs validator | python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py . | exit 2, original file absent; BLOCKED / NOT RUN, not waived or replaced | observed missing-file error |
| Host cleanup | ps -C mysqld -o pid,uid,args and test-directory inventory | Only unrelated /usr/sbin/mysqld PID 1713 UID 124; no disposable MySQL roots/processes or cart live-image roots | approved read-only host inventory |

The non-hidden source mirror is byte-verified for 290 tracked/new task files, unchanged dependencies
and the built dist. Snapshot SHA256 over ordered names/bytes:
c39f21c1021b77e32516d3b787ea2f191c58d353462ade0b6563de24b90917b8. Metadata at
/tmp/press-cart002-mirror.json. Runtime/test source stayed unchanged through the final full run;
only final documentation annotations follow that snapshot. This avoids the previously reproduced
FND .codex build-root static-serving issue without editing FND or claiming that path behavior passes.

### Actual behavior and concurrency proofs

- The trusted service receives only the caller transaction; no pool handle, separate transaction
  or HTTP session override. Customer identity/version inputs and limits are validated. Missing/
  empty/other-customer carts do not mint a snapshot or lazily create a checkout cart.
- Frozen snapshots use CAT current final unit price and product metadata; exact base/final sums
  are bounded safe JSON integers. Free discounts work; unsafe base subtotal rejects without clear.
- Shared CAT product locks precede variant locks. Competing real FOR UPDATE NOWAIT probes against
  cart, product and variant rows fail while the handoff holds them; identical queries succeed after
  outer commit. This confirms blocking/release rather than a SQL syntax/privilege failure.
- An existing old consistent-read snapshot does not supply stale prices: a separate CAT owner
  service commits a price change, then checkout's current locking reads observe the new value.
  Removed variants and soft-deleted products reject readiness with VARIANT_UNAVAILABLE.
- Original snapshots are bound by WeakMap to service instance and transaction; cloned, forged,
  cross-transaction, cross-instance, replayed and finished-transaction use cannot clear a cart.
- Clear checks owner/cart/version, increments version once and deletes that cart's rows in the
  caller transaction. A consumer exception after clear restores the full cart/version. A later
  caught SQL constraint failure still prevents commit and restores it under DB-FND-001.
- An old-tab mutation conflicts after consumption. A mutation committed first makes readiness
  reject the stale version. No updates are lost or silently applied to a newer cart.
- A 100-line cart read uses exactly five domain queries: cart, items, parent mapping, products,
  variants. No N+1 catalog reads, numeric inventory, CAT write or ORD row is introduced.

Re-read CART-002/AC-CART-002 and all linked caller/owner contracts after implementation. Reviewed
complete prior/new source and docs for money, ownership, bounded SQL, lock order, stale snapshots,
rollback, expired transaction handles, safe errors, debug artifacts and scope drift. Existing
display projections and public CRUD are retained and exercised by the full regression suite.
This is implementation self-review, not an independent agent review.

### Limits, formal status and stop

CART-002 backend code/tests are verified under the explicit development exception. Formal task
completion remains blocked by CART-001/CAT-006 prerequisites and missing original docs validation.
Feature 0/4, BE 0/2 complete; task statuses remain blocked, not ready-for-integration or merge-ready.
Future ORD must compare accepted quotes and persist orders/idempotency before consuming the
original snapshot; no production order/quote/idempotency implementation or end-to-end ORD pass
is claimed. No UI/FE/INT acceptance checkbox, production concurrency/load/proxy/hosting acceptance
or worktree-path FND static-serving pass. No application DB migration, new commit/checkpoint,
push, PR, merge, deployment or next task. Planned subject remains
feat(CART-002): add transactional cart checkout handoff; completion commit None.


## 2026-11-06 — CART checkpoint execution disposition

CART-001 preservation checkpoint is 8209be1bd256d13fbed49f0716bf4638262d1f27; its runtime/test source is the previously verified
CART-001 snapshot (171 full unit / 116 mirror integration). It was staged from that snapshot
without overwriting the current CART-002 worktree.
CART-002 planned checkpoint: chore(CART-002): checkpoint verified transactional cart handoff.
The final runtime/test source retains the 179-unit / 129-mirror-integration and focused proof
evidence in the CART-002 appendix, unchanged for this documentation/Git-only publication.
No application test rerun claimed. Both tasks remain blocked; no completion/validator/feature pass.
Read-only git ls-remote found no origin/work/CART-backend or origin/feature/CART-integration.
Publish the work branch non-force; do not create the missing integration baseline or choose an
alternate PR target. Branch-plan's PR policy remains required for later remote integration.
Actual second hash and push verification are reported after execution, with no circular follow-up commit.

## ORD-001 verification appendix — 2026-11-07

### Commands and observed results

| Check | Exact command | Observed result |
|---|---|---|
| Focused ORD unit | `node --test --test-isolation=none server/src/features/orders/domain/orders-state.test.js server/src/features/orders/domain/orders-snapshots.test.js` | Exit 0, 15/15 passed in 2 suites |
| Focused ORD MySQL | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/orders/domain/orders-domain.integration.test.js` | Exit 0, 8/8 passed in 2 suites on local disposable MySQL 8.4.11 |
| Lint | `npm run lint` | Exit 0 in the worktree |
| Full unit | `npm test` | Exit 0, 194/194 passed in 39 suites in the source mirror; existing jsdom canvas notices did not fail tests |
| Build | `npm run build` | Exit 0, Vite built 78 modules in the source mirror |
| Full integration | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration` | Exit 0, 137/137 passed in 25 suites, 0 skipped, in the source mirror with its built assets |
| Diff whitespace | `git diff --check` | Exit 0 |
| Original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2, original script missing; validation blocked |

The non-hidden source mirror at `/tmp/press-ord001-verify-opqhz0j6` avoids the known FND
static-serving issue under the hidden worktree path. The 299 tracked and unignored task files
were copied and byte-compared before the build. The pre-evidence manifest SHA-256 was
`a7585c3b39e70a38ad8b41f4a608caa3e7dd2b4058de496da4f432568b54589a`.
Only evidence documentation changed after mirroring. The sandbox command
`FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- --help` reported 18 file wrappers
and 0 suites, so it is excluded from pass counts. Typecheck has no package script or project
configuration in this JavaScript baseline.

### Exercised behavior and remaining gates

Reviewed ORD-001, linked acceptance criteria, SQL, domain, tests and the documentation diff.
The focused tests covered method-specific payment and fulfillment, unchanged achieved repeats,
invalid actors/versions, exact money and immutable snapshots. Disposable fixtures proved fresh
DDL, upgrade and no-op rerun with original checksums/data, duplicate-key concurrency, customer
ownership, catalog edit/soft-delete retention, audit guards and transaction rollback.
The normal runner in the full suite excluded the pending ORD SQL. The unchanged CART upgrade
test passed with that normal discovery path. ORD applied its SQL only through explicit fixture
lists. Production migration permissions and ordinary ORD activation remain unverified.

ORD-001 remains blocked on activation under ORD-DEC-005 and the missing original validator.
Feature acceptance checkboxes remain open. A-001 and downstream checkout, APIs and expiry
verification remain separate. Completion commit: None. Next ready BE task: None.

### 2026-11-07 activation reproduction

Copied the three ORD SQL files into normal discovery in a disposable source copy only and
byte-compared the CART test to the worktree. Ran the command below with disposable MySQL.

```sh
FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none --test-name-pattern='cart migration upgrade and discovery isolation' server/src/features/cart/routes/cart-core.integration.test.js
```

Exit 1, 0 passed and 1 failed with `MIGRATION_OUT_OF_ORDER` at the second migration run.
The CART fixture applies every discovered migration except CART as its starting history, so it
records ORD ahead of CART. FND then rejects adding CART behind already-applied migrations.
A CART fixture fix would bound both lists to the historical CART target. Keeping the fixture
unchanged per ORD-DEC-005 leaves ORD activation blocked. The worktree SQL stays in `pending/`.
The mandatory docs validator was attempted again and exited 2 because the original file is absent.

### 2026-11-07 ORD-001 user acceptance

ORD-DEC-006 supersedes the earlier blocked status for task tracking only. `git diff --check`
passed, and the ORD source and tests matched the verified mirror byte for byte. No code tests
were rerun for this documentation update. The original validator command again exited 2 because
the script was absent. The observed activation failure and integration gates remain open.
Completion commit: None.

### 2026-11-07 ORD-001 checkpoint preparation

ORD-DEC-007 authorizes one checkpoint and a non-force push of `work/ORD-backend`.
Source/tests match the verified mirror; `git diff --check` passed and no new code tests ran.
The original validator invocation exited 2 because the script was absent. A read-only
`git ls-remote --heads` found neither `work/ORD-backend` nor `feature/ORD-integration`.
The actual checkpoint hash and remote result are reported after execution.

## 2026-11-07 — CART historical upgrade fixture

| Check | Exact command or procedure | Result |
|---|---|---|
| Focused upgrade on CART | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none --test-name-pattern='cart migration upgrade and discovery isolation' server/src/features/cart/routes/cart-core.integration.test.js` | Exit 0, 1 passed |
| CART integration with later migrations discoverable | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/cart/routes/cart-core.integration.test.js server/src/features/cart/routes/cart-catalog-live.integration.test.js server/src/features/cart/services/cart-checkout.integration.test.js` | Exit 0, 32 passed, 0 failed, 0 cancelled, 0 skipped |
| Lint and whitespace | `npm run lint` and `git diff --check` | Exit 0 |

The isolated composition used ORD checkpoint 59861e6, the patched CART test byte-for-byte,
and SET checkpoint 0ac8db7 for settings and its approved runtime files. The copy exposed
SET and all three ORD SQL files to normal discovery. The first combined run passed the
upgrade and other database checks but cancelled five app tests because the SET manifest
support was absent from the copy. Adding the published FND registry and CAT admin route
files from SET to the copy resolved that setup failure. No merge, SQL change, or runtime
change was made in the worktree. The fixture retains its existing data-preservation and
no-op repeat assertions. CAT-006 and ORD integration remain open.
The original docs validator exited 2 because its script was absent. The user later authorized
publishing the verified test correction as a checkpoint under CART-DEC-008.

## SET-001 — Singleton Settings Backend Verification — 2026-11-04

**Authorization:** SET-DEC-002/003 approve SET-001-only early development on work/SET-backend from published a6603ca5f2b5eb54b75e530906cee42821ec371e, provisioning/mobile/social policy and bounded FND/CAT composition changes (FND-DEC-012/CAT-DEC-009). A-004 confirmed; A-013 records transport/storage bounds. No frozen integration baseline, dependency/validator waiver, frontend, next task or publication implied.

| Check | Exact command / procedure | Observed result |
|---|---|---|
| Focused SET + FND manifests | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/settings/services/settings.test.js server/src/features/settings/routes/settings.integration.test.js server/src/app/foundation-manifests.test.js > /tmp/press-set001-focused-final.log 2>&1` | Exit 0; 37 passed, 6 suites, 0 failed/cancelled/skipped |
| Full unit | `npm run test > /tmp/press-set001-full-unit.log 2>&1` | Exit 0; 169 passed, 35 suites, 0 failed/cancelled/skipped |
| Full integration final | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration > /tmp/press-set001-full-integration-final.log 2>&1` | Exit 0; 104 passed, 20 suites, 0 failed/cancelled/skipped |
| Lint | `npm run lint > /tmp/press-set001-lint.log 2>&1` | Exit 0 |
| Build | `npm run build > /tmp/press-set001-build.log 2>&1` | Exit 0 |
| Diff | `git diff --check` | Exit 0 |
| Required original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2; prescribed script missing, BLOCKED / NOT RUN. No substitute installed or acceptance requirement changed. |
| Typecheck | package.json inspection | No typecheck script; existing JavaScript/ESM unchanged. |
| Host cleanup/preservation | Read-only process and exact /tmp fixture inventories, CAT git status and stash list | Only unrelated /usr/sbin/mysqld PID 1718 UID 124; no press-fnd002-mysql-* / press-cat003-images-* / press-cat001-images-* directories. CAT worktree remains clean; both original stashes preserved. System MySQL untouched. |

All commands ran in /home/tarek/projects/Press-Store-SET-backend. Integration/subprocess suites ran outside sandbox against newly created disposable MySQL only, never an existing application database. No server/.env read, dependencies/lockfile changed, frontend implementation, Git commit/push/merge/deploy. Existing CAT node_modules is linked for test/build reuse; generated output is ignored.

**Observed coverage:** Feature migration discovery, upgrade after existing AUTH/CAT schema/session data, rerun; MySQL singleton PK/CHECK/version enforcement. Missing public/admin state 503 without auto-seeding, nonzero PUT cannot provision missing record. Two concurrent version-0 PUTs yield one 200/one 409 and one row; two same-version updates yield one 200/one 409 with exactly one version increment. Four strict canonical phones; Wallet EG/InstaPay independently accept distinct/equal values. Optional social clearing and approved HTTPS hosts; invalid protocol/host/credentials/port/unknown fields/versions/phones rejected without changing prior configuration.

Public SQL/DTO contact/social only, internal contact excludes social/payment/version and internal payment returns exactly one chosen number. Cash avoids settings DB reads; selected unavailable destination fails without falling back to another value. Synthetic repository extras/corrupted persisted social data do not escape projections. Actual HTTP responses/log capture exclude payment numbers, session tokens and credentials. FND safe errors do not echo supplied values/SQL/driver messages.

SET admin requires valid scoped session; absent/expired 401 and customer-only 403. Actual CAT resources remain guarded. Session-query counting shows SET requests authenticate once through their own mount rather than traversing CAT. No cookie issuance/clear by settings. Origin/JSON/unknown-query rejection precedes mutation; production accepts only configured HTTPS Origin despite different request Host/forwarded host. Full-field settings remain unchanged after injected failure following an actual SQL UPDATE, confirming transaction rollback; error remains canonical safe 500. Settings and existing admin session survive actual server/pool recreation.

**Failure history / resolution:** Initial full integration command `/tmp/press-set001-full-integration.log` exited 1: 94 passed, 10 cancelled by the CAT admin suite's failed setup, no skipped cases. Its fixture excluded cat_004 but included newer SET migration; adding cat_004 afterwards correctly triggered MIGRATION_OUT_OF_ORDER before upgrade. Changed only that test's initial migration list to the ordered prefix before cat_004, then reran all integration tests on entirely new disposable fixtures. Did not weaken FND validation, edit an existing SQL migration/history, retry/repair a deployed DB or silently skip CAT tests. Source review additionally rejected trailing-whitespace mount paths and added production Origin coverage; final focused/full results above are authoritative.

**Second pass:** Re-read SET-001 and AC-SET-001/002 backend boundaries; reviewed new SQL, input/repository/service/routes/manifest/tests and narrow FND/CAT diff. Verified parameterized closed-identifier SQL, numeric version CAS/provisioning races, safe projection construction, host/key allowlist, actor/Origin boundaries and no payload logging. Multi-segment manifests still reject duplicate/reserved/traversal/encoded/parameter/trailing paths before attaching/factories; existing parent-prefix composition remains ordinary fall-through. Source ownership is server/src/features/settings/** plus approved FND manifest-loader/test and CAT router/fixture changes; owner docs/assumptions/delivery records updated. No unrelated source or frontend modifications. No independent review is claimed.

**Disposition / handoff:** SET-001 implemented/tested, formal status blocked on original mandatory docs validator; SET remains 0/3, both feature Passed boxes unchecked. Planned subject feat(SET-001): add store settings contracts; commit None. Source is local on work/SET-backend, original checkouts preserved. Full footer/form/browser/ORD/CUS integration, normal frozen baseline/owner acknowledgement, production hosting/engine/migration/recovery/security acceptance remain separate/unrun. Existing FND global migration ordering was retained; future deployment migration strategy changes need independent approval. No SET-002/SET-003 or next backend task started. Review SET contracts §14, SET-DEC-002/003 and approved FND/CAT seams against this evidence; no publish/merge/deploy authorization inferred.


## SET-001 — User-Accepted Backend Task Closeout — 2026-11-06

SET-DEC-004 records explicit user-requested closeout after the code/evidence and missing mandatory validator were explained. SET-001 done by acceptance for task tracking; backend 1/1, feature 1/3. Prior actual evidence remains 169/169 unit, 104/104 isolated integration and lint/build/diff pass, with initial fixture-order failure and correction preserved. No new code test/lint/build run for this docs-only update.

Bounded closeout checks: source/test/package hashes unchanged; SET-001 row done, SET-002/003 rows not-started; count 1/3, two feature Passed boxes unchecked, feature in-progress. Git diff whitespace check pass. This is manual consistency verification, not a substitute for the prescribed docs validator. Original validator command still exits 2 because the script is missing: BLOCKED / NOT RUN. No requirement, full privacy/FE/browser/consumer/integration/hosting/recovery/security/merge/release gate marked passed or waived.

All SET implementation and approved shared changes remain local/uncommitted; completion commit None. CAT/AUTH worktrees and stashes unchanged in scope. No source/DB/env/frontend work, independent review, commit/push/merge/deploy or next task performed. Earlier blocked statements are historical and superseded only for SET-001 task tracking.


## 2026-11-06 — User-authorized SET-001 checkpoint publication

The user explicitly requested uploading SET and HOME to GitHub. SET-DEC-005 authorizes one preservation checkpoint for SET-001 and non-force push of work/SET-backend to origin, separately from the other worktree. Planned subject: `chore(SET-001): checkpoint verified store settings APIs`. SET-001 remains done by user acceptance SET-DEC-004, feature 1/3, BE 1/1 accepted. Original required docs validation remains BLOCKED / NOT RUN; all full feature/FE/INT/hosting/recovery/security/merge gates and unchecked acceptance boxes remain unchanged.

Existing observed verification: 169 unit / 104 isolated integration, lint/build/diff passed, no failed/cancelled/skipped tests. No new code checks claimed during this docs/Git-only publication. Include only this task's source/tests/approved shared-owner amendments/docs. Preserve original CAT/AUTH and the other feature's work; no frontend, DB/env access, PR/merge/deployment or next task. The resulting checkpoint hash and observed push result are reported after execution rather than invented in a self-referencing follow-up commit. Earlier local/uncommitted/no-publication statements remain historical, superseded only for this authorized publication.

## HOME-001 — Homepage Content and Atomic CAT Curation Verification — 2026-11-06

**Scope/authorization:** HOME-001 only, early CAT-derived baseline a6603ca5f2b5eb54b75e530906cee42821ec371e on work/HOME-backend. User explicitly approved HOME-DEC-002: reuse four already approved FND/CAT composition files from SET, extend CAT-owned bounded read/atomic list/revision commands with additive migration, 1–3 active hero rule, nullable disabled/absent banners including banner1 and internal product/filter CTA policy. CAT-DEC-011 owns CAT changes, FND-DEC-012/CAT-DEC-009 remain the reused source seams. A-014 records transport/order bounds. SET source/migration is not imported; original CAT/SET/AUTH work remains separate and untouched. Full tests below cover all source present in this approved HOME branch, not an unperformed merged SET integration.

| Check | Exact command / procedure | Observed result |
|---|---|---|
| Focused HOME/MySQL | `FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/homepage/services/homepage.test.js server/src/features/homepage/routes/homepage.integration.test.js > /tmp/press-home001-focused-final.log 2>&1` | Exit 0; 15 passed, 2 suites, 0 failed/cancelled/skipped |
| Full unit final | `npm run test > /tmp/press-home001-full-unit-final.log 2>&1` | Exit 0; 168 passed, 35 suites, 0 failed/cancelled/skipped |
| Full integration final | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration > /tmp/press-home001-full-integration-final.log 2>&1` | Exit 0; 105 passed, 19 suites, 0 failed/cancelled/skipped |
| Lint | `npm run lint > /tmp/press-home001-lint.log 2>&1` | Exit 0 |
| Build | `npm run build > /tmp/press-home001-build.log 2>&1` | Exit 0 |
| Diff | `git diff --check` | Exit 0 |
| Required original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2; original script missing, BLOCKED / NOT RUN. No replacement or invented pass. |
| Typecheck | package.json | No typecheck script; project stays JavaScript/ESM. |
| Host cleanup | Read-only ps and exact /tmp fixture inventories after final runs | Only unrelated /usr/sbin/mysqld PID 1713 UID 124. No press-fnd002-mysql-* / press-home001-images-* / press-cat003-images-* / press-cat001-images-* roots remain. System service untouched. |
| Preservation / source transfer | CAT/SET status, stash list, SHA-256 and package diff | Original worktree changes and both original stashes preserved. FND loader copy hash de72b67f1d0fbb7f1eb75bf6486756dbeb529e8dd2352707b184245b8af83932 and CAT router copy hash 6e807fa4c508e7aeee8f78f8f803d705b87414c0c7db7bfc90a73d53c671b017 equal their SET sources. No dependency/lockfile change. |

**Observed API/security/content coverage:** Actual startServer/runtime with the one lifecycle DB and explicit new temporary upload root; explicit migration upgrade from pre-cat_005 prefix to all new CAT/HOME migrations and rerun. Public unconfigured homepage 503, initial inactive hero rejected with no persisted files, first valid active image creates version 1. Fixed public key order, active safe slide DTOs, bounded CAT categories/curated products, no private version/path/token/hash fields. Anonymous admin 401/customer-only 403, valid admin precedence with both cookies; cross-origin writes blocked before files. Production configured HTTPS Origin accepted independently of request/forwarded host, wrong Origin rejected, expired session denied while public reads still work. No auth cookie changes by HOME.

Hero tests cover last-active delete/deactivation rejection, competing active creates at the three-slide boundary (one 201/one 409), row-version concurrent update conflicts, ordering, valid inactive lifecycle, image replacement, and cleanup of removed image files after commit. Injected failure after an actual SQL image UPDATE rolls back original metadata/image reference, removes only newly staged file and retains old files. Stale update/multiple-image requests do not leave extra files. Unit compensation/post-commit cleanup failure proves committed new files stay present and responses expose only cleanupPending, not internal paths.

Banner tests create both fixed slots, show active text, disable either to null, reject third slot and stale CAS, and allow one of two competing edits. Curation tests atomically choose eight, reject ninth/missing/duplicate IDs without state change, allow one same-revision whole-set writer and reject stale competition. Real CAT create/update/setFlags/delete mutations advance list revision on membership change, so stale HOME replacement fails. Unavailable canonical selections are private but excluded from public purchase display; deletion clears flags/revision and public data. Injected failure after the first actual flag UPDATE rolls back all flags and list revision. Content/selection state survives real HTTP server and DB-pool recreation.

**Second-pass validation fixes:** Initial focused/full runs already passed. Source review found encoded CTA output could exceed the 2048-character storage bound even when raw Unicode input fit, and JavaScript dollar-end regex anchoring could admit trailing line separators in IDs. Added normalized output/control checks to HOME CTA validation, exact BigInt string round-trip validation to HOME IDs and the new CAT bulk command, plus regression assertions (including 100 emoji size + 100 emoji color, newline IDs and links). Repeated focused/full checks after those source changes: final logs above are authoritative. No false failing-test history is invented; these were review-discovered gaps fixed before final verification. No claim is made of rewriting all legacy CAT validation.

**Source/ownership review:** Re-read HOME-001 and backend portions of AC-HOME-001/002. Reviewed all HOME SQL/input/repository/service/router/manifest/tests, CAT revision/read/replace/legacy-writer diff, and reused FND/CAT source seams for exact validation, parameterization, lock ordering, conflict behavior, image ownership/cleanup, actor derivation, sensitive/error exposure and source drift. HOME SQL touches only its own tables; CAT SQL stays in CAT repositories behind named read/command services. New migrations only, previous applied SQL files unchanged. No frontend, new pool/dependency/env reader, existing application DB/server/.env access, source publication or unrelated original-worktree edits. This is self-verification, not a claimed independent review.

**Limits / disposition:** HOME-001 implemented/verified locally, formal status blocked by original mandatory docs validator; feature 0/4 and both Passed boxes unchecked. Full FE/carousel/responsive/browser/consumer/CAT/UI acknowledgement, normal frozen baseline/merge, production load/hosting/isolation/migration/recovery/security acceptance remain unrun/separate. Category limit/order and global list revision are documented in A-014/CAT contract. HOME/CAT read snapshots are separate transactions, no global single-instant projection guarantee. Existing FND file compensation does not promise crash/distributed atomicity; cleanupPending/ambiguous commit/orphan inventory need explicit approved reconciliation, no blind retry/job. Global migration ordering/interruption rules are unchanged, no existing DB recovery attempted. Planned subject feat(HOME-001): add homepage content API; completion commit None. No commit/push/PR/merge/deploy or next task. Review handoff: HOME contracts §14, CAT §17, new HOME source, CAT revision/merchandising/legacy writer and reused mount seams against these observed checks.


## 2026-11-06 — User-authorized HOME-001 checkpoint publication

The user explicitly requested uploading SET and HOME to GitHub. HOME-DEC-003 authorizes one preservation checkpoint for HOME-001 and non-force push of work/HOME-backend to origin, separately from the other worktree. Planned subject: `chore(HOME-001): checkpoint verified homepage APIs`. HOME-001 remains formally blocked, feature 0/4; this does not accept or close the task. Original required docs validation remains BLOCKED / NOT RUN; all full feature/FE/INT/hosting/recovery/security/merge gates and unchecked acceptance boxes remain unchanged.

Existing observed verification: 168 unit / 105 isolated integration, lint/build/diff passed, no failed/cancelled/skipped tests. No new code checks claimed during this docs/Git-only publication. Include only this task's source/tests/approved shared-owner amendments/docs. Preserve original CAT/AUTH and the other feature's work; no frontend, DB/env access, PR/merge/deployment or next task. The resulting checkpoint hash and observed push result are reported after execution rather than invented in a self-referencing follow-up commit. Earlier local/uncommitted/no-publication statements remain historical, superseded only for this authorized publication.

## 2026-11-07 — ORD-002 local quote service

| Check | Exact command or procedure | Result |
|---|---|---|
| Quote unit matrix | `node --test --test-isolation=none server/src/features/orders/checkout/checkout-quote.test.js` | 6/6 passed |
| Real owner composition | `FND_DISPOSABLE_MYSQL_TESTS=1 ORD_REAL_SETTINGS_TESTS=1 node --test --test-isolation=none server/src/features/orders/checkout/checkout-quote.integration.test.js` | 3/3 passed on disposable MySQL |
| Full unit | `npm test` on the non-hidden ORD source mirror | 200/200 passed |
| Full integration | `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration` on the non-hidden ORD source mirror with built assets | 137/137 executed tests passed. The opt-in quote suite skipped on this baseline because SET is absent. |
| Lint and build | `npm run lint` and `npm run build` on the ORD source mirror | Both exited 0 |
| Original docs validator | `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .` | Exit 2, original script absent |

The live quote composition used published ORD checkpoint 59861e6, the exact new ORD-002
files, SET owner modules from 0ac8db7, and the CART upgrade test from e5275d4. The test
only used disposable data. It verified all payment methods, selected-only destination,
settings provisioning and destination changes, CAT repricing at the same cart version,
unavailable products, empty and stale carts, and quote reads leaving the cart unchanged.
The checkout API, live feature integration, and ORD-003 confirmation are outside these results.

### 2026-11-07 — ORD-002 isolated HTTP verification

The final isolated suite ran with
`FND_DISPOSABLE_MYSQL_TESTS=1 ORD_REAL_SETTINGS_TESTS=1 node --test --test-isolation=none server/src/features/orders/checkout/checkout-quote.integration.test.js`
and passed 4/4. The temporary FND test app mounted the router with real AUTH sessions and
CART, CAT, and SET services. It verified all payment methods, selected-only destinations,
no-store headers, unchanged carts, safe logs, missing settings, session scope, Origin,
JSON and input guards, empty carts, and stale cart versions. Runtime discovery was unchanged.

The focused quote unit suite passed 6/6. On the non-hidden ORD baseline with the same checkout
files, `npm test` passed 200/200, `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration`
passed all 137 executed tests with the SET-dependent suite disabled, and `npm run build`
passed. `npm run lint` and `git diff --check` passed. The original validator invocation again
exited 2 because its script was missing. The task remains blocked on application mounting and
the formal owner integrations. Completion commit: None.

### 2026-11-07 — ORD-002 application discovery rehearsal

The GitHub head check found no CAT, SET, CART, or ORD integration branch. The original
documentation validator invocation exited 2 because its script was absent. Application
mounting on the actual ORD branch remains deferred.

In a disposable copy at `/tmp/press-ord002-discovery-Jln5Rj`, composed ORD checkpoint
59861e6 and the local quote code with SET checkpoint 0ac8db7 (settings modules and its
approved runtime support) and the CART upgrade fixture from e5275d4. The quote service
and router matched the worktree byte for byte. A temporary ORD manifest used the actual
server discovery path. The quote suite used `startServer` rather than a manually mounted test
router. On disposable MySQL, the following command exited 0 with 36 passed, 0 failed,
and 0 skipped, covering the four quote cases and all 32 CART cases in the same composition.

```sh
FND_DISPOSABLE_MYSQL_TESTS=1 ORD_REAL_SETTINGS_TESTS=1 node --test --test-isolation=none server/src/features/orders/checkout/checkout-quote.integration.test.js server/src/features/cart/routes/cart-catalog-live.integration.test.js server/src/features/cart/routes/cart-core.integration.test.js server/src/features/cart/services/cart-checkout.integration.test.js
```

The manifest and test harness adaptation were confined to the disposable copy. No owner
branch merge, application mounting on the work branch, or acceptance status change occurred.
