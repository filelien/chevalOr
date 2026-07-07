-- CMS Enterprise Core: fully administrable public website

-- 1) Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cms_page_status') THEN
    CREATE TYPE public.cms_page_status AS ENUM ('draft', 'published', 'archived', 'scheduled');
  END IF;
END $$;

-- 2) Pages
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code TEXT UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  template TEXT NOT NULL DEFAULT 'default',
  status public.cms_page_status NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  canonical_url TEXT,
  og_image TEXT,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_homepage BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.cms_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  section_type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  media_asset_id UUID NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  animation TEXT,
  responsive JSONB NOT NULL DEFAULT '{"desktop":true,"tablet":true,"mobile":true}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Menus & footer
CREATE TABLE IF NOT EXISTS public.cms_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'header',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.cms_menus(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.cms_menu_items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT,
  page_id UUID REFERENCES public.cms_pages(id) ON DELETE SET NULL,
  icon TEXT,
  is_external BOOLEAN NOT NULL DEFAULT FALSE,
  is_mobile_only BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Media library enterprise
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code TEXT UNIQUE,
  title TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  media_kind TEXT NOT NULL DEFAULT 'image',
  width INT,
  height INT,
  size_bytes BIGINT,
  webp_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  linked_pages TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Forms builder
CREATE TABLE IF NOT EXISTS public.cms_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  workflow JSONB NOT NULL DEFAULT '{}',
  captcha_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.cms_forms(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) Redirects / SEO support
CREATE TABLE IF NOT EXISTS public.cms_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path TEXT NOT NULL UNIQUE,
  target_path TEXT NOT NULL,
  status_code INT NOT NULL DEFAULT 301 CHECK (status_code IN (301,302,307,308)),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers
DROP TRIGGER IF EXISTS trg_cms_pages_updated ON public.cms_pages;
CREATE TRIGGER trg_cms_pages_updated BEFORE UPDATE ON public.cms_pages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_cms_page_sections_updated ON public.cms_page_sections;
CREATE TRIGGER trg_cms_page_sections_updated BEFORE UPDATE ON public.cms_page_sections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_cms_menus_updated ON public.cms_menus;
CREATE TRIGGER trg_cms_menus_updated BEFORE UPDATE ON public.cms_menus FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_cms_menu_items_updated ON public.cms_menu_items;
CREATE TRIGGER trg_cms_menu_items_updated BEFORE UPDATE ON public.cms_menu_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_media_assets_updated ON public.media_assets;
CREATE TRIGGER trg_media_assets_updated BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_cms_forms_updated ON public.cms_forms;
CREATE TRIGGER trg_cms_forms_updated BEFORE UPDATE ON public.cms_forms FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_cms_redirects_updated ON public.cms_redirects;
CREATE TRIGGER trg_cms_redirects_updated BEFORE UPDATE ON public.cms_redirects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Entity codes
DROP TRIGGER IF EXISTS trg_cms_page_entity_code ON public.cms_pages;
CREATE TRIGGER trg_cms_page_entity_code
AFTER INSERT ON public.cms_pages FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_entity_code_after('PRODUCT', 'cms_page');

DROP TRIGGER IF EXISTS trg_media_asset_entity_code ON public.media_assets;
CREATE TRIGGER trg_media_asset_entity_code
AFTER INSERT ON public.media_assets FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_entity_code_after('PRODUCT', 'media_asset');

-- Grants / RLS
GRANT SELECT ON public.cms_pages, public.cms_page_sections, public.cms_menus, public.cms_menu_items, public.media_assets, public.cms_forms, public.cms_redirects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cms_pages, public.cms_page_sections, public.cms_menus, public.cms_menu_items, public.media_assets, public.cms_forms, public.cms_form_submissions, public.cms_redirects TO authenticated;
GRANT ALL ON public.cms_page_versions, public.cms_forms, public.cms_form_submissions TO authenticated;
GRANT ALL ON public.cms_pages, public.cms_page_versions, public.cms_page_sections, public.cms_menus, public.cms_menu_items, public.media_assets, public.cms_forms, public.cms_form_submissions, public.cms_redirects TO service_role;

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CMS pages public read published" ON public.cms_pages FOR SELECT TO anon, authenticated USING (status = 'published' OR public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));
CREATE POLICY "CMS pages staff manage" ON public.cms_pages FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE POLICY "CMS page versions staff manage" ON public.cms_page_versions FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE POLICY "CMS sections staff manage" ON public.cms_page_sections FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE POLICY "CMS menus staff manage" ON public.cms_menus FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE POLICY "CMS menu items staff manage" ON public.cms_menu_items FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE POLICY "Media assets staff manage" ON public.media_assets FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE POLICY "CMS forms staff manage" ON public.cms_forms FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE POLICY "CMS form submissions staff read" ON public.cms_form_submissions FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));
CREATE POLICY "CMS form submissions public insert" ON public.cms_form_submissions FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "CMS form submissions staff update" ON public.cms_form_submissions FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

CREATE POLICY "CMS redirects staff manage" ON public.cms_redirects FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','manager','reception']::public.app_role[]));

-- Seed minimal
INSERT INTO public.cms_menus (key, label, location, is_active)
VALUES
  ('main_header', 'Menu principal', 'header', true),
  ('main_footer', 'Footer', 'footer', true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.cms_pages (slug, title, path, template, status, seo_title, seo_description, is_homepage)
VALUES
  ('accueil', 'Accueil', '/', 'home', 'published', 'Accueil | Le Cheval d''Or', 'Découvrez notre hôtel haut de gamme à Anié.', true),
  ('a-propos', 'A propos', '/a-propos', 'default', 'published', 'A propos | Le Cheval d''Or', 'Notre histoire, notre mission, nos valeurs.', false),
  ('contact', 'Contact', '/contact', 'default', 'published', 'Contact | Le Cheval d''Or', 'Contactez notre équipe.', false)
ON CONFLICT (slug) DO NOTHING;
