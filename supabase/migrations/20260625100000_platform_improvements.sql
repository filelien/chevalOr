-- Améliorations plateforme : suivi messages contact

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

GRANT UPDATE ON public.contact_messages TO authenticated;

CREATE POLICY "Contact: staff update" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));
