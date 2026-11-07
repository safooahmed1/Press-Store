-- ORD / ORD-001. Staged outside immediate discovery under ORD-DEC-005.
-- Forward-only additive schema. No startup or production application authorized.
-- No automatic DOWN: retain order history. On partial DDL preserve the FND marker;
-- inspect actual schema and restore/complete only through an approved recovery procedure.
-- store-orders sorts after the published CART baseline; do not rename old migrations.
CREATE TABLE orders (
  order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  payment_method ENUM('cash','wallet_eg','instapay') CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  wallet_sender_number VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NULL,
  payment_status ENUM('unpaid','payment_pending','paid') CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  fulfillment_status ENUM('placed','prepared','delivered','cancelled') CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  subtotal_minor BIGINT UNSIGNED NOT NULL,
  discount_minor BIGINT UNSIGNED NOT NULL,
  total_minor BIGINT UNSIGNED NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  cash_expires_at DATETIME(6) NULL,
  paid_at DATETIME(6) NULL,
  verified_by_admin_id BIGINT UNSIGNED NULL,
  prepared_at DATETIME(6) NULL,
  prepared_by_admin_id BIGINT UNSIGNED NULL,
  delivered_at DATETIME(6) NULL,
  delivered_by_admin_id BIGINT UNSIGNED NULL,
  cancelled_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
  CONSTRAINT orders_verifier FOREIGN KEY (verified_by_admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT,
  CONSTRAINT orders_preparer FOREIGN KEY (prepared_by_admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT,
  CONSTRAINT orders_deliverer FOREIGN KEY (delivered_by_admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT,
  CONSTRAINT orders_number_present CHECK (CHAR_LENGTH(TRIM(order_number)) > 0),
  CONSTRAINT orders_version_positive CHECK (version >= 1),
  CONSTRAINT orders_money CHECK (subtotal_minor <= 9007199254740991 AND discount_minor <= 9007199254740991
    AND total_minor <= 9007199254740991 AND subtotal_minor = total_minor + discount_minor),
  CONSTRAINT orders_wallet CHECK (
    (payment_method = 'wallet_eg' AND wallet_sender_number IS NOT NULL
      AND REGEXP_LIKE(wallet_sender_number, '^[+][1-9][0-9]{7,14}$', 'c'))
    OR (payment_method <> 'wallet_eg' AND wallet_sender_number IS NULL)),
  CONSTRAINT orders_payment_pair CHECK (
    (payment_method = 'cash' AND payment_status IN ('unpaid','paid'))
    OR (payment_method <> 'cash' AND payment_status IN ('payment_pending','paid'))),
  CONSTRAINT orders_cash_expiry CHECK (
    (payment_method = 'cash' AND payment_status = 'unpaid' AND cash_expires_at IS NOT NULL AND cash_expires_at > created_at)
    OR ((payment_method <> 'cash' OR payment_status = 'paid') AND cash_expires_at IS NULL)),
  CONSTRAINT orders_payment_audit CHECK (
    (payment_status = 'paid' AND paid_at IS NOT NULL AND paid_at >= created_at AND paid_at <= updated_at)
    OR (payment_status <> 'paid' AND paid_at IS NULL)),
  CONSTRAINT orders_manual_verifier CHECK (
    (payment_method <> 'cash' AND payment_status = 'paid' AND verified_by_admin_id IS NOT NULL)
    OR ((payment_method = 'cash' OR payment_status <> 'paid') AND verified_by_admin_id IS NULL)),
  CONSTRAINT orders_electronic_pending CHECK (payment_status <> 'payment_pending' OR fulfillment_status = 'placed'),
  CONSTRAINT orders_cash_paid CHECK (payment_method <> 'cash' OR payment_status <> 'paid' OR fulfillment_status = 'delivered'),
  CONSTRAINT orders_delivery_audit CHECK (
    (fulfillment_status = 'delivered' AND payment_status = 'paid' AND delivered_at IS NOT NULL
      AND delivered_by_admin_id IS NOT NULL AND delivered_at >= paid_at AND delivered_at <= updated_at)
    OR (fulfillment_status <> 'delivered' AND delivered_at IS NULL AND delivered_by_admin_id IS NULL)),
  CONSTRAINT orders_preparation_pair CHECK (
    (prepared_at IS NULL AND prepared_by_admin_id IS NULL AND fulfillment_status <> 'prepared')
    OR (prepared_at IS NOT NULL AND prepared_by_admin_id IS NOT NULL AND fulfillment_status <> 'placed'
      AND prepared_at >= created_at AND prepared_at <= updated_at
      AND (delivered_at IS NULL OR prepared_at <= delivered_at)
      AND (cancelled_at IS NULL OR prepared_at <= cancelled_at))),
  CONSTRAINT orders_cancel_audit CHECK (
    (fulfillment_status = 'cancelled' AND payment_method = 'cash' AND payment_status = 'unpaid'
      AND cancelled_at IS NOT NULL AND cancelled_at >= cash_expires_at AND cancelled_at <= updated_at)
    OR (fulfillment_status <> 'cancelled' AND cancelled_at IS NULL)),
  CONSTRAINT orders_time_order CHECK (updated_at >= created_at),
  UNIQUE KEY orders_number_unique (order_number),
  UNIQUE KEY orders_owner (order_id, customer_id),
  KEY orders_customer_history (customer_id, created_at, order_id),
  KEY orders_fulfillment (fulfillment_status, created_at, order_id),
  KEY orders_cash_expiry (payment_method, payment_status, cash_expires_at, fulfillment_status, order_id)
) ENGINE=InnoDB;
