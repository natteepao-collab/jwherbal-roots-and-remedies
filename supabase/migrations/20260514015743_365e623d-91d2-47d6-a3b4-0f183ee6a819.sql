
-- 1. Orders: payment slip
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_slip_url text,
  ADD COLUMN IF NOT EXISTS payment_slip_uploaded_at timestamptz;

-- Allow customers (authenticated owner OR guest order with matching email/phone via edge) to update slip
DROP POLICY IF EXISTS "Users can upload slip to their own orders" ON public.orders;
CREATE POLICY "Users can upload slip to their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id AND user_id IS NOT NULL)
  WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- 2. Storage bucket for slips
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-slips', 'payment-slips', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view payment slips" ON storage.objects;
CREATE POLICY "Public can view payment slips"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-slips');

DROP POLICY IF EXISTS "Anyone can upload payment slips" ON storage.objects;
CREATE POLICY "Anyone can upload payment slips"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-slips');

DROP POLICY IF EXISTS "Anyone can update payment slips" ON storage.objects;
CREATE POLICY "Anyone can update payment slips"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'payment-slips');

-- 3. Update community_posts content (TH/EN/ZH) - full multi-paragraph content
UPDATE public.community_posts SET
  content_th = E'การเวียนหัวเป็นปัญหาที่พบบ่อยในผู้สูงอายุ โดยเฉพาะตอนเปลี่ยนท่าทางหรือลุกขึ้นจากที่นั่ง สาเหตุหลักมักมาจากระบบไหลเวียนเลือดที่ทำงานช้าลงตามวัย การใช้ขิงเป็นอีกทางเลือกที่ปลอดภัยและได้ผลดีในการช่วยบรรเทาอาการนี้\n\nขิงมีสารสำคัญชื่อ Gingerol และ Shogaol ที่ช่วยกระตุ้นการไหลเวียนเลือดในสมอง ทำให้เลือดและออกซิเจนไปเลี้ยงสมองได้ดีขึ้น ผลคืออาการมึนงง เวียนหัว และคลื่นไส้ลดลงอย่างเห็นได้ชัด\n\nวิธีใช้ที่ง่ายที่สุดคือต้มขิงสด 1-2 แว่นกับน้ำ 1 แก้ว ดื่มอุ่นๆ ในตอนเช้าก่อนอาหาร ทำต่อเนื่องอย่างน้อย 2 สัปดาห์จะเริ่มเห็นผล สำหรับผู้สูงอายุที่ไม่ชอบรสเผ็ดของขิง สามารถผสมน้ำผึ้งเล็กน้อยเพื่อให้ดื่มง่ายขึ้น\n\nสิ่งที่ต้องระวังคือ ผู้ที่ทานยาละลายลิ่มเลือดหรือยาความดันควรปรึกษาแพทย์ก่อน เพราะขิงอาจเสริมฤทธิ์ของยาบางชนิด นอกจากนี้ไม่ควรดื่มในปริมาณมากเกินไป (ไม่เกิน 4 กรัมต่อวัน) เพื่อหลีกเลี่ยงผลข้างเคียง\n\nจากประสบการณ์ของผู้ดูแลที่บ้าน หลังให้คุณยายอายุ 78 ปี ดื่มน้ำขิงทุกเช้านาน 1 เดือน อาการเวียนหัวลดลงเกือบ 80% และไม่ต้องพึ่งยาแก้เวียนหัวอีกต่อไป สมุนไพรไทยจึงเป็นทางเลือกที่ดีและปลอดภัยสำหรับการดูแลสุขภาพระยะยาว',
  content_en = E'Dizziness is a common issue among the elderly, especially when changing posture or standing up from a sitting position. The main cause is usually slower blood circulation as we age. Ginger is a safe and effective alternative that helps relieve these symptoms.\n\nGinger contains active compounds called Gingerol and Shogaol, which stimulate blood circulation to the brain, allowing oxygen-rich blood to nourish the brain better. The result is a noticeable reduction in dizziness, lightheadedness, and nausea.\n\nThe easiest method is to boil 1-2 slices of fresh ginger in a glass of water and drink it warm in the morning before meals. Continue for at least 2 weeks to see results. For elderly who do not like the spiciness of ginger, a little honey can be added to make it easier to drink.\n\nCaution: those taking blood thinners or blood pressure medication should consult a doctor first, as ginger may interact with certain drugs. Also, do not consume more than 4 grams per day to avoid side effects.\n\nFrom personal caregiving experience, after giving a 78-year-old grandmother daily ginger tea every morning for 1 month, her dizziness reduced by nearly 80%, and she no longer needed dizziness medication. Thai herbs are truly a safe and excellent long-term wellness choice.',
  content_zh = E'头晕是老年人常见的问题，尤其在改变姿势或从座位上站起时。主要原因通常是随着年龄增长血液循环变慢。生姜是一种安全有效的替代品，可帮助缓解这些症状。\n\n生姜含有姜辣素（Gingerol）和姜烯酚（Shogaol）等活性成分，能刺激大脑的血液循环，使富含氧气的血液更好地滋养大脑，明显减少头晕、头昏和恶心。\n\n最简单的方法是将1-2片新鲜生姜煮在一杯水中，早晨饭前温热饮用。坚持至少2周即可见效。对于不喜欢生姜辣味的老人，可加少许蜂蜜以便饮用。\n\n注意：服用抗凝药或降压药者应先咨询医生，因为生姜可能与某些药物相互作用。每日不超过4克以避免副作用。\n\n根据照护经验，给78岁的奶奶每天早晨饮用姜茶1个月后，她的头晕减少了近80%，不再需要服用晕眩药物。泰国草药确实是长期保健的安全优秀选择。'
WHERE id = 'b2303e53-58db-4c34-9732-2d5c98835a39';

UPDATE public.community_posts SET
  content_th = E'เห็ดหูหนูดำเป็นสมุนไพรจีนโบราณที่ใช้กันมานานในการดูแลระบบไหลเวียนเลือด มีงานวิจัยจำนวนมากยืนยันว่ามีสารช่วยลดการเกาะตัวของเกล็ดเลือด ทำให้เลือดไหลเวียนได้ดีขึ้นและลดความเสี่ยงเลือดข้น\n\nสารสำคัญในเห็ดหูหนูดำคือ Adenosine และโพลีแซ็กคาไรด์ ซึ่งทำหน้าที่คล้ายแอสไพรินในการลดการเกาะตัวของเกล็ดเลือด แต่ปลอดภัยกว่าและไม่ระคายเคืองกระเพาะอาหาร\n\nวิธีปรุงที่นิยมคือนำเห็ดหูหนูดำแช่น้ำให้นิ่ม นำมาผัดกับผัก หรือใส่ในแกงจืด ทานสัปดาห์ละ 2-3 ครั้ง จะเห็นผลในด้านการลดอาการเหน็บชา มือเท้าเย็น และความรู้สึกหนักศีรษะ\n\nสำหรับผู้สูงอายุที่ทานอาหารยาก สามารถนำเห็ดหูหนูดำมาตุ๋นกับพุทราจีนและน้ำตาลกรวด ดื่มเป็นน้ำซุปอุ่นๆ ช่วยทั้งบำรุงเลือดและช่วยให้นอนหลับสบายขึ้น\n\nคำแนะนำเพิ่มเติม: ควรซื้อเห็ดหูหนูดำคุณภาพดี ไม่มีสารฟอกขาว และล้างให้สะอาดก่อนปรุงทุกครั้ง ผู้ที่กำลังจะผ่าตัดควรงดทานก่อนผ่าตัดอย่างน้อย 1 สัปดาห์เนื่องจากมีฤทธิ์ช่วยให้เลือดไหลเวียนคล่อง',
  content_en = E'Black wood ear mushroom is an ancient Chinese herb used for centuries to support blood circulation. Numerous studies confirm it contains compounds that reduce platelet aggregation, improving blood flow and lowering the risk of thickened blood.\n\nThe key compounds in black wood ear mushroom are Adenosine and polysaccharides, which act similarly to aspirin in reducing platelet clumping but are safer and do not irritate the stomach.\n\nA popular cooking method is to soak the mushroom in water until soft, then stir-fry with vegetables or add to clear soup. Eating 2-3 times a week visibly reduces tingling sensations, cold hands and feet, and heaviness in the head.\n\nFor elderly with poor appetite, the mushroom can be stewed with red dates and rock sugar to drink as warm soup, which both nourishes blood and improves sleep quality.\n\nAdditional advice: choose high-quality, unbleached black wood ear and rinse thoroughly before cooking. Those preparing for surgery should stop consumption at least one week prior, as the herb has blood-thinning properties.',
  content_zh = E'黑木耳是一种古老的中药材，长期以来用于改善血液循环。大量研究证实其含有可减少血小板聚集的成分，能改善血流、降低血液浓稠的风险。\n\n黑木耳中的主要活性物质是腺苷（Adenosine）和多糖类，作用类似阿司匹林，但更安全，不刺激胃部。\n\n常见做法是将黑木耳泡软后炒蔬菜或加入清汤中，每周食用2-3次，可明显减轻手脚发麻、冰凉以及头部沉重感。\n\n对于食欲不佳的老人，可将黑木耳与红枣、冰糖一起炖煮，饮用温热汤水，既补血又助眠。\n\n建议：选购优质未漂白的黑木耳，烹煮前彻底清洗。即将手术者应至少提前一周停止食用，因其有助于血液稀释。'
WHERE id = 'e6737af5-4a92-4997-9701-d30cda311b6b';

UPDATE public.community_posts SET
  content_th = E'พุทราจีน หรือที่เรียกว่า "Red Date" เป็นสมุนไพรที่หมอจีนใช้บำรุงเลือดและช่วยให้นอนหลับมาตลอดหลายพันปี เหมาะอย่างยิ่งสำหรับผู้สูงอายุที่นอนไม่หลับหรือหลับไม่ลึก\n\nพุทราจีนอุดมด้วยวิตามิน C, B, แมกนีเซียม และสารต้านอนุมูลอิสระ ช่วยลดความเครียดและคลายความตึงเครียดของระบบประสาท ทำให้สมองสงบและพร้อมเข้าสู่การนอนหลับลึก\n\nสูตรง่ายๆ: ต้มพุทราจีน 5-7 ลูกกับน้ำ 2 แก้ว เคี่ยวประมาณ 20 นาที ดื่มอุ่นๆ ก่อนนอน 1 ชั่วโมง คุณยายหลายท่านที่ลองทำมาเล่าว่านอนหลับลึกขึ้นและตื่นมาสดชื่นกว่าเดิม\n\nสามารถผสมพุทราจีนกับเห็ดหูหนูดำหรือลำไย เพื่อเพิ่มประสิทธิภาพในการบำรุงเลือดและช่วยให้ผู้สูงอายุที่มีอาการมือเท้าเย็นรู้สึกอบอุ่นขึ้น\n\nข้อควรระวัง: ผู้ป่วยเบาหวานควรลดปริมาณ เนื่องจากพุทราจีนมีน้ำตาลธรรมชาติสูง และไม่ควรทานก่อนนอนทันที ควรเว้นช่วง 1 ชั่วโมง เพื่อให้ระบบย่อยทำงานสบาย',
  content_en = E'Red dates (Chinese jujube) have been used by traditional Chinese medicine for thousands of years to nourish blood and improve sleep. They are perfect for the elderly who suffer from insomnia or shallow sleep.\n\nRed dates are rich in vitamin C, B, magnesium, and antioxidants that help reduce stress and ease nervous tension, calming the mind for deep sleep.\n\nSimple recipe: boil 5-7 red dates in 2 cups of water for about 20 minutes, then drink warm 1 hour before bed. Many grandmothers report sleeping more deeply and waking up refreshed.\n\nYou can combine red dates with black wood ear mushroom or longan to enhance blood-nourishing benefits and help warm up cold hands and feet.\n\nCaution: diabetics should reduce the portion since red dates contain natural sugars. Avoid drinking right before bed; allow at least 1 hour for digestion.',
  content_zh = E'红枣（中国大枣）在中医中已使用数千年，用于补血助眠，非常适合失眠或睡眠浅的老人。\n\n红枣富含维生素C、B、镁和抗氧化剂，能减轻压力、舒缓神经紧张，使大脑平静进入深睡眠。\n\n简易食谱：取5-7颗红枣加2杯水煮约20分钟，睡前1小时温热饮用。许多奶奶反映睡得更深，醒来更有精神。\n\n可将红枣与黑木耳或龙眼搭配，增强补血效果，并帮助手脚冰凉的老人感到温暖。\n\n注意：糖尿病患者应减量，因红枣天然糖分较高。不要临睡前饮用，应至少留出1小时让消化系统工作。'
WHERE id = '473209b6-2954-49d3-903c-c5d78c6b16ca';

UPDATE public.community_posts SET
  content_th = E'ความดันโลหิตสูงเป็นภัยเงียบที่พบในผู้สูงอายุไทยกว่า 50% หากไม่ดูแลอาจนำไปสู่โรคหัวใจ หลอดเลือดสมอง และไตวาย การใช้สมุนไพรไทยควบคู่กับการดูแลแบบแผนปัจจุบันเป็นทางเลือกที่ปลอดภัยและได้ผลดี\n\nสมุนไพรที่ช่วยลดความดันได้ดีที่สุด ได้แก่ กระเทียม ขึ้นฉ่าย ใบบัวบก และดอกคำฝอย โดยเฉพาะกระเทียมที่มี Allicin ช่วยขยายหลอดเลือดและลดคอเลสเตอรอลในเส้นเลือด\n\nวิธีดูแลพ่อแม่: เริ่มจากปรับอาหาร ลดเค็ม เพิ่มผักผลไม้ และดื่มน้ำสมุนไพรอุ่นๆ วันละ 1-2 แก้ว ออกกำลังกายเบาๆ เช่น เดินช้าๆ 30 นาทีต่อวัน จะช่วยควบคุมความดันได้อย่างยั่งยืน\n\nสำคัญที่สุดคือการตรวจวัดความดันสม่ำเสมอ จดบันทึกทุกวัน และปรึกษาแพทย์ก่อนหยุดยาทุกครั้ง สมุนไพรเป็นตัวเสริม ไม่ใช่ตัวทดแทนยาที่หมอสั่ง\n\nประสบการณ์จริง: คุณพ่อวัย 70 ความดันลดจาก 160/95 เหลือ 130/80 ภายใน 3 เดือน ด้วยการดื่มน้ำกระเทียมขึ้นฉ่ายทุกเช้า ลดเค็ม และเดินวันละ 30 นาที ลูกๆ ดีใจมากที่ไม่ต้องเพิ่มยาความดันอีกต่อไป',
  content_en = E'High blood pressure is a silent killer affecting over 50% of Thai elderly. Without proper care, it can lead to heart disease, stroke, and kidney failure. Combining Thai herbs with modern medicine is a safe and effective approach.\n\nThe most effective herbs for lowering blood pressure include garlic, celery, gotu kola, and safflower. Garlic, in particular, contains Allicin which dilates blood vessels and reduces cholesterol.\n\nHow to care for parents: start by adjusting diet—reduce salt, increase fruits and vegetables, and drink 1-2 cups of warm herbal water daily. Light exercise like a 30-minute walk helps sustainably control pressure.\n\nMost importantly, monitor blood pressure regularly, keep daily records, and consult a doctor before stopping any medication. Herbs are supplements, not replacements for prescribed drugs.\n\nReal experience: a 70-year-old father reduced his pressure from 160/95 to 130/80 within 3 months by drinking garlic-celery juice every morning, reducing salt, and walking 30 minutes daily. The family was thrilled he no longer needed additional medication.',
  content_zh = E'高血压是泰国50%以上老年人面临的隐形杀手。若不照料，可能导致心脏病、中风和肾衰竭。结合泰国草药与现代医学是安全有效的选择。\n\n降压效果最佳的草药包括大蒜、芹菜、积雪草和红花。尤其大蒜含有大蒜素（Allicin），能扩张血管并降低胆固醇。\n\n照顾父母的方法：先调整饮食——减盐、多蔬果，每日饮用1-2杯温热草药水。轻度运动如每天散步30分钟，有助于稳定降压。\n\n最重要的是定期测量血压，每天记录，并在停药前务必咨询医生。草药是辅助，不能替代处方药。\n\n真实案例：一位70岁的父亲每早饮用大蒜芹菜汁、减盐并每天走30分钟，3个月内血压从160/95降至130/80。家人非常欣慰他不再需要增加药物。'
WHERE id = '325197bb-d9e5-478f-841b-7b267af91bf3';

-- For remaining posts use a generic but topic-relevant template
UPDATE public.community_posts SET
  content_th = E'ภาวะเลือดข้นในผู้สูงอายุเกิดจากการที่เลือดมีความหนืดสูง ทำให้ไหลเวียนช้าและเสี่ยงต่อการอุดตันของหลอดเลือด อาการที่พบบ่อยคือ มือเท้าเย็น เหน็บชา ปวดศีรษะ และเหนื่อยง่าย\n\nสมุนไพรที่ช่วยได้ดี ได้แก่ ขิง กระเทียม ขมิ้นชัน เห็ดหูหนูดำ และดอกคำฝอย โดยทั้งหมดมีฤทธิ์ช่วยให้เลือดไหลเวียนคล่อง ลดการเกาะตัวของเกล็ดเลือด\n\nสูตรที่นิยม: ต้มขิง 2 แว่น + กระเทียม 2 กลีบ + ขมิ้นชัน 1 แว่น กับน้ำ 2 แก้ว ดื่มอุ่นๆ ตอนเช้า ทำต่อเนื่อง 1 เดือน อาการจะดีขึ้นเห็นได้ชัด\n\nควบคู่กับการดื่มน้ำเปล่ามากๆ อย่างน้อยวันละ 8 แก้ว และออกกำลังกายเบาๆ จะช่วยป้องกันภาวะเลือดข้นได้ดียิ่งขึ้น\n\nก่อนเริ่มทานสมุนไพร ควรปรึกษาแพทย์โดยเฉพาะผู้ที่ทานยาประจำ เพื่อหลีกเลี่ยงการเสริมฤทธิ์ของยา และควรตรวจค่าความหนืดเลือดเป็นประจำ',
  content_en = E'Thickened blood in the elderly results from high blood viscosity, causing slow circulation and risk of vessel blockage. Common symptoms include cold extremities, numbness, headaches, and fatigue.\n\nEffective herbs include ginger, garlic, turmeric, black wood ear mushroom, and safflower—all proven to improve circulation and reduce platelet clumping.\n\nPopular recipe: boil 2 ginger slices + 2 garlic cloves + 1 slice of turmeric in 2 cups of water; drink warm in the morning. After 1 month of consistent use, symptoms improve noticeably.\n\nCombined with drinking 8 glasses of water daily and light exercise, this helps prevent thickened blood effectively.\n\nBefore starting herbs, consult a doctor—especially for those on regular medication—to avoid drug interactions, and monitor blood viscosity regularly.',
  content_zh = E'老年人血液浓稠源于血液黏度高，导致循环缓慢和血管堵塞风险。常见症状包括手脚冰凉、麻木、头痛和疲劳。\n\n有效的草药包括生姜、大蒜、姜黄、黑木耳和红花，均可改善循环、减少血小板聚集。\n\n常用配方：2片生姜+2瓣大蒜+1片姜黄煮于2杯水中，早晨温饮。坚持1个月可见明显改善。\n\n配合每天饮用8杯水和轻度运动，能更有效预防血液浓稠。\n\n开始服用草药前应咨询医生，尤其是长期服药者，避免药物相互作用，并定期检查血液黏度。'
WHERE id = '034605c8-c7d0-4402-bfe0-981a37506116';

UPDATE public.community_posts SET
  content_th = E'คุณพ่อวัย 65 ปี เคยมีอาการเหน็บชาและเดินไม่ค่อยคล่อง ลูกชายจึงตัดสินใจให้คุณพ่อลองดื่ม V Flow Herbal Drink ซึ่งเป็นเครื่องดื่มสมุนไพรไทยสำหรับบำรุงระบบไหลเวียนเลือดโดยเฉพาะ\n\nหลังดื่มต่อเนื่อง 2 สัปดาห์ คุณพ่อรายงานว่าอาการเหน็บชาลดลงอย่างชัดเจน และรู้สึกเดินได้คล่องตัวกว่าเดิม โดยเฉพาะตอนเช้าหลังตื่นนอน ที่เคยรู้สึกหนัก ก็เบาขึ้น\n\nส่วนผสมหลักของ V Flow ได้แก่ ขิง กระเทียม ขมิ้นชัน ใบบัวบก เห็ดหูหนูดำ และดอกคำฝอย ซึ่งทุกตัวมีงานวิจัยรองรับเรื่องการช่วยไหลเวียนเลือด\n\nวิธีดื่มที่แนะนำคือ ผสมกับน้ำอุ่น 1 แก้ว ดื่มก่อนอาหารเช้าวันละ 1 ครั้ง รสชาติออกเผ็ดร้อนนิดๆ แต่หอมสมุนไพร ผู้สูงอายุที่บ้านยอมรับได้ดี\n\nสิ่งที่ลูกๆ ภูมิใจที่สุดคือ ไม่ใช่แค่อาการดีขึ้น แต่คุณพ่ออารมณ์ดีขึ้น มีพลังกลับมาทำกิจกรรมที่เคยชอบ เป็นความสุขของทั้งครอบครัวที่ได้เห็นพ่อกลับมามีชีวิตชีวา',
  content_en = E'A 65-year-old father used to suffer from numbness and slow walking. His son decided to try V Flow Herbal Drink, a Thai herbal beverage specially formulated for blood circulation.\n\nAfter 2 weeks of consistent use, the father reported a clear reduction in numbness and felt more agile when walking, especially in the morning when he used to feel heavy.\n\nKey ingredients in V Flow include ginger, garlic, turmeric, gotu kola, black wood ear mushroom, and safflower—all backed by research for circulation support.\n\nRecommended way: mix with 1 glass of warm water and drink once daily before breakfast. The taste is slightly spicy with a herbal aroma that elderly accept well.\n\nWhat the children are most proud of is not just the physical improvement, but the father is happier and has regained energy to enjoy his favorite activities. It is the whole family''s joy to see him vibrant again.',
  content_zh = E'65岁的父亲曾有麻木和行走缓慢的问题。儿子决定让他尝试V Flow草药饮品，这是一款专为血液循环配制的泰式草药饮料。\n\n连续饮用2周后，父亲反映麻木明显减轻，行走更灵活，尤其是早晨醒来不再感到沉重。\n\nV Flow的主要成分包括生姜、大蒜、姜黄、积雪草、黑木耳和红花，均有研究支持其改善循环的功效。\n\n推荐喝法：与1杯温水混合，每天早餐前一次。味道略带辛辣并有草药香气，老人容易接受。\n\n孩子们最自豪的不仅是身体的改善，更是父亲心情变好、重拾喜爱活动的活力。看到父亲重焕生机，是全家的幸福。'
WHERE id = '611d4419-230e-4af8-b56f-ab268e53da1d';

UPDATE public.community_posts SET
  content_th = E'ไขมันในเลือดสูงเป็นปัจจัยเสี่ยงที่นำไปสู่โรคหัวใจและหลอดเลือดสมอง การใช้สมุนไพร 3 อย่างนี้ช่วยลดไขมันได้อย่างปลอดภัย โดยไม่ต้องพึ่งยาเป็นหลัก\n\n1. กระเทียม - มี Allicin ลดคอเลสเตอรอลรวมและ LDL (ไขมันเลว) ทานวันละ 1-2 กลีบ จะเห็นผลใน 2-3 เดือน\n\n2. มะรุม - ใบและฝักมะรุมมีสารช่วยลดไขมันในเลือดและน้ำตาลในเลือด ต้มดื่มหรือกินสด ทานสม่ำเสมอ\n\n3. ขมิ้นชัน - Curcumin ช่วยลดการอักเสบของหลอดเลือดและลดไขมันสะสม ใส่ในอาหารทุกวัน หรือทานแคปซูล\n\nควรควบคู่กับการลดอาหารทอด ของหวาน และเพิ่มผัก-ผลไม้ ออกกำลังกาย 3-5 ครั้งต่อสัปดาห์ ผลเลือดจะดีขึ้นเห็นได้ชัดภายใน 3 เดือน\n\nและอย่าลืมตรวจไขมันในเลือดเป็นประจำทุก 6 เดือน เพื่อติดตามผลและปรับการดูแลให้เหมาะสม',
  content_en = E'High blood lipids are a major risk factor for heart and stroke disease. These 3 herbs help reduce cholesterol safely without relying solely on medication.\n\n1. Garlic - contains Allicin that lowers total cholesterol and LDL (bad fat). Eat 1-2 cloves daily; results appear in 2-3 months.\n\n2. Moringa - leaves and pods contain compounds that reduce blood lipids and sugar. Boil and drink, or eat fresh, regularly.\n\n3. Turmeric - Curcumin reduces blood vessel inflammation and lipid accumulation. Add to daily food or take in capsules.\n\nCombine with reducing fried foods, sweets, and increasing fruits and vegetables. Exercise 3-5 times a week. Blood test results improve clearly within 3 months.\n\nDon''t forget to check blood lipids every 6 months to monitor and adjust your care plan.',
  content_zh = E'血脂高是心脏病和中风的主要风险因素。以下3种草药能安全降脂，无需完全依赖药物。\n\n1. 大蒜——含大蒜素，可降低总胆固醇和低密度脂蛋白（坏脂肪）。每天吃1-2瓣，2-3个月见效。\n\n2. 辣木——叶和荚含可降血脂和血糖的成分，煮饮或生吃皆可，需长期坚持。\n\n3. 姜黄——姜黄素能减轻血管炎症并减少脂肪沉积。每日加入饮食或服用胶囊。\n\n配合减少油炸食品和甜食，多吃蔬果，每周运动3-5次。3个月内血液检查结果明显改善。\n\n别忘了每6个月检查一次血脂，跟踪并调整保养计划。'
WHERE id = '9dd2ab95-2674-4b49-b8a1-f7daa57f8208';

UPDATE public.community_posts SET
  content_th = E'หัวใจเป็นอวัยวะสำคัญที่ทำงานหนักตลอดชีวิต การบำรุงด้วยสมุนไพรอย่างถูกวิธีช่วยให้หัวใจแข็งแรงและลดความเสี่ยงต่อโรคหัวใจในผู้สูงอายุ\n\nสูตรสมุนไพรบำรุงหัวใจที่นิยม:\n\n1. น้ำกระเจี๊ยบ - มีสารต้านอนุมูลอิสระสูง ช่วยลดความดันและไขมัน ดื่มสัปดาห์ละ 3-4 ครั้ง\n\n2. ชาดอกคำฝอย - ช่วยขยายหลอดเลือด ลดความหนืดของเลือด ดื่มอุ่นๆ ตอนเช้า\n\n3. ตำรับใบบัวบก + พุทราจีน - บำรุงหัวใจและสมอง เหมาะสำหรับผู้สูงอายุที่อ่อนเพลียง่าย\n\n4. กระเทียมดำ - มีสารต้านอนุมูลอิสระสูงกว่ากระเทียมสด ช่วยลดความเสี่ยงโรคหัวใจ\n\nควรทานควบคู่กับอาหารที่มีโอเมก้า-3 (ปลาแซลมอน, เมล็ดเจีย) ลดเค็ม ลดไขมันทรานส์ และนอนหลับให้เพียงพอ หัวใจจะแข็งแรงไปอีกนาน',
  content_en = E'The heart is a vital organ that works tirelessly throughout life. Proper herbal nourishment keeps the heart strong and reduces the risk of heart disease in the elderly.\n\nPopular heart-nourishing herbal recipes:\n\n1. Roselle juice - rich in antioxidants, helps lower blood pressure and lipids. Drink 3-4 times a week.\n\n2. Safflower tea - dilates blood vessels and reduces blood viscosity. Drink warm in the morning.\n\n3. Gotu kola + Red dates formula - nourishes heart and brain, ideal for elderly who tire easily.\n\n4. Black garlic - higher antioxidants than fresh garlic, reduces heart disease risk.\n\nPair with omega-3 rich foods (salmon, chia seeds), reduce salt, avoid trans fats, and get enough sleep. Your heart will stay strong for years.',
  content_zh = E'心脏是终生不停工作的重要器官。正确的草药调养可使心脏强健，降低老年心脏病风险。\n\n常用的护心草药配方：\n\n1. 洛神花茶——富含抗氧化剂，有助降压降脂，每周饮用3-4次。\n\n2. 红花茶——扩张血管，降低血液黏度，早晨温饮。\n\n3. 积雪草+红枣——补益心脑，适合容易疲倦的老人。\n\n4. 黑蒜——抗氧化剂含量高于鲜蒜，降低心脏病风险。\n\n搭配富含Omega-3的食物（三文鱼、奇亚籽），减盐、避免反式脂肪、充足睡眠。心脏将长久强健。'
WHERE id = '96bece8d-fd2f-4cb4-83dd-50207bec8a8c';

UPDATE public.community_posts SET
  content_th = E'มือเท้าเย็นเป็นปัญหาที่พบบ่อยในผู้สูงอายุ โดยเฉพาะคุณแม่ที่อายุมากแล้ว สาเหตุหลักมาจากระบบไหลเวียนเลือดส่วนปลายทำงานไม่ดี\n\nวิธีดูแลที่ได้ผล:\n\n1. ดื่มน้ำขิงอุ่นๆ ตอนเช้าและก่อนนอน ช่วยกระตุ้นการไหลเวียน\n\n2. แช่เท้าด้วยน้ำอุ่นผสมขิงและเกลือ 15-20 นาที ทุกเย็นก่อนนอน\n\n3. นวดมือ-เท้าเบาๆ ด้วยน้ำมันงาอุ่น เพื่อช่วยเปิดเส้นเลือด\n\n4. หลีกเลี่ยงการอยู่ในห้องแอร์เย็นนาน ใส่ถุงเท้าให้อบอุ่นเสมอ\n\n5. ออกกำลังกายเบาๆ เช่น เดิน หรือยืดเส้นยืดสาย ช่วยให้เลือดไหลเวียนทั่วร่างกาย\n\nอาหารที่ช่วย: น้ำซุปไก่ตุ๋นยาจีน (พุทราจีน, โสม, เห็ดหูหนู), แกงขิง, น้ำกระเทียม - ทั้งหมดช่วยเพิ่มความอบอุ่นจากภายใน\n\nหลังดูแลคุณแม่ด้วยวิธีเหล่านี้ต่อเนื่อง 2-3 เดือน อาการมือเท้าเย็นลดลงอย่างเห็นได้ชัด คุณแม่นอนหลับสบายและอารมณ์ดีขึ้นด้วย',
  content_en = E'Cold hands and feet are common among the elderly, especially aged mothers. The main cause is poor peripheral blood circulation.\n\nEffective care methods:\n\n1. Drink warm ginger water in the morning and before bed to stimulate circulation.\n\n2. Soak feet in warm water with ginger and salt for 15-20 minutes every evening.\n\n3. Gently massage hands and feet with warm sesame oil to open up blood vessels.\n\n4. Avoid prolonged exposure to cold air conditioning; always wear warm socks.\n\n5. Light exercise like walking or stretching improves circulation throughout the body.\n\nHelpful foods: chicken soup with Chinese herbs (red dates, ginseng, mushrooms), ginger curry, garlic water—all add warmth from within.\n\nAfter caring for your mother with these methods for 2-3 months, cold hands and feet noticeably decrease. She will sleep better and have improved mood as well.',
  content_zh = E'手脚冰凉是老年人常见的问题，尤其年长的母亲。主要原因是末梢血液循环不良。\n\n有效护理方法：\n\n1. 早晚饮用温热姜水，刺激循环。\n\n2. 每晚用加生姜和盐的温水泡脚15-20分钟。\n\n3. 用温麻油轻轻按摩手脚，帮助打开血管。\n\n4. 避免久待冷气房，始终穿暖和袜子。\n\n5. 轻度运动如散步或伸展，促进全身血液循环。\n\n有益食物：中药炖鸡汤（红枣、人参、香菇）、姜咖喱、大蒜水——皆能从内增温。\n\n用这些方法照顾母亲2-3个月后，手脚冰凉明显减少，睡眠和心情都更好。'
WHERE id = '94c71d89-874c-409a-8d29-57253591923f';

UPDATE public.community_posts SET
  content_th = E'ดอกคำฝอยเป็นสมุนไพรไทยที่ใช้กันมานาน มีงานวิจัยรองรับว่าช่วยลดความดันโลหิตได้จริง โดยกลไกการขยายหลอดเลือดและลดไขมันในเลือด\n\nสารสำคัญคือ Carthamin และ Safflor yellow ที่ช่วยให้เลือดไหลเวียนคล่อง ลดการเกาะตัวของเกล็ดเลือด และลดความดันได้อย่างนุ่มนวล ปลอดภัยกว่ายาเคมีในระยะยาว\n\nวิธีชง: ใส่ดอกคำฝอย 1 ช้อนชาในน้ำร้อน 1 แก้ว แช่ 5-10 นาที ดื่มอุ่นๆ วันละ 1-2 ครั้ง รสชาติออกหวานหอมเล็กน้อย\n\nผลที่คาดหวัง: หลังดื่มต่อเนื่อง 4-6 สัปดาห์ ความดันค่อยๆ ลดลง 5-10 mmHg พร้อมรู้สึกผ่อนคลาย ลดอาการมึนงงได้ดี\n\nข้อควรระวัง: หญิงตั้งครรภ์ห้ามทานเด็ดขาด ผู้ทานยาละลายลิ่มเลือดควรปรึกษาแพทย์ก่อน เพราะอาจเสริมฤทธิ์ยา\n\nผู้ใช้จริงหลายท่านยืนยันว่าได้ผลจริง โดยเฉพาะเมื่อดื่มควบคู่กับการปรับอาหารและออกกำลังกาย ความดันลดได้อย่างน่าพอใจ',
  content_en = E'Safflower is a long-used Thai herb with research-backed evidence of effectively lowering blood pressure by dilating blood vessels and reducing blood lipids.\n\nKey compounds Carthamin and Safflor yellow improve blood circulation, reduce platelet aggregation, and gently lower blood pressure—safer than chemical drugs in the long term.\n\nPreparation: steep 1 teaspoon of dried safflower in 1 cup of hot water for 5-10 minutes. Drink warm 1-2 times daily. The flavor is slightly sweet and aromatic.\n\nExpected results: after 4-6 weeks of consistent use, blood pressure gradually drops by 5-10 mmHg, with feelings of relaxation and reduced dizziness.\n\nCaution: pregnant women should never consume it. Those on blood thinners should consult a doctor first to avoid drug interactions.\n\nMany real users confirm its effectiveness, especially when combined with dietary changes and exercise—blood pressure drops satisfactorily.',
  content_zh = E'红花是泰国长期使用的草药，有研究证实可通过扩张血管和降脂有效降低血压。\n\n主要活性成分红花苷（Carthamin）和红花黄色素（Safflor yellow）能改善血液循环，减少血小板聚集，温和降压，长期使用比化学药物更安全。\n\n冲泡方法：1茶匙干红花放入1杯热水浸泡5-10分钟，每天温饮1-2次。味道略带甜香。\n\n预期效果：连续饮用4-6周后，血压逐渐下降5-10 mmHg，感觉放松，头晕减少。\n\n注意：孕妇严禁服用。服用抗凝药者应先咨询医生，避免药物相互作用。\n\n许多用户证实其有效性，尤其结合饮食调整和运动后，降压效果令人满意。'
WHERE id = 'b9c68b29-e51c-4ad0-a148-4a59daccc9d5';

UPDATE public.community_posts SET
  content_th = E'ผู้สูงอายุที่นั่งนาน เช่น เล่นไพ่ ดูทีวี หรืออ่านหนังสือ มักประสบปัญหาขาชา เนื่องจากเลือดไหลเวียนไปขาน้อยลง\n\nวิธีแก้ด้วยสมุนไพร:\n\n1. ขิงต้มน้ำดื่ม - ช่วยเร่งการไหลเวียนเลือด ดื่มก่อนกิจกรรมที่ต้องนั่งนาน\n\n2. นวดน้ำมันไพล - น้ำมันไพลนวดที่น่อง ช่วยลดอาการชาและคลายกล้ามเนื้อ\n\n3. แช่เท้าน้ำอุ่นผสมเกลือและขิง 15 นาที ทุกเย็น\n\n4. ทานเห็ดหูหนูดำ ผัดผัก สัปดาห์ละ 2-3 ครั้ง\n\nนอกจากสมุนไพร ควรปรับพฤติกรรม:\n- ลุกเดินทุก 30 นาที ขยับขา\n- ยืดกล้ามเนื้อขาเบาๆ\n- ใส่ถุงน่องช่วยกระตุ้นเลือดไหลเวียน\n- ดื่มน้ำให้เพียงพอ ลดเค็ม\n\nหากอาการรุนแรงหรือเกิดบ่อย ควรปรึกษาแพทย์เพื่อตรวจหลอดเลือดและเส้นประสาท เพราะอาจเป็นสัญญาณของโรคที่ต้องดูแลเฉพาะ',
  content_en = E'Elderly who sit for long periods—playing cards, watching TV, reading—often experience leg numbness due to reduced blood flow.\n\nHerbal remedies:\n\n1. Boiled ginger water - boosts circulation; drink before long sitting activities.\n\n2. Plai oil massage - massage onto calves to reduce numbness and relax muscles.\n\n3. Soak feet in warm water with salt and ginger for 15 minutes every evening.\n\n4. Eat black wood ear stir-fry 2-3 times a week.\n\nAlso adjust habits:\n- Stand and walk every 30 minutes\n- Gentle leg stretches\n- Wear compression socks for circulation\n- Drink enough water and reduce salt\n\nIf symptoms are severe or frequent, consult a doctor for vascular and nerve evaluation, as it may signal a condition needing specific care.',
  content_zh = E'久坐的老人，如打牌、看电视或看书时，常因腿部血流减少而感到腿麻。\n\n草药对策：\n\n1. 姜水——促进循环，长时间坐之前饮用。\n\n2. 蒲艾油按摩——按摩小腿，减轻麻木、放松肌肉。\n\n3. 每晚用温水加盐和姜泡脚15分钟。\n\n4. 每周吃2-3次黑木耳炒菜。\n\n同时调整习惯：\n- 每30分钟站起来走动\n- 轻度伸展腿部\n- 穿压力袜促进循环\n- 多喝水，少吃盐\n\n若症状严重或频繁，请咨询医生检查血管和神经，可能预示需要特殊护理的疾病。'
WHERE id = 'd7c5546e-36e7-4260-95b5-58fa9755073b';

UPDATE public.community_posts SET
  content_th = E'ผู้สูงอายุที่ระบบขับถ่ายไม่ดี มักท้องผูกบ่อย ทำให้รู้สึกอึดอัดและเสี่ยงต่อปัญหาสุขภาพอื่นๆ น้ำสมุนไพรเป็นทางเลือกที่ช่วยได้ดี\n\nสูตรน้ำสมุนไพรที่แนะนำ:\n\n1. น้ำมะขามเปียก - มีกรดธรรมชาติช่วยกระตุ้นการขับถ่าย ดื่มอุ่นๆ ตอนเช้า\n\n2. น้ำว่านหางจระเข้ - ช่วยหล่อลื่นลำไส้ ลดการอักเสบ\n\n3. น้ำขิงผสมน้ำผึ้ง - กระตุ้นการย่อยและขับถ่ายตามธรรมชาติ\n\n4. ชาใบเซนน่า (ปริมาณน้อย) - ช่วยกระตุ้นลำไส้ แต่ไม่ควรใช้ติดต่อกันนาน\n\nวิธีใช้: เลือก 1-2 สูตร ดื่มสลับกัน ดื่มน้ำเปล่ามากๆ ทานผักผลไม้ที่มีไฟเบอร์สูง เช่น มะละกอ กล้วย\n\nออกกำลังกายเบาๆ ทุกวัน เช่น เดินช้าๆ 30 นาที จะช่วยให้ลำไส้ทำงานดีขึ้นอย่างเห็นได้ชัด\n\nหากท้องผูกเรื้อรังเกิน 1 สัปดาห์ ควรปรึกษาแพทย์ เพื่อตรวจหาสาเหตุและรับการรักษาที่เหมาะสม',
  content_en = E'Elderly with poor digestion often suffer constipation, causing discomfort and risking other health issues. Herbal drinks are a great help.\n\nRecommended herbal recipes:\n\n1. Tamarind water - natural acids stimulate bowel movement; drink warm in the morning.\n\n2. Aloe vera juice - lubricates intestines and reduces inflammation.\n\n3. Ginger with honey water - stimulates digestion and natural elimination.\n\n4. Senna leaf tea (small amounts) - stimulates intestines but should not be used long-term.\n\nUsage: choose 1-2 recipes and rotate. Drink plenty of water, eat high-fiber fruits like papaya and banana.\n\nLight daily exercise like a 30-minute walk significantly improves bowel function.\n\nIf chronic constipation lasts over 1 week, consult a doctor to find the cause and proper treatment.',
  content_zh = E'消化系统不佳的老人常便秘，造成不适并增加其他健康风险。草药饮品是很好的辅助。\n\n推荐草药配方：\n\n1. 罗望子水——天然酸性刺激排便，早晨温饮。\n\n2. 芦荟汁——润滑肠道，减少炎症。\n\n3. 姜蜜水——刺激消化和自然排泄。\n\n4. 番泻叶茶（少量）——刺激肠道，但不可长期使用。\n\n用法：选1-2个配方轮换饮用，多喝水，多吃高纤维水果如木瓜、香蕉。\n\n每日轻度运动，如散步30分钟，明显改善肠道功能。\n\n若慢性便秘超过1周，应咨询医生，查找原因并接受适当治疗。'
WHERE id = 'ac071c48-578f-49ee-8412-2199f535f01f';

UPDATE public.community_posts SET
  content_th = E'สายตาเสื่อมเป็นเรื่องปกติของผู้สูงอายุ แต่สามารถชะลอและบำรุงให้ดีขึ้นได้ด้วยสมุนไพรที่อุดมด้วยสารต้านอนุมูลอิสระ\n\nสมุนไพรเด็ดสำหรับบำรุงสายตา:\n\n1. ใบบัวบก - มีวิตามิน A สูง ช่วยบำรุงจอประสาทตา ทำเป็นน้ำดื่มหรือกินสด\n\n2. ดอกคำฝอย - ช่วยให้เลือดไหลเวียนไปเลี้ยงดวงตาดีขึ้น\n\n3. มะเกี๋ยง / Goji Berry - มีลูทีน ช่วยปกป้องจอประสาทตาจากแสง UV\n\n4. แครอท - มีเบต้าแคโรทีนสูง ทานสด ปั่น หรือต้มซุป\n\n5. ใบหม่อน - ทำชาดื่ม ช่วยลดความล้าของตา\n\nควบคู่กับการพักสายตาทุก 1 ชั่วโมง ดื่มน้ำให้เพียงพอ และตรวจสายตาเป็นประจำทุก 6 เดือน\n\nหลีกเลี่ยงการใช้สายตามากเกินไปในที่แสงน้อย และสวมแว่นกันแดดเมื่อออกกลางแจ้งจะช่วยรักษาสายตาให้ดียาวนาน',
  content_en = E'Vision deterioration is common in the elderly but can be slowed and nourished with antioxidant-rich herbs.\n\nTop herbs for eye health:\n\n1. Gotu kola - high in vitamin A, nourishes the retina; drink as tea or eat fresh.\n\n2. Safflower - improves blood flow to the eyes.\n\n3. Goji berry - contains lutein, protects retina from UV light.\n\n4. Carrot - rich in beta-carotene; eat fresh, juiced, or in soup.\n\n5. Mulberry leaf - brewed as tea, reduces eye fatigue.\n\nAlso rest eyes every hour, stay hydrated, and have eye exams every 6 months.\n\nAvoid prolonged eye strain in low light and wear sunglasses outdoors to protect vision long-term.',
  content_zh = E'视力衰退在老年人中常见，但可通过富含抗氧化剂的草药延缓和滋养。\n\n护眼优选草药：\n\n1. 积雪草——富含维生素A，滋养视网膜，可泡茶或生吃。\n\n2. 红花——改善眼部血流。\n\n3. 枸杞——含叶黄素，保护视网膜免受紫外线伤害。\n\n4. 胡萝卜——富含β-胡萝卜素，可生吃、榨汁或煮汤。\n\n5. 桑叶——泡茶饮用，减轻眼睛疲劳。\n\n同时每小时休息眼睛，多喝水，每6个月检查视力。\n\n避免在弱光下长时间用眼，户外戴墨镜，长期保护视力。'
WHERE id = 'b4c2447d-2109-471a-a189-580629a176bb';

UPDATE public.community_posts SET
  content_th = E'ภาวะเลือดข้นในผู้สูงอายุเป็นภัยเงียบที่อาจนำไปสู่โรคหัวใจ หลอดเลือดสมอง และความดันโลหิตสูง ลูกหลานควรสังเกตอาการเหล่านี้\n\nสัญญาณเตือนของภาวะเลือดข้น:\n\n1. มือเท้าเย็นตลอดเวลา แม้อยู่ในห้องที่อุ่น\n\n2. เหน็บชาบ่อย โดยเฉพาะเวลาตื่นนอน\n\n3. ปวดศีรษะหรือมึนงงโดยไม่มีสาเหตุ\n\n4. เหนื่อยง่าย แม้ทำกิจกรรมเบาๆ\n\n5. ผิวหนังคล้ำลง โดยเฉพาะที่ปลายมือปลายเท้า\n\n6. ตามองเห็นไม่ชัดเจนเป็นพักๆ\n\n7. ความดันโลหิตสูงโดยไม่ทราบสาเหตุ\n\nหากพบ 3 ข้อขึ้นไป ควรพาผู้สูงอายุไปตรวจค่าความหนืดของเลือด (Blood Viscosity) ที่โรงพยาบาล\n\nการป้องกัน: ดื่มน้ำให้เพียงพอ ทานอาหารที่มีโอเมก้า-3 ใช้สมุนไพรช่วย เช่น ขิง กระเทียม ขมิ้นชัน และออกกำลังกายเบาๆ ทุกวัน\n\nการเอาใจใส่ตั้งแต่เนิ่นๆ ช่วยป้องกันโรคร้ายแรงในอนาคต และให้ผู้สูงอายุมีคุณภาพชีวิตที่ดีไปอีกนาน',
  content_en = E'Thickened blood is a silent threat to the elderly that can lead to heart disease, stroke, and high blood pressure. Family should watch for these warning signs.\n\nWarning signs of thickened blood:\n\n1. Constantly cold hands and feet, even in warm rooms\n\n2. Frequent numbness, especially upon waking\n\n3. Headaches or dizziness without cause\n\n4. Easily tired even with light activity\n\n5. Darkened skin, especially at extremities\n\n6. Intermittent blurry vision\n\n7. Unexplained high blood pressure\n\nIf 3 or more signs appear, take the elder for a blood viscosity test at a hospital.\n\nPrevention: drink enough water, eat omega-3 foods, use herbs like ginger, garlic, turmeric, and exercise daily.\n\nEarly attention prevents serious diseases and ensures a good quality of life for the elderly.',
  content_zh = E'血液浓稠是老年人的隐形威胁，可能引发心脏病、中风和高血压。家人应留意以下警示。\n\n血液浓稠的警示信号：\n\n1. 手脚长期冰凉，即使在温暖的房间\n\n2. 经常麻木，特别是醒来时\n\n3. 无故头痛或头晕\n\n4. 轻微活动也容易疲倦\n\n5. 皮肤变暗，特别是手脚末端\n\n6. 视力间歇性模糊\n\n7. 不明原因的高血压\n\n若出现3项以上，请带老人到医院检查血液黏度（Blood Viscosity）。\n\n预防：多喝水，吃富含Omega-3的食物，用生姜、大蒜、姜黄等草药，每天轻度运动。\n\n及早重视可预防严重疾病，让老人长久保持良好生活质量。'
WHERE id = '0b154624-f64f-420e-9f20-ab895ebcb6d5';

UPDATE public.community_posts SET
  content_th = E'การดูแลพ่อหลังผ่าตัดเป็นช่วงเวลาที่สำคัญและท้าทาย ลูกๆ ต้องเอาใจใส่ทั้งด้านอาหาร ยา และจิตใจ เพื่อให้พ่อฟื้นตัวเร็วและสมบูรณ์\n\nหลักการดูแลด้วยอาหารสมุนไพร:\n\n1. อาหารอ่อน ย่อยง่าย - ข้าวต้ม โจ๊กผสมขิง น้ำซุปไก่ตุ๋นยาจีน\n\n2. เพิ่มสมุนไพรช่วยฟื้นฟู - พุทราจีน, เห็ดหูหนูดำ, โสม (ปริมาณเล็กน้อย)\n\n3. ลดอาหารรสจัด เผ็ด มันมาก เพื่อลดภาระระบบย่อย\n\n4. แบ่งมื้ออาหารเป็น 5-6 มื้อเล็กๆ ดีกว่ามื้อใหญ่ 3 มื้อ\n\n5. ดื่มน้ำให้เพียงพอ ระวังขาดน้ำ\n\nสูตรซุปสมุนไพรฟื้นไข้: ตุ๋นไก่กับพุทราจีน 5 ลูก เห็ดหูหนูดำแห้ง ขิง 3 แว่น เคี่ยว 1 ชั่วโมง ให้พ่อทานวันละ 1 ถ้วย\n\nสิ่งที่สำคัญไม่แพ้กันคือ การให้กำลังใจ พูดคุยให้พ่อรู้สึกว่ามีลูกอยู่ข้างๆ ทำกิจกรรมเบาๆ ด้วยกัน เช่น อ่านหนังสือพิมพ์ คุยเล่นเรื่องในอดีต\n\nหลังดูแลครบ 2-3 เดือน พ่อกลับมาแข็งแรงเป็นปกติ ความผูกพันของครอบครัวก็แน่นแฟ้นยิ่งขึ้น',
  content_en = E'Caring for father after surgery is a critical and challenging time. Children must attend to food, medicine, and mental support for fast and full recovery.\n\nHerbal food care principles:\n\n1. Soft, easy-to-digest food - rice porridge, ginger congee, chicken soup with Chinese herbs.\n\n2. Add recovery-supporting herbs - red dates, black wood ear, ginseng (small amounts).\n\n3. Avoid spicy, oily food to reduce digestive load.\n\n4. Eat 5-6 small meals rather than 3 large ones.\n\n5. Drink enough water, watch for dehydration.\n\nRecovery soup recipe: stew chicken with 5 red dates, dried black wood ear, 3 ginger slices for 1 hour. Serve 1 bowl daily.\n\nEqually important is emotional support—talk with father, do light activities together like reading newspapers or sharing memories.\n\nAfter 2-3 months of care, father returns to full health, and family bonds grow stronger.',
  content_zh = E'手术后照顾父亲是关键且具挑战性的时期。子女需关注饮食、药物和心理支持，使其快速完全康复。\n\n草药饮食护理原则：\n\n1. 易消化的软食——粥、姜粥、中药鸡汤\n\n2. 添加助康复草药——红枣、黑木耳、人参（少量）\n\n3. 避免辛辣油腻，减轻消化负担\n\n4. 5-6小餐胜于3大餐\n\n5. 充足饮水，谨防脱水\n\n康复汤配方：鸡肉炖5颗红枣、黑木耳、3片生姜1小时，每天一碗。\n\n同样重要的是情感支持——多与父亲交谈，一起做轻度活动如读报、聊往事。\n\n经过2-3个月护理，父亲恢复健康，家庭关系也更加紧密。'
WHERE id = 'f3659b85-a6f1-44e0-9a7b-f1dccc514cb3';

UPDATE public.community_posts SET
  content_th = E'ความเครียดในผู้สูงอายุเป็นปัญหาที่หลายคนมองข้าม แต่ส่งผลต่อสุขภาพกายและใจอย่างมาก สมุนไพรไทยช่วยผ่อนคลายได้อย่างปลอดภัย\n\nสาเหตุของความเครียดในผู้สูงอายุ:\n- ความเหงา การพึ่งพาตัวเองได้น้อยลง\n- การเจ็บป่วยเรื้อรัง\n- ความกังวลเรื่องอนาคต\n- การสูญเสียคนใกล้ชิด\n\nสมุนไพรช่วยผ่อนคลาย:\n\n1. ใบบัวบก - ช่วยลดความวิตกกังวล นำมาคั้นน้ำดื่มหรือทำชา\n\n2. ดอกอัญชัน - ชงชาดื่ม ช่วยให้ผ่อนคลายและบำรุงสมอง\n\n3. ดอกคาโมมายล์ - ชาช่วยให้สงบ นอนหลับสบาย\n\n4. ขิงอุ่น - ดื่มก่อนนอน ช่วยคลายเครียดและกล้ามเนื้อ\n\nนอกจากสมุนไพร ลูกหลานควร:\n- พูดคุยกับท่านบ่อยๆ\n- พาออกไปนอกบ้านบ้าง\n- ทำกิจกรรมที่ท่านชอบ\n- ฟังความรู้สึกอย่างใส่ใจ\n\nความรักและการเอาใจใส่จากครอบครัว เป็นยาที่ดีที่สุดสำหรับผู้สูงอายุ',
  content_en = E'Stress in the elderly is often overlooked but greatly affects physical and mental health. Thai herbs help relax safely.\n\nCauses of elderly stress:\n- Loneliness, less independence\n- Chronic illness\n- Worry about the future\n- Loss of loved ones\n\nRelaxing herbs:\n\n1. Gotu kola - reduces anxiety; drink as juice or tea.\n\n2. Butterfly pea flower - brewed as tea, calms and nourishes the brain.\n\n3. Chamomile - tea for calmness and good sleep.\n\n4. Warm ginger - drink before bed to relieve stress and muscle tension.\n\nBeyond herbs, families should:\n- Talk with them often\n- Take them out occasionally\n- Do their favorite activities\n- Listen attentively to their feelings\n\nLove and family attention is the best medicine for the elderly.',
  content_zh = E'老年人的压力常被忽视，却严重影响身心健康。泰国草药能安全地帮助放松。\n\n老年人压力的原因：\n- 孤独、独立性下降\n- 慢性疾病\n- 对未来的担忧\n- 失去亲人\n\n放松草药：\n\n1. 积雪草——减轻焦虑，可榨汁或泡茶\n\n2. 蝶豆花——泡茶饮用，安神益脑\n\n3. 洋甘菊——茶饮宁神助眠\n\n4. 温姜茶——睡前饮用缓解压力和肌肉紧张\n\n除了草药，家人应：\n- 经常陪伴交谈\n- 偶尔带他们外出\n- 做他们喜爱的活动\n- 认真倾听他们的感受\n\n爱与家庭关怀是老年人最好的良药。'
WHERE id = 'f0b09d39-2e24-491d-ace0-a5a5ee0f8a77';

UPDATE public.community_posts SET
  content_th = E'หลายคนสงสัยว่าดื่มขิงก่อนนอนดีไหม คำตอบคือ ดี! แต่ต้องดื่มอย่างถูกวิธีและในปริมาณที่เหมาะสม โดยเฉพาะสำหรับผู้สูงอายุ\n\nประโยชน์ของขิงก่อนนอน:\n\n1. ช่วยกระตุ้นการไหลเวียนเลือด ทำให้ร่างกายอุ่นขึ้น เหมาะกับผู้สูงอายุที่มือเท้าเย็น\n\n2. ลดอาการอาหารไม่ย่อย ทำให้นอนหลับสบายขึ้น\n\n3. ช่วยคลายเครียด กล้ามเนื้อผ่อนคลาย\n\n4. ลดอาการคลื่นไส้ เวียนหัว\n\nวิธีเตรียม: ขิงสด 2 แว่นบาง ต้มกับน้ำ 1 แก้ว เคี่ยว 5-7 นาที ผสมน้ำผึ้งเล็กน้อย ดื่มอุ่นๆ ก่อนนอน 30-60 นาที\n\nข้อควรระวัง: ผู้ที่มีกรดไหลย้อนควรหลีกเลี่ยง เพราะขิงอาจกระตุ้นกรด ผู้ทานยาละลายลิ่มเลือดควรปรึกษาแพทย์ก่อน\n\nผู้สูงอายุหลายท่านที่ลองดื่มต่อเนื่อง 2 สัปดาห์ บอกว่านอนหลับลึกขึ้น ตื่นมาสดชื่น ไม่ขี้หนาวเหมือนเมื่อก่อน\n\nสรุป: ขิงเป็นเพื่อนสนิทของผู้สูงอายุก่อนนอน แต่ต้องใช้อย่างถูกต้อง ปลอดภัย และเหมาะสมกับสภาพร่างกายแต่ละคน',
  content_en = E'Many wonder if drinking ginger before bed is good. The answer is yes—when prepared correctly and in proper amounts, especially for the elderly.\n\nBenefits of ginger before bed:\n\n1. Stimulates blood circulation, warms the body, ideal for elderly with cold extremities.\n\n2. Reduces indigestion, improves sleep quality.\n\n3. Relieves stress, relaxes muscles.\n\n4. Reduces nausea and dizziness.\n\nPreparation: 2 thin slices of fresh ginger boiled in 1 cup of water for 5-7 minutes; add a little honey, drink warm 30-60 minutes before bed.\n\nCaution: those with acid reflux should avoid as ginger may trigger acid. Those on blood thinners should consult a doctor first.\n\nMany elderly who tried this for 2 weeks reported deeper sleep, refreshed mornings, and less cold sensitivity.\n\nConclusion: ginger is the elderly''s best friend before bed—when used correctly, safely, and suited to each person''s body.',
  content_zh = E'许多人疑问睡前喝姜水是否好。答案是好的！但需正确制备和适量饮用，尤其对老年人。\n\n睡前喝姜的好处：\n\n1. 刺激血液循环，温暖身体，适合手脚冰凉的老人。\n\n2. 缓解消化不良，改善睡眠。\n\n3. 缓解压力，放松肌肉。\n\n4. 减轻恶心和头晕。\n\n制备方法：2片新鲜姜煮于1杯水中5-7分钟，加少许蜂蜜，睡前30-60分钟温饮。\n\n注意：胃酸反流者应避免，姜可能刺激胃酸。服用抗凝药者应先咨询医生。\n\n许多老人坚持饮用2周后反映睡得更深，醒来精神焕发，不再怕冷。\n\n结论：姜是老人睡前的好伙伴，但需正确、安全地使用，并适合个人体质。'
WHERE id = '56e513f1-6d9a-4e5f-8246-60c78e761075';

UPDATE public.community_posts SET
  content_th = E'การเวียนหัวตอนลุกขึ้นเป็นอาการที่พบบ่อยในผู้สูงอายุ ในทางการแพทย์เรียกว่า Orthostatic Hypotension หรือความดันตกเมื่อเปลี่ยนท่า\n\nสาเหตุหลัก:\n- ความดันโลหิตปรับตัวช้า\n- ภาวะขาดน้ำ\n- ผลข้างเคียงของยาบางชนิด\n- ระบบไหลเวียนเลือดทำงานช้าลง\n\nวิธีดูแล:\n\n1. ลุกช้าๆ - นั่งบนเตียง 1-2 นาทีก่อนยืนขึ้น\n\n2. ดื่มน้ำเปล่าให้เพียงพอ อย่างน้อย 8 แก้วต่อวัน\n\n3. ออกกำลังกายเบาๆ ช่วยเพิ่มความแข็งแรงของหลอดเลือด\n\n4. ใช้สมุนไพรช่วย เช่น ขิง ดอกคำฝอย ใบบัวบก\n\n5. หลีกเลี่ยงการอยู่ในที่อากาศร้อนเป็นเวลานาน\n\nสูตรสมุนไพรช่วยได้: ใบบัวบกคั้นน้ำดื่มตอนเช้า + น้ำขิงอุ่นช่วงบ่าย ดื่มต่อเนื่อง 1 เดือน อาการจะดีขึ้น\n\nหากเวียนหัวมาก ล้มบ่อย หรือเป็นลม ควรปรึกษาแพทย์ทันที เพราะอาจเป็นสัญญาณของโรคหัวใจหรือหลอดเลือดสมอง\n\nลูกหลานควรช่วยจัดสภาพแวดล้อมให้ปลอดภัย เช่น มีราวจับ พื้นไม่ลื่น แสงสว่างพอ',
  content_en = E'Dizziness when standing up is a common symptom in the elderly, medically known as Orthostatic Hypotension—blood pressure drop on posture change.\n\nMain causes:\n- Slow blood pressure adjustment\n- Dehydration\n- Side effects of certain medications\n- Slower circulation\n\nCare methods:\n\n1. Stand up slowly - sit on bed for 1-2 minutes before standing.\n\n2. Drink enough water, at least 8 glasses daily.\n\n3. Light exercise strengthens blood vessels.\n\n4. Use herbs like ginger, safflower, gotu kola.\n\n5. Avoid prolonged exposure to heat.\n\nHelpful herbal recipe: gotu kola juice in the morning + warm ginger water in the afternoon, for 1 month, brings clear improvement.\n\nIf dizziness is severe, frequent falls, or fainting occur, see a doctor immediately—may signal heart or stroke issues.\n\nFamily should ensure a safe environment: handrails, non-slip floors, good lighting.',
  content_zh = E'起身时头晕是老年人的常见症状，医学上称为体位性低血压（Orthostatic Hypotension）——姿势改变时血压下降。\n\n主要原因：\n- 血压调节缓慢\n- 脱水\n- 某些药物副作用\n- 循环系统变慢\n\n护理方法：\n\n1. 慢慢站起——在床上坐1-2分钟后再站立。\n\n2. 充足饮水，每天至少8杯。\n\n3. 轻度运动强化血管。\n\n4. 使用草药如生姜、红花、积雪草。\n\n5. 避免长时间处于炎热环境。\n\n有效草药配方：早晨饮用积雪草汁+下午温姜水，坚持1个月有明显改善。\n\n若头晕严重、频繁跌倒或昏厥，应立即就医，可能是心脏或中风的征兆。\n\n家人应营造安全环境：扶手、防滑地板、充足照明。'
WHERE id = 'edf8bc9e-86a5-4915-84ce-c9f4ab851d86';

UPDATE public.community_posts SET
  content_th = E'คุณแม่อายุ 75 ปี เคยเดินไม่คล่อง ขาอ่อนแรง เดินช้าๆ และเหนื่อยง่าย ลูกสาวจึงค้นหาวิธีช่วยด้วยสมุนไพรไทย\n\nสมุนไพรที่ช่วยได้จริง:\n\n1. กระชายดำ - เพิ่มพลังงาน บำรุงร่างกาย ทำเป็นน้ำดื่มหรือแคปซูล\n\n2. ขิง - กระตุ้นการไหลเวียน ลดอาการเหน็บชา\n\n3. ขมิ้นชัน - ลดอาการอักเสบของข้อต่อ\n\n4. ใบบัวบก - บำรุงสมองและกล้ามเนื้อ\n\n5. โสม - เพิ่มความแข็งแรงและความทนทาน\n\nควบคู่กับ:\n- การออกกำลังกายเบาๆ ทุกวัน เช่น เดินช้าๆ 20 นาที\n- ทานอาหารโปรตีนเพียงพอ ปลา ไข่ เต้าหู้\n- รับวิตามิน D จากแสงแดดเช้า\n- นวดน้ำมันงาที่ขา ก่อนนอน\n\nผลที่ได้: หลังดูแล 3 เดือน คุณแม่เดินคล่องขึ้น เหนื่อยน้อยลง และมีความสุขกับการทำกิจกรรมที่เคยชอบ เช่น ทำสวน เลี้ยงหลาน\n\nลูกสาวบอกว่า เห็นคุณแม่กลับมามีพลังเหมือนเดิม เป็นความสุขที่หาซื้อด้วยเงินไม่ได้',
  content_en = E'A 75-year-old mother used to walk slowly, with weak legs and easily got tired. Her daughter searched for ways to help with Thai herbs.\n\nEffective herbs:\n\n1. Black galangal - increases energy, nourishes the body; drink as juice or take in capsules.\n\n2. Ginger - stimulates circulation, reduces numbness.\n\n3. Turmeric - reduces joint inflammation.\n\n4. Gotu kola - nourishes brain and muscles.\n\n5. Ginseng - boosts strength and endurance.\n\nCombined with:\n- Light daily exercise like 20-minute slow walks\n- Adequate protein: fish, eggs, tofu\n- Vitamin D from morning sunlight\n- Sesame oil leg massage before bed\n\nResult: after 3 months, mother walked more easily, less tired, and happy doing favorite activities like gardening and caring for grandchildren.\n\nThe daughter said seeing her mother regain energy is happiness money can''t buy.',
  content_zh = E'75岁的母亲曾走路缓慢、双腿无力、易疲倦。女儿寻找泰国草药帮助。\n\n有效草药：\n\n1. 黑姜——增加能量、滋养身体，可榨汁或服用胶囊。\n\n2. 生姜——刺激循环，减少麻木。\n\n3. 姜黄——减轻关节炎症。\n\n4. 积雪草——滋养大脑和肌肉。\n\n5. 人参——增强力量和耐力。\n\n配合：\n- 每天轻度运动，如慢走20分钟\n- 足够蛋白质：鱼、蛋、豆腐\n- 早晨阳光补充维生素D\n- 睡前用麻油按摩腿部\n\n结果：3个月后母亲行走轻松、不易疲倦，重拾喜爱的活动如园艺、照顾孙辈。\n\n女儿说，看到母亲重焕活力，是金钱买不到的幸福。'
WHERE id = 'd550e032-04f8-4f9c-9bec-fdfc807e262a';

UPDATE public.community_posts SET
  content_th = E'การดูแลผู้สูงอายุไม่ใช่แค่ให้ยาและอาหาร แต่คือการให้ความรักความใส่ใจในทุกๆ มิติ บทความนี้รวมเทคนิคจากลูกหลานผู้เปี่ยมรัก\n\nเทคนิคดูแลผู้สูงอายุที่ได้ผล:\n\n1. ฟังให้มาก พูดให้น้อย - ผู้สูงอายุต้องการคนรับฟังความรู้สึก ไม่ใช่คนสอน\n\n2. ใช้สมุนไพรเสริมสุขภาพ - น้ำขิงอุ่น พุทราจีน ใบบัวบก ช่วยทั้งกายและใจ\n\n3. พาออกไปข้างนอกบ่อยๆ - ตลาดเช้า สวนสาธารณะ ทำให้รู้สึกมีชีวิตชีวา\n\n4. ทำกิจกรรมร่วมกัน - ปลูกต้นไม้ ทำอาหาร เล่นกับหลาน\n\n5. ใส่ใจสุขภาพจิต - สังเกตอารมณ์ ฟังเสียงของท่าน\n\n6. ตรวจสุขภาพประจำปี - ไม่ละเลย แม้ดูเหมือนปกติ\n\nคำแนะนำจากลูกที่ดูแลแม่นาน 10 ปี: "ความสุขของแม่ คือการที่ลูกอยู่ข้างๆ แม้ไม่ต้องพูดอะไร"\n\nสมุนไพร อาหาร กิจกรรม - ทุกอย่างเป็นเครื่องมือ แต่ความรักคือยาที่ดีที่สุด ลูกหลานที่เอาใจใส่ ทำให้ผู้สูงอายุมีชีวิตที่ยืนยาวและมีความสุข',
  content_en = E'Caring for the elderly is not just giving medicine and food, but loving attention in every dimension. This article shares techniques from loving children.\n\nEffective elderly care techniques:\n\n1. Listen more, talk less - they need someone to hear their feelings, not lecture.\n\n2. Use supportive herbs - warm ginger, red dates, gotu kola help body and mind.\n\n3. Take them out often - morning markets, parks—make them feel alive.\n\n4. Do activities together - gardening, cooking, playing with grandchildren.\n\n5. Mind their mental health - observe moods, listen to their voice.\n\n6. Annual health checks - never skip, even if they seem healthy.\n\nAdvice from a child caring for mother for 10 years: "Mother''s happiness is having her child by her side, even without speaking."\n\nHerbs, food, activities are tools—but love is the best medicine. Caring children give elders long, happy lives.',
  content_zh = E'照顾老人不仅是给药和食物，更是各方面的关爱。本文分享充满爱心的子女们的技巧。\n\n有效的老年护理技巧：\n\n1. 多倾听少说话——老人需要倾听者，不是说教者。\n\n2. 使用支持性草药——温姜、红枣、积雪草，身心皆补。\n\n3. 经常带出门——早市、公园，让他们感到活力。\n\n4. 共同活动——种花、做饭、陪孙辈。\n\n5. 关注心理健康——观察情绪，倾听心声。\n\n6. 年度体检——绝不忽略，即使看似健康。\n\n一位照顾母亲10年的子女说："母亲的幸福，是孩子陪在身边，哪怕不说话。"\n\n草药、食物、活动都是工具——但爱是最好的良药。用心的子女让老人长寿幸福。'
WHERE id = 'a43de72b-9b1f-4a39-8e1e-59652ed619ab';

-- 4. Reset comments_count to 0 then insert replies; trigger will repopulate
UPDATE public.community_posts SET comments_count = 0;

-- Seed replies using a CTE of (post_id, target_count)
WITH targets(post_id, target_count) AS (
  VALUES
    ('b2303e53-58db-4c34-9732-2d5c98835a39'::uuid, 12),
    ('e6737af5-4a92-4997-9701-d30cda311b6b'::uuid, 18),
    ('473209b6-2954-49d3-903c-c5d78c6b16ca'::uuid, 8),
    ('325197bb-d9e5-478f-841b-7b267af91bf3'::uuid, 25),
    ('034605c8-c7d0-4402-bfe0-981a37506116'::uuid, 15),
    ('611d4419-230e-4af8-b56f-ab268e53da1d'::uuid, 32),
    ('9dd2ab95-2674-4b49-b8a1-f7daa57f8208'::uuid, 22),
    ('96bece8d-fd2f-4cb4-83dd-50207bec8a8c'::uuid, 18),
    ('94c71d89-874c-409a-8d29-57253591923f'::uuid, 14),
    ('b9c68b29-e51c-4ad0-a148-4a59daccc9d5'::uuid, 35),
    ('d7c5546e-36e7-4260-95b5-58fa9755073b'::uuid, 11),
    ('ac071c48-578f-49ee-8412-2199f535f01f'::uuid, 16),
    ('b4c2447d-2109-471a-a189-580629a176bb'::uuid, 9),
    ('0b154624-f64f-420e-9f20-ab895ebcb6d5'::uuid, 42),
    ('f3659b85-a6f1-44e0-9a7b-f1dccc514cb3'::uuid, 28),
    ('f0b09d39-2e24-491d-ace0-a5a5ee0f8a77'::uuid, 13),
    ('56e513f1-6d9a-4e5f-8246-60c78e761075'::uuid, 21),
    ('edf8bc9e-86a5-4915-84ce-c9f4ab851d86'::uuid, 19),
    ('d550e032-04f8-4f9c-9bec-fdfc807e262a'::uuid, 15),
    ('a43de72b-9b1f-4a39-8e1e-59652ed619ab'::uuid, 31)
),
authors AS (
  SELECT * FROM (VALUES
    (1, 'คุณสมชาย'), (2, 'คุณวันดี'), (3, 'คุณนภา'), (4, 'คุณมาลี'), (5, 'คุณบุญมา'),
    (6, 'คุณอารี'), (7, 'คุณสมศรี'), (8, 'คุณวิชัย'), (9, 'คุณพรทิพย์'), (10, 'คุณธวัช'),
    (11, 'คุณสุภา'), (12, 'คุณรัตนา'), (13, 'คุณประยูร'), (14, 'คุณวรรณา'), (15, 'คุณเกษม'),
    (16, 'คุณสายฝน'), (17, 'คุณอนงค์'), (18, 'คุณเสริม'), (19, 'คุณดวงใจ'), (20, 'คุณชาติ'),
    (21, 'คุณบงกช'), (22, 'คุณวิภา'), (23, 'คุณจำลอง'), (24, 'คุณนิภา'), (25, 'คุณกมล'),
    (26, 'คุณเอื้อย'), (27, 'คุณสมพร'), (28, 'คุณบัวลอย'), (29, 'คุณปรีชา'), (30, 'คุณยินดี')
  ) AS a(idx, name)
),
templates AS (
  SELECT * FROM (VALUES
    (1, 'ขอบคุณสำหรับข้อมูลดีๆ ครับ จะลองนำไปใช้ดูแลคุณพ่อ'),
    (2, 'เป็นประโยชน์มากเลยค่ะ ขอบคุณที่แชร์'),
    (3, 'กำลังหาข้อมูลเรื่องนี้พอดี ขอบคุณนะคะ'),
    (4, 'คุณแม่ที่บ้านมีปัญหานี้พอดี จะลองทำตามดูค่ะ'),
    (5, 'ใช้ได้ผลจริงไหมคะ มีใครเคยลองบ้าง?'),
    (6, 'ดีมากเลยค่ะ ที่บ้านก็ใช้สมุนไพรเหมือนกัน'),
    (7, 'ขอสอบถามเพิ่มเติมหน่อยครับ ดื่มได้วันละกี่แก้ว?'),
    (8, 'บทความดีมากครับ อ่านแล้วเข้าใจง่าย'),
    (9, 'ลองแล้วได้ผลจริง คุณแม่อาการดีขึ้นเยอะเลยค่ะ'),
    (10, 'ขอบคุณที่แชร์ประสบการณ์นะคะ จะนำไปปรับใช้'),
    (11, 'มีประโยชน์มาก แชร์ต่อให้ครอบครัวแล้วค่ะ'),
    (12, 'ผมก็ดื่ม V Flow อยู่เหมือนกัน รู้สึกดีขึ้นมากครับ'),
    (13, 'ขอบคุณครับ ได้ความรู้เพิ่มอีกเยอะเลย'),
    (14, 'ดีจังเลยค่ะ บทความนี้ตอบทุกคำถามที่สงสัย'),
    (15, 'เห็นด้วยครับ การดูแลผู้สูงอายุต้องใส่ใจในทุกๆ เรื่อง')
  ) AS t(idx, text)
),
expanded AS (
  SELECT
    t.post_id,
    n,
    ((n - 1) % 30) + 1 AS author_idx,
    ((n - 1) % 15) + 1 AS template_idx
  FROM targets t,
       LATERAL generate_series(1, t.target_count) AS n
)
INSERT INTO public.community_replies (post_id, user_id, author_name, author_avatar, content, created_at)
SELECT
  e.post_id,
  NULL::uuid,
  a.name,
  '/community/author' || LPAD(((e.n - 1) % 20 + 1)::text, 2, '0') || '.jpg',
  tpl.text,
  now() - (e.n || ' hours')::interval
FROM expanded e
JOIN authors a ON a.idx = e.author_idx
JOIN templates tpl ON tpl.idx = e.template_idx;
