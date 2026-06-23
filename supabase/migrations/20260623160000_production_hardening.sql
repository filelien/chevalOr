-- Production hardening: public bookings, payments, storage, RLS fixes, seeds

-- Payment tracking on reservations
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Restrict client reservation updates to safe cancellation only
DROP POLICY IF EXISTS "Reservations: own update" ON public.reservations;
CREATE POLICY "Reservations: own cancel" ON public.reservations
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (
    profile_id = auth.uid()
    AND status IN ('cancelled', 'pending', 'confirmed')
  );

-- Public can request conference / event bookings (pending only)
GRANT INSERT ON public.conference_bookings TO anon;
GRANT INSERT ON public.event_bookings TO anon;

CREATE POLICY "Conference: public request" ON public.conference_bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');

CREATE POLICY "Events: public request" ON public.event_bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');

-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('room-photos', 'room-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('gallery', 'gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Gallery public read" ON storage.objects;
DROP POLICY IF EXISTS "Gallery staff upload" ON storage.objects;
DROP POLICY IF EXISTS "Gallery staff delete" ON storage.objects;

CREATE POLICY "Gallery public read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');
CREATE POLICY "Gallery staff upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'gallery'
    AND public.has_any_role(auth.uid(), ARRAY['super_admin'::public.app_role, 'manager'::public.app_role])
  );
CREATE POLICY "Gallery staff delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'gallery'
    AND public.has_any_role(auth.uid(), ARRAY['super_admin'::public.app_role, 'manager'::public.app_role])
  );

-- Notify staff on new public requests (via SECURITY DEFINER helper)
CREATE OR REPLACE FUNCTION public.notify_staff_conference()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_admin('conference', 'Nouvelle demande conférence', NEW.event_title, '/admin/conference');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_staff_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_admin('event', 'Nouvelle demande événement', NEW.title, '/admin/evenements');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_conference ON public.conference_bookings;
CREATE TRIGGER trg_notify_conference
  AFTER INSERT ON public.conference_bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_staff_conference();

DROP TRIGGER IF EXISTS trg_notify_event ON public.event_bookings;
CREATE TRIGGER trg_notify_event
  AFTER INSERT ON public.event_bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_staff_event();

-- Seed gallery if empty
INSERT INTO public.gallery_items (title, category, url, media_type, sort_order, is_published)
SELECT * FROM (VALUES
  ('Façade de l''hôtel à Anié', 'Hôtel', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 'image', 1, true),
  ('Restaurant — spécialités togolaises', 'Restaurant', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200', 'image', 2, true),
  ('Chambre climatisée', 'Chambres', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', 'image', 3, true),
  ('Hall d''accueil', 'Hôtel', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200', 'image', 4, true),
  ('Salle de conférence', 'Événements', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200', 'image', 5, true),
  ('Espace détente', 'Services', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200', 'image', 6, true)
) AS v(title, category, url, media_type, sort_order, is_published)
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items LIMIT 1);

-- Seed published reviews if empty
INSERT INTO public.reviews (author_name, rating, comment, is_published)
SELECT * FROM (VALUES
  ('Koffi A.', 5, 'Nous avons organisé notre séminaire annuel ici : salle impeccable, équipe réactive, cadre parfait pour travailler.', true),
  ('Marie T.', 5, 'Un havre de paix au centre du Togo. Chambres confortables et restaurant excellent.', true),
  ('Aminata S.', 5, 'Découvrir Anié depuis cet hôtel a été une belle surprise. Accueil chaleureux et authenticité.', true),
  ('Jean-Baptiste M.', 5, 'Emplacement idéal pour mes déplacements professionnels. Wi-Fi fiable et parking sécurisé.', true)
) AS v(author_name, rating, comment, is_published)
WHERE NOT EXISTS (SELECT 1 FROM public.reviews WHERE is_published = true LIMIT 1);
