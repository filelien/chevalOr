-- Operations 360: spa, bar, laundry, housekeeping, maintenance CRUD modules

CREATE TABLE IF NOT EXISTS public.spa_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'massage',
  duration_min INT NOT NULL DEFAULT 60 CHECK (duration_min > 0),
  price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.spa_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code TEXT UNIQUE,
  service_id UUID REFERENCES public.spa_services(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  therapist_name TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','ongoing','done','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bar_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'cocktail',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  stock_qty NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bar_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code TEXT UNIQUE,
  table_ref TEXT,
  customer_name TEXT,
  total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','prepared','served','paid','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.laundry_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  room_ref TEXT,
  item_count INT NOT NULL DEFAULT 1 CHECK (item_count > 0),
  service_type TEXT NOT NULL DEFAULT 'standard',
  total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','washing','ready','delivered','cancelled')),
  pickup_at TIMESTAMPTZ,
  delivery_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code TEXT UNIQUE,
  room_ref TEXT NOT NULL,
  assigned_to TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','validated')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code TEXT UNIQUE,
  title TEXT NOT NULL,
  room_ref TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','assigned','in_progress','resolved','closed')),
  technician_name TEXT,
  estimated_cost NUMERIC(10,2) DEFAULT 0 CHECK (estimated_cost >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.touch_ops_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_spa_services_updated ON public.spa_services;
CREATE TRIGGER trg_spa_services_updated BEFORE UPDATE ON public.spa_services FOR EACH ROW EXECUTE FUNCTION public.touch_ops_updated_at();
DROP TRIGGER IF EXISTS trg_spa_bookings_updated ON public.spa_bookings;
CREATE TRIGGER trg_spa_bookings_updated BEFORE UPDATE ON public.spa_bookings FOR EACH ROW EXECUTE FUNCTION public.touch_ops_updated_at();
DROP TRIGGER IF EXISTS trg_bar_products_updated ON public.bar_products;
CREATE TRIGGER trg_bar_products_updated BEFORE UPDATE ON public.bar_products FOR EACH ROW EXECUTE FUNCTION public.touch_ops_updated_at();
DROP TRIGGER IF EXISTS trg_bar_orders_updated ON public.bar_orders;
CREATE TRIGGER trg_bar_orders_updated BEFORE UPDATE ON public.bar_orders FOR EACH ROW EXECUTE FUNCTION public.touch_ops_updated_at();
DROP TRIGGER IF EXISTS trg_laundry_orders_updated ON public.laundry_orders;
CREATE TRIGGER trg_laundry_orders_updated BEFORE UPDATE ON public.laundry_orders FOR EACH ROW EXECUTE FUNCTION public.touch_ops_updated_at();
DROP TRIGGER IF EXISTS trg_housekeeping_tasks_updated ON public.housekeeping_tasks;
CREATE TRIGGER trg_housekeeping_tasks_updated BEFORE UPDATE ON public.housekeeping_tasks FOR EACH ROW EXECUTE FUNCTION public.touch_ops_updated_at();
DROP TRIGGER IF EXISTS trg_maintenance_tickets_updated ON public.maintenance_tickets;
CREATE TRIGGER trg_maintenance_tickets_updated BEFORE UPDATE ON public.maintenance_tickets FOR EACH ROW EXECUTE FUNCTION public.touch_ops_updated_at();

DROP TRIGGER IF EXISTS trg_spa_service_entity_code ON public.spa_services;
CREATE TRIGGER trg_spa_service_entity_code AFTER INSERT ON public.spa_services FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('PRODUCT', 'spa_service');
DROP TRIGGER IF EXISTS trg_spa_booking_entity_code ON public.spa_bookings;
CREATE TRIGGER trg_spa_booking_entity_code AFTER INSERT ON public.spa_bookings FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('BOOK', 'spa_booking');
DROP TRIGGER IF EXISTS trg_bar_product_entity_code ON public.bar_products;
CREATE TRIGGER trg_bar_product_entity_code AFTER INSERT ON public.bar_products FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('PRODUCT', 'bar_product');
DROP TRIGGER IF EXISTS trg_bar_order_entity_code ON public.bar_orders;
CREATE TRIGGER trg_bar_order_entity_code AFTER INSERT ON public.bar_orders FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('ORDER', 'bar_order');
DROP TRIGGER IF EXISTS trg_laundry_entity_code ON public.laundry_orders;
CREATE TRIGGER trg_laundry_entity_code AFTER INSERT ON public.laundry_orders FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('ORDER', 'laundry_order');
DROP TRIGGER IF EXISTS trg_housekeeping_entity_code ON public.housekeeping_tasks;
CREATE TRIGGER trg_housekeeping_entity_code AFTER INSERT ON public.housekeeping_tasks FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('CHECKIN', 'housekeeping_task');
DROP TRIGGER IF EXISTS trg_maintenance_entity_code ON public.maintenance_tickets;
CREATE TRIGGER trg_maintenance_entity_code AFTER INSERT ON public.maintenance_tickets FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('EXPENSE', 'maintenance_ticket');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.spa_services, public.spa_bookings, public.bar_products, public.bar_orders, public.laundry_orders, public.housekeeping_tasks, public.maintenance_tickets TO authenticated;
GRANT ALL ON public.spa_services, public.spa_bookings, public.bar_products, public.bar_orders, public.laundry_orders, public.housekeeping_tasks, public.maintenance_tickets TO service_role;

ALTER TABLE public.spa_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spa_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bar_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bar_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops: spa services staff manage" ON public.spa_services FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff','reception']::public.app_role[]));
CREATE POLICY "Ops: spa bookings staff manage" ON public.spa_bookings FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff','reception']::public.app_role[]));
CREATE POLICY "Ops: bar products staff manage" ON public.bar_products FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]));
CREATE POLICY "Ops: bar orders staff manage" ON public.bar_orders FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]));
CREATE POLICY "Ops: laundry staff manage" ON public.laundry_orders FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','cleaning_staff','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','cleaning_staff','reception']::public.app_role[]));
CREATE POLICY "Ops: housekeeping staff manage" ON public.housekeeping_tasks FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','cleaning_staff','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','cleaning_staff','reception']::public.app_role[]));
CREATE POLICY "Ops: maintenance staff manage" ON public.maintenance_tickets FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','cleaning_staff','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','cleaning_staff','reception']::public.app_role[]));
