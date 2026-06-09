CREATE TABLE public.popup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  image_alt TEXT DEFAULT 'โปรโมชั่นพิเศษ',
  button_text TEXT NOT NULL DEFAULT 'ช้อปเลย รับส่วนลด →',
  note_text TEXT DEFAULT '*ส่วนลดนี้มีเฉพาะที่เว็บไซต์นี้เท่านั้น',
  link_url TEXT NOT NULL DEFAULT '/shop',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.popup_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.popup_settings TO authenticated;
GRANT ALL ON public.popup_settings TO service_role;

ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view popup settings"
ON public.popup_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can insert popup settings"
ON public.popup_settings FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update popup settings"
ON public.popup_settings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete popup settings"
ON public.popup_settings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_popup_settings_updated_at
BEFORE UPDATE ON public.popup_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.popup_settings (id, enabled, button_text, note_text, link_url, image_alt)
VALUES ('00000000-0000-0000-0000-000000000001', true, 'ช้อปเลย รับส่วนลด →', '*ส่วนลดนี้มีเฉพาะที่เว็บไซต์นี้เท่านั้น', '/shop', 'โปรโมชั่นพิเศษ V FLOW ลดแรงมาก ส่วนลดเพิ่ม 50 บาท');