-- Create contact_settings table
CREATE TABLE public.contact_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL DEFAULT '',
  phone_hours text NOT NULL DEFAULT 'จันทร์-ศุกร์ 9:00-18:00 น.',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  line_id text NOT NULL DEFAULT '',
  line_url text NOT NULL DEFAULT '',
  facebook_url text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  weekday_hours text NOT NULL DEFAULT '9:00 - 18:00 น.',
  weekend_hours text NOT NULL DEFAULT '10:00 - 16:00 น.',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view contact settings
CREATE POLICY "Anyone can view contact settings"
  ON public.contact_settings
  FOR SELECT
  USING (true);

-- Admins can manage contact settings
CREATE POLICY "Admins can manage contact settings"
  ON public.contact_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default data
INSERT INTO public.contact_settings (
  phone,
  phone_hours,
  email,
  address,
  line_id,
  line_url,
  facebook_url,
  instagram_url,
  weekday_hours,
  weekend_hours
) VALUES (
  '08x-xxx-xxxx',
  'จันทร์-ศุกร์ 9:00-18:00 น.',
  'info@jwherbal.com',
  '123 ถนนสุขภาพ แขวงสุขใจ เขตธรรมชาติ กรุงเทพฯ 10100',
  '@JWHERBAL',
  'https://line.me/R/ti/p/@jwherbal',
  'https://facebook.com/jwherbal',
  'https://instagram.com/jwherbal',
  '9:00 - 18:00 น.',
  '10:00 - 16:00 น.'
);