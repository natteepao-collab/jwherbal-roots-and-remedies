
-- Add is_promoted column to products table
ALTER TABLE public.products ADD COLUMN is_promoted boolean NOT NULL DEFAULT false;

-- Set existing promoted products as promoted
UPDATE public.products SET is_promoted = true WHERE id IN (
  'a1f1c1d1-1111-4111-8111-111111111111',
  'b2f2c2d2-2222-4222-8222-222222222222'
);
