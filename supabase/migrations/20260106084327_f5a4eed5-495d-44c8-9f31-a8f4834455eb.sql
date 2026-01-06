
-- Create storage bucket for brand story gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-story-gallery', 'brand-story-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public access to view images
CREATE POLICY "Anyone can view gallery images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'brand-story-gallery');

-- Create policy for admin to upload images
CREATE POLICY "Admins can upload gallery images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'brand-story-gallery' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policy for admin to update images
CREATE POLICY "Admins can update gallery images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'brand-story-gallery' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policy for admin to delete images
CREATE POLICY "Admins can delete gallery images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'brand-story-gallery' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
