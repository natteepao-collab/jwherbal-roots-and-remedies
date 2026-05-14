CREATE POLICY "Anyone can view payment settings"
ON public.payment_settings
FOR SELECT
TO public
USING (true);