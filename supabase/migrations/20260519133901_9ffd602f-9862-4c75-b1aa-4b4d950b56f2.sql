
UPDATE public.about_settings SET achievement_products = '2' WHERE achievement_products = '100+';

CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  user_agent text,
  session_id text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_path ON public.page_views(path);
CREATE INDEX idx_page_views_session ON public.page_views(session_id);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view page views"
  ON public.page_views FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.seo_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  metric_key text NOT NULL,
  target_value numeric NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT 'monthly',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seo targets"
  ON public.seo_targets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.seo_targets (label, metric_key, target_value, period) VALUES
  ('ยอดเข้าชมต่อเดือน', 'monthly_views', 10000, 'monthly'),
  ('ผู้เข้าชมไม่ซ้ำต่อเดือน', 'monthly_unique', 3000, 'monthly'),
  ('ยอดเข้าชมต่อวัน', 'daily_views', 350, 'daily');
