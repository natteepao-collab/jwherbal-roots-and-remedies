-- 1. Restrict analytics_baselines reads to admins only
DROP POLICY IF EXISTS "Anyone can view baselines" ON public.analytics_baselines;
CREATE POLICY "Admins can view baselines"
ON public.analytics_baselines
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Bind payment-slip uploads to a real, recently-created order
CREATE OR REPLACE FUNCTION public.payment_slip_order_valid(_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id::text = split_part(_path, '/', 1)
      AND o.created_at > now() - interval '24 hours'
  );
$$;

DROP POLICY IF EXISTS "Anyone can upload a payment slip" ON storage.objects;
CREATE POLICY "Upload payment slip to valid recent order"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'payment-slips'
  AND array_length(storage.foldername(name), 1) = 1
  AND public.payment_slip_order_valid(name)
);