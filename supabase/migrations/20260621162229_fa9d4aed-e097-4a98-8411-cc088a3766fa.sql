
-- Reservations: payment + cancellation + special requests
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_amount numeric,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS special_requests text,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

-- Profiles: CRM fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS preferences text;

-- Allow staff to read every profile (CRM)
DROP POLICY IF EXISTS "Profiles: staff read all" ON public.profiles;
CREATE POLICY "Profiles: staff read all" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception','accountant']::app_role[]));

-- Allow clients to update their own reservation (used for self-cancel / modify)
DROP POLICY IF EXISTS "Reservations: own update" ON public.reservations;
CREATE POLICY "Reservations: own update" ON public.reservations
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Sync profile email + populate on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
    ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- Backfill emails for existing users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- Availability helpers
CREATE OR REPLACE FUNCTION public.is_room_available(
  _room_id uuid, _check_in date, _check_out date, _exclude_id uuid DEFAULT NULL
) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.room_id = _room_id
      AND r.status IN ('pending','confirmed','checked_in')
      AND (_exclude_id IS NULL OR r.id <> _exclude_id)
      AND r.check_in < _check_out
      AND r.check_out > _check_in
  );
$$;

CREATE OR REPLACE FUNCTION public.find_available_room(
  _check_in date, _check_out date, _capacity integer, _type text DEFAULT NULL
) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id FROM public.rooms r
  WHERE r.is_active = true
    AND r.capacity >= _capacity
    AND (_type IS NULL OR r.type::text = _type)
    AND public.is_room_available(r.id, _check_in, _check_out)
  ORDER BY r.price_per_night ASC
  LIMIT 1;
$$;

-- Auto reference RES-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION public.set_reservation_reference()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := 'RES-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((floor(random()*10000))::int::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_reservation_reference ON public.reservations;
CREATE TRIGGER trg_set_reservation_reference
BEFORE INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.set_reservation_reference();
