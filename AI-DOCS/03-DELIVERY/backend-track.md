# Backend Track

## 1. Purpose and Source of Truth

This is the Backend developer entry point, not a second specification. Canonical behavior, API/data contracts, acceptance criteria, task status, and evidence remain in each feature's seven files. If this view conflicts with a feature contract or backlog, the owner document wins and this view must be corrected.

## 2. Lane Rules

- Select only a `BE` task whose named dependencies and contract-freeze prerequisite are satisfied.
- Own only `server/src/features/<feature>/**`, explicitly assigned platform/server paths, backend tests, migrations, and scripts named by the task.
- Do not edit `src/features/**`, frontend fixtures, pages, or components.
- Freeze request, response, error, auth, pagination, and concurrency behavior in the canonical technical contract before FE and BE proceed in parallel.
- A contract change after freeze requires a recorded owner decision, both lane owners' acknowledgement, named consumer updates, and a rerun of contract/integration checks.

## 3. Planned Backend Queue

| Order | Feature | Workstream | Tasks | Depends On | Branch | Owned Source | Current State |
|---:|---|---|---|---|---|---|---|
| 1 | AUTH | WS-AUTH-BE | AUTH-001–AUTH-003 | FND DB/HTTP contracts; A-005 | `work/AUTH-backend` | `server/src/features/auth/**`, `server/src/platform/auth/**`, bootstrap script | blocked by FND-002 and A-005 |
| 2 | CAT | WS-CAT-BE | CAT-001–CAT-003 | AUTH guard; FND DB/storage/HTTP | `work/CAT-backend` | `server/src/features/catalog/**` | planned |
| 3 | SET | WS-SET-BE | SET-001 | AUTH guard; FND DB/HTTP | `work/SET-backend` | `server/src/features/settings/**` | planned; parallel-safe with CAT-BE after dependencies |
| 4 | HOME | WS-HOME-BE | HOME-001 | CAT admin/curation contract; FND storage | `work/HOME-backend` | `server/src/features/homepage/**` | planned |
| 5 | CART | WS-CART-BE | CART-001–CART-002 | AUTH and CAT read contracts | `work/CART-backend` | `server/src/features/cart/**` | planned; parallel-safe with HOME-BE |
| 6 | ORD | WS-ORD-BE | ORD-001–ORD-003, ORD-006, ORD-009, ORD-011 | CART/CAT/SET/AUTH/FND contracts | `work/ORD-backend` | `server/src/features/orders/**` | planned |
| 7 | CUS | WS-CUS-BE | CUS-001 | AUTH and ORD read contracts | `work/CUS-backend` | `server/src/features/customers/**` | planned |
| 8 | ADM | WS-ADM-BE | ADM-004 | CAT/ORD/CUS read projections | `work/ADM-backend` | `server/src/features/admin-dashboard/**` | planned |

FND remains on its existing legacy feature branch and is not retroactively repartitioned. UI is frontend-only and remains on its existing feature branch.

## 4. Handoff to Integration

The BE workstream is `ready-for-integration` only when its tasks are `done`, backend checks pass, the canonical contract matches the implementation, and its completion commits are available on the documented branch. This state does not make the feature `merge-ready`.

## 5. Blockers and Next Work

When the current API is delayed, record the blocker in the feature backlog. Do not ask FE to wait or silently change its fixture shape. FE may continue against the frozen contract. The backend developer moves only after explicit authorization to the next BE task whose dependencies are complete.
