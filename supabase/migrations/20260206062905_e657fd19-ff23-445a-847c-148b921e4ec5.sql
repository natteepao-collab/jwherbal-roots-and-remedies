-- Create about_settings table for main about page content
CREATE TABLE public.about_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Vision section
  vision_title_th TEXT NOT NULL DEFAULT 'วิสัยทัศน์',
  vision_title_en TEXT NOT NULL DEFAULT 'Vision',
  vision_title_zh TEXT NOT NULL DEFAULT '愿景',
  vision_quote_th TEXT NOT NULL DEFAULT '"เป็นแบรนด์ผลิตภัณฑ์ดูแลสุขภาพหลอดเลือดจากสมุนไพร ที่ได้รับความเชื่อมั่นในด้านคุณภาพ มาตรฐาน และความปลอดภัย เพื่อยกระดับคุณภาพชีวิตของผู้คนอย่างยั่งยืน"',
  vision_quote_en TEXT NOT NULL DEFAULT '"To be a trusted herbal blood vessel health brand, recognized for quality, standards, and safety, to sustainably enhance people''s quality of life."',
  vision_quote_zh TEXT NOT NULL DEFAULT '"成为值得信赖的草药血管健康品牌，以质量、标准和安全著称，持续提升人们的生活质量。"',
  vision_subtitle_th TEXT NOT NULL DEFAULT 'ไม่ใช่เพียงการดูแลสุขภาพในวันนี้ แต่คือการสร้างโอกาสให้ผู้คนมีชีวิตที่แข็งแรงในระยะยาว',
  vision_subtitle_en TEXT NOT NULL DEFAULT 'Not just caring for health today, but creating opportunities for people to live stronger lives in the long run.',
  vision_subtitle_zh TEXT NOT NULL DEFAULT '不仅是今天的健康护理，更是为人们创造长期健康生活的机会。',
  vision_image_url TEXT,
  -- Company story
  story_title_th TEXT NOT NULL DEFAULT 'เรื่องราวของเรา',
  story_title_en TEXT NOT NULL DEFAULT 'Our Story',
  story_title_zh TEXT NOT NULL DEFAULT '我们的故事',
  story_paragraph1_th TEXT NOT NULL DEFAULT 'JWHERBAL เริ่มต้นจากความตั้งใจที่จะนำภูมิปัญญาสมุนไพรไทยมาพัฒนาเป็นผลิตภัณฑ์ที่มีคุณภาพและปลอดภัย',
  story_paragraph1_en TEXT NOT NULL DEFAULT 'JWHERBAL began with the intention to develop Thai herbal wisdom into quality and safe products.',
  story_paragraph1_zh TEXT NOT NULL DEFAULT 'JWHERBAL始于将泰国草药智慧开发为优质安全产品的愿景。',
  story_paragraph2_th TEXT NOT NULL DEFAULT 'ด้วยประสบการณ์กว่า 10 ปี ในการวิจัยและพัฒนาผลิตภัณฑ์สมุนไพร เราได้รับความไว้วางใจจากลูกค้ากว่า 50,000 คนทั่วประเทศ',
  story_paragraph2_en TEXT NOT NULL DEFAULT 'With over 10 years of experience in herbal product research and development, we have earned the trust of over 50,000 customers nationwide.',
  story_paragraph2_zh TEXT NOT NULL DEFAULT '凭借超过10年的草药产品研发经验，我们赢得了全国50,000多名客户的信任。',
  story_paragraph3_th TEXT NOT NULL DEFAULT 'เรามุ่งมั่นที่จะสร้างสรรค์ผลิตภัณฑ์ที่ดีที่สุดเพื่อสุขภาพที่ดีของทุกคน',
  story_paragraph3_en TEXT NOT NULL DEFAULT 'We are committed to creating the best products for everyone''s good health.',
  story_paragraph3_zh TEXT NOT NULL DEFAULT '我们致力于为每个人的健康创造最好的产品。',
  -- Achievements
  achievement_years TEXT NOT NULL DEFAULT '10+',
  achievement_years_label_th TEXT NOT NULL DEFAULT 'ปีประสบการณ์',
  achievement_years_label_en TEXT NOT NULL DEFAULT 'Years of Experience',
  achievement_years_label_zh TEXT NOT NULL DEFAULT '年经验',
  achievement_customers TEXT NOT NULL DEFAULT '50,000+',
  achievement_customers_label_th TEXT NOT NULL DEFAULT 'ลูกค้าที่ไว้วางใจ',
  achievement_customers_label_en TEXT NOT NULL DEFAULT 'Trusted Customers',
  achievement_customers_label_zh TEXT NOT NULL DEFAULT '信任的客户',
  achievement_products TEXT NOT NULL DEFAULT '100+',
  achievement_products_label_th TEXT NOT NULL DEFAULT 'ผลิตภัณฑ์',
  achievement_products_label_en TEXT NOT NULL DEFAULT 'Products',
  achievement_products_label_zh TEXT NOT NULL DEFAULT '产品',
  achievement_satisfaction TEXT NOT NULL DEFAULT '98%',
  achievement_satisfaction_label_th TEXT NOT NULL DEFAULT 'ความพึงพอใจ',
  achievement_satisfaction_label_en TEXT NOT NULL DEFAULT 'Satisfaction Rate',
  achievement_satisfaction_label_zh TEXT NOT NULL DEFAULT '满意率',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create about_mission_items table for mission accordion items
CREATE TABLE public.about_mission_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  title_zh TEXT NOT NULL DEFAULT '',
  description_th TEXT NOT NULL,
  description_en TEXT NOT NULL DEFAULT '',
  description_zh TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_mission_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for about_settings
CREATE POLICY "Anyone can view about settings" ON public.about_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage about settings" ON public.about_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for about_mission_items
CREATE POLICY "Anyone can view active mission items" ON public.about_mission_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage mission items" ON public.about_mission_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_about_settings_updated_at BEFORE UPDATE ON public.about_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_mission_items_updated_at BEFORE UPDATE ON public.about_mission_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default about settings
INSERT INTO public.about_settings (id) VALUES (gen_random_uuid());

-- Insert mission items from user's screenshots
INSERT INTO public.about_mission_items (sort_order, title_th, title_en, title_zh, description_th, description_en, description_zh) VALUES
(1, 'พัฒนาผลิตภัณฑ์สมุนไพรไทยสู่มาตรฐานสากล', 'Develop Thai Herbal Products to International Standards', '将泰国草药产品提升至国际标准', 'คัดเลือกและพัฒนาสมุนไพรไทยด้วยกระบวนการผลิตที่ได้มาตรฐาน ผ่านการควบคุมคุณภาพ ความปลอดภัย และการวิจัยอย่างเหมาะสม เพื่อให้ผู้บริโภคมั่นใจในทุกขั้นตอนของผลิตภัณฑ์', 'Select and develop Thai herbs through standardized production processes, quality control, safety measures, and appropriate research to ensure consumer confidence in every step of the product.', '通过标准化生产流程、质量控制、安全措施和适当研究来选择和开发泰国草药，确保消费者对产品的每个环节都有信心。'),
(2, 'ส่งเสริมการเข้าถึงการดูแลสุขภาพอย่างมีคุณภาพ', 'Promote Access to Quality Healthcare', '促进优质医疗保健的可及性', 'มุ่งพัฒนาผลิตภัณฑ์ที่มีคุณภาพในราคาที่เหมาะสม เพื่อให้คนไทยสามารถเข้าถึงทางเลือกในการดูแลสุขภาพหลอดเลือดได้อย่างทั่วถึง', 'Develop quality products at affordable prices so that Thai people can access blood vessel health care options widely.', '以合理的价格开发优质产品，让泰国人民能够广泛获得血管健康护理选择。'),
(3, 'ดำเนินธุรกิจควบคู่กับความรับผิดชอบต่อสังคม', 'Conduct Business with Social Responsibility', '在经营业务的同时承担社会责任', 'จัดสรรรายได้ส่วนหนึ่งเพื่อสนับสนุนอุปกรณ์ทางการแพทย์ และกิจกรรมด้านสาธารณสุขให้แก่โรงพยาบาลและชุมชนในพื้นที่ห่างไกล เพื่อร่วมยกระดับคุณภาพชีวิตของสังคมไทย', 'Allocate a portion of revenue to support medical equipment and public health activities for hospitals and communities in remote areas to help improve the quality of life in Thai society.', '将部分收入用于支持偏远地区医院和社区的医疗设备和公共卫生活动，以帮助提高泰国社会的生活质量。'),
(4, 'เป็นส่วนหนึ่งในการส่งเสริมสุขภาพหลอดเลือดของผู้คน', 'Be Part of Promoting People''s Vascular Health', '成为促进人们血管健康的一部分', 'ให้ความรู้และสร้างความตระหนักรู้ด้านการดูแลสุขภาพหลอดเลือด ควบคู่กับการใช้ผลิตภัณฑ์อย่างถูกต้อง เพื่อสนับสนุนการมีสุขภาพที่ดีอย่างยั่งยืน', 'Provide knowledge and raise awareness about vascular health care, along with proper product usage, to support sustainable good health.', '提供血管健康护理知识并提高意识，配合正确的产品使用，以支持可持续的良好健康。');