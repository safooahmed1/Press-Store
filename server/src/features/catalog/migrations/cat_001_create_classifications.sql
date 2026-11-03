-- CAT / CAT-001. Additive, forward-only schema; no automatic DOWN.
-- MySQL DDL is not transactional. An interruption requires inspecting actual schema
-- and the FND execution marker; never auto-retry, drop tables or rewrite history.
CREATE TABLE categories (
  category_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin NOT NULL,
  image_path VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  UNIQUE KEY categories_name (name),
  CONSTRAINT categories_name_present CHECK (CHAR_LENGTH(TRIM(name)) > 0),
  CONSTRAINT categories_image_present CHECK (CHAR_LENGTH(image_path) > 0),
  CONSTRAINT categories_version_positive CHECK (version > 0)
) ENGINE=InnoDB;
CREATE TABLE brands (
  brand_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin NOT NULL,
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  UNIQUE KEY brands_name (name),
  CONSTRAINT brands_name_present CHECK (CHAR_LENGTH(TRIM(name)) > 0),
  CONSTRAINT brands_version_positive CHECK (version > 0)
) ENGINE=InnoDB;
