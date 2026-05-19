CREATE POLICY "Admins can delete chat conversations"
ON public.chat_conversations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete chat messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));