-- Create table for customer review images carousel
CREATE TABLE public.review_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;

-- Public can view active images
CREATE POLICY "Anyone can view active review images"
ON public.review_images
FOR SELECT
USING (is_active = true);

-- Admin can manage all review images
CREATE POLICY "Admins can manage review images"
ON public.review_images
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_review_images_updated_at
  BEFORE UPDATE ON public.review_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();