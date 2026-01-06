-- Create brand_story table for managing the brand story section
CREATE TABLE public.brand_story (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_th TEXT NOT NULL DEFAULT 'จากแปลงปลูกอินทรีย์ สู่มือคุณ',
  title_en TEXT NOT NULL DEFAULT 'From Organic Farms to Your Hands',
  title_zh TEXT NOT NULL DEFAULT '从有机农场到您手中',
  description_th TEXT NOT NULL DEFAULT 'เราคัดสรรเฉพาะสมุนไพรเกรดพรีเมียมจากแหล่งปลูกที่ดีที่สุดในประเทศไทย ผ่านกระบวนการผลิตที่ได้มาตรฐาน เพื่อให้คุณมั่นใจได้ในคุณภาพทุกหยดที่ดื่ม',
  description_en TEXT NOT NULL DEFAULT 'We carefully select only premium-grade herbs from the finest farms in Thailand, processed through certified production standards, ensuring quality in every drop you drink.',
  description_zh TEXT NOT NULL DEFAULT '我们精心挑选来自泰国最好农场的优质草药，通过认证的生产标准加工，确保您饮用的每一滴都是高品质的。',
  image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_story ENABLE ROW LEVEL SECURITY;

-- Anyone can view brand story
CREATE POLICY "Anyone can view brand story" 
ON public.brand_story 
FOR SELECT 
USING (true);

-- Only admins can manage brand story
CREATE POLICY "Admins can manage brand story" 
ON public.brand_story 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default record
INSERT INTO public.brand_story (id) VALUES (gen_random_uuid());