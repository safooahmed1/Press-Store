# Change Log — Persistent Cart

No implementation activity recorded.


## 2026-11-06 — CART-001 independent backend development

- Added staged additive schema, locked customer-owned repository, CRUD service and router factories.
- Approved bounds: quantity 1–99, maximum 100 lines, version compare on every mutation.
- Added real disposable-MySQL persistence/isolation/concurrency/rollback/security tests with explicitly
  test-only injected catalog projections. They do not establish live READ-CAT-001 compatibility.
- User instructed real catalog linking to remain stopped; no CAT/FE/FND source edits, manifest,
  auto-discovered CART migration, production mock, readiness service or ORD handoff.
- Original documentation validation remains BLOCKED / NOT RUN. Checks and failures are retained in
  verification-matrix CART-001 appendix; no task completion, commit, publication or next task.

## 2026-11-06 — CART-001 real CAT binding and activation

CART-DEC-004/CAT-DEC-012 supersede the earlier linking stop for this task. Added the CAT
batch service/repository and CART manifest consumer. Registered unchanged SQL under migrations/
and reconciled CAT's admin upgrade-fixture prefix without changing the runner or applied history.
New live app/MySQL tests use real AUTH/CAT APIs and discovered routes with no projection fixture.
Focused unit 10/10, focused MySQL 21/21, full unit 171/171 and lint/build passed; full regression
and original documentation gate are recorded in the activation verification appendix. No task
completion, commit, remote write, CART-002 or frontend change.


### CART-001 activation — final verification and stop

Final focused units 10/10, focused real-MySQL/HTTP 21/21, full unit 171/171 and exact non-hidden
source-mirror integration 116/116 pass, zero skips/failures. Lint/build/whitespace/host cleanup pass.
Real CAT binding, manifest routes and unchanged SQL registration are verified. Original docs
validator remains absent (BLOCKED / NOT RUN), CART-001 blocked with no completion commit.
CART-002/FE/INT and all publication/deployment remain untouched. Exact logs, scope, snapshot
and the existing .codex static-serving limitation: activation verification appendix.


## 2026-11-06 — CART-002 early backend implementation

Approved CART-DEC-005 development exception. Added checkout read/clear service on the caller
transaction, exact frozen snapshots and version/identity-bound consumption. CAT-DEC-013 adds
parent-product then variant shared locking reads and authoritative snapshot metadata. ORD-DEC-003
coordinates future consumers without implementing orders. Add real concurrency/rollback and
bounded-query tests; full results follow in the CART-002 verification appendix. No completion claim.


### CART-002 final backend verification and stop

Focused units/contracts 13/13, focused actual-MySQL 13/13, full unit 179/179 and byte-verified
non-hidden source-mirror integration 129/129 pass with zero failures/skips. Lint/build/whitespace
and host cleanup pass. Current locking reads, transaction-bound immutable snapshots, exact
version clear, rollback and bounded queries verified; no frontend or ORD code added.
Original validator missing and CART-001/CAT-006 formal dependencies remain open; CART-002 blocked,
no completion/checkpoint commit or publication. Exact scope/logs/limitations: CART-002 appendix.


## 2026-11-06 — User-authorized CART checkpoint publication

CART-DEC-006 records the explicit request to save and upload CART backend work. Preserve CART-001
and CART-002 as two separate checkpoints on work/CART-backend, then non-force push that branch.
Planned subjects: chore(CART-001): checkpoint verified persistent cart APIs;
chore(CART-002): checkpoint verified transactional cart handoff.
This is preservation of blocked task work, not a completion/feature/validator pass. Existing observed
CART-001 171 unit/116 mirror integration and CART-002 179 unit/129 mirror integration evidence is
retained, not claimed rerun for publication. No frontend or unrelated worktree changes included.
PR-based remote integration still requires the documented feature/CART-integration baseline and
gates; no new integration branch, alternate merge target, merge, deployment or release is created.
Actual Git hashes and push confirmation follow execution, without a self-referencing follow-up commit.

## 2026-11-07 — CART upgrade fixture correction

The fixture now applies only the historical migration prefix through CART. The upgrade
and repeat passed with SET and ORD SQL discoverable. Full CART integration in that
disposable composition passed 32/32. See CART-DEC-008 and the verification matrix.
