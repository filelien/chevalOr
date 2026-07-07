-- ERP Platform Complete: entity_id fix, guest reservations, entity codes, RLS

-- ============================================================
-- 1. FIX entity_id UUID vs TEXT in activity_log trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_reservation_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END,
    'reservation',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'status', COALESCE(NEW.status, OLD.status),
      'total_price', COALESCE(NEW.total_price, OLD.total_price),
      'room_id', COALESCE(NEW.room_id, OLD.room_id)
    )
  );
  INSERT INTO public.audit_logs (user_id, action, module, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'reservation_created' ELSE 'reservation_updated' END,
    'reservation',
    'reservation',
    COALESCE(NEW.id, OLD.id)::text,
    jsonb_build_object(
      'old', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
      'new', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. Guest reservation fields on reservations
-- ============================================================
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT;

ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS entity_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;

-- Allow anon to insert guests via RPC only (no direct anon insert)
GRANT SELECT ON public.guests TO anon;

-- ============================================================
-- 3. ENTITY CODE SYSTEM — sequences + registry
-- ============================================================
CREATE TABLE IF NOT EXISTS public.entity_code_sequences (
  prefix TEXT PRIMARY KEY,
  last_value BIGINT NOT NULL DEFAULT 0,
  pad_length INT NOT NULL DEFAULT 6,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.entity_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefix TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  qr_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entity_codes_entity ON public.entity_codes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_codes_code ON public.entity_codes(code);

GRANT SELECT ON public.entity_codes TO anon, authenticated;
GRANT ALL ON public.entity_codes TO service_role;
GRANT SELECT, UPDATE ON public.entity_code_sequences TO service_role;

ALTER TABLE public.entity_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_code_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "EntityCodes: staff read" ON public.entity_codes
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception','restaurant_staff','accountant']::public.app_role[]));

CREATE POLICY "EntityCodes: staff manage" ON public.entity_codes
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

CREATE POLICY "EntityCodeSeq: staff read" ON public.entity_code_sequences
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

-- Seed default prefixes
INSERT INTO public.entity_code_sequences (prefix, last_value, pad_length) VALUES
  ('HOTEL', 0, 6),
  ('ROOM', 0, 6),
  ('FLOOR', 0, 6),
  ('TABLE', 0, 6),
  ('MENU', 0, 6),
  ('CLIENT', 0, 6),
  ('BOOK', 0, 6),
  ('CHECKIN', 0, 6),
  ('CHECKOUT', 0, 6),
  ('ORDER', 0, 6),
  ('PAYMENT', 0, 6),
  ('INVOICE', 0, 6),
  ('PRODUCT', 0, 6),
  ('EMPLOYEE', 0, 6),
  ('SUPPLIER', 0, 6),
  ('EXPENSE', 0, 6)
ON CONFLICT (prefix) DO NOTHING;

-- Generate sequential entity code
CREATE OR REPLACE FUNCTION public.generate_entity_code(_prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next BIGINT;
  v_pad INT;
  v_code TEXT;
BEGIN
  INSERT INTO public.entity_code_sequences (prefix, last_value, pad_length)
  VALUES (_prefix, 0, 6)
  ON CONFLICT (prefix) DO NOTHING;

  UPDATE public.entity_code_sequences
  SET last_value = last_value + 1, updated_at = now()
  WHERE prefix = _prefix
  RETURNING last_value, pad_length INTO v_next, v_pad;

  v_code := _prefix || '-' || lpad(v_next::text, v_pad, '0');
  RETURN v_code;
END;
$$;

-- Register entity code in registry
CREATE OR REPLACE FUNCTION public.register_entity_code(
  _prefix TEXT,
  _entity_type TEXT,
  _entity_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  SELECT code INTO v_code
  FROM public.entity_codes
  WHERE entity_type = _entity_type AND entity_id = _entity_id
  LIMIT 1;

  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  v_code := public.generate_entity_code(_prefix);

  INSERT INTO public.entity_codes (prefix, code, entity_type, entity_id, qr_data)
  VALUES (_prefix, v_code, _entity_type, _entity_id, v_code)
  ON CONFLICT (code) DO NOTHING;

  RETURN v_code;
END;
$$;

-- Add entity_code columns to main tables
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS entity_code TEXT UNIQUE;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS entity_code TEXT UNIQUE;
ALTER TABLE public.restaurant_tables ADD COLUMN IF NOT EXISTS entity_code TEXT UNIQUE;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS entity_code TEXT UNIQUE;
ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS entity_code TEXT UNIQUE;

-- Auto-assign codes on insert
CREATE OR REPLACE FUNCTION public.auto_assign_entity_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix TEXT;
  v_type TEXT;
BEGIN
  v_prefix := TG_ARGV[0];
  v_type := TG_ARGV[1];

  IF NEW.entity_code IS NULL OR NEW.entity_code = '' THEN
    NEW.entity_code := public.register_entity_code(v_prefix, v_type, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Triggers for entity codes (BEFORE INSERT so id exists — use AFTER INSERT instead)
CREATE OR REPLACE FUNCTION public.auto_assign_entity_code_after()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix TEXT;
  v_type TEXT;
  v_code TEXT;
BEGIN
  v_prefix := TG_ARGV[0];
  v_type := TG_ARGV[1];

  IF NEW.entity_code IS NULL OR NEW.entity_code = '' THEN
    v_code := public.register_entity_code(v_prefix, v_type, NEW.id);
    EXECUTE format('UPDATE %I SET entity_code = $1 WHERE id = $2', TG_TABLE_NAME)
      USING v_code, NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_room_entity_code ON public.rooms;
CREATE TRIGGER trg_room_entity_code
  AFTER INSERT ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('ROOM', 'room');

DROP TRIGGER IF EXISTS trg_menu_entity_code ON public.menu_items;
CREATE TRIGGER trg_menu_entity_code
  AFTER INSERT ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('MENU', 'menu_item');

DROP TRIGGER IF EXISTS trg_table_entity_code ON public.restaurant_tables;
CREATE TRIGGER trg_table_entity_code
  AFTER INSERT ON public.restaurant_tables
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('TABLE', 'restaurant_table');

DROP TRIGGER IF EXISTS trg_reservation_entity_code ON public.reservations;
CREATE TRIGGER trg_reservation_entity_code
  AFTER INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('BOOK', 'reservation');

DROP TRIGGER IF EXISTS trg_order_entity_code ON public.restaurant_orders;
CREATE TRIGGER trg_order_entity_code
  AFTER INSERT ON public.restaurant_orders
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('ORDER', 'order');

DROP TRIGGER IF EXISTS trg_guest_entity_code ON public.guests;
CREATE TRIGGER trg_guest_entity_code
  AFTER INSERT ON public.guests
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_entity_code_after('CLIENT', 'guest');

-- Backfill existing records without codes
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.rooms WHERE entity_code IS NULL LOOP
    PERFORM public.register_entity_code('ROOM', 'room', r.id);
    UPDATE public.rooms SET entity_code = (
      SELECT code FROM public.entity_codes WHERE entity_id = r.id AND entity_type = 'room' LIMIT 1
    ) WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id FROM public.menu_items WHERE entity_code IS NULL LOOP
    PERFORM public.register_entity_code('MENU', 'menu_item', r.id);
    UPDATE public.menu_items SET entity_code = (
      SELECT code FROM public.entity_codes WHERE entity_id = r.id AND entity_type = 'menu_item' LIMIT 1
    ) WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id FROM public.restaurant_tables WHERE entity_code IS NULL LOOP
    PERFORM public.register_entity_code('TABLE', 'restaurant_table', r.id);
    UPDATE public.restaurant_tables SET entity_code = (
      SELECT code FROM public.entity_codes WHERE entity_id = r.id AND entity_type = 'restaurant_table' LIMIT 1
    ) WHERE id = r.id;
  END LOOP;
END;
$$;

-- ============================================================
-- 4. GUEST RESERVATION RPC (no account required)
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_guest_reservation(
  p_full_name TEXT,
  p_email TEXT,
  p_check_in DATE,
  p_check_out DATE,
  p_room_id UUID,
  p_phone TEXT DEFAULT NULL,
  p_guests_count INT DEFAULT 1,
  p_special_requests TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_guest_id UUID;
  v_nights INT;
  v_price NUMERIC;
  v_total NUMERIC;
  v_reservation_id UUID;
  v_reference TEXT;
  v_entity_code TEXT;
  v_room_name TEXT;
BEGIN
  -- Validation
  IF p_full_name IS NULL OR length(trim(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'Nom complet requis (min 2 caractères)';
  END IF;
  IF p_email IS NULL OR p_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'Email invalide';
  END IF;
  IF p_check_out <= p_check_in THEN
    RAISE EXCEPTION 'La date de départ doit être après l''arrivée';
  END IF;
  IF NOT public.is_room_available(p_room_id, p_check_in, p_check_out) THEN
    RAISE EXCEPTION 'Chambre non disponible pour ces dates';
  END IF;

  v_nights := (p_check_out - p_check_in);
  SELECT price_per_night, name INTO v_price, v_room_name
  FROM public.rooms WHERE id = p_room_id AND is_active = true;
  IF v_price IS NULL THEN
    RAISE EXCEPTION 'Chambre introuvable';
  END IF;
  v_total := v_nights * v_price;

  -- Find or create guest
  SELECT id INTO v_guest_id FROM public.guests
  WHERE lower(email) = lower(trim(p_email))
  LIMIT 1;

  IF v_guest_id IS NULL THEN
    INSERT INTO public.guests (full_name, email, phone, address, city, country, nationality)
    VALUES (trim(p_full_name), lower(trim(p_email)), p_phone, p_address, p_city, p_country, p_country)
    RETURNING id INTO v_guest_id;
  ELSE
    UPDATE public.guests SET
      full_name = trim(p_full_name),
      phone = COALESCE(p_phone, phone),
      address = COALESCE(p_address, address),
      city = COALESCE(p_city, city),
      country = COALESCE(p_country, country),
      updated_at = now()
    WHERE id = v_guest_id;
  END IF;

  -- Create reservation
  INSERT INTO public.reservations (
    room_id, guest_id, check_in, check_out, nights, guests_count,
    total_price, status, special_requests, source,
    guest_name, guest_email, guest_phone, payment_status
  ) VALUES (
    p_room_id, v_guest_id, p_check_in, p_check_out, v_nights, p_guests_count,
    v_total, 'pending', p_special_requests, 'guest_portal',
    trim(p_full_name), lower(trim(p_email)), p_phone, 'unpaid'
  )
  RETURNING id, reference INTO v_reservation_id, v_reference;

  SELECT entity_code INTO v_entity_code FROM public.reservations WHERE id = v_reservation_id;

  -- Notify staff
  BEGIN
    PERFORM public.notify_admin('reservation', 'Nouvelle réservation invité',
      trim(p_full_name) || ' — ' || v_reference, '/admin/reservations');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'reference', v_reference,
    'entity_code', v_entity_code,
    'total_price', v_total,
    'nights', v_nights,
    'room_name', v_room_name
  );
END;
$$;

-- Lookup reservation by reference (public, no auth)
CREATE OR REPLACE FUNCTION public.get_guest_reservation_by_ref(p_reference TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', r.id,
    'reference', r.reference,
    'entity_code', r.entity_code,
    'status', r.status,
    'check_in', r.check_in,
    'check_out', r.check_out,
    'nights', r.nights,
    'total_price', r.total_price,
    'guest_name', r.guest_name,
    'guest_email', r.guest_email,
    'guest_phone', r.guest_phone,
    'room_name', rm.name,
    'room_number', rm.number,
    'created_at', r.created_at
  ) INTO v_result
  FROM public.reservations r
  JOIN public.rooms rm ON rm.id = r.room_id
  WHERE r.reference = p_reference OR r.entity_code = p_reference
  LIMIT 1;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_guest_reservation TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_guest_reservation_by_ref TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_entity_code TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_entity_code TO authenticated;

-- ============================================================
-- 5. Audit logs: allow null user_id for guest actions
-- ============================================================
-- audit_logs.user_id already nullable — no change needed

-- Permission for entity codes admin
INSERT INTO public.permissions (key, module, label, description) VALUES
  ('entity_code.view', 'entity_code', 'Voir codes entités', 'Accès au registre des codes QR/barres'),
  ('entity_code.manage', 'entity_code', 'Gérer codes entités', 'Génération et impression des codes')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_key)
SELECT r.role, p.key
FROM (VALUES
  ('super_admin'::public.app_role),
  ('manager'::public.app_role),
  ('reception'::public.app_role)
) AS r(role)
CROSS JOIN public.permissions p
WHERE p.key IN ('entity_code.view', 'entity_code.manage')
ON CONFLICT DO NOTHING;
