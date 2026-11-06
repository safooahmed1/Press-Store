# CART backend — CART-001

Branch: `work/CART-backend`, approved baseline `a6603ca5f2b5eb54b75e530906cee42821ec371e`.
CART-DEC-004 and CAT-DEC-012 authorize real CAT linking and activation after the earlier independent stage.

## Current implementation

- Discovered `/api/v1/cart` customer CRUD routes; existing AUTH guards/Origin and FND envelopes.
- One persistent cart/customer, one row/variant, locked lazy creation and mutations.
- Quantity 1–99, at most 100 lines, expectedCartVersion on every mutation; safe exact totals.
- The manifest supplies CAT's real `readVariants(ids, tx)` service through READ-CAT-001. It reads
  at most 100 distinct variants in one query on the cart transaction, including unavailable rows.
- No production projection fixture, direct CAT SQL, extra pool, checkout readiness or ORD handoff.
  CART-002/FE/INT are separate work; current display totals do not imply checkout readiness.

## Migrations

`migrations/persistent-cart_001_create_carts.sql` is now discovered after AUTH/CAT. It is byte-identical
to the earlier staged SQL, including its historical hold comments. There is no startup migration.
Only disposable fixtures have applied it. Existing application DB/env and all other worktrees are untouched.
Forward-only additive schema, restrictive FKs; preserve unresolved markers for approved partial-DDL recovery.
Never automatically drop/retry/mark-applied. No production migration or deployment is authorized.

## Verification and remaining gate

Focused unit: 10/10 CART/CAT boundary tests. Focused actual-MySQL: 21/21, including five real-app
scenarios and two CAT transaction/query-bound proofs. Full unit: 171/171; lint/build pass.
Exact final regression evidence and any failures: AI-DOCS/03-DELIVERY/verification-matrix.md,
CART-001 real backend activation appendix. The mandatory original docs validator is absent.
No completion commit or full-feature/FE/INT/production acceptance is claimed.

Commands: `npm run test -- cart`, `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- cart`,
full `npm run test`, full opt-in integration, lint and build. Direct focused files avoid counting
unselected-file wrappers. Only newly created disposable MySQL; never server/.env/application DBs.

## Historical independent stage

Before CART-DEC-004, the user stopped real linking: no manifest and SQL outside discovery.
That stage verified 5 focused units, 14 independent MySQL CART cases, 166 full units and 109
full integration tests in a non-hidden byte-verified source mirror. Those results are retained
in the earlier verification appendix; they do not describe the current activated route count.
The .codex worktree path has a separately reproduced baseline FND static-serving limitation.


## CART-001 checkpoint publication

User authorized preservation/push under CART-DEC-006. Full integration 116/116 verified in the
non-hidden source mirror; task remains blocked on original docs validation. No completion commit
or PR/merge/deploy claim; CART-002 code follows as a separate checkpoint.
