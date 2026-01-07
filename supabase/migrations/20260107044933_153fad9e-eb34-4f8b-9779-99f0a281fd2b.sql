-- Create FAQ/Q&A table
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_th TEXT NOT NULL,
  question_en TEXT NOT NULL DEFAULT '',
  question_zh TEXT NOT NULL DEFAULT '',
  answer_th TEXT NOT NULL,
  answer_en TEXT NOT NULL DEFAULT '',
  answer_zh TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active FAQ items" 
ON public.faq_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage FAQ items" 
ON public.faq_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_faq_items_updated_at
BEFORE UPDATE ON public.faq_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();