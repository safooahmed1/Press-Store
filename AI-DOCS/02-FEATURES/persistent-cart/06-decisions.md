# Decisions — Persistent Cart

## CART-DEC-004 — Resume real CAT linking and backend activation

- **Status:** `approved`
- **Date:** 2026-11-06
- **Decision:** User selected item 1 from the remaining-work list, authorizing the bounded
  CAT-DEC-012 batch service amendment, CART manifest wiring and migration registration.
  Preserve prior independent work on work/CART-backend and all historical evidence.
- **Consequences:** Supersedes CART-DEC-003's linking stop for CART-001 only. Move the unchanged
  staged SQL into migrations/, reconcile only CAT's migration-upgrade fixture prefix, and
  verify real CAT price/availability projections and customer CRUD through the discovered app.
  No existing application DB or server/.env use. Only newly created disposable MySQL fixtures.
  Original documentation validation is still required; no completion/commit gate is waived.
- **Affected contracts/tasks:** API-CART-001, READ-CAT-001, CART-001. CART-002, FE and INT remain untouched.

## CART-DEC-001 — Persistent cart with current-price projection

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Persist selected variant/quantity and cached current applicable price, but recalculate through CAT on cart reads and order creation; do not reserve/decrement stock.
- **Rationale:** Matches persistent-cart and no-numeric-stock requirements while preventing stale checkout.
- **Alternatives:** Guest/localStorage cart, locked prices, inventory reservation.
- **Consequences:** CAT must be available for readiness and ORD revalidates transactionally.
- **Affected contracts/tasks:** CART-001–CART-004; READ-CART-001; READ-CAT-001.


## CART-DEC-002 — Approved local backend baseline, bounds and version policy

- **Status:** `approved`
- **Date:** 2026-11-06
- **Decision:** User approved the proposed CART-001 backend start from published CAT checkpoint
  `a6603ca5f2b5eb54b75e530906cee42821ec371e`, quantity 1–99 per variant, at most 100 lines,
  duplicate-variant quantity merging within that limit, and current cart version on every mutation.
- **Rationale:** Define the documented but previously unspecified quantity/line bounds and prevent lost updates.
- **Consequences:** Only CART-001 is selected. No downstream task, FE, release gate or remote write is authorized.
  This authorizes local development against the snapshot, not a frozen integration baseline or CAT-006 waiver.
- **Affected contracts/tasks:** API-CART-001; CART-001. CART-002 remains separately gated.

## CART-DEC-003 — Independent development only; real CAT integration stopped

- **Status:** `approved`
- **Date:** 2026-11-06
- **Decision:** In response to the proposed CAT batch-read owner/consumer amendment, the user explicitly
  chose “نفّذ الجزء المستقل واترك الربط متوقفًا” (implement the independent portion and leave linking stopped).
  Do not change CAT owner source/contracts/tests or claim approval for the proposed batch export.
- **Rationale:** Existing requireAvailableVariant reads one available variant only; it cannot satisfy the
  documented bounded batch projection of retained unavailable items using the consumer transaction.
- **Consequences:** CART factories have an explicit unresolved dependency, with no manifest, production mock
  or direct CAT SQL. Tests may inject contract-shaped projections while testing real CART persistence/AUTH.
  Stage SQL under schemas/ outside automatic discovery while stopped. Its persistent-cart feature-name
  prefix sorts after CAT under the unchanged migration runner; activation and CAT upgrade-fixture
  reconciliation are later integration work. CART-001 cannot be completed or committed as complete.
- **Affected contracts/tasks:** API-CART-001 consumer development; READ-CAT-001 linking remains unapproved;
  CART-001 incomplete, CART-002 and all FE/INT tasks untouched.


## CART-DEC-006 — User-authorized CART checkpoint publication

- **Status:** `approved`
- **Date:** 2026-11-06
- **Decision:** User explicitly requested following delivery documentation and uploading the current
  CART backend work to GitHub. Authorize separate preservation checkpoints for CART-001 and CART-002
  on work/CART-backend and a normal non-force push to origin/work/CART-backend.
- **Planned subjects:** chore(CART-001): checkpoint verified persistent cart APIs;
  chore(CART-002): checkpoint verified transactional cart handoff.
- **Consequences:** This supersedes earlier no-checkpoint/no-push instructions only for preservation.
  Both tasks remain blocked for their documented gates; no fabricated completion commit, validator
  pass or feature readiness. Preserve current code, task separation and unrelated worktrees.
  Retain observed verification evidence; no code check rerun is claimed for documentation/Git-only work.
  The documented PR merge target is feature/CART-integration, which is not a ready local integration
  baseline. Branch publication does not create that baseline or authorize main/alternate-target
  integration. A later remote integration must use the required PR and exact approved target.
  No merge, deployment, release, new task or remote repository creation.
- **Affected tasks:** CART-001, CART-002 checkpoints only. Report actual hashes/push evidence after
  execution; do not add a circular follow-up commit to store its own hash.
