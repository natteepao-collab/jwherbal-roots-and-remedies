-- Allow logged-in users to view their own chat conversations and messages
CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can view their own chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = chat_messages.conversation_id
      AND c.user_id = auth.uid()
  )
);

-- Helpful index for per-user lookup ordered by recency
CREATE INDEX IF NOT EXISTS chat_conversations_user_id_last_message_at_idx
  ON public.chat_conversations (user_id, last_message_at DESC);