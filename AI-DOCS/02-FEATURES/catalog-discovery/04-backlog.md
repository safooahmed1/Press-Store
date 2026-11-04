# Backlog — Catalog and Discovery

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CAT-001 | CAT/domain | WS-CAT-BE | Add catalog schema, money/discount, image, variant, and classification services | REQ-CAT-001, REQ-CAT-002, REQ-CAT-003, REQ-CAT-006, REQ-CAT-017, REQ-CAT-018 | FND-002, FND-004 | CAT server migrations/services | migration/unit tests | `blocked` | `work/CAT-backend` | User-authorized preservation checkpoint; planned chore(CAT-001): checkpoint verified catalog domain foundation | CAT-001 evidence appendix in verification-matrix; code checks pass, original docs validator BLOCKED / NOT RUN. |
| 2 | CAT-002 | CAT/public-api | WS-CAT-BE | Implement paginated public list/detail/classification APIs and five filters | REQ-CAT-005, REQ-CAT-009, REQ-CAT-010, REQ-CAT-011, REQ-CAT-012, REQ-CAT-013, REQ-CAT-015, REQ-CAT-019 | CAT-001, FND-003 | CAT public routes/repos | filter/API tests | `done` | `work/CAT-backend` | Checkpoint 43ebb117945afe60babd86c12a55cd4091ea1514; accepted CAT-DEC-007; publication CAT-DEC-008 | 2026-11-04: accepted task tracking; verification appendix records 161 unit / 95 integration, lint/build/diff passes. Original validator BLOCKED / NOT RUN; checkpoint publication does not satisfy feature gates. |
| 3 | CAT-003 | CAT/admin-api | WS-CAT-BE | Implement admin catalog CRUD, uploads, variants, flags, and safe deletion | REQ-CAT-004, REQ-CAT-016, REQ-CAT-017, REQ-CAT-018, REQ-CAT-019 | CAT-001, AUTH-AUTH-002, STO-FND-001 | CAT admin routes/services | admin/upload/conflict tests | `done` | `work/CAT-backend` | User-authorized checkpoint; planned chore(CAT-003): checkpoint verified admin catalog management; CAT-DEC-008 | 2026-11-04: accepted task tracking; verification appendix records 161 unit / 95 integration, lint/build/diff passes. Original validator BLOCKED / NOT RUN; checkpoint publication does not satisfy feature gates. |
| 4 | CAT-004 | CAT/storefront | WS-CAT-FE | Build Shop/Product Details with required filters, variants, gallery, and exclusions | REQ-CAT-007, REQ-CAT-008, REQ-CAT-009, REQ-CAT-010, REQ-CAT-011, REQ-CAT-012, REQ-CAT-013, REQ-CAT-014, REQ-SCOPE-006, REQ-SCOPE-008, REQ-SCOPE-009, REQ-SCOPE-016 | CAT-002, UI-002 | `src/features/catalog/shop/**`, `product/**` | component/responsive tests | `not-started` | `work/CAT-frontend` | — | — |
| 5 | CAT-005 | CAT/admin-ui | WS-CAT-FE | Build responsive product/category/brand lists and forms | REQ-CAT-004, REQ-CAT-016, REQ-CAT-017, REQ-CAT-018 | CAT-003, UI-004 | `src/features/catalog/admin/**` | UI/admin form tests | `not-started` | `work/CAT-frontend` | — | — |
| 6 | CAT-006 | CAT/integrity | WS-CAT-INT | Freeze availability contract and complete catalog cross-feature/security suite | REQ-CAT-020, REQ-FND-020, REQ-SCOPE-020 | CAT-002–CAT-005 | CAT tests/contracts | full catalog integration/build | `not-started` | `feature/CAT-integration` | — | — |

## DEC-008 Effective Delivery Overlay

| Lane | Workstream | Effective Tasks | Effective Branch | Integration Rule |
|---|---|---|---|---|
| BE | WS-CAT-BE | CAT-001–CAT-003 | `work/CAT-backend` | Domain/public/admin API checks pass before merge to integration. |
| FE | WS-CAT-FE | CAT-004–CAT-005 | `work/CAT-frontend` | Complete Shop/Product/Admin capabilities against frozen CAT fixtures when needed. |
| INT | WS-CAT-INT | CAT-006 | `feature/CAT-integration` | Real API, availability, security, consumer, and build gates pass. |

The ordered-task rows above and this lane summary are the canonical DEC-008 assignments; earlier planned assignments remain recoverable in Git history.

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| CAT-001; feature verification | Original required documentation validator is unavailable. | Original tooling owner / user | Keep BLOCKED / NOT RUN; no replacement. CAT-002/003 task tracking accepted under CAT-DEC-007; no validator or feature pass. |

## Completion Summary

- **Completed:** 2/6 — CAT-002 and CAT-003 done by user acceptance, CAT-DEC-007; BE 2/3 accepted.
- **Next ready task:** None in the requested BE scope while CAT-001 remains formally blocked. CAT-004/005 are separately owned FE; CAT-006 INT prerequisites remain open. No next task authorized.
- **Feature status:** `in-progress`

## 2026-11-04 — CAT-001 bounded backend implementation

CAT-DEC-002/003 record the explicit baseline and money-policy approvals. A-010 records implementation bounds. Source, tests, migrations and task evidence are local to work/CAT-backend; no completion commit, remote write or CAT-002 start. Required original docs validation remains BLOCKED / NOT RUN.

## 2026-11-04 — CAT-002 public read implementation

CAT-DEC-004 permits early development against published checkpoint 2c6bb4f. Public reads/filtering/pagination and safe errors are implemented and tested; see CAT-002 verification appendix. CAT-DEC-005 transparently records the final-price interpretation and the actual user-directed continuation, without inventing explicit option approval. A-011 records presentation bounds. Formal completion remains blocked on original docs validation; no completion commit, push or CAT-003 start.

## 2026-11-04 — CAT-003 protected admin implementation

CAT-DEC-006 / FND-DEC-011 record the approved early start, AUTH guard transfer, config/context amendment, parser dependency and additive curation migration. Admin CRUD/uploads/version conflicts/history-safe deletion and max-eight concurrency are implemented with isolated evidence in CAT-003 verification appendix. Required original docs validation remains BLOCKED / NOT RUN; no completion commit/remote write/next task or frontend integration. CAT remains 0/6 formally done.

## 2026-11-04 — User-accepted CAT-002/CAT-003 closeout

CAT-DEC-007 supersedes earlier blocked status only for these two task rows, leaving all historical failures and unrun checks visible. CAT-001 remains blocked; total 2/6 accepted tasks and BE 2/3. Both implementations are local without completion commits; no fabricated hash or feature readiness. Original docs validator stays BLOCKED / NOT RUN.
