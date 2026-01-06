-- Create trust_certifications table
CREATE TABLE public.trust_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon TEXT NOT NULL DEFAULT 'shield',
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  description_th TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_zh TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trust_ingredients table
CREATE TABLE public.trust_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  description_th TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_zh TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trust_expert table (single row for expert section)
CREATE TABLE public.trust_expert (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_th TEXT NOT NULL DEFAULT 'ทีมเภสัชกรพร้อมให้คำปรึกษา',
  title_en TEXT NOT NULL DEFAULT 'Pharmacist Team Ready to Assist',
  title_zh TEXT NOT NULL DEFAULT '药剂师团队随时为您服务',
  description_th TEXT NOT NULL DEFAULT 'เรามีทีมเภสัชกรและผู้เชี่ยวชาญด้านสมุนไพรไทยคอยให้คำปรึกษาตลอดเวลา',
  description_en TEXT NOT NULL DEFAULT 'Our team of pharmacists and Thai herbal experts are always available to advise you.',
  description_zh TEXT NOT NULL DEFAULT '我们的药剂师和泰国草药专家团队随时为您提供建议。',
  image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trust_section_settings table for section header
CREATE TABLE public.trust_section_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_title_th TEXT NOT NULL DEFAULT 'มาตรฐานที่คุณวางใจได้',
  section_title_en TEXT NOT NULL DEFAULT 'Standards You Can Trust',
  section_title_zh TEXT NOT NULL DEFAULT '您可以信赖的标准',
  section_subtitle_th TEXT NOT NULL DEFAULT 'เราผ่านการรับรองมาตรฐานจากหน่วยงานที่เชื่อถือได้ พร้อมทีมผู้เชี่ยวชาญคอยให้คำปรึกษา',
  section_subtitle_en TEXT NOT NULL DEFAULT 'We are certified by trusted authorities with a team of experts ready to assist you.',
  section_subtitle_zh TEXT NOT NULL DEFAULT '我们获得了可信机构的认证，并有专家团队随时为您提供帮助。',
  ingredients_title_th TEXT NOT NULL DEFAULT 'วัตถุดิบพรีเมียม คัดสรรอย่างพิถีพิถัน',
  ingredients_title_en TEXT NOT NULL DEFAULT 'Premium Ingredients, Carefully Selected',
  ingredients_title_zh TEXT NOT NULL DEFAULT '优质原料，精心挑选',
  ingredients_image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trust_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_expert ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_section_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view active certifications" ON public.trust_certifications FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active ingredients" ON public.trust_ingredients FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view expert info" ON public.trust_expert FOR SELECT USING (true);
CREATE POLICY "Anyone can view section settings" ON public.trust_section_settings FOR SELECT USING (true);

-- Admin manage policies
CREATE POLICY "Admins can manage certifications" ON public.trust_certifications FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage ingredients" ON public.trust_ingredients FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage expert" ON public.trust_expert FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage section settings" ON public.trust_section_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default data
INSERT INTO public.trust_certifications (icon, title_th, title_en, title_zh, description_th, description_en, description_zh, sort_order) VALUES
('shield', 'อย.', 'FDA Thailand', '泰国FDA', 'ขึ้นทะเบียนอาหาร', 'Food Registration', '食品注册', 1),
('award', 'GMP', 'GMP', 'GMP', 'มาตรฐานการผลิต', 'Manufacturing Standard', '生产标准', 2),
('leaf', 'Organic', 'Organic', 'Organic', 'วัตถุดิบอินทรีย์', 'Organic Ingredients', '有机原料', 3),
('award', 'OTOP', 'OTOP', 'OTOP', 'สินค้าคัดสรร', 'Selected Product', '精选产品', 4);

INSERT INTO public.trust_ingredients (name_th, name_en, name_zh, description_th, description_en, description_zh, sort_order) VALUES
('ขิงแก่ 12 เดือน', '12-Month Aged Ginger', '12个月陈姜', 'ขิงแก่จัดที่มีสารจินเจอรอลสูง ช่วยกระตุ้นการไหลเวียนโลหิต', 'Mature ginger with high gingerol content for blood circulation', '成熟的生姜，姜酚含量高，有助于血液循环', 1),
('ไพลสดจากสวน', 'Fresh Galangal from Gardens', '花园新鲜南姜', 'ไพลสดคุณภาพ ช่วยบรรเทาอาการปวดเมื่อย', 'Quality fresh galangal for pain relief', '优质新鲜南姜，缓解疼痛', 2),
('ขมิ้นชันออร์แกนิก', 'Organic Turmeric', '有机姜黄', 'ขมิ้นชันปลอดสารพิษ อุดมด้วยเคอร์คูมิน', 'Pesticide-free turmeric rich in curcumin', '无农药姜黄，富含姜黄素', 3);

INSERT INTO public.trust_expert (title_th, title_en, title_zh, description_th, description_en, description_zh) VALUES
('ทีมเภสัชกรพร้อมให้คำปรึกษา', 'Pharmacist Team Ready to Assist', '药剂师团队随时为您服务', 'เรามีทีมเภสัชกรและผู้เชี่ยวชาญด้านสมุนไพรไทยคอยให้คำปรึกษาตลอดเวลา เพื่อให้คุณมั่นใจในการเลือกผลิตภัณฑ์ที่เหมาะกับสุขภาพของคุณ', 'Our team of pharmacists and Thai herbal experts are always available to advise you, ensuring you choose the right products for your health.', '我们的药剂师和泰国草药专家团队随时为您提供建议，确保您选择适合您健康的产品。');

INSERT INTO public.trust_section_settings (section_title_th, section_title_en, section_title_zh, section_subtitle_th, section_subtitle_en, section_subtitle_zh, ingredients_title_th, ingredients_title_en, ingredients_title_zh) VALUES
('มาตรฐานที่คุณวางใจได้', 'Standards You Can Trust', '您可以信赖的标准', 'เราผ่านการรับรองมาตรฐานจากหน่วยงานที่เชื่อถือได้ พร้อมทีมผู้เชี่ยวชาญคอยให้คำปรึกษา', 'We are certified by trusted authorities with a team of experts ready to assist you.', '我们获得了可信机构的认证，并有专家团队随时为您提供帮助。', 'วัตถุดิบพรีเมียม คัดสรรอย่างพิถีพิถัน', 'Premium Ingredients, Carefully Selected', '优质原料，精心挑选');

-- Create triggers for updated_at
CREATE TRIGGER update_trust_certifications_updated_at BEFORE UPDATE ON public.trust_certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trust_ingredients_updated_at BEFORE UPDATE ON public.trust_ingredients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trust_expert_updated_at BEFORE UPDATE ON public.trust_expert FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trust_section_settings_updated_at BEFORE UPDATE ON public.trust_section_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();