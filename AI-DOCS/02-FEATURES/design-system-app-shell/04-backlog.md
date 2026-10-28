# Backlog — Design System and App Shell

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | UI-001 | UI/visual-system | WS-UI-01 | Use frontend-design to establish Tailwind tokens, typography, color, and asset direction | REQ-FND-004, REQ-FND-008, REQ-UI-001, REQ-UI-002, REQ-UI-003 | FND-001 | `src/styles/**`, theme config, approved shared assets | token tests; visual QA | `done` | `feature/UI-design-system-app-shell` | `feat(UI-001): establish fashion design system` | Token/style tests, Node 24 lint/build, and 390/768/1440 visual evidence in `evidence/`; feature-level AC-UI-001 remains shared with UI-002 |
| 2 | UI-002 | UI/primitives | WS-UI-01 | Build accessible controls and loading/empty/error/unauthorized states | REQ-FND-015, REQ-UI-001 | UI-001 | `src/shared/ui/primitives/**`, `states/**` | component/a11y tests | `done` | `feature/UI-design-system-app-shell` | `feat(UI-002): add accessible UI primitives` | 6 DOM/component tests, axe pass, 30 UI suite checks, foundation/lint/build/audit/docs validator pass |
| 3 | UI-003 | UI/customer-shell | WS-UI-01 | Build responsive customer navbar, footer, and layout primitives | REQ-FND-016, REQ-UI-004, REQ-UI-005 | UI-002, API-SET-002 contract frozen | `src/shared/ui/shell/customer/**` | navigation/keyboard tests | `not-started` | `feature/UI-design-system-app-shell` | — | — |
| 4 | UI-004 | UI/responsive | WS-UI-01 | Build admin layout primitives and complete responsive/accessibility matrix | REQ-FND-016, REQ-UI-006, REQ-UI-007 | UI-002, UI-003 | `src/shared/ui/shell/admin/**`, UI tests | viewport/a11y/build checks | `not-started` | `feature/UI-design-system-app-shell` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| UI-003 | A-004 social networks and SET projection implementation | User/SET | Empty optional links remain allowed; consume contract after SET-001 |

## Completion Summary

- **Completed:** 2/4
- **Next ready task:** `UI-003`
- **Feature status:** `in-progress`
