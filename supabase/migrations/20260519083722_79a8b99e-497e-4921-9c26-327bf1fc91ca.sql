-- Add admin-takeover fields
ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS admin_takeover boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_takeover_by uuid,
  ADD COLUMN IF NOT EXISTS admin_takeover_at timestamp with time zone;

-- Allow admins to send messages in any conversation (as assistant/admin replies)
CREATE POLICY "Admins can insert messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update conversation metadata (takeover state, notes, etc.)
CREATE POLICY "Admins can update conversations"
ON public.chat_conversations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Realtime: ensure both tables broadcast changes and emit full row data
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_conversations REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
  END IF;
END $$;