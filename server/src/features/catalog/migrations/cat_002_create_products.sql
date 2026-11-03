-- CAT / CAT-001. Additive; classification FKs restrict deletes, including soft-deleted products.
-- Indexes support future public category/brand/price queries. No stock quantity.
-- Partial DDL requires separately approved inspection/recovery, never automatic DOWN.
CREATE TABLE products (
  product_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  brand_id BIGINT UNSIGNED NOT NULL,
  price_minor BIGINT UNSIGNED NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  deleted_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT products_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
  CONSTRAINT products_brand FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE RESTRICT,
  CONSTRAINT products_price CHECK (price_minor BETWEEN 1 AND 9007199254740991),
  CONSTRAINT products_discount CHECK (discount_percent BETWEEN 0 AND 100),
  CONSTRAINT products_flags CHECK (is_best_seller IN (0,1) AND is_new_arrival IN (0,1)),
  CONSTRAINT products_version CHECK (version > 0),
  CONSTRAINT products_copy CHECK (CHAR_LENGTH(TRIM(name)) > 0 AND CHAR_LENGTH(TRIM(description)) > 0),
  KEY products_category_price (category_id, deleted_at, price_minor, product_id),
  KEY products_brand_price (brand_id, deleted_at, price_minor, product_id),
  KEY products_public_price (deleted_at, price_minor, product_id)
) ENGINE=InnoDB;
