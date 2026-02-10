
-- Add missing delete policy for product-images (with unique name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete product images storage' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Admins can delete product images storage"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'product-images'
      AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;
