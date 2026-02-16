
-- Create promotion_tiers table
CREATE TABLE public.promotion_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'ชิ้น',
  price NUMERIC NOT NULL,
  normal_price NUMERIC NOT NULL,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotion_tiers ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Anyone can view active promotion tiers"
ON public.promotion_tiers FOR SELECT
USING (is_active = true);

-- Admin write policies
CREATE POLICY "Admins can insert promotion tiers"
ON public.promotion_tiers FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update promotion tiers"
ON public.promotion_tiers FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete promotion tiers"
ON public.promotion_tiers FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_promotion_tiers_updated_at
BEFORE UPDATE ON public.promotion_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
