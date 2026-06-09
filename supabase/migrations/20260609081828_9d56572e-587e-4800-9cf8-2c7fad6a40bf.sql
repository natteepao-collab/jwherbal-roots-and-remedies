DROP POLICY IF EXISTS "Owner or fresh empty guest order can add items" ON public.order_items;

CREATE POLICY "Owner or fresh guest order can add items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_items.order_id
      AND (
        (o.user_id IS NOT NULL AND o.user_id = auth.uid())
        OR (o.user_id IS NULL AND o.created_at > (now() - interval '5 minutes'))
      )
  )
);