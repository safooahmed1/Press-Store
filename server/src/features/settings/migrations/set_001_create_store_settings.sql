-- SET / SET-001. Additive singleton schema; explicit FND runner only, never startup.
-- No initial business values or credentials are seeded. Admin version-0 PUT provisions once.
-- Forward only. MySQL DDL may partially commit: preserve FND interruption marker,
-- inspect actual schema and obtain a separate recovery plan; never auto-drop/retry.
CREATE TABLE store_settings (
  settings_id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL,
  store_phone VARCHAR(13) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  whatsapp_phone VARCHAR(13) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  wallet_eg_number VARCHAR(13) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  insta_pay_number VARCHAR(13) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  social_links JSON NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT settings_singleton CHECK (settings_id = 1),
  CONSTRAINT settings_name CHECK (CHAR_LENGTH(TRIM(store_name)) > 0),
  CONSTRAINT settings_version CHECK (version > 0),
  CONSTRAINT settings_social_object CHECK (JSON_TYPE(social_links) = 'OBJECT'),
  CONSTRAINT settings_store_phone CHECK (REGEXP_LIKE(store_phone, '^[+]201[0-9]{9}$', 'c') AND CHAR_LENGTH(store_phone) = 13),
  CONSTRAINT settings_whatsapp_phone CHECK (REGEXP_LIKE(whatsapp_phone, '^[+]201[0-9]{9}$', 'c') AND CHAR_LENGTH(whatsapp_phone) = 13),
  CONSTRAINT settings_wallet_phone CHECK (REGEXP_LIKE(wallet_eg_number, '^[+]201[0-9]{9}$', 'c') AND CHAR_LENGTH(wallet_eg_number) = 13),
  CONSTRAINT settings_instapay_phone CHECK (REGEXP_LIKE(insta_pay_number, '^[+]201[0-9]{9}$', 'c') AND CHAR_LENGTH(insta_pay_number) = 13)
) ENGINE=InnoDB;
