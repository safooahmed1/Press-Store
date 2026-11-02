-- Owner: AUTH / AUTH-001. Forward-only additive identity schema.
-- Recovery: inspect partial DDL and the FND interruption marker before any retry.
-- No automatic DOWN: preserve identities; any destructive recovery requires a separately approved backup/restore plan.
-- Unique phone indexes enforce canonical identity; the admin primary key and CHECK allow exactly one admin.
CREATE TABLE customers (
  customer_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(13) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  password_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  UNIQUE KEY customers_phone (phone),
  CONSTRAINT customers_phone_format CHECK (REGEXP_LIKE(phone, '^[+]201[0-9]{9}$', 'c') AND CHAR_LENGTH(phone) = 13),
  CONSTRAINT customers_names_present CHECK (CHAR_LENGTH(TRIM(first_name)) > 0 AND CHAR_LENGTH(TRIM(last_name)) > 0)
) ENGINE=InnoDB;

CREATE TABLE admins (
  admin_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  phone VARCHAR(13) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  password_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  UNIQUE KEY admins_phone (phone),
  CONSTRAINT admins_single_identity CHECK (admin_id = 1),
  CONSTRAINT admins_phone_format CHECK (REGEXP_LIKE(phone, '^[+]201[0-9]{9}$', 'c') AND CHAR_LENGTH(phone) = 13)
) ENGINE=InnoDB;
