# Decisions — Checkout, Payments, and Orders

## ORD-DEC-010 — Local checkout activation on the combined Back-end branch

- **Status:** Local implementation
- **Date:** 2026-11-07
- **Decision:** Complete the local checkout wiring in the combined `Back-end` worktree after
  the user requested finishing ORD-002. The combined branch contains the published CART, CAT
  and SET backend services. The ORD manifest composes those services using the existing FND
  lifecycle database and AUTH customer boundary.
- **Boundary:** This satisfies local application mounting on `Back-end`. The documented ORD
  integration baseline, owner acceptance, original documentation validation, and completion
  gate remain open. ORD-001 migration discovery and ORD-003 confirmation are unchanged.
- **Checkpoint:** The user requested a commit for the verified application mount on
  `Back-end`. Planned subject: `chore(ORD-002): checkpoint checkout activation`.

## ORD-DEC-009 — ORD-002 checkpoint and local Back-end inclusion

- **Status:** `approved by user`
- **Date:** 2026-11-07
- **Decision:** Preserve the verified local quote service, router, tests, and evidence on
  `work/ORD-backend` in one checkpoint and include it on the local `Back-end` branch.
  Planned subject: `chore(ORD-002): checkpoint verified checkout quote`.
- **Boundary:** The checkpoint preserves the blocked task status. Application mounting,
  dependency integration, and original documentation validation remain open under
  ORD-DEC-008.

## ORD-DEC-008 — Local checkout quote development before integration

- **Status:** `approved by user`
- **Date:** 2026-11-07
- **Decision:** Start ORD-002 BE on `work/ORD-backend` at published ORD-001 checkpoint
  `59861e6`. Use the real CART/CAT services on that baseline and the published SET
  payment service in isolated verification. The user approved deferring the HTTP API
  until the owner dependencies are integrated.
- **Quote contract:** Supply the selected payment method and expected cart version.
  Return server-calculated amounts and only the selected electronic destination.
  Wallet requires a sender number at confirmation, so quote input excludes it.
- **Boundary:** The approval permits local development and fixture composition only.
  Formal CAT/CART/SET integration, ORD-001 migration activation, the original docs validator,
  and completion gates stay open. No order creation, frontend, checkpoint, or push authorized.

## ORD-DEC-007 — ORD-001 checkpoint publication

- **Status:** `approved by user`
- **Date:** 2026-11-07
- **Decision:** Preserve the verified ORD-001 work and ORD-DEC-006 acceptance in one checkpoint
  on `work/ORD-backend`, then publish that branch to the configured GitHub remote without force.
  Planned subject is `chore(ORD-001): checkpoint verified order schema and domain`.
- **Scope:** ORD-001 source, tests, and documentation only. The pending migration location,
  original docs validation, integration gates and ORD-002 dependency wait remain as recorded.
  Publication does not authorize a pull request, merge, or deployment.

## ORD-DEC-006 — User acceptance of ORD-001 for task tracking

- **Status:** `approved by user`
- **Date:** 2026-11-07
- **Decision:** The user accepted ORD-001 after reviewing its local verification and the remaining
  migration activation and documentation validation gates. Record ORD-001 as `done` for task
  tracking only. This supersedes ORD-DEC-005's task status; its CART scope restriction still applies.
- **Evidence:** Retain the existing 15 focused domain tests, 8 focused MySQL tests, 194 full unit
  tests, 137 full mirror integration tests and the recorded migration activation failure.
- **Integration boundary:** SQL remains under `migrations/pending/`. Ordinary migration discovery,
  the original docs validator, and feature acceptance remain open. No completion commit or
  publication is authorized by this acceptance. ORD-002 stays unstarted per the user's instruction
  to wait for its CART, CAT and SET dependencies.

## ORD-DEC-004 — ORD-001 local baseline and repeat-action policy

- **Status:** `approved`
- **Date:** 2026-11-06
- **Decision:** User approved work/ORD-backend from published CART checkpoint
  `0e3937b753038db37491c23dfc8ae951a5be54da` for ORD-001 development only, without claiming
  the missing frozen ORD integration baseline. FND database/AUTH schema are the accepted
  development prerequisites; no CART/SET runtime integration or completion gate is waived.
- **State-policy resolution:** API-ORD-003 is authoritative: repeating an achieved action returns
  the current state without changing version or timestamps; incompatible transitions reject.
  This supersedes AC-ORD-002's earlier conflicting repeat-as-error wording. Authorization is
  checked even on a repeat; a new transition still requires the current expected version.
- **Consequences:** One BE task only: schema, immutable item/money snapshots, state domain and
  idempotency-record constraints. No quote/create/admin/history endpoints or expiry job. A-001's
  cutoff remains pending; domain tests use explicit test deadlines without selecting production policy.
  No frontend, remote operation, deployment or incomplete checkpoint is authorized.
- **Affected contracts/tasks:** Order/OrderItem, API-ORD-003 semantics, ORD-001.

## ORD-DEC-005 — Keep CART unchanged and stage ORD SQL

- **Status:** `approved-scope-limitation`
- **Date:** 2026-11-06
- **Decision:** User explicitly declined the proposed CART upgrade-test prefix correction and
  instructed that CART remain unchanged. Preserve all CART source/tests/contracts.
- **Implementation consequence:** Stage ORD SQL under orders/migrations/pending/ outside FND's
  immediate-file discovery. ORD tests append that SQL explicitly to the unchanged discovered
  baseline before using the existing runner. Registering ORD SQL and reconciling the legacy CART
  fixture remain later integration work; no bypass of ordering or mutation of migration history.
- **Affected task:** ORD-001 stays incomplete until activation and required validation gates pass.

## ORD-DEC-003 — Acknowledge CART-002 transaction handoff contract

- **Status:** `approved`
- **Date:** 2026-11-06
- **Decision:** Under the user's approved CART-002/CAT locking amendment, coordinate the future
  ORD consumer with CART's canonical read/clear contract and transaction-bound snapshot.
- **Consequences:** Keep ORD-002/003 unstarted. Future implementation must compare its accepted
  quote to fresh locked data, insert idempotent immutable history, then consume the exact cart
  snapshot in the same transaction. No ORD business-rule, API or implementation change here.
- **Affected contracts/tasks:** READ-CART-001, CMD-CART-001; ORD-002/003 future consumers.

## ORD-DEC-001 — Manual electronic verification and paid retention

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Apply DEC-002/003: Wallet EG/InstaPay remain pending until admin verification, Wallet stores only sender number, no receipt/reference is uploaded, and paid orders never auto-expire.
- **Rationale:** Direct user confirmation and minimum operational complexity.
- **Alternatives:** Gateway integration, receipt upload, expiring paid orders.
- **Consequences:** Truthful separate payment/fulfillment states and admin verification action are mandatory.
- **Affected contracts/tasks:** ORD-001–ORD-008; API-ORD-001/003; JOB-ORD-001.

## ORD-DEC-002 — Atomic order transaction owns history

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** One idempotent transaction revalidates CAT/CART, snapshots immutable items/money, creates the order, and clears the exact cart.
- **Rationale:** Prevents duplicate/corrupt orders and stale availability.
- **Alternatives:** Client totals, multi-step nontransactional creation, numeric stock reservation.
- **Consequences:** Cross-feature read/command contracts must participate in one database transaction boundary.
- **Affected contracts/tasks:** ORD-002, ORD-003; READ-CART-001, CMD-CART-001, READ-CAT-001.
