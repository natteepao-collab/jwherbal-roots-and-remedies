-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true);

-- Allow anyone to view article images (public bucket)
CREATE POLICY "Anyone can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Allow admins to upload article images
CREATE POLICY "Admins can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update article images
CREATE POLICY "Admins can update article images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'article-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete article images
CREATE POLICY "Admins can delete article images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-images' 
  AND public.has_role(auth.uid(), 'admin')
);