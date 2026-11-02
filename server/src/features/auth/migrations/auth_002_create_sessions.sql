-- Owner: AUTH / AUTH-001. Forward-only session schema; identity migration precedes this file.
-- Recovery: inspect actual schema and FND interruption marker; never auto-drop sessions or retry partial DDL.
-- Two nullable FKs plus a scope CHECK enforce the conceptual actorType/actorId relationship.
-- No cascading deletion. Primary hash supports lookup/revocation; expiry and actor indexes support cleanup.
CREATE TABLE sessions (
  session_id_hash BINARY(32) NOT NULL PRIMARY KEY,
  actor_type ENUM('customer', 'admin') NOT NULL,
  customer_id BIGINT UNSIGNED NULL,
  admin_id BIGINT UNSIGNED NULL,
  expires_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  last_seen_at DATETIME(6) NOT NULL,
  INDEX sessions_expiry (expires_at),
  INDEX sessions_customer (customer_id),
  INDEX sessions_admin (admin_id),
  CONSTRAINT sessions_customer_fk FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
  CONSTRAINT sessions_admin_fk FOREIGN KEY (admin_id) REFERENCES admins (admin_id),
  CONSTRAINT sessions_actor_scope CHECK (
    (actor_type = 'customer' AND customer_id IS NOT NULL AND admin_id IS NULL)
    OR (actor_type = 'admin' AND admin_id IS NOT NULL AND customer_id IS NULL)
  ),
  CONSTRAINT sessions_time_order CHECK (expires_at > created_at AND last_seen_at >= created_at)
) ENGINE=InnoDB;
