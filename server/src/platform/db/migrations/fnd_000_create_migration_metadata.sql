-- Owner: FND. Bootstrap only; executed under the database-scoped migration lock.
-- Forward-only, idempotent infrastructure initialization. Never drop history to recover.
-- Required indexes: binary unique names and applied_at history index.
CREATE TABLE IF NOT EXISTS migration_records (
  migration_name VARCHAR(190) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  checksum CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  applied_at DATETIME(6) NOT NULL,
  INDEX migration_records_applied_at (applied_at)
) ENGINE=InnoDB;

-- Plural name follows the original database rules and explicit user clarification.
CREATE TABLE IF NOT EXISTS migration_execution_states (
  migration_name VARCHAR(190) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  checksum CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  started_at DATETIME(6) NOT NULL
) ENGINE=InnoDB;
