-- HOME / HOME-001. Additive explicit migrations only; no seed marketing text/images.
-- Singleton serializes hero limits through commit. Banners are two fixed placements.
-- Forward only: partial MySQL DDL requires inspection/FND marker recovery approval, never auto-drop/retry.
CREATE TABLE homepage_states (
  state_id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  CONSTRAINT homepage_singleton CHECK (state_id = 1)
) ENGINE=InnoDB;
INSERT INTO homepage_states (state_id) VALUES (1);
CREATE TABLE hero_slides (
  hero_slide_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  image_path VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500) NOT NULL,
  button_text VARCHAR(100) NOT NULL,
  button_link VARCHAR(2048) NOT NULL,
  is_active BOOLEAN NOT NULL,
  display_order INT UNSIGNED NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT hero_fields CHECK (CHAR_LENGTH(TRIM(title)) > 0 AND CHAR_LENGTH(TRIM(subtitle)) > 0 AND CHAR_LENGTH(TRIM(button_text)) > 0),
  CONSTRAINT hero_active CHECK (is_active IN (0,1)),
  CONSTRAINT hero_version CHECK (version > 0),
  CONSTRAINT hero_order CHECK (display_order <= 10000),
  KEY hero_active_order (is_active, display_order, hero_slide_id)
) ENGINE=InnoDB;
CREATE TABLE promotion_banners (
  placement VARCHAR(8) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  text VARCHAR(1000) NOT NULL,
  is_active BOOLEAN NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT banners_placement CHECK (placement IN ('banner_1','banner_2')),
  CONSTRAINT banners_text CHECK (CHAR_LENGTH(TRIM(text)) > 0),
  CONSTRAINT banners_active CHECK (is_active IN (0,1)),
  CONSTRAINT banners_version CHECK (version > 0)
) ENGINE=InnoDB;
