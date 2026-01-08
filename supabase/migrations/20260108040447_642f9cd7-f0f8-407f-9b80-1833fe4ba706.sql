-- Create storage bucket for site assets (logo, etc.)
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Allow anyone to view site assets
CREATE POLICY "Anyone can view site assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-assets');

-- Only admins can upload site assets
CREATE POLICY "Admins can upload site assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can update site assets
CREATE POLICY "Admins can update site assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can delete site assets
CREATE POLICY "Admins can delete site assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));