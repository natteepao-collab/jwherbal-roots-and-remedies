-- Create site settings table for logo and other site-wide settings
CREATE TABLE public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT,
    site_name TEXT DEFAULT 'JWHERBAL',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view site settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can update site settings
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert site settings
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.site_settings (id, logo_url, site_name)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'JWHERBAL');

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();