-- CAT / CAT-001. Preserve variant/image identities: no cascading destructive deletes.
-- Slot 0 is main, slots 1..3 additional. Unique slot + CHECK enforce upper limits;
-- the CAT service enforces main-image existence atomically with product creation.
-- Image paths are opaque FND-owned filenames, never user-selected filesystem paths.
-- Recovery: inspect partial DDL and FND marker; no automatic rollback/drop/retry.
CREATE TABLE product_images (
  product_image_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  image_path VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  slot TINYINT UNSIGNED NOT NULL,
  CONSTRAINT product_images_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
  CONSTRAINT product_images_slot CHECK (slot BETWEEN 0 AND 3),
  CONSTRAINT product_images_path CHECK (CHAR_LENGTH(image_path) > 0),
  UNIQUE KEY product_images_order (product_id, slot),
  UNIQUE KEY product_images_path_unique (image_path)
) ENGINE=InnoDB;
CREATE TABLE product_variants (
  variant_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  color VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin NOT NULL,
  size VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT product_variants_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
  CONSTRAINT product_variants_boolean CHECK (is_available IN (0,1)),
  CONSTRAINT product_variants_labels CHECK (CHAR_LENGTH(TRIM(color)) > 0 AND CHAR_LENGTH(TRIM(size)) > 0),
  UNIQUE KEY product_variants_pair (product_id, color, size),
  KEY product_variants_filters (color, size, is_available, product_id),
  KEY product_variants_size (size, is_available, product_id)
) ENGINE=InnoDB;
