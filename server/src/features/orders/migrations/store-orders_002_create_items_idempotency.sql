-- ORD / ORD-001. Staged, forward-only. No automatic rollback/drop or cascade.
-- Immutable rows are protected by the following ORD-owned trigger migration.
-- FK and unique indexes preserve owner association; position bounds enforce max 100 rows/order.
CREATE TABLE order_items (
  order_item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  position SMALLINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  variant_id BIGINT UNSIGNED NULL,
  product_name VARCHAR(255) NOT NULL,
  color VARCHAR(100) NOT NULL,
  size VARCHAR(100) NOT NULL,
  quantity TINYINT UNSIGNED NOT NULL,
  base_unit_price_minor BIGINT UNSIGNED NOT NULL,
  final_unit_price_minor BIGINT UNSIGNED NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  line_subtotal_minor BIGINT UNSIGNED GENERATED ALWAYS AS (base_unit_price_minor * quantity) STORED,
  line_total_minor BIGINT UNSIGNED GENERATED ALWAYS AS (final_unit_price_minor * quantity) STORED,
  line_discount_minor BIGINT UNSIGNED GENERATED ALWAYS AS ((base_unit_price_minor - final_unit_price_minor) * quantity) STORED,
  created_at DATETIME(6) NOT NULL,
  CONSTRAINT order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE RESTRICT,
  CONSTRAINT order_items_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
  CONSTRAINT order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE RESTRICT,
  CONSTRAINT order_items_identity_pair CHECK ((product_id IS NULL AND variant_id IS NULL)
    OR (product_id IS NOT NULL AND variant_id IS NOT NULL)),
  CONSTRAINT order_items_position CHECK (position BETWEEN 1 AND 100),
  CONSTRAINT order_items_quantity CHECK (quantity BETWEEN 1 AND 99),
  CONSTRAINT order_items_money CHECK (base_unit_price_minor BETWEEN 1 AND 9007199254740991
    AND final_unit_price_minor <= base_unit_price_minor AND line_subtotal_minor <= 9007199254740991
    AND line_total_minor <= 9007199254740991 AND discount_percent BETWEEN 0 AND 100),
  CONSTRAINT order_items_text CHECK (CHAR_LENGTH(TRIM(product_name)) > 0 AND CHAR_LENGTH(TRIM(color)) > 0 AND CHAR_LENGTH(TRIM(size)) > 0),
  UNIQUE KEY order_items_position (order_id, position),
  KEY order_items_product (product_id),
  KEY order_items_variant (variant_id)
) ENGINE=InnoDB;

CREATE TABLE order_idempotency_records (
  customer_id BIGINT UNSIGNED NOT NULL,
  idempotency_key_hash BINARY(32) NOT NULL,
  request_hash BINARY(32) NOT NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (customer_id, idempotency_key_hash),
  UNIQUE KEY order_idempotency_order (order_id),
  KEY order_idempotency_owner (order_id, customer_id),
  CONSTRAINT order_idempotency_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
  CONSTRAINT order_idempotency_owner FOREIGN KEY (order_id, customer_id) REFERENCES orders(order_id, customer_id) ON DELETE RESTRICT
) ENGINE=InnoDB;
