-- Fix 1: Add INSERT policy for profiles table (defense-in-depth)
CREATE POLICY "Users can create own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Fix 2: Update update_updated_at_column function with search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix 3: Tighten order_items INSERT policy to only allow items for recent orders
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Can create order items for valid orders"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = order_id
    AND created_at > NOW() - INTERVAL '5 minutes'
  )
);