
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin','manager','reception','restaurant_staff','accountant','cleaning_staff','customer');
CREATE TYPE public.room_status AS ENUM ('available','occupied','cleaning','maintenance','reserved');
CREATE TYPE public.room_type AS ENUM ('standard','superior','deluxe','suite','family');
CREATE TYPE public.reservation_status AS ENUM ('pending','confirmed','checked_in','checked_out','cancelled');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles: read own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles: update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles: insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User roles: read own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles))
$$;

-- Super admins can manage roles
CREATE POLICY "User roles: super admin manage" ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ============ AUTO PROFILE + DEFAULT ROLE ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ ROOMS ============
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type public.room_type NOT NULL DEFAULT 'standard',
  capacity INT NOT NULL DEFAULT 2 CHECK (capacity > 0),
  price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
  description TEXT,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  size_sqm INT,
  status public.room_status NOT NULL DEFAULT 'available',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rooms: public read active" ON public.rooms FOR SELECT TO anon USING (is_active = TRUE);
CREATE POLICY "Rooms: authenticated read all" ON public.rooms FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Rooms: managers insert" ON public.rooms FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));
CREATE POLICY "Rooms: managers update" ON public.rooms FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception','cleaning_staff']::public.app_role[]));
CREATE POLICY "Rooms: managers delete" ON public.rooms FOR DELETE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ ROOM PHOTOS ============
CREATE TABLE public.room_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.room_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_photos TO authenticated;
GRANT ALL ON public.room_photos TO service_role;
ALTER TABLE public.room_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RoomPhotos: public read" ON public.room_photos FOR SELECT TO anon USING (TRUE);
CREATE POLICY "RoomPhotos: auth read" ON public.room_photos FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "RoomPhotos: managers write" ON public.room_photos FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

CREATE INDEX idx_room_photos_room ON public.room_photos(room_id);

-- ============ GUESTS ============
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_document TEXT,
  nationality TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guests: own read" ON public.guests FOR SELECT TO authenticated
USING (profile_id = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception','accountant']::public.app_role[]));
CREATE POLICY "Guests: staff manage" ON public.guests FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));
CREATE POLICY "Guests: self insert" ON public.guests FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

CREATE TRIGGER trg_guests_updated BEFORE UPDATE ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ RESERVATIONS ============
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE DEFAULT ('LCO-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INT NOT NULL CHECK (nights > 0),
  guests_count INT NOT NULL DEFAULT 1 CHECK (guests_count > 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status public.reservation_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reservations: own read" ON public.reservations FOR SELECT TO authenticated
USING (profile_id = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception','accountant']::public.app_role[]));
CREATE POLICY "Reservations: self insert" ON public.reservations FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));
CREATE POLICY "Reservations: staff manage" ON public.reservations FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE TRIGGER trg_reservations_updated BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_reservations_room_dates ON public.reservations(room_id, check_in, check_out);
CREATE INDEX idx_reservations_profile ON public.reservations(profile_id);
