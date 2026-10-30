# Frontend Track

## 1. Purpose and Source of Truth

This is the Frontend developer entry point, not a duplicate specification. Canonical UX behavior, API contracts, acceptance criteria, task status, and evidence remain in each feature's seven files. The feature documents win over this navigation view.

## 2. Lane Rules

- Select only an `FE` task whose UI dependencies and canonical API contract are frozen; the live API need not be running.
- Own only `src/features/<feature>/**`, explicitly assigned shared UI paths, and client tests/fixtures named by the task.
- Do not edit `server/**`, migrations, backend services, or the canonical API shape.
- Build a complete reviewable capability, including loading, empty, error, unauthorized, validation, responsive, and accessibility states—not one task per endpoint or control.
- Contract fixtures/mock adapters are test/development-only. Production adapters always target the real API and no new mock dependency is implied.

## 3. Planned Frontend Queue

| Order | Feature | Workstream | Tasks | Depends On | Branch | Owned Source | Current State |
|---:|---|---|---|---|---|---|---|
| 1 | AUTH | WS-AUTH-FE | AUTH-004 | UI primitives; frozen AUTH API contract | `work/AUTH-frontend` | `src/features/auth/**` | planned |
| 2 | CAT | WS-CAT-FE | CAT-004–CAT-005 | UI shells; frozen CAT contracts | `work/CAT-frontend` | `src/features/catalog/**` | planned |
| 3 | SET | WS-SET-FE | SET-002 | admin shell; frozen SET contract | `work/SET-frontend` | `src/features/settings/**` | planned; parallel-safe with CAT-FE |
| 4 | HOME | WS-HOME-FE | HOME-002–HOME-003 | UI shells; frozen HOME/CAT contracts | `work/HOME-frontend` | `src/features/homepage/**` | planned |
| 5 | CART | WS-CART-FE | CART-003 | UI shell; frozen CART/CAT contracts | `work/CART-frontend` | `src/features/cart/**` | planned; parallel-safe with HOME-FE |
| 6 | ORD | WS-ORD-FE | ORD-004, ORD-007, ORD-010 | UI shells; frozen ORD contracts | `work/ORD-frontend` | `src/features/orders/**` | planned |
| 7 | CUS | WS-CUS-FE | CUS-002 | admin shell; frozen CUS contract | `work/CUS-frontend` | `src/features/customers/**` | planned |
| 8 | ADM | WS-ADM-FE | ADM-001, ADM-005 | admin shell; frozen dashboard/navigation contracts | `work/ADM-frontend` | `src/features/admin-dashboard/**` | planned |

UI remains on its existing legacy feature branch and is not rewritten retroactively.

## 4. API-Delayed Handoff

When FE passes against contract fixtures before the live API exists, its workstream becomes `ready-for-integration`; the feature and INT task remain open. Record the fixture scenarios and production adapter boundary, commit the completed FE task, and stop. After explicit authorization, the developer may move to the next dependency-ready FE capability rather than wait for Backend.

Only the INT workstream may prove that the real API replaces the fixture successfully. Fixture success never satisfies live auth, persistence, concurrency, or E2E acceptance.

## 5. Work-in-Progress Limit

One FE task may be `in-progress` per developer. Finished work waiting for integration is not reopened casually; contract changes return through the documented owner/change gate.
