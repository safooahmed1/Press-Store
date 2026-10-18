# Feature Brief — Store Settings

## 1. Identity

- **Feature ID:** `SET`
- **Kind:** `shared`
- **Parent Feature:** `None`
- **Owner:** `WS-SET-01`
- **Status:** `planned`

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

Secrets, payment verification, gateway credentials, theme/content management, arbitrary key-value settings, or required social networks not confirmed by A-004.

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

> **ASSUMPTION A-004:** social links are optional and hidden when empty.  
> **TODO A-004:** confirm required networks.
