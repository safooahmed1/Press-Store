# Assumptions Register

## A-015 — ORD snapshot text/storage bounds

Active noncritical implementation assumption, 2026-11-06, ORD-001. Order numbers use nonempty
ASCII storage up to 64 characters; their generation format is deferred to ORD-003. Wallet-sender
storage is at most 16 ASCII characters in canonical E.164 shape; permitted-country/input
normalization policy remains ORD-002 scope, not a newly accepted payment policy. Snapshot
product names use 255 Unicode code points and color/size 100, matching existing CAT bounds.
These are bounded storage choices, not PRD limits or a user-confirmed order-number format.
IDs 013/014 exist in the separate SET/HOME owner worktrees and are not reassigned here.
Money, payment/fulfillment and repeat-action policy remain canonical ORD decisions, not assumptions.

| Assumption ID | Status | Affected Doc | Assumption | Confirmation Needed |
|---|---|---|---|---|
| A-001 | Pending Confirmation | ORD contracts, checkout copy, cleanup job | “3–7 days” means an unpaid Cash on Pickup order auto-cancels at the maximum boundary: exactly 7 calendar days after creation; no automatic cancellation occurs on day 3. | Confirm the exact automatic cutoff or replace it with another deterministic rule. |
| A-002 | Confirmed by user approval 2026-10-23 | database-rules, FND contracts; FND-DEC-002 | Use `mysql2/promise`, explicit parameterized SQL, and forward SQL migrations with an FND-owned runner; no ORM, query builder, or additional migration framework. | None for technology selection. Exact driver version/compatibility and hosting MySQL engine/version, TLS requirements, connection limits, and migration privileges remain unverified; see FND-DEC-002. |
| A-003 | Confirmed by user 2026-10-28 | UI and content contracts | Launch copy is English-first; V1 does not include a runtime language switch or translation system, and layouts tolerate Arabic RTL content. | None for UI-001; feature owners still supply their own copy. |
| A-004 | Confirmed by user 2026-11-04 for SET-001 | SET contracts, footer | Social links are optional and hidden when empty; supported optional keys/HTTPS hosts are Facebook, Instagram and TikTok under SET-DEC-003. No required network. | None for this policy; FE/browser integration remains separately owned. |
| A-005 | Confirmed by user 2026-10-31 | AUTH contracts | Customer and admin phone numbers accept Egyptian local `01xxxxxxxxx` or `+201xxxxxxxxx` input, normalize to unique `+20` E.164, and do not support non-Egyptian numbers in V1. | None. |
| A-006 | Pending Confirmation | branch-plan, integration-plan | Use merge commits for local/remote feature integration so task commits remain visible; do not merge until the user explicitly authorizes it. | Confirm `merge`, `squash`, or `rebase` before the first merge. |
| A-007 | Confirmed by user 2026-10-28 | UI feature and visual QA | The user supplied `design-reference/home.png`, `product.png`, and `shop.png`; they guide UI-001 without being copied literally or staged as production assets. | None for UI-001. |
| A-008 | Confirmed 2026-10-30 | FND contracts §13; FND-DEC-006 | Immediate feature directories use `manifest.js` with a named `feature` export. Client manifests compose through React Router and permit static paths plus named dynamic parameters; server manifests mount Express routers below `/api/v1`. | User approved the routing architecture amendment; future feature owners register routes only through their manifests. |
| A-009 | Active noncritical implementation assumption (AGENTS §6) | AUTH schema/contracts | Store first/last names in VARCHAR(255) columns with non-empty trimmed values. This is a bounded storage choice for an unspecified name limit, not a PRD requirement; registration validation belongs to AUTH-002. | May be amended by the owner; no user confirmation is claimed. See AUTH-DEC-006. |

## 2026-10-23 — A-002 confirmation history

A-002 previously remained pending: explicit SQL migrations and a small parameterized MySQL query layer were proposed, with the concrete driver to be chosen during FND-002 and any required ORM/query builder awaiting confirmation. User approval of FND-DEC-002 D2 confirms the choice above; it does not claim dependency installation, database connectivity, hosting compatibility, or task completion.

## A-010 — CAT bounded text and variant payloads

Active noncritical implementation assumption, 2026-11-04, CAT-001. Names use at most 255 well-formed Unicode code points, product descriptions 10000, color/size labels 100, and a product payload at most 1000 variants. Text is trimmed, nonempty and rejects control characters; no case folding or Unicode normalization is performed. Classification names and variant labels use exact case-sensitive binary equality in MySQL. A product may have zero variants and therefore no purchasable options. These are bounded implementation choices, not stated PRD limits or a user-confirmed decision. Owners may revise these limits consistently before API freeze. Money behavior is separately approved in CAT-DEC-003, not assumed here.


## A-011 — CAT public read pagination and presentation bounds

Active noncritical implementation assumption, 2026-11-04, CAT-002. Products/categories/brands share default page 1 and pageSize 24, maximum pageSize 48 (existing CAT bound), and maximum page 100000 (implementation bound). Fixed ascending resource ID order provides deterministic paging; no client sorting control. Product details reject query parameters. Categories/brands use paginated `{data:{items},meta}` with explicit categoryId/brandId fields; category items include imageUrl. Color and size filters conjunctively match the same active variant using existing exact case-sensitive labels, and returned options include all active variants of each matched product. Products without active options remain browseable without variant filters and expose an empty option array. These clarify bounded read presentation; they are not newly attributed PRD requirements. Final-price interpretation is recorded separately in CAT-DEC-005, not hidden as an assumption here.


## A-012 — CAT admin transport details

Active noncritical transport assumption, 2026-11-04, CAT-003. POST creates (201), GET reads (200), PUT replaces the editable representation (200), DELETE accepts a JSON version object (200). IDs and version are positive BIGINT strings; updatedAt is UTC ISO text, and version is authoritative for conflicts. Admin list pagination follows A-011. Product PUT may omit images to preserve the gallery; otherwise images is an ordered complete list of {imageId} and/or {uploadIndex}, first entry main, total 1–4, each new uploaded file referenced exactly once. Multipart has one JSON data field and up to four images file fields; category mutations allow at most one image, brand mutations none. Payload/field and request bounds are implementation safeguards derived from existing FND 64 KiB JSON / 5 MiB image limits. No client storage path, actor/role override or numeric stock accepted. These transport details are owner implementation choices, not invented PRD quotations or a completed FE contract freeze. Critical max-eight/business/auth rules remain in approved CAT/FND/AUTH contracts.


## A-013 — SET storage/transport bounds

Active noncritical implementation assumption, 2026-11-04, SET-001: storeName is trimmed, well-formed Unicode with at most 255 code points and no control characters; social URL values are bounded to 2048 characters before/after canonicalization, with at most the three approved optional keys. Numeric version uses positive MySQL INT UNSIGNED for stored values, first-save expected version 0; supported update input is an integer 0..4294967294 to prevent overflow on increment. Full PUT requires all store/contact/payment fields, with omitted socialLinks replaced by {}. All reads use no-store rather than introducing caching/invalidation. These are bounded implementation details, not quoted PRD limits. Phone/bootstrap/social-host business/security policy is explicitly approved in SET-DEC-003.

## 2026-11-04 — A-004 confirmation history

The former pending requirement question is resolved by explicit user approval of optional Facebook/Instagram/TikTok links, HTTPS corresponding hosts, no required network. Earlier pending records remain historical and are superseded for policy only; no shared footer/UI implementation or live integration is claimed.

## A-014 — HOME bounded transport and ordering

Active noncritical implementation assumption, 2026-11-06, HOME-001. Title/subtitle/button text limits are 255/500/100 code points; banner text 1000. All are trimmed, well-formed, nonempty without controls. Button links max 2048 characters both before and after URL encoding. Display order integer 0..10000, ties broken by slide ID. Admin pagination follows existing 24/default, 48/max, 100000/max page; homepage categories use first 48 by ID. Curation lists are canonical sets rendered by product ID, not caller ranking. Resource versions are positive numeric unsigned INT; expected 0 is only for initial banner PUT, first creation version 1. Hero POST omits version; update/delete require current version. Banner PUT first-provisions slot at version 0, then CAS updates; no marketing text auto-seeded. One data JSON field plus one images upload per slide, reusing existing bounded CAT parser/FND normalization; JSON PUT may keep current image. Both absent/disabled banners are null under explicitly approved HOME-DEC-002. These transport/storage details are implementation bounds, not PRD quotations or a completed frontend freeze. Security/business rules are in HOME-DEC-002/CAT-DEC-011.
