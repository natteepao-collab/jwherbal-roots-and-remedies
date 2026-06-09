DELETE FROM public.about_certifications WHERE name ILIKE '%HALAL%';

UPDATE public.about_values
SET description_th = 'ผลิตภัณฑ์ทุกชิ้นผ่านการรับรองมาตรฐาน อย. และ GMP',
    description_en = 'All products are FDA and GMP certified',
    description_zh = '所有产品均获得FDA和GMP认证'
WHERE id = '8d5de68f-f772-4777-99b5-d5acdc4f1bd3';