# Change Log — Checkout, Payments, and Orders

No implementation activity recorded.


## 2026-11-06 — ORD-001 local core

ORD-DEC-004 approves local branch baseline and resolves repeats in favor of API-ORD-003.
ORD-DEC-005 keeps CART unchanged and stages three additive migrations outside discovery.
Added immutable snapshot and state-domain functions plus unit/real-MySQL fixture proofs.
No request replay/order-create/admin API or expiry worker implemented; A-001 remains pending.
A-015 documents bounded text storage. Exact observed verification and open gates follow in the
ORD-001 verification appendix. No feature/task completion, publication or next task claimed.

## 2026-11-07 — ORD-001 local verification

Passed 15 focused domain tests, 8 focused disposable-MySQL tests, lint, and the build.
The exact source mirror passed 194 unit and 137 integration tests, including the unchanged
CART upgrade test. ORD-001 is blocked on ordinary SQL discovery and the unavailable original
docs validator. See the verification matrix for commands and scope. Completion commit: None.

## 2026-11-07 — ORD-001 task acceptance

ORD-DEC-006 records user acceptance for task tracking. ORD BE is 1/6 accepted. The three
migrations remain pending activation, original docs validation remains open, and ORD-002
awaits its named dependencies. The verified code is local.

## 2026-11-07 — ORD-001 checkpoint publication authorized

ORD-DEC-007 authorizes one checkpoint on `work/ORD-backend` and a non-force push.
The code and existing test evidence are unchanged. Migration activation and the original
docs validator remain open.

## 2026-11-07 — ORD-002 local checkout quote

ORD-DEC-008 permits local quote development. The service validates the method and CART
version, uses current catalog amounts, and obtains only the selected SET destination.
Wallet sender input remains part of confirmation. See the verification matrix for observed
results and the gates still open.

## 2026-11-07 — ORD-002 isolated quote HTTP adapter

Added the quote router and mounted it only in the disposable test app. It uses the
published customer-session guard and existing Origin, JSON and error boundaries.
Application mounting remains deferred under ORD-DEC-008.

## 2026-11-07 — ORD-002 local application mount on Back-end

ORD-DEC-010 records mounting the existing quote router using the real CART and SET services
on the combined backend branch. Verification exercises FND discovery and customer-session
requests through the normal server entry point. The formal integration and validator gates remain open.

## 2026-11-07 — ORD-002 backend tracking acceptance

ORD-DEC-011 records user acceptance of ORD-002 for backend tracking based on verification
of `Back-end` at `8a6b060`. ORD BE is 2/6 accepted. The formal ORD integration baseline
and original docs validator remain open.

## 2026-11-07 — ORD-003 local order creation

ORD-DEC-012 records the combined Back-end development baseline and seven-day cash deadline.
Added the confirmation service, SQL persistence, and isolated customer router. The service
revalidates the quote, stores immutable order facts and idempotency hashes, and clears the
exact cart in one transaction. Normal route mounting awaits migration activation.

## 2026-11-07 — ORD-003 activation on Back-end

ORD-DEC-013 registers the existing ORD migrations without changing their content and
mounts order creation through the normal server entry point. Fresh install and upgrade
from pre-ORD Back-end were verified on disposable MySQL. Formal gates remain open.

## 2026-11-07 — ORD-003 backend tracking acceptance

ORD-DEC-014 records acceptance of the verified Back-end activation for task tracking.
ORD BE is 3/6 accepted. Formal integration and original documentation validation
remain open.

## 2026-11-07 — ORD-006 admin order APIs

Added admin-only order list and detail, manual payment verification, preparation,
delivery, and WhatsApp links from the stored customer number. ORD-DEC-015 records the
combined Back-end baseline. Formal integration and original documentation validation
remain open.

## 2026-11-07 — ORD-006 backend tracking acceptance

ORD-DEC-016 records acceptance of the verified Back-end admin order APIs for task
tracking. ORD BE is 4/6 accepted. Formal integration and original documentation
validation remain open.

## 2026-11-07 — ORD-009 customer order history

Added paginated customer order reads and immutable details to the normal `/orders`
mount. Session ownership and cancellation are enforced by the database queries.
ORD-DEC-017 records the combined Back-end baseline and remaining formal gates.

## 2026-11-07 — ORD-009 backend tracking acceptance

ORD-DEC-018 records acceptance of the verified Back-end customer history APIs
for task tracking. ORD BE is 5/6 accepted. Formal integration and original
documentation validation remain open.

## 2026-11-07 — ORD-011 cash expiry job

Added the registered cash expiry job and linked it to the FND runner under ORD-DEC-019.
The job uses the stored seven-day deadline and guarded, rerunnable batches. Production
scheduling and formal verification remain open.

## 2026-11-08 — ORD-011 backend tracking acceptance

ORD-DEC-020 records acceptance of the cash expiry job and FND runner for backend
tracking. ORD BE is 6/6 accepted. Formal integration, original documentation
validation, and production scheduling remain open.
