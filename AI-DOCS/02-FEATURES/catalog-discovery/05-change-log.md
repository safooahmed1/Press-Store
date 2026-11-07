# Change Log — Catalog and Discovery

## 2026-11-06 — READ-CAT-001 batch consumer amendment for CART-001

CAT-DEC-012 authorizes the additive service/repository projection on the caller transaction,
including retained inactive/deleted-product variants and exact existing price calculation.
Added focused validation/query-bound tests and actual-MySQL transaction-local read/rollback proofs.
Adjusted only the admin migration-upgrade test's historical prefix for later CART discovery.
No CAT HTTP API, frontend, stock model, existing migration/history or other worktree changed.
This does not complete CAT-006 or waive original documentation validation. Evidence: CART-001
real-backend-activation appendix in the delivery verification matrix.

No implementation activity recorded.


## 2026-11-04 — CAT-001 backend domain implementation, completion blocked

Added forward-only catalog schema, exact discounted-money calculations, strict domain validation, classification services, transactional product/image/variant creation, safe availability lookup and storage compensation. Added unit and disposable MySQL integrity tests. CAT-DEC-002/003 and A-010 record authorization/policy/bounds. No routes, frontend, dependencies, application database operations, commit or push. Evidence is in the CAT-001 appendix of verification-matrix; mandatory original docs validator remains BLOCKED / NOT RUN. Earlier planned/no-implementation entry remains historical.


## CAT-001 checkpoint publication authorization — 2026-11-04

The user explicitly requested a commit and push to preserve CAT-001 as a checkpoint. Planned subject: `chore(CAT-001): checkpoint verified catalog domain foundation`, branch `work/CAT-backend`, destination `origin/work/CAT-backend`. Include only CAT-001 source/tests/migrations and its documentation. This is a preservation checkpoint, not a completion commit; original documentation validation remains BLOCKED / NOT RUN and CAT-001 stays blocked. Prior statements that publication was unauthorized are historical and superseded only for this checkpoint. No AUTH changes, CAT-002 start, PR, merge or deployment is authorized. Report the resulting hash and observed push result after execution rather than inventing evidence or making a follow-up hash-only commit.


## 2026-11-04 — CAT-002 public catalog reads

Implemented anonymous product list/detail/category/brand routes with safe DTOs, bounded pagination, the five supported filters, same-active-pair color/size matching and exact final-price bounds. Added CAT-only manifest/contextual factories, parameterized transactional repositories and HTTP/MySQL/query-validation tests. CAT-DEC-004/005 and A-011 record authorization and interpretation/bounds. Full code verification and cleanup are recorded in verification-matrix CAT-002 appendix; formal completion remains blocked by original docs validator. No source from another feature, frontend, migration, dependency, commit/push/merge/deployment or CAT-003 work.


## 2026-11-04 — CAT-003 protected admin catalog management

Implemented admin product/category/brand list/detail/create/update/delete, strict multipart image handling through existing FND storage, optimistic version conflicts, history-preserving variant deactivation/readd and product soft deletion, safe image replacement/compensation/post-commit cleanup, and concurrent max-eight flags with additive cat_004 coordination migration. Transferred existing AUTH guards unchanged and added only approved FND storage-context/config/test paths. Added pinned busboy/streamsearch lock entries with no other package upgrades. CAT-DEC-006/FND-DEC-011 and A-012 record approval and transport detail. Tests/evidence are in CAT-003 verification appendix. No .env/application DB/frontend access, no commit/push/merge/deploy. Mandatory original docs validator remains BLOCKED / NOT RUN; full feature acceptance unchecked.


## 2026-11-04 — User accepts CAT-002/CAT-003 closeout

CAT-DEC-007 records requested task-tracking closeout of both implemented/tested tasks. Backlog rows are done by acceptance; CAT 2/6, BE 2/3. CAT-001 remains blocked. Source/tests and historical evidence are unchanged; no completion commits exist for these two tasks. Original docs validation remains BLOCKED / NOT RUN; full feature/FE/INT/hosting/recovery requirements and unchecked acceptance criteria remain open. No commit/push/deployment or next task.


## 2026-11-04 — Current checkpoint publication disposition

CAT-DEC-008 authorizes separate CAT-002/CAT-003 checkpoint commits and non-force push. CAT-002 checkpoint is 43ebb117945afe60babd86c12a55cd4091ea1514. CAT-003 planned subject is chore(CAT-003): checkpoint verified admin catalog management; resulting hash/push confirmation are reported from Git after execution, not invented in this record. Earlier local/uncommitted/no-authorization entries remain historical and are superseded for this publication only. Task accounting remains CAT-002/003 accepted done (2/6, BE 2/3); CAT-001 blocked. Original docs validation BLOCKED / NOT RUN; feature remains in-progress, all three Passed boxes unchecked. No new code tests run for publication, no PR/merge/deploy/next task.


## 2026-11-06 — CART-002 checkout locking read

CAT-DEC-013 approves bounded current locking reads on the caller transaction, products before
variants, plus product/base/discount metadata for future order snapshots. Existing display reads
and CAT HTTP/money/write behavior are preserved. No stock, new pool, migration or feature-
completion claim. Focused unit and real-MySQL locking/concurrency evidence is recorded under CART-002.

## 2026-11-04 — Approved SET-001 composition consumer amendment

CAT-DEC-009 scopes existing admin middleware to the three CAT resources so SET can own /admin/settings independently. Adjusted only the integration fixture's initial ordered migration prefix for new later-feature migrations. No catalog data/API/business rules changed; full CAT checks are part of SET verification. Original CAT task counts/acceptance remain unchanged.
