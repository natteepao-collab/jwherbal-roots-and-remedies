
CREATE TABLE public.promotion_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT 'โปรโมชั่นประจำเดือน',
  is_monthly boolean NOT NULL DEFAULT true,
  custom_end_date timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promotion_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view promotion settings"
  ON public.promotion_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage promotion settings"
  ON public.promotion_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default row
INSERT INTO public.promotion_settings (title, is_monthly, is_active)
VALUES ('โปรโมชั่นประจำเดือน', true, true);

CREATE TRIGGER update_promotion_settings_updated_at
  BEFORE UPDATE ON public.promotion_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
