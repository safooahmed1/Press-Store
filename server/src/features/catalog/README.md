# Catalog domain — CAT-001

Server-internal domain implementation only; no public/admin routes yet. Ownership and canonical behavior: AI-DOCS/02-FEATURES/catalog-discovery/03-technical-contracts.md §14, CAT-DEC-002/003 and A-010.

Migrations are additive and use FND discovery, never startup. cat_001 creates classifications, cat_002 products, cat_003 images/variants. Apply only via the existing explicit operator runner after appropriate authorization. MySQL partial DDL is irreversible automatically: preserve FND interruption evidence and obtain an inspected recovery plan, never drop/retry automatically. Tests use only newly created disposable MySQL fixtures.

Services enforce mandatory main image, zero to three additional images, unique explicit variants, integer money and safe file compensation. Slot zero is main. Zero variants means no purchasable option. Repository methods are internal trusted-input persistence seams. Classification file cleanup after a committed delete may return cleanupPending; callers must reconcile without exposing storage paths. Do not automatically retry ambiguous commits or claim process-crash atomicity between MySQL and the filesystem.

CAT-002 owns public routes/filtering; CAT-003 owns admin HTTP, authentication, product updates, curation limits and full mutation recovery. CAT-006 retains consumer/integration/security acceptance. Mandatory documentation validation remains BLOCKED / NOT RUN; no completion commit or feature acceptance.


## CAT-002 public reads

Public /api/v1/products, /products/:id, /categories and /brands are composed by the CAT manifest using the FND lifecycle-owned database. Exact envelopes, query validation, price-filter disposition and bounds are canonical CAT contracts §15. Final-price range filters use SQL DECIMAL arithmetic matching the CAT integer calculation. Only active variant options and nondeleted products appear; a sold-out product remains browseable without variant filters. No admin mutations yet. urlFor is used purely to validate/render opaque stored image paths; its adapter's unused root is never created/accessed. Required original docs validation remains BLOCKED / NOT RUN; CAT-002 is local and uncommitted. CAT-003 still owns admin APIs and full file-mutation handling.


## CAT-003 protected admin management

/api/v1/admin/{products,categories,brands} supports guarded GET/POST/PUT/DELETE. Use version strings on mutations; product/category image changes use multipart data JSON + images files. Product PUT supports an ordered imageId/uploadIndex manifest and retains files only after validated ownership. Canonical fields/status/recovery behavior: CAT contracts §16, A-012, CAT-DEC-006. Fixed AUTH scope and Origin checks precede file parsing. Product/variant/history identities survive soft removal. New cat_004 singleton serializes max-eight curation writes and backs CMD-CAT-001 setFlags; it is explicit/forward only and never runs on startup.

FND injects validated storageConfig; production uses its validated serving root, test writes require an explicit temporary root. No implicit application file writes in tests. Obsolete-file cleanup happens after commit; cleanupPending warns of orphan files without undoing committed images or leaking paths. Explicit reconciliation is needed after cleanup/crash/ambiguous commit failures; no automatic retry/job is added. All formal CAT backend completion remains blocked on original documentation validator. No new commit/push or FE/full feature acceptance.

## Current accepted task status — 2026-11-04

CAT-DEC-007 records user-accepted closeout of CAT-002/CAT-003 for tracking only. CAT-001 remains blocked. Total 2/6 accepted; BE 2/3. Original docs validation remains BLOCKED / NOT RUN; no requirement/feature/merge gate pass inferred. Source is local and uncommitted, no new commit/push or next task. Earlier blocked status entries remain historical evidence.


## 2026-11-04 — Current checkpoint publication disposition

CAT-DEC-008 authorizes separate CAT-002/CAT-003 checkpoint commits and non-force push. CAT-002 checkpoint is 43ebb117945afe60babd86c12a55cd4091ea1514. CAT-003 planned subject is chore(CAT-003): checkpoint verified admin catalog management; resulting hash/push confirmation are reported from Git after execution, not invented in this record. Earlier local/uncommitted/no-authorization entries remain historical and are superseded for this publication only. Task accounting remains CAT-002/003 accepted done (2/6, BE 2/3); CAT-001 blocked. Original docs validation BLOCKED / NOT RUN; feature remains in-progress, all three Passed boxes unchecked. No new code tests run for publication, no PR/merge/deploy/next task.
