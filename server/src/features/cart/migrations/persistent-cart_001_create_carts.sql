-- CART / CART-001. Additive, forward-only; explicit operator migration only.
-- STAGED outside discovery while real CAT wiring remains explicitly stopped.
-- Tests apply this file explicitly after AUTH/CAT migrations.
-- The canonical feature-name prefix sorts after cat_* under DB-FND-001.
-- Preserve all existing AUTH/CAT migrations and history. No automatic DOWN.
-- Recovery: inspect partial DDL and FND execution marker before an approved repair;
-- do not automatically drop tables, retry unresolved DDL, or mark it applied.
-- Unique owner and cart+variant keys support locks/merges; FKs restrict deletion.
CREATE TABLE carts (
  cart_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT carts_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
  CONSTRAINT carts_version_positive CHECK (version >= 1),
  UNIQUE KEY carts_customer_unique (customer_id)
) ENGINE=InnoDB;
CREATE TABLE cart_items (
  cart_item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT UNSIGNED NOT NULL,
  variant_id BIGINT UNSIGNED NOT NULL,
  quantity TINYINT UNSIGNED NOT NULL,
  current_unit_price_minor BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE RESTRICT,
  CONSTRAINT cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE RESTRICT,
  CONSTRAINT cart_items_quantity CHECK (quantity BETWEEN 1 AND 99),
  CONSTRAINT cart_items_price CHECK (current_unit_price_minor <= 9007199254740991),
  UNIQUE KEY cart_items_variant_unique (cart_id, variant_id),
  KEY cart_items_variant (variant_id)
) ENGINE=InnoDB;
