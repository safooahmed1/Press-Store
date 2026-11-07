-- ORD / ORD-001. Append-only history protection; staged outside automatic discovery.
-- Requires CREATE TRIGGER privileges, verified only on disposable MySQL, not hosting.
-- Partial DDL recovery is manual and separately approved; never silently drop these guards.
CREATE TRIGGER orders_keep_facts BEFORE UPDATE ON orders FOR EACH ROW
BEGIN
  IF NOT (NEW.order_id <=> OLD.order_id AND NEW.order_number <=> OLD.order_number
    AND NEW.customer_id <=> OLD.customer_id AND NEW.payment_method <=> OLD.payment_method
    AND NEW.wallet_sender_number <=> OLD.wallet_sender_number AND NEW.subtotal_minor <=> OLD.subtotal_minor
    AND NEW.discount_minor <=> OLD.discount_minor AND NEW.total_minor <=> OLD.total_minor
    AND NEW.created_at <=> OLD.created_at) THEN
    SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = 'Order facts are immutable';
  END IF;
  IF (OLD.paid_at IS NOT NULL AND NOT (NEW.paid_at <=> OLD.paid_at))
    OR (OLD.verified_by_admin_id IS NOT NULL AND NOT (NEW.verified_by_admin_id <=> OLD.verified_by_admin_id))
    OR (OLD.prepared_at IS NOT NULL AND NOT (NEW.prepared_at <=> OLD.prepared_at))
    OR (OLD.prepared_by_admin_id IS NOT NULL AND NOT (NEW.prepared_by_admin_id <=> OLD.prepared_by_admin_id))
    OR (OLD.delivered_at IS NOT NULL AND NOT (NEW.delivered_at <=> OLD.delivered_at))
    OR (OLD.delivered_by_admin_id IS NOT NULL AND NOT (NEW.delivered_by_admin_id <=> OLD.delivered_by_admin_id))
    OR (OLD.cancelled_at IS NOT NULL AND NOT (NEW.cancelled_at <=> OLD.cancelled_at))
    OR (OLD.cash_expires_at IS NULL AND NEW.cash_expires_at IS NOT NULL)
    OR (OLD.cash_expires_at IS NOT NULL AND NEW.cash_expires_at IS NOT NULL AND NOT (NEW.cash_expires_at <=> OLD.cash_expires_at)) THEN
    SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = 'Order audit facts are immutable';
  END IF;
  IF NOT (NEW.payment_status <=> OLD.payment_status AND NEW.fulfillment_status <=> OLD.fulfillment_status
    AND NEW.cash_expires_at <=> OLD.cash_expires_at AND NEW.paid_at <=> OLD.paid_at
    AND NEW.verified_by_admin_id <=> OLD.verified_by_admin_id AND NEW.prepared_at <=> OLD.prepared_at
    AND NEW.prepared_by_admin_id <=> OLD.prepared_by_admin_id AND NEW.delivered_at <=> OLD.delivered_at
    AND NEW.delivered_by_admin_id <=> OLD.delivered_by_admin_id AND NEW.cancelled_at <=> OLD.cancelled_at) THEN
    IF NEW.version <> OLD.version + 1 OR NEW.updated_at < OLD.updated_at THEN
      SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = 'Order transition requires next version and time';
    END IF;
  ELSEIF NEW.version <> OLD.version OR NOT (NEW.updated_at <=> OLD.updated_at) THEN
    SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = 'Order repeat must preserve audit version';
  END IF;
END;
CREATE TRIGGER orders_keep_history BEFORE DELETE ON orders FOR EACH ROW
  SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = 'Order history is retained';
CREATE TRIGGER order_items_keep_snapshot BEFORE UPDATE ON order_items FOR EACH ROW
  SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = 'Order item snapshots are immutable';
CREATE TRIGGER order_items_keep_history BEFORE DELETE ON order_items FOR EACH ROW
  SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = 'Order item history is retained';
CREATE TRIGGER order_idempotency_keep_snapshot BEFORE UPDATE ON order_idempotency_records FOR EACH ROW
  SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = 'Order idempotency records are immutable';
CREATE TRIGGER order_idempotency_keep_history BEFORE DELETE ON order_idempotency_records FOR EACH ROW
  SIGNAL SQLSTATE '23000' SET MESSAGE_TEXT = 'Order idempotency history is retained';
