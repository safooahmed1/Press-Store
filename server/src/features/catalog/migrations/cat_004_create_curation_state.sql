-- CAT / CAT-003. User-approved additive singleton for transactional curation coordination.
-- All CAT product create/update/delete operations lock this row before counting/updating flags.
-- No stock, order, HOME or AUTH tables. Forward only; never auto-drop or retry partial DDL.
-- Inspect actual schema and FND interruption marker before any separately approved recovery.
CREATE TABLE catalog_curation_states (
  state_id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  CONSTRAINT catalog_curation_singleton CHECK (state_id = 1)
) ENGINE=InnoDB;
INSERT INTO catalog_curation_states (state_id) VALUES (1);
