-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id           SERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  product_name  VARCHAR(100) NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'shipped', 'delivered')),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Notification function: sends full row as JSON payload on any change
CREATE OR REPLACE FUNCTION notify_order_change()
RETURNS trigger AS $$
DECLARE
  payload JSON;
BEGIN
  IF TG_OP = 'DELETE' THEN
    payload := json_build_object(
      'operation', TG_OP,
      'data', row_to_json(OLD)
    );
  ELSE
    payload := json_build_object(
      'operation', TG_OP,
      'data', row_to_json(NEW)
    );
  END IF;

  PERFORM pg_notify('orders_channel', payload::text);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: fires AFTER any INSERT, UPDATE, or DELETE on orders
DROP TRIGGER IF EXISTS orders_change_trigger ON orders;
CREATE TRIGGER orders_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_change();
