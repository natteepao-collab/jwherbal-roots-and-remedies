ALTER TABLE public.popup_settings
  ADD COLUMN IF NOT EXISTS promo_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS promo_threshold numeric NOT NULL DEFAULT 2000,
  ADD COLUMN IF NOT EXISTS promo_discount numeric NOT NULL DEFAULT 50;