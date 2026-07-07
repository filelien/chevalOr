
-- ============ RESTAURANT POS SCHEMA ============

CREATE TYPE public.table_status AS ENUM ('available','occupied','reserved','cleaning');
CREATE TYPE public.order_status AS ENUM ('new','preparing','ready','served','paid','cancelled');

-- Menu categories
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_categories TO authenticated;
GRANT ALL ON public.menu_categories TO service_role;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "MenuCategories: public read active" ON public.menu_categories FOR SELECT TO anon USING (is_active = TRUE);
CREATE POLICY "MenuCategories: auth read" ON public.menu_categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "MenuCategories: managers write" ON public.menu_categories FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

CREATE TRIGGER trg_menu_categories_updated BEFORE UPDATE ON public.menu_categories
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Menu items
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "MenuItems: public read available" ON public.menu_items FOR SELECT TO anon USING (is_available = TRUE);
CREATE POLICY "MenuItems: auth read" ON public.menu_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "MenuItems: managers write" ON public.menu_items FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

CREATE TRIGGER trg_menu_items_updated BEFORE UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);

-- Restaurant tables
CREATE TABLE public.restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT 4 CHECK (capacity > 0),
  status public.table_status NOT NULL DEFAULT 'available',
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_tables TO authenticated;
GRANT ALL ON public.restaurant_tables TO service_role;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RestTables: staff read" ON public.restaurant_tables FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]));
CREATE POLICY "RestTables: staff write" ON public.restaurant_tables FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]));

CREATE TRIGGER trg_restaurant_tables_updated BEFORE UPDATE ON public.restaurant_tables
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Orders
CREATE TABLE public.restaurant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE DEFAULT ('ORD-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  status public.order_status NOT NULL DEFAULT 'new',
  guests_count INT NOT NULL DEFAULT 1 CHECK (guests_count > 0),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_orders TO authenticated;
GRANT ALL ON public.restaurant_orders TO service_role;
ALTER TABLE public.restaurant_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RestOrders: staff manage" ON public.restaurant_orders FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]));

CREATE TRIGGER trg_restaurant_orders_updated BEFORE UPDATE ON public.restaurant_orders
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_restaurant_orders_table ON public.restaurant_orders(table_id);
CREATE INDEX idx_restaurant_orders_status ON public.restaurant_orders(status);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.restaurant_orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  line_total NUMERIC(10,2) NOT NULL CHECK (line_total >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "OrderItems: staff manage" ON public.order_items FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','restaurant_staff']::public.app_role[]));

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Recalculate order totals
CREATE OR REPLACE FUNCTION public.recalc_order_total(_order_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _sub NUMERIC(10,2);
BEGIN
  SELECT COALESCE(SUM(line_total), 0) INTO _sub FROM public.order_items WHERE order_id = _order_id;
  UPDATE public.restaurant_orders SET subtotal = _sub, total = _sub, updated_at = now() WHERE id = _order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalc_order_total()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  PERFORM public.recalc_order_total(COALESCE(NEW.order_id, OLD.order_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_order_items_recalc AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_order_total();

GRANT EXECUTE ON FUNCTION public.recalc_order_total(UUID) TO authenticated;

-- Super admin: read all user roles (for user management UI)
DROP POLICY IF EXISTS "User roles: super admin read all" ON public.user_roles;
CREATE POLICY "User roles: super admin read all" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Super admin: read all profiles for user management
DROP POLICY IF EXISTS "Profiles: super admin read all" ON public.profiles;
CREATE POLICY "Profiles: super admin read all" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Seed default menu + tables
INSERT INTO public.menu_categories (name, sort_order) VALUES
  ('Entrées', 1), ('Plats', 2), ('Desserts', 3), ('Boissons', 4);

INSERT INTO public.menu_items (category_id, name, description, price, sort_order)
SELECT c.id, v.name, v.description, v.price, v.ord
FROM public.menu_categories c
JOIN (VALUES
  ('Entrées', 'Salade exotique', 'Mangue, avocat, vinaigrette citronnée', 4500, 1),
  ('Entrées', 'Soupe du jour', 'Préparation du chef', 3500, 2),
  ('Plats', 'Poisson braisé', 'Poisson frais, légumes de saison', 8500, 1),
  ('Plats', 'Poulet DG', 'Recette togolaise traditionnelle', 7500, 2),
  ('Plats', 'Entrecôte grillée', 'Pommes sautées, sauce au poivre', 12000, 3),
  ('Desserts', 'Mousse au chocolat', 'Chocolat noir 70%', 4000, 1),
  ('Desserts', 'Tarte tropézienne', 'Crème légère, sucre glace', 4500, 2),
  ('Boissons', 'Jus de bissap', 'Maison, frais', 2000, 1),
  ('Boissons', 'Eau minérale', '50cl', 1500, 2),
  ('Boissons', 'Vin rouge (verre)', 'Sélection du sommelier', 5000, 3)
) AS v(cat, name, description, price, ord) ON c.name = v.cat;

INSERT INTO public.restaurant_tables (number, capacity, location) VALUES
  ('T1', 2, 'Terrasse'), ('T2', 2, 'Terrasse'), ('T3', 4, 'Salle'),
  ('T4', 4, 'Salle'), ('T5', 6, 'Salle'), ('T6', 8, 'Salon privé');
