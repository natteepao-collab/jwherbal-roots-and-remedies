-- Lock down Realtime Broadcast/Presence channels to admins only.
-- The app uses postgres_changes (which already enforces table-level RLS per subscriber),
-- but does NOT use Realtime Broadcast or Presence. Adding admin-only policies on
-- realtime.messages prevents any authenticated user from subscribing to broadcast
-- channels that could leak PII (chat_conversations, chat_messages, etc.).

-- Ensure RLS is enabled (default on modern Supabase, safe to re-run)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop any prior policies we may have created so this migration is idempotent
DROP POLICY IF EXISTS "Admins only can read realtime broadcasts" ON realtime.messages;
DROP POLICY IF EXISTS "Admins only can write realtime broadcasts" ON realtime.messages;

CREATE POLICY "Admins only can read realtime broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins only can write realtime broadcasts"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));