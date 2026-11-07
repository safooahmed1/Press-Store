# Feature Brief — Store Settings

## 1. Identity

- **Feature ID:** `SET`
- **Kind:** `shared`
- **Parent Feature:** `None`
- **Owner:** `WS-SET-BE`, `WS-SET-FE`, `WS-SET-INT`
- **Status:** `in-progress`

## 2. Summary

Own the singleton store/contact/payment settings, admin editing experience, and minimum public/read-only projections used by footer, checkout, orders, and WhatsApp.

## 3. Business Value

Lets the store change customer-facing contact and two independent payment numbers without code changes while limiting unnecessary exposure.

## 4. Roles and Users

Admin manages values; Anonymous/Customer see context-appropriate public values.

## 5. Requirement Coverage

| Requirement ID | Summary | PRD Location |
|---|---|---|
| REQ-SET-001 | Store name, phone, and WhatsApp/contact settings | §24 |
| REQ-SET-002 | Separate Wallet EG and InstaPay numbers | §24 |
| REQ-SET-003 | Context-minimized public settings | §24 |
| REQ-SET-004 | Footer contact/social projection | §7.7 |

## 6. In Scope

Singleton schema, validation, admin GET/PUT, public contact projection, internal payment/contact reads, responsive Settings form, and privacy/consumer tests.

## 7. Out of Scope

Secrets, payment verification, gateway credentials, theme/content management, arbitrary key-value settings, or required social networks (none under approved SET-DEC-003 optional-link policy).

## 8. User Flows

### Flow 1 — Admin updates settings
1. Admin opens Settings.
2. Current store/contact/payment values load.
3. Admin edits and saves validated independent values.
4. Consumers read the updated projection.

Alternate flows:
- Optional social link remains empty/hidden.
- Concurrent stale update is rejected.

Exit states:
- Success: versioned settings are updated atomically.
- Cancelled: unsaved changes are discarded.
- Failure: field/conflict error with prior values preserved.

## 9. Screens and States

| Screen/View | Route/Entry | Purpose | Elements | Loading | Empty | Error | Unauthorized |
|---|---|---|---|---|---|---|---|
| Admin Settings | `/admin/settings` | Manage store/payment info | Store/contact/payment fields, save | Form skeleton | Seed-required prompt | Field/retry/conflict | Admin login/forbidden |
| Footer projection | customer shell | Show public contact/social data | Store/phone/WhatsApp/social links | Shell placeholder | Hide optional links | Omit optional data safely | Public |

## 10. Business Rules

Wallet EG and InstaPay numbers are independent. Settings are a singleton with versioned updates. Public footer reads omit payment numbers; checkout receives only the payment number for the selected method through the internal ORD consumer contract.

## 11. Edge Cases

Same/different payment numbers, malformed phones/URLs, empty optional social links, concurrent update, missing initial singleton, and payment settings unavailable during checkout.

## 12. Dependencies

FND DB/HTTP, AUTH admin guard, UI controls/admin layout.

## 13. Assumptions and TODOs

> **A-004 confirmed:** social links are optional, empty links hidden, and Facebook/Instagram/TikTok are supported under SET-DEC-003. No network is required.

SET-001 backend implementation and verification are recorded under SET-DEC-002/003; formal completion remains blocked on original mandatory documentation validation. A-004 optional network policy is approved; FE/INT acceptance remains separate.


## 2026-11-06 — User-accepted SET backend closeout

SET-DEC-004 supersedes earlier blocked task-accounting status for SET-001. SET backend is 1/1 accepted, feature 1/3. Original docs validation remains BLOCKED / NOT RUN; all feature acceptance criteria and FE/browser/consumer/privacy/hosting/recovery/integration gates remain open. Both feature Passed boxes stay unchecked and feature remains in-progress, not merge-ready or release-verified. Implementation/docs remain local and uncommitted; completion commit None. Documentation-only closeout, no new source/tests/packages, code checks, frontend, existing DB/env access, commit/push/merge/deploy or next task. Earlier observed verification/failure history and separate CAT/AUTH work remain preserved.
