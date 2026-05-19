
ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS page_url text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS device_type text,
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS customer_line text,
  ADD COLUMN IF NOT EXISTS intent text,
  ADD COLUMN IF NOT EXISTS topics text[],
  ADD COLUMN IF NOT EXISTS products_mentioned text[],
  ADD COLUMN IF NOT EXISTS sentiment text,
  ADD COLUMN IF NOT EXISTS lead_score integer,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS analyzed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS admin_notes text;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_intent ON public.chat_conversations(intent);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_sentiment ON public.chat_conversations(sentiment);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_lead_score ON public.chat_conversations(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message_at ON public.chat_conversations(last_message_at DESC);
