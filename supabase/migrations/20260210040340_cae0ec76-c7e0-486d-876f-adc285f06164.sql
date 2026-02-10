
-- Remove overly permissive policies (service role bypasses RLS anyway)
DROP POLICY "Service role can manage conversations" ON public.chat_conversations;
DROP POLICY "Service role can manage messages" ON public.chat_messages;
