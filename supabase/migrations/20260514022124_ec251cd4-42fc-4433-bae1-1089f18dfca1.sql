CREATE TABLE public.notification_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type text NOT NULL,
  channel text NOT NULL,
  status text NOT NULL,
  reference_id text,
  reference_type text,
  dedupe_key text,
  payload jsonb,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_logs_dedupe ON public.notification_logs(dedupe_key, created_at DESC);
CREATE INDEX idx_notification_logs_ref ON public.notification_logs(reference_type, reference_id, created_at DESC);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notification logs"
ON public.notification_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage notification logs"
ON public.notification_logs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));