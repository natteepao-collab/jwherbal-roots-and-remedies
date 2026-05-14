-- Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'payment-slips';

-- Drop old permissive policies
DROP POLICY IF EXISTS "Public can view payment slips" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload payment slips" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update payment slips" ON storage.objects;

-- Admin-only SELECT
CREATE POLICY "Admins can view payment slips"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-slips' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow uploads (INSERT) for anyone (guest checkout supported); no UPDATE/overwrite for non-admins
CREATE POLICY "Anyone can upload a payment slip"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-slips');

-- Admin-only UPDATE / DELETE
CREATE POLICY "Admins can update payment slips"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'payment-slips' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete payment slips"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'payment-slips' AND has_role(auth.uid(), 'admin'::app_role));