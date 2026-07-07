
-- Site features: contact, newsletter, table reservations, stock, finance

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contact: anyone insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Contact: staff read" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Newsletter: anyone insert" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Newsletter: staff read" ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

CREATE TYPE public.table_reservation_status AS ENUM ('pending','confirmed','cancelled','completed');

CREATE TABLE public.table_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE DEFAULT ('TBL-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guests_count INT NOT NULL DEFAULT 2 CHECK (guests_count > 0),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  status public.table_reservation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.table_reservations TO anon, authenticated;
GRANT SELECT, UPDATE ON public.table_reservations TO authenticated;
GRANT ALL ON public.table_reservations TO service_role;
ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "TableRes: anyone insert" ON public.table_reservations FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "TableRes: staff manage" ON public.table_reservations FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff','reception']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff','reception']::public.app_role[]));

CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unité',
  min_threshold NUMERIC(10,2) NOT NULL DEFAULT 5,
  unit_cost NUMERIC(10,2) DEFAULT 0,
  category TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory: staff manage" ON public.inventory_items FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]));

CREATE TRIGGER trg_inventory_updated BEFORE UPDATE ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TYPE public.finance_type AS ENUM ('income','expense');

CREATE TABLE public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.finance_type NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_records TO authenticated;
GRANT ALL ON public.financial_records TO service_role;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Finance: accountant manage" ON public.financial_records FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','accountant']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','accountant']::public.app_role[]));

-- Seed inventory
INSERT INTO public.inventory_items (name, quantity, unit, min_threshold, category, unit_cost) VALUES
  ('Riz basmati', 25, 'kg', 10, 'Épicerie', 1200),
  ('Huile d''olive', 12, 'L', 5, 'Épicerie', 4500),
  ('Poisson frais', 8, 'kg', 5, 'Frais', 3500),
  ('Vin rouge', 24, 'bouteilles', 10, 'Boissons', 8000),
  ('Serviettes blanches', 200, 'unités', 50, 'Linge', 2500),
  ('Produits ménage', 15, 'L', 5, 'Entretien', 1800);
