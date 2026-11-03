# Assumptions Register

| Assumption ID | Status | Affected Doc | Assumption | Confirmation Needed |
|---|---|---|---|---|
| A-001 | Pending Confirmation | ORD contracts, checkout copy, cleanup job | “3–7 days” means an unpaid Cash on Pickup order auto-cancels at the maximum boundary: exactly 7 calendar days after creation; no automatic cancellation occurs on day 3. | Confirm the exact automatic cutoff or replace it with another deterministic rule. |
| A-002 | Confirmed by user approval 2026-10-23 | database-rules, FND contracts; FND-DEC-002 | Use `mysql2/promise`, explicit parameterized SQL, and forward SQL migrations with an FND-owned runner; no ORM, query builder, or additional migration framework. | None for technology selection. Exact driver version/compatibility and hosting MySQL engine/version, TLS requirements, connection limits, and migration privileges remain unverified; see FND-DEC-002. |
| A-003 | Confirmed by user 2026-10-28 | UI and content contracts | Launch copy is English-first; V1 does not include a runtime language switch or translation system, and layouts tolerate Arabic RTL content. | None for UI-001; feature owners still supply their own copy. |
| A-004 | Pending Confirmation | SET contracts, footer | Social links are optional settings and hidden when empty because the PRD does not name required networks. | Confirm required social networks, if any. |
| A-005 | Confirmed by user 2026-10-31 | AUTH contracts | Customer and admin phone numbers accept Egyptian local `01xxxxxxxxx` or `+201xxxxxxxxx` input, normalize to unique `+20` E.164, and do not support non-Egyptian numbers in V1. | None. |
| A-006 | Pending Confirmation | branch-plan, integration-plan | Use merge commits for local/remote feature integration so task commits remain visible; do not merge until the user explicitly authorizes it. | Confirm `merge`, `squash`, or `rebase` before the first merge. |
| A-007 | Confirmed by user 2026-10-28 | UI feature and visual QA | The user supplied `design-reference/home.png`, `product.png`, and `shop.png`; they guide UI-001 without being copied literally or staged as production assets. | None for UI-001. |
| A-008 | Confirmed 2026-10-30 | FND contracts §13; FND-DEC-006 | Immediate feature directories use `manifest.js` with a named `feature` export. Client manifests compose through React Router and permit static paths plus named dynamic parameters; server manifests mount Express routers below `/api/v1`. | User approved the routing architecture amendment; future feature owners register routes only through their manifests. |
| A-009 | Active noncritical implementation assumption (AGENTS §6) | AUTH schema/contracts | Store first/last names in VARCHAR(255) columns with non-empty trimmed values. This is a bounded storage choice for an unspecified name limit, not a PRD requirement; registration validation belongs to AUTH-002. | May be amended by the owner; no user confirmation is claimed. See AUTH-DEC-006. |

## 2026-10-23 — A-002 confirmation history

A-002 previously remained pending: explicit SQL migrations and a small parameterized MySQL query layer were proposed, with the concrete driver to be chosen during FND-002 and any required ORM/query builder awaiting confirmation. User approval of FND-DEC-002 D2 confirms the choice above; it does not claim dependency installation, database connectivity, hosting compatibility, or task completion.

## A-010 — CAT bounded text and variant payloads

Active noncritical implementation assumption, 2026-11-04, CAT-001. Names use at most 255 well-formed Unicode code points, product descriptions 10000, color/size labels 100, and a product payload at most 1000 variants. Text is trimmed, nonempty and rejects control characters; no case folding or Unicode normalization is performed. Classification names and variant labels use exact case-sensitive binary equality in MySQL. A product may have zero variants and therefore no purchasable options. These are bounded implementation choices, not stated PRD limits or a user-confirmed decision. Owners may revise these limits consistently before API freeze. Money behavior is separately approved in CAT-DEC-003, not assumed here.
