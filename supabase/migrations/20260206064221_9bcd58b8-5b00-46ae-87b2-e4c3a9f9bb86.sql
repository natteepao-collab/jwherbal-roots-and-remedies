-- Create table for Values section
CREATE TABLE public.about_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon TEXT NOT NULL DEFAULT 'leaf',
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  title_zh TEXT NOT NULL DEFAULT '',
  description_th TEXT NOT NULL,
  description_en TEXT NOT NULL DEFAULT '',
  description_zh TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Certifications section
CREATE TABLE public.about_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'award',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Hero section fields to about_settings
ALTER TABLE public.about_settings
ADD COLUMN IF NOT EXISTS hero_title_th TEXT NOT NULL DEFAULT 'เกี่ยวกับ JWHERBAL',
ADD COLUMN IF NOT EXISTS hero_title_en TEXT NOT NULL DEFAULT 'About JWHERBAL',
ADD COLUMN IF NOT EXISTS hero_title_zh TEXT NOT NULL DEFAULT '关于JWHERBAL',
ADD COLUMN IF NOT EXISTS hero_subtitle_th TEXT NOT NULL DEFAULT 'มุ่งมั่นนำเสนอสมุนไพรและผลิตภัณฑ์เพื่อสุขภาพคุณภาพสูง เพื่อคุณภาพชีวิตที่ดีกว่าของทุกคน',
ADD COLUMN IF NOT EXISTS hero_subtitle_en TEXT NOT NULL DEFAULT 'Committed to providing high-quality herbs and health products for a better quality of life for everyone',
ADD COLUMN IF NOT EXISTS hero_subtitle_zh TEXT NOT NULL DEFAULT '致力于提供高质量的草药和健康产品，为每个人创造更好的生活质量',
ADD COLUMN IF NOT EXISTS values_title_th TEXT NOT NULL DEFAULT 'ค่านิยมของเรา',
ADD COLUMN IF NOT EXISTS values_title_en TEXT NOT NULL DEFAULT 'Our Values',
ADD COLUMN IF NOT EXISTS values_title_zh TEXT NOT NULL DEFAULT '我们的价值观',
ADD COLUMN IF NOT EXISTS values_subtitle_th TEXT NOT NULL DEFAULT 'หลักการที่เรายึดมั่นในการดำเนินธุรกิจ',
ADD COLUMN IF NOT EXISTS values_subtitle_en TEXT NOT NULL DEFAULT 'The principles we uphold in our business',
ADD COLUMN IF NOT EXISTS values_subtitle_zh TEXT NOT NULL DEFAULT '我们在业务中坚持的原则',
ADD COLUMN IF NOT EXISTS certifications_title_th TEXT NOT NULL DEFAULT 'ใบรับรองคุณภาพ',
ADD COLUMN IF NOT EXISTS certifications_title_en TEXT NOT NULL DEFAULT 'Quality Certifications',
ADD COLUMN IF NOT EXISTS certifications_title_zh TEXT NOT NULL DEFAULT '质量认证',
ADD COLUMN IF NOT EXISTS certifications_subtitle_th TEXT NOT NULL DEFAULT 'ผลิตภัณฑ์ของเราได้รับการรับรองมาตรฐานจากหน่วยงานที่เชื่อถือได้',
ADD COLUMN IF NOT EXISTS certifications_subtitle_en TEXT NOT NULL DEFAULT 'Our products are certified by trusted authorities',
ADD COLUMN IF NOT EXISTS certifications_subtitle_zh TEXT NOT NULL DEFAULT '我们的产品获得可信机构的认证',
ADD COLUMN IF NOT EXISTS mission_subtitle_th TEXT NOT NULL DEFAULT 'พันธกิจที่เรายึดมั่นในการพัฒนาผลิตภัณฑ์สมุนไพรคุณภาพสูงสำหรับทุกครอบครัว',
ADD COLUMN IF NOT EXISTS mission_subtitle_en TEXT NOT NULL DEFAULT 'Our commitment to developing high-quality herbal products for every family',
ADD COLUMN IF NOT EXISTS mission_subtitle_zh TEXT NOT NULL DEFAULT '我们致力于为每个家庭开发高质量的草药产品';

-- Enable RLS
ALTER TABLE public.about_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_certifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for about_values
CREATE POLICY "Anyone can view active values" ON public.about_values FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage values" ON public.about_values FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for about_certifications
CREATE POLICY "Anyone can view active certifications" ON public.about_certifications FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage certifications" ON public.about_certifications FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default values
INSERT INTO public.about_values (icon, title_th, title_en, title_zh, description_th, description_en, description_zh, sort_order) VALUES
('leaf', 'ธรรมชาติ 100%', 'Natural 100%', '100%天然', 'เราใช้เฉพาะวัตถุดิบจากธรรมชาติที่ผ่านการคัดสรรอย่างพิถีพิถัน', 'We use only carefully selected natural ingredients', '我们只使用精心挑选的天然原料', 1),
('shield', 'คุณภาพมาตรฐาน', 'Quality Standards', '质量标准', 'ผลิตภัณฑ์ทุกชิ้นผ่านการรับรองมาตรฐาน อย. GMP และ HALAL', 'All products are FDA, GMP and HALAL certified', '所有产品均获得FDA、GMP和HALAL认证', 2),
('heart', 'ใส่ใจลูกค้า', 'Customer Care', '客户关怀', 'ทีมผู้เชี่ยวชาญพร้อมให้คำปรึกษาและดูแลลูกค้าอย่างใกล้ชิด', 'Expert team ready to provide close customer support', '专业团队随时为客户提供周到的服务', 3),
('target', 'นวัตกรรม', 'Innovation', '创新', 'พัฒนาสูตรผลิตภัณฑ์อย่างต่อเนื่องด้วยงานวิจัยและเทคโนโลยีทันสมัย', 'Continuously developing products with research and modern technology', '通过研究和现代技术不断开发产品', 4);

-- Insert default certifications
INSERT INTO public.about_certifications (name, icon, sort_order) VALUES
('อย. (FDA)', 'award', 1),
('GMP', 'award', 2),
('HALAL', 'award', 3),
('ISO 9001', 'award', 4);

-- Create triggers for updated_at
CREATE TRIGGER update_about_values_updated_at BEFORE UPDATE ON public.about_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_certifications_updated_at BEFORE UPDATE ON public.about_certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();