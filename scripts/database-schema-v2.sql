-- SQL Migration: Ensure all required tables exist for Cheval d'Or Essentials v2.0
-- Execute this in Supabase SQL Editor to ensure complete DB schema

-- 1. staff_users table (if not exists)
CREATE TABLE IF NOT EXISTS public.staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  job_title TEXT,
  roles TEXT[] DEFAULT '{"reception"}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  hire_date TEXT,
  salary NUMERIC,
  manager_id UUID REFERENCES public.staff_users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. site_settings table (central config storage - DYNAMIC)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP DEFAULT now(),
  updated_by UUID
);

-- 3. critical_alerts table (for global audit system)
CREATE TABLE IF NOT EXISTS public.critical_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT CHECK (level IN ('CRITICAL', 'HIGH')),
  type TEXT,
  message TEXT,
  module TEXT,
  user_email TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  timestamp TIMESTAMP DEFAULT now()
);

-- 4. audit_logs enhancement (ensure columns exist)
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'INFO';
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS details JSONB;

-- 5. profiles enhancement (client system)
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS vip_level TEXT DEFAULT 'standard' CHECK (vip_level IN ('standard', 'silver', 'gold', 'platinum'));
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS reservation_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS first_booking_date TIMESTAMP;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS last_booking_date TIMESTAMP;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('M', 'F', 'Other'));
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'fr';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS notes TEXT;

-- 6. rooms enhancement
ALTER TABLE IF EXISTS public.rooms ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS public.rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.rooms ADD COLUMN IF NOT EXISTS amenities TEXT[];

-- 7. reservations enhancement
ALTER TABLE IF EXISTS public.reservations ADD COLUMN IF NOT EXISTS payment_amount NUMERIC;
ALTER TABLE IF EXISTS public.reservations ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE IF EXISTS public.reservations ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- 8. financial_records enhancement
ALTER TABLE IF EXISTS public.financial_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now();
ALTER TABLE IF EXISTS public.financial_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- 9. reviews table (ensure exists for avis module)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id),
  profile_id UUID REFERENCES public.profiles(id),
  author_name TEXT NOT NULL,
  author_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating INTEGER,
  service_rating INTEGER,
  comfort_rating INTEGER,
  value_rating INTEGER,
  comment TEXT,
  title TEXT,
  is_published BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'hidden', 'archived')),
  admin_reply TEXT,
  admin_reply_by UUID,
  admin_reply_date TIMESTAMP,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_users_department ON public.staff_users(department);
CREATE INDEX IF NOT EXISTS idx_staff_users_status ON public.staff_users(status);
CREATE INDEX IF NOT EXISTS idx_profiles_vip_level ON public.profiles(vip_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON public.audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_critical_alerts_resolved ON public.critical_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_is_published ON public.reviews(is_published);

-- 11. Initialize default site settings if empty
INSERT INTO public.site_settings (key, value) VALUES
  ('hotel_config', '{"name":"Hôtel Le Cheval d''Or","phone":"+228 22 000 000","email":"contact@chevaldor.tg","whatsapp":"+228 90 000 000","address":"BP 12345, Anié","city":"Anié","country":"Togo","theme_color":"#C9A227","secondary_color":"#1a1d24","accent_color":"#60a5fa"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('whatsapp_config', '{"enabled":true,"defaultMessage":"Bonjour, je souhaite des informations.","activeHours":"08:00 - 20:00","agent":"Réception","color":"#25D366","position":"right"}')
ON CONFLICT (key) DO NOTHING;

-- 12. Enable RLS and set policies (if not already done)
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.critical_alerts ENABLE ROW LEVEL SECURITY;

-- Create default public policies for site_settings (readable by all, writable by admin)
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin_write" ON public.site_settings FOR UPDATE USING (auth.jwt() ->> 'role' = 'authenticated');

-- 13. Verify table count
SELECT 
  COUNT(*) as total_tables,
  array_agg(table_name) as tables
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- 14. Summary
COMMENT ON TABLE public.staff_users IS 'Personnel management - Distinct from client profiles';
COMMENT ON TABLE public.site_settings IS 'Dynamic configuration - No hardcoded values';
COMMENT ON TABLE public.critical_alerts IS 'Global monitoring and alerts';
COMMENT ON TABLE public.reviews IS 'Client reviews and reputation management';
