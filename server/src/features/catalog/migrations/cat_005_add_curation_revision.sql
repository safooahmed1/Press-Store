-- CAT / approved HOME-001 consumer amendment. Additive, forward only.
-- Shared revision detects list edits and legacy single-product flag changes under the existing singleton lock.
-- No duplicate HOME selection table or existing migration edits; no automatic DOWN/retry.
-- On interrupted DDL retain the FND marker and inspect schema before separately approved recovery.
ALTER TABLE catalog_curation_states ADD COLUMN curation_version INT UNSIGNED NOT NULL DEFAULT 1,
  ADD CONSTRAINT catalog_curation_version_positive CHECK (curation_version > 0);
