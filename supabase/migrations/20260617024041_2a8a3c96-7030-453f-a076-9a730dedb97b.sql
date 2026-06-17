
CREATE TABLE public.analytics_baselines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  baseline_value NUMERIC NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'month',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.analytics_baselines TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_baselines TO authenticated;
GRANT ALL ON public.analytics_baselines TO service_role;

ALTER TABLE public.analytics_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view baselines"
  ON public.analytics_baselines FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert baselines"
  ON public.analytics_baselines FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update baselines"
  ON public.analytics_baselines FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete baselines"
  ON public.analytics_baselines FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_analytics_baselines_updated_at
  BEFORE UPDATE ON public.analytics_baselines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.analytics_baselines (metric_key, label, baseline_value, period) VALUES
  ('monthly_views', 'ยอดเข้าชม (รายเดือน)', 50, 'month'),
  ('monthly_unique', 'ผู้เข้าชมไม่ซ้ำ (รายเดือน)', 100, 'month');
