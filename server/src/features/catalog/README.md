# Catalog domain — CAT-001

Server-internal domain implementation only; no public/admin routes yet. Ownership and canonical behavior: AI-DOCS/02-FEATURES/catalog-discovery/03-technical-contracts.md §14, CAT-DEC-002/003 and A-010.

Migrations are additive and use FND discovery, never startup. cat_001 creates classifications, cat_002 products, cat_003 images/variants. Apply only via the existing explicit operator runner after appropriate authorization. MySQL partial DDL is irreversible automatically: preserve FND interruption evidence and obtain an inspected recovery plan, never drop/retry automatically. Tests use only newly created disposable MySQL fixtures.

Services enforce mandatory main image, zero to three additional images, unique explicit variants, integer money and safe file compensation. Slot zero is main. Zero variants means no purchasable option. Repository methods are internal trusted-input persistence seams. Classification file cleanup after a committed delete may return cleanupPending; callers must reconcile without exposing storage paths. Do not automatically retry ambiguous commits or claim process-crash atomicity between MySQL and the filesystem.

CAT-002 owns public routes/filtering; CAT-003 owns admin HTTP, authentication, product updates, curation limits and full mutation recovery. CAT-006 retains consumer/integration/security acceptance. Mandatory documentation validation remains BLOCKED / NOT RUN; no completion commit or feature acceptance.
