# CART backend — CART-001 / CART-002

Branch: `work/CART-backend`, approved baseline `a6603ca5f2b5eb54b75e530906cee42821ec371e`.
CART-DEC-004 and CAT-DEC-012 authorize real CAT linking and activation after the earlier independent stage.

## Current implementation

- Discovered `/api/v1/cart` customer CRUD routes; existing AUTH guards/Origin and FND envelopes.
- One persistent cart/customer, one row/variant, locked lazy creation and mutations.
- Quantity 1–99, at most 100 lines, expectedCartVersion on every mutation; safe exact totals.
- The manifest supplies CAT's real `readVariants(ids, tx)` service through READ-CAT-001. It reads
  at most 100 distinct variants in one query on the cart transaction, including unavailable rows.
- No production projection fixture, direct CAT SQL or extra pool. Display totals do not imply checkout readiness.
- CART-002 now supplies trusted readiness and exact transactional clear under CART-DEC-005/CAT-DEC-013.
  No order/quote/payment implementation, new HTTP endpoint or frontend code is added.

## Migrations

`migrations/persistent-cart_001_create_carts.sql` is now discovered after AUTH/CAT. It is byte-identical
to the earlier staged SQL, including its historical hold comments. There is no startup migration.
Only disposable fixtures have applied it. Existing application DB/env and all other worktrees are untouched.
Forward-only additive schema, restrictive FKs; preserve unresolved markers for approved partial-DDL recovery.
Never automatically drop/retry/mark-applied. No production migration or deployment is authorized.

## Verification and remaining gate

CART-002 focused unit/contracts: 13/13. Focused actual-MySQL handoff: 13/13.
Full unit: 179/179; full integration: 129/129 in a byte-verified non-hidden /tmp source mirror.
Lint/build/whitespace/host cleanup pass. Exact commands and limitations: the CART-002 appendix
in AI-DOCS/03-DELIVERY/verification-matrix.md. Original docs validator is absent and formal
CART-001/CAT-006 gates remain open, so neither task has a completion commit/readiness claim.

## Checkout consumer contract

Import createCartCheckoutService from services/checkout-carts.js with the lifecycle-owned database.
READ-CART-001 is readForCheckout(tx, {customerId, expectedCartVersion}); it returns an immutable
current-price snapshot while holding cart/product/variant locks until the outer transaction ends.
CMD-CART-001 is clearForCheckout(tx, snapshot), accepting the original snapshot from the same
service and transaction exactly once. Missing/empty/unavailable/stale carts fail closed.

The trusted future ORD caller must derive customerId from AUTH, pass its active transaction-only
handle, compare the accepted quote to fresh prices, persist immutable order/idempotency results,
and only then clear the exact snapshot. It must propagate failures so everything rolls back.
Do not serialize/reconstruct a handoff ticket, use a separate connection, swallow SQL failures,
or clear again on order replay. CART selection version is not a price/quote fingerprint.
Canonical metadata, sums/errors and lock order: persistent-cart technical contracts §16.

Commands: `npm run test -- cart`, `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- cart`,
full `npm run test`, full opt-in integration, lint and build. Direct focused files avoid counting
unselected-file wrappers. Only newly created disposable MySQL; never server/.env/application DBs.

## Historical independent stage

Before CART-DEC-004, the user stopped real linking: no manifest and SQL outside discovery.
That stage verified 5 focused units, 14 independent MySQL CART cases, 166 full units and 109
full integration tests in a non-hidden byte-verified source mirror. Those results are retained
in the earlier verification appendix; they do not describe the current activated route count.
The .codex worktree path has a separately reproduced baseline FND static-serving limitation.

## Historical CART-001 activation evidence

Before CART-002, activated CRUD/read binding verified 10 focused units, 21 focused real-MySQL
cases, 171 full units and 116 full integration tests. Those observations remain in the CART-001
activation appendix; current totals above include CART-002's additional backend coverage.

## Checkpoint publication

CART-DEC-006 authorizes preserving this work in separate task checkpoints and publishing
work/CART-backend without promoting completion status. CART-001 checkpoint: 8209be1bd256d13fbed49f0716bf4638262d1f27.
CART-002 is the following checkpoint; its hash/push confirmation are reported after execution.
The required feature/CART-integration PR target is absent; branch preservation creates no
integration baseline, alternate-target PR, merge or deployment. Earlier no-checkpoint statements
are superseded only for this explicit preservation authorization.
