
-- Seed chambres + codes promo

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  discount_percent INT NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  valid_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_codes TO anon, authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Promo: public read active" ON public.promo_codes FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "Promo: managers write" ON public.promo_codes FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_percent INT;

INSERT INTO public.promo_codes (code, title, discount_percent, valid_until) VALUES
  ('CHEVAL20', 'Early Bird -20%', 20, '2026-12-31'),
  ('WEEKEND', 'Week-end Lomé', 15, '2026-09-30'),
  ('TABLE15', 'Restaurant -15%', 15, '2026-08-31')
ON CONFLICT (code) DO NOTHING;

-- Chambres seed (si aucune n'existe)
INSERT INTO public.rooms (number, name, type, capacity, price_per_night, description, amenities, size_sqm, status, is_active)
SELECT * FROM (VALUES
  ('101', 'Chambre Standard Vue Jardin', 'standard'::public.room_type, 2, 45000::numeric,
   'Élégance discrète avec vue sur le jardin tropical. Lit king size, salle de bain marbre, climatisation.',
   ARRAY['Wifi','Climatisation','TV','Minibar','Coffre-fort'], 28, 'available'::public.room_status, true),
  ('201', 'Chambre Supérieure Océan', 'superior'::public.room_type, 2, 65000::numeric,
   'Lumière naturelle abondante, balcon privé, décoration contemporaine aux touches dorées.',
   ARRAY['Wifi','Climatisation','Balcon','Minibar','Bureau','Peignoirs'], 35, 'available'::public.room_status, true),
  ('301', 'Suite Deluxe Cheval d''Or', 'deluxe'::public.room_type, 3, 95000::numeric,
   'Notre suite signature : salon séparé, baignoire îlot, service conciergerie dédié.',
   ARRAY['Wifi','Salon','Baignoire','Minibar premium','Machine Nespresso','Peignoirs'], 52, 'available'::public.room_status, true),
  ('401', 'Suite Présidentielle', 'suite'::public.room_type, 4, 150000::numeric,
   'Le summum du luxe Cheval d''Or. Terrasse panoramique, butler service, accès spa privé.',
   ARRAY['Terrasse','Butler','Spa privé','Salon','2 chambres','Bar privé'], 85, 'available'::public.room_status, true),
  ('102', 'Chambre Familiale', 'family'::public.room_type, 5, 85000::numeric,
   'Espace généreux pour familles : deux chambres communicantes, coin jeux, lits superposés.',
   ARRAY['Wifi','2 chambres','Coin jeux','Climatisation','Minibar'], 48, 'available'::public.room_status, true)
) AS v(number, name, type, capacity, price_per_night, description, amenities, size_sqm, status, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.rooms LIMIT 1);
