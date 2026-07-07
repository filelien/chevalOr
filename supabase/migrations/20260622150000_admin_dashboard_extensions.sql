-- Extensions PMS : salle de conférence, événements, galerie, avis, CMS, notifications

CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TABLE public.conference_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_name TEXT NOT NULL,
  organizer_email TEXT,
  organizer_phone TEXT,
  event_title TEXT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  participants INT NOT NULL DEFAULT 10 CHECK (participants > 0),
  equipment TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(10,2),
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL DEFAULT 'seminar',
  title TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT,
  organizer_phone TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  expected_guests INT NOT NULL DEFAULT 20,
  price NUMERIC(10,2),
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Hôtel',
  url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_email TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers updated_at
CREATE TRIGGER trg_conference_updated BEFORE UPDATE ON public.conference_bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_event_updated BEFORE UPDATE ON public.event_bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.conference_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conference_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_bookings TO authenticated;
GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT ON public.reviews TO anon, authenticated;
GRANT UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO authenticated;
GRANT SELECT, UPDATE ON public.admin_notifications TO authenticated;
GRANT INSERT ON public.admin_notifications TO authenticated;
GRANT SELECT ON public.activity_log TO authenticated;
GRANT INSERT ON public.activity_log TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

CREATE POLICY "Conference: staff manage" ON public.conference_bookings FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE POLICY "Events: staff manage" ON public.event_bookings FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE POLICY "Gallery: public read published" ON public.gallery_items FOR SELECT TO anon, authenticated
  USING (is_published = TRUE);
CREATE POLICY "Gallery: staff manage" ON public.gallery_items FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

CREATE POLICY "Reviews: public read published" ON public.reviews FOR SELECT TO anon, authenticated
  USING (is_published = TRUE);
CREATE POLICY "Reviews: anyone insert" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Reviews: staff manage" ON public.reviews FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));
CREATE POLICY "Reviews: staff delete" ON public.reviews FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

CREATE POLICY "Settings: public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Settings: managers write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

CREATE POLICY "Notifications: staff read" ON public.admin_notifications FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception','restaurant_staff','accountant']::public.app_role[]));
CREATE POLICY "Notifications: staff update" ON public.admin_notifications FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));
CREATE POLICY "Notifications: system insert" ON public.admin_notifications FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Activity: staff read" ON public.activity_log FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));
CREATE POLICY "Activity: staff insert" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Paramètres par défaut (CMS / SEO)
INSERT INTO public.site_settings (key, value) VALUES
  ('hotel_info', '{"tagline":"Votre référence hôtelière à Anié","slogan":"Confort, hospitalité et excellence","address":"Centre-ville, Anié, Togo"}'),
  ('seo_home', '{"title":"Hôtel Le Cheval d''Or — Anié, Togo","description":"Chambres climatisées, restaurant, salle de conférence à Anié.","keywords":"hôtel Anié, Togo, conférence, séminaire"}'),
  ('conference_pricing', '{"half_day":75000,"full_day":120000,"hourly":15000}')
ON CONFLICT (key) DO NOTHING;

-- Notification helper
CREATE OR REPLACE FUNCTION public.notify_admin(_type TEXT, _title TEXT, _body TEXT DEFAULT NULL, _link TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, body, link) VALUES (_type, _title, _body, _link);
END; $$;

CREATE OR REPLACE FUNCTION public.log_reservation_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.activity_log (action, entity_type, entity_id, details)
  VALUES (
    TG_OP,
    'reservation',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('status', COALESCE(NEW.status::text, OLD.status::text), 'reference', COALESCE(NEW.reference, OLD.reference))
  );
  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_admin('reservation', 'Nouvelle réservation', NEW.reference, '/admin/reservations');
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

DROP TRIGGER IF EXISTS trg_reservation_activity ON public.reservations;
CREATE TRIGGER trg_reservation_activity
  AFTER INSERT OR UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.log_reservation_activity();
