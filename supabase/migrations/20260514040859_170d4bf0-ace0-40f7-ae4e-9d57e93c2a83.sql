DROP POLICY IF EXISTS "Can create order items for valid orders" ON public.order_items;

CREATE POLICY "Owner or fresh empty guest order can add items"
ON public.order_items
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND (
        (o.user_id IS NOT NULL AND o.user_id = auth.uid())
        OR (o.user_id IS NULL AND o.created_at > (now() - interval '5 minutes'))
      )
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.order_items oi WHERE oi.order_id = order_items.order_id
  )
);