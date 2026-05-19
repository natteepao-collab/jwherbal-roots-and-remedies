
-- Remove Organic and OTOP
DELETE FROM public.trust_certifications WHERE title_th IN ('Organic', 'OTOP');

-- Add new certifications: GHPs, HACCP, ISO 9001, ISO 22000
INSERT INTO public.trust_certifications (title_th, title_en, title_zh, description_th, description_en, description_zh, icon, sort_order) VALUES
('GHPs', 'GHPs', 'GHPs', 'หลักเกณฑ์สุขลักษณะที่ดี', 'Good Hygiene Practices', '良好卫生规范', 'shield', 3),
('HACCP', 'HACCP', 'HACCP', 'ระบบวิเคราะห์อันตรายและจุดควบคุมวิกฤต', 'Hazard Analysis & Critical Control Points', '危害分析与关键控制点', 'shield', 4),
('ISO 9001', 'ISO 9001', 'ISO 9001', 'มาตรฐานระบบบริหารคุณภาพสากล', 'International Quality Management Standard', '国际质量管理标准', 'award', 5),
('ISO 22000', 'ISO 22000', 'ISO 22000', 'มาตรฐานความปลอดภัยอาหารสากล', 'International Food Safety Standard', '国际食品安全标准', 'award', 6);
