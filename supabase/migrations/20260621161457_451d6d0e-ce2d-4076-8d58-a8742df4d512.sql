
-- Fix mutable search_path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Lock down SECURITY DEFINER helpers (still callable by authenticated via RLS policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, public.app_role[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies for the room-photos bucket
CREATE POLICY "Room photos: public read"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'room-photos');

CREATE POLICY "Room photos: managers upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'room-photos'
  AND public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[])
);

CREATE POLICY "Room photos: managers update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'room-photos'
  AND public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[])
);

CREATE POLICY "Room photos: managers delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'room-photos'
  AND public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[])
);
