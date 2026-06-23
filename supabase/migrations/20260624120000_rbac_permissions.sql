-- RBAC complet : permissions granulaires, rôles personnalisés, audit, profils staff

-- Extensions profil staff
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'suspended', 'inactive')),
  ADD COLUMN IF NOT EXISTS hired_at DATE,
  ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mfa_required BOOLEAN NOT NULL DEFAULT FALSE;

-- Catalogue des permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  key TEXT PRIMARY KEY,
  module TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role public.app_role NOT NULL,
  permission_key TEXT NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_key)
);

CREATE TABLE IF NOT EXISTS public.custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  based_on public.app_role,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.custom_role_permissions (
  custom_role_id UUID NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (custom_role_id, permission_key)
);

CREATE TABLE IF NOT EXISTS public.user_custom_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_role_id UUID NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, custom_role_id)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  module TEXT,
  entity_type TEXT,
  entity_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed permissions
INSERT INTO public.permissions (key, module, label, description) VALUES
  ('dashboard.view', 'dashboard', 'Voir tableau de bord', 'Accès au centre de commande'),
  ('reservation.view', 'reservation', 'Voir réservations', NULL),
  ('reservation.create', 'reservation', 'Créer réservations', NULL),
  ('reservation.edit', 'reservation', 'Modifier réservations', NULL),
  ('reservation.delete', 'reservation', 'Supprimer réservations', NULL),
  ('reservation.cancel', 'reservation', 'Annuler réservations', NULL),
  ('reservation.export', 'reservation', 'Exporter réservations', NULL),
  ('room.view', 'room', 'Voir chambres', NULL),
  ('room.create', 'room', 'Créer chambres', NULL),
  ('room.edit', 'room', 'Modifier chambres', NULL),
  ('room.delete', 'room', 'Supprimer chambres', NULL),
  ('client.view', 'client', 'Voir clients', NULL),
  ('client.create', 'client', 'Créer clients', NULL),
  ('client.edit', 'client', 'Modifier clients', NULL),
  ('client.delete', 'client', 'Supprimer clients', NULL),
  ('client.export', 'client', 'Exporter clients', NULL),
  ('conference.view', 'conference', 'Voir conférences', NULL),
  ('conference.manage', 'conference', 'Gérer conférences', NULL),
  ('event.view', 'event', 'Voir événements', NULL),
  ('event.manage', 'event', 'Gérer événements', NULL),
  ('restaurant.view', 'restaurant', 'Voir restaurant', NULL),
  ('restaurant.manage', 'restaurant', 'Gérer restaurant', NULL),
  ('stock.view', 'stock', 'Voir stocks', NULL),
  ('stock.manage', 'stock', 'Gérer stocks', NULL),
  ('staff.view', 'staff', 'Voir personnel', NULL),
  ('staff.manage', 'staff', 'Gérer personnel', NULL),
  ('finance.view', 'finance', 'Voir finances', NULL),
  ('finance.create', 'finance', 'Créer écritures', NULL),
  ('finance.edit', 'finance', 'Modifier finances', NULL),
  ('finance.delete', 'finance', 'Supprimer finances', NULL),
  ('finance.export', 'finance', 'Exporter finances', NULL),
  ('payment.view', 'payment', 'Voir paiements', NULL),
  ('payment.manage', 'payment', 'Gérer paiements', NULL),
  ('report.view', 'report', 'Voir rapports', NULL),
  ('report.export', 'report', 'Exporter rapports', NULL),
  ('marketing.view', 'marketing', 'Voir marketing', NULL),
  ('marketing.manage', 'marketing', 'Gérer marketing', NULL),
  ('review.view', 'review', 'Voir avis', NULL),
  ('review.manage', 'review', 'Modérer avis', NULL),
  ('message.view', 'message', 'Voir messages', NULL),
  ('message.manage', 'message', 'Gérer messages', NULL),
  ('site.view', 'site', 'Voir site web', NULL),
  ('site.manage', 'site', 'Gérer site web', NULL),
  ('gallery.view', 'gallery', 'Voir galerie', NULL),
  ('gallery.manage', 'gallery', 'Gérer galerie', NULL),
  ('seo.view', 'seo', 'Voir SEO', NULL),
  ('seo.manage', 'seo', 'Gérer SEO', NULL),
  ('user.view', 'user', 'Voir utilisateurs', NULL),
  ('user.create', 'user', 'Créer utilisateurs', NULL),
  ('user.edit', 'user', 'Modifier utilisateurs', NULL),
  ('user.delete', 'user', 'Supprimer utilisateurs', NULL),
  ('role.view', 'role', 'Voir rôles', NULL),
  ('role.manage', 'role', 'Gérer rôles', NULL),
  ('settings.view', 'settings', 'Voir paramètres', NULL),
  ('settings.edit', 'settings', 'Modifier paramètres', NULL),
  ('audit.view', 'audit', 'Voir journal audit', NULL),
  ('notification.view', 'notification', 'Voir alertes', NULL)
ON CONFLICT (key) DO NOTHING;

-- Permissions par rôle système (matrice par défaut)
INSERT INTO public.role_permissions (role, permission_key)
SELECT r.role, p.key
FROM (VALUES
  ('reception'::public.app_role, ARRAY[
    'dashboard.view','reservation.view','reservation.create','reservation.edit','reservation.cancel',
    'room.view','client.view','client.create','client.edit','conference.view','conference.manage',
    'event.view','review.view','review.manage','message.view','message.manage','payment.view','payment.manage','notification.view'
  ]),
  ('manager'::public.app_role, ARRAY[
    'dashboard.view','reservation.view','reservation.create','reservation.edit','reservation.cancel','reservation.export',
    'room.view','room.edit','client.view','client.create','client.edit','client.export',
    'conference.view','conference.manage','event.view','event.manage',
    'restaurant.view','restaurant.manage','stock.view','stock.manage',
    'staff.view','staff.manage','finance.view','finance.create','finance.edit','finance.export',
    'payment.view','payment.manage','report.view','report.export',
    'marketing.view','marketing.manage','review.view','review.manage',
    'message.view','message.manage','site.view','site.manage','gallery.view','gallery.manage',
    'seo.view','seo.manage','settings.view','settings.edit','audit.view','notification.view'
  ]),
  ('restaurant_staff'::public.app_role, ARRAY[
    'dashboard.view','restaurant.view','restaurant.manage','message.view','message.manage','notification.view'
  ]),
  ('accountant'::public.app_role, ARRAY[
    'dashboard.view','finance.view','finance.create','finance.edit','finance.export',
    'payment.view','payment.manage','report.view','report.export','notification.view'
  ]),
  ('cleaning_staff'::public.app_role, ARRAY[
    'dashboard.view','room.view','notification.view'
  ])
) AS r(role, perms)
CROSS JOIN LATERAL unnest(r.perms) AS p(key)
ON CONFLICT DO NOTHING;

-- super_admin : toutes les permissions
INSERT INTO public.role_permissions (role, permission_key)
SELECT 'super_admin'::public.app_role, key FROM public.permissions
ON CONFLICT DO NOTHING;

-- Helpers RBAC
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = 'super_admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission_key = _permission
  )
  OR EXISTS (
    SELECT 1 FROM public.user_custom_roles ucr
    JOIN public.custom_role_permissions crp ON crp.custom_role_id = ucr.custom_role_id
    JOIN public.custom_roles cr ON cr.id = ucr.custom_role_id AND cr.is_active
    WHERE ucr.user_id = _user_id AND crp.permission_key = _permission
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS SETOF TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT DISTINCT p.key FROM public.permissions p
  WHERE public.has_permission(_user_id, p.key);
$$;

REVOKE ALL ON FUNCTION public.has_permission(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_permissions(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions(UUID) TO authenticated;

-- RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.permissions TO authenticated;
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_custom_roles TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.login_history TO authenticated;

CREATE POLICY "Permissions: staff read" ON public.permissions FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception','restaurant_staff','accountant','cleaning_staff']::public.app_role[]));

CREATE POLICY "Role perms: staff read" ON public.role_permissions FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager']::public.app_role[]));

CREATE POLICY "Role perms: super admin write" ON public.role_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Custom roles: super admin" ON public.custom_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Custom role perms: super admin" ON public.custom_role_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "User custom roles: super admin" ON public.user_custom_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Audit: staff read" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'audit.view'));

CREATE POLICY "Audit: staff insert" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Login history: own read" ON public.login_history FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Login history: insert own" ON public.login_history FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Super admin peut mettre à jour tous les profils staff
DROP POLICY IF EXISTS "Profiles: super admin update all" ON public.profiles;
CREATE POLICY "Profiles: super admin update all" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Audit automatique changements de rôles
CREATE OR REPLACE FUNCTION public.audit_role_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, module, entity_type, entity_id, details)
    VALUES (auth.uid(), 'role_assigned', 'user', 'user_roles', NEW.user_id::text,
      jsonb_build_object('role', NEW.role));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, module, entity_type, entity_id, details)
    VALUES (auth.uid(), 'role_removed', 'user', 'user_roles', OLD.user_id::text,
      jsonb_build_object('role', OLD.role));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_user_roles ON public.user_roles;
CREATE TRIGGER trg_audit_user_roles
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_change();

-- Améliorer activity_log trigger réservations
CREATE OR REPLACE FUNCTION public.log_reservation_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END,
    'reservation',
    COALESCE(NEW.id, OLD.id)::text,
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
