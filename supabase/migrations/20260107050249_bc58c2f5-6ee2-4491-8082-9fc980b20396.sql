-- Create table for FAQ images (separate from review images)
CREATE TABLE public.faq_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faq_images ENABLE ROW LEVEL SECURITY;

-- Public can view active images
CREATE POLICY "Anyone can view active faq images" 
ON public.faq_images 
FOR SELECT 
USING (is_active = true);

-- Admins can manage all faq images
CREATE POLICY "Admins can manage faq images" 
ON public.faq_images 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for FAQ images
INSERT INTO storage.buckets (id, name, public) VALUES ('faq-images', 'faq-images', true);

-- Storage policies for faq-images bucket
CREATE POLICY "Anyone can view faq images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'faq-images');

CREATE POLICY "Admins can upload faq images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'faq-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update faq images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'faq-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete faq images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'faq-images' AND public.has_role(auth.uid(), 'admin'));