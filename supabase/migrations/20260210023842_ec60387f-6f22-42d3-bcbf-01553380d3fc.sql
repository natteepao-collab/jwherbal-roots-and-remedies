
-- Add detail content fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS detail_content_th text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS detail_content_en text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS detail_content_zh text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS usage_instructions_th text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS usage_instructions_en text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS usage_instructions_zh text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS suitable_for_th text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS suitable_for_en text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS suitable_for_zh text NOT NULL DEFAULT '';

-- Create product_images table for gallery
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  title text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_images
CREATE POLICY "Anyone can view active product images"
ON public.product_images
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage product images"
ON public.product_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update existing V Flow products with detail content
UPDATE public.products SET
  detail_content_th = '• สมุนไพรไทย 100% จากโครงการวิจัย IRTC
• ช่วยบำรุงการไหลเวียนโลหิต ลดภาวะเลือดข้น
• ผลิตในโรงงานมาตรฐาน GMP
• มีเลข อย. รับรอง',
  detail_content_en = '• 100% Thai herbs from IRTC research project
• Improves blood circulation, reduces blood viscosity
• Manufactured in GMP-certified facility
• FDA approved',
  suitable_for_th = '• วัยรุ่นหรือวัยทำงาน
• ผู้ที่มีความเครียด ทำงานใช้สมองมาก สมองไม่โล่ง
• ผู้ที่อ่อนเพลียง่าย ต้องการเพิ่มความสดชื่น กระปรี้กระเปร่า
• ผู้ที่เสี่ยงต่อความเสื่อมของหลอดเลือด เช่น ไม่ค่อยมีเวลาพักผ่อน ความดันเริ่มสูง
• ผู้ที่มีอาการเวียน หรือ มึนศีรษะเป็นประจำ
• ผู้ที่ต้องการบำรุงผิวพรรณให้ดูอ่อนเยาว์ สดใสจากภายในสู่ภายนอก',
  suitable_for_en = '• Teenagers and working adults
• People with stress, heavy brain workers
• Those who feel fatigued easily, need energy boost
• Those at risk of blood vessel deterioration
• People with frequent dizziness or headaches
• Those who want to nourish skin from within',
  usage_instructions_th = 'ทานวันละ 2 เม็ด ก่อนอาหารเช้า',
  usage_instructions_en = 'Take 2 capsules daily before breakfast'
WHERE id = 'a1f1c1d1-1111-4111-8111-111111111111';

UPDATE public.products SET
  detail_content_th = '• สมุนไพรไทย 100% ขิง พุทราจีน เห็ดหูหนู
• ปราศจากน้ำตาล มีเลข อย. 50-1-16657-2-0226
• ช่วยการไหลเวียนโลหิต ลดภาวะเลือดข้น
• ผลิตในโรงงานมาตรฐาน GMP',
  detail_content_en = '• 100% Thai herbs: ginger, Chinese jujube, wood ear mushroom
• Sugar-free, FDA No. 50-1-16657-2-0226
• Improves blood circulation, reduces blood viscosity
• GMP certified production',
  suitable_for_th = '• วัยกลางคนและผู้สูงอายุ
• ผู้ที่มีความเสี่ยงของโรคหลอดเลือดแข็งตัว และหลอดเลือดเสื่อม เช่น ผู้สูงอายุ โรคเบาหวาน โรคความดันโลหิตสูง หรือ เริ่มสูง โรคไขมันในเลือดสูง สูบบุหรี่ พักผ่อนไม่เพียงพอ
• ผู้ที่มีอาการของโรคทางหลอดเลือดตีบ เช่น โรคหลอดเลือดสมอง หรืออัมพาต โรคหลอดเลือดหัวใจ
• ผู้ที่มีอาการเวียน หรือ มึนศีรษะเป็นประจำ เดินเซ ความคิดไม่คล่อง และหลับไม่สนิท จากการที่เลือดไปเลี้ยงสมองไม่เพียงพอ',
  suitable_for_en = '• Middle-aged and elderly
• Those at risk of arteriosclerosis: diabetes, hypertension, high cholesterol, smokers
• Those with vascular disease symptoms: stroke, paralysis, heart disease
• Those with frequent dizziness, unsteady gait, poor concentration, insomnia due to insufficient blood flow to brain',
  usage_instructions_th = '1 ซอง ผสมน้ำร้อน ดื่มก่อนอาหารเช้า',
  usage_instructions_en = '1 sachet mixed with hot water, drink before breakfast'
WHERE id = 'b2f2c2d2-2222-4222-8222-222222222222';
