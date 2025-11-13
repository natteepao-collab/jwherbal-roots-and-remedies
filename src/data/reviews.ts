import customer01 from "@/assets/avatars/customer01.jpg";
import customer02 from "@/assets/avatars/customer02.jpg";
import customer03 from "@/assets/avatars/customer03.jpg";
import customer04 from "@/assets/avatars/customer04.jpg";
import customer05 from "@/assets/avatars/customer05.jpg";
import customer06 from "@/assets/avatars/customer06.jpg";
import customer07 from "@/assets/avatars/customer07.jpg";
import customer08 from "@/assets/avatars/customer08.jpg";
import customer09 from "@/assets/avatars/customer09.jpg";
import customer10 from "@/assets/avatars/customer10.jpg";
import customer11 from "@/assets/avatars/customer11.jpg";
import customer12 from "@/assets/avatars/customer12.jpg";
import customer13 from "@/assets/avatars/customer13.jpg";
import customer14 from "@/assets/avatars/customer14.jpg";
import customer15 from "@/assets/avatars/customer15.jpg";
import customer16 from "@/assets/avatars/customer16.jpg";
import customer17 from "@/assets/avatars/customer17.jpg";
import customer18 from "@/assets/avatars/customer18.jpg";
import customer19 from "@/assets/avatars/customer19.jpg";
import customer20 from "@/assets/avatars/customer20.jpg";

export interface Review {
  id: number;
  name: string;
  age: number;
  occupation: {
    th: string;
    en: string;
    zh: string;
  };
  review: {
    th: string;
    en: string;
    zh: string;
  };
  avatarUrl: string;
  rating: number;
}

export const reviews: Review[] = [
  {
    id: 1,
    name: "สุรีย์",
    age: 52,
    occupation: {
      th: "แม่บ้าน",
      en: "Homemaker",
      zh: "家庭主妇"
    },
    review: {
      th: "ก่อนหน้านี้มีอาการมึนหัวบ่อยแล้วก็เหน็บชาตามปลายมือปลายเท้า หลังจากลองดื่ม V Flow ตอนเช้าติดกันประมาณสองอาทิตย์ รู้สึกว่าหัวไม่หนักเหมือนเดิม เดินทำงานบ้านได้คล่องขึ้นค่ะ",
      en: "I used to have frequent dizziness and numbness in my hands and feet. After drinking V Flow every morning for about two weeks, I feel my head is not as heavy as before, and I can walk and do housework more easily.",
      zh: "以前经常头晕，手脚发麻。连续喝了两周V Flow后，感觉头不再那么沉重，做家务也更轻松了。"
    },
    avatarUrl: customer01,
    rating: 5
  },
  {
    id: 2,
    name: "กิตติ",
    age: 45,
    occupation: {
      th: "พนักงานออฟฟิศ",
      en: "Office Worker",
      zh: "办公室职员"
    },
    review: {
      th: "นั่งทำงานหน้าคอมทั้งวัน รู้สึกเมื่อยตัวและขาแข็งๆ เหมือนเลือดไหลเวียนไม่ดี ลองดื่มวันละซอง รู้สึกตัวเบาขึ้น ไม่ง่วงเพลียหลังมื้อเท่าก่อน ดื่มง่าย ไม่หวานเลี่ยนด้วยครับ",
      en: "Sitting at the computer all day made me feel tired with stiff legs, like poor circulation. After drinking one sachet daily, I feel lighter and less drowsy after meals. Easy to drink and not overly sweet.",
      zh: "整天坐在电脑前工作，感觉疲劳腿僵硬，血液循环不好。每天喝一包后感觉身体轻松了，饭后不再那么困倦。容易饮用，不会太甜。"
    },
    avatarUrl: customer02,
    rating: 5
  },
  {
    id: 3,
    name: "มาลี",
    age: 60,
    occupation: {
      th: "เกษียณอายุราชการ",
      en: "Retired Civil Servant",
      zh: "退休公务员"
    },
    review: {
      th: "ปกติเป็นคนมือเท้าเย็นตลอด โดยเฉพาะตอนกลางคืน หลังลอง V Flow ได้ประมาณ 1 เดือน รู้สึกว่ามือเท้าอุ่นขึ้น หลับสบายกว่าเดิม ไม่ตื่นมามึนหัวตอนเช้าเหมือนเมื่อก่อนค่ะ",
      en: "I normally have cold hands and feet, especially at night. After trying V Flow for about a month, my hands and feet feel warmer, I sleep better, and don't wake up dizzy in the morning like before.",
      zh: "我通常手脚冰凉，尤其是晚上。喝了V Flow大约一个月后，手脚感觉更温暖，睡得更好，早上醒来不再像以前那样头晕了。"
    },
    avatarUrl: customer03,
    rating: 5
  },
  {
    id: 4,
    name: "ศักดิ์ชัย",
    age: 50,
    occupation: {
      th: "เจ้าของธุรกิจ",
      en: "Business Owner",
      zh: "企业主"
    },
    review: {
      th: "หมอเคยบอกว่าเลือดค่อนข้างข้น ต้องดูแลตัวเอง เลยลองหาตัวช่วยจากสมุนไพร V Flow เป็นตัวที่รู้สึกโอเค ดื่มง่าย ตอนนี้เหมือนร่างกาย Active ขึ้น ไม่หนักตัวเหมือนเดิมครับ",
      en: "The doctor mentioned my blood was quite thick and I needed to take care of myself. I tried herbal supplements, and V Flow feels right. Easy to drink, and now my body feels more active and not as heavy as before.",
      zh: "医生说我的血液比较浓稠，需要照顾好自己。我尝试了草药补充剂，V Flow感觉很好。容易饮用，现在身体感觉更活跃，不像以前那么沉重。"
    },
    avatarUrl: customer04,
    rating: 4
  },
  {
    id: 5,
    name: "อรทัย",
    age: 38,
    occupation: {
      th: "พยาบาล",
      en: "Nurse",
      zh: "护士"
    },
    review: {
      th: "ทำงานกะดึกบ่อย ร่างกายล้าและเวียนหัวง่าย พอลองดื่ม V Flow ก่อนเริ่มงาน รู้สึกว่าไม่มึนหัวง่ายเหมือนก่อน และระบบขับถ่ายดีขึ้นด้วยค่ะ",
      en: "I often work night shifts, feeling tired and dizzy easily. After drinking V Flow before work, I don't feel dizzy as easily as before, and my digestive system has improved too.",
      zh: "我经常上夜班，感觉疲劳容易头晕。工作前喝V Flow后，不再像以前那样容易头晕，消化系统也改善了。"
    },
    avatarUrl: customer05,
    rating: 5
  },
  {
    id: 6,
    name: "พงษ์",
    age: 55,
    occupation: {
      th: "ข้าราชการบำนาญ",
      en: "Retired Government Officer",
      zh: "退休政府官员"
    },
    review: {
      th: "รู้สึกว่าตั้งแต่เริ่มดื่ม V Flow ร่างกายกระฉับกระเฉงขึ้น เดินออกกำลังกายรอบหมู่บ้านได้นานขึ้น ไม่เหนื่อยหอบเร็วเหมือนแต่ก่อน ดีที่เป็นสมุนไพรไม่ใส่น้ำตาล ทำให้มั่นใจมากขึ้นครับ",
      en: "Since I started drinking V Flow, my body feels more energetic. I can walk around the village for exercise longer without getting tired quickly like before. It's great that it's herbal with no added sugar, making me more confident.",
      zh: "自从开始喝V Flow，我的身体感觉更有活力了。我可以绕着村子散步锻炼更长时间，不会像以前那样很快就累了。很好的是它是草药制成的，不加糖，让我更有信心。"
    },
    avatarUrl: customer06,
    rating: 5
  },
  {
    id: 7,
    name: "จิราพร",
    age: 42,
    occupation: {
      th: "แม่ค้าขายของออนไลน์",
      en: "Online Seller",
      zh: "网络卖家"
    },
    review: {
      th: "นั่งแพ็กของทั้งวัน เมื่อก่อนชาปลายนิ้วมือบ่อยมาก พอลองดื่มต่อเนื่องประมาณ 3 สัปดาห์ อาการชาลดลง รู้สึกมือไม่เย็นเหมือนเดิม ชอบตรงที่ชงง่าย รสชาติกลมกล่อมค่ะ",
      en: "I pack items all day, and used to have frequent numbness in my fingertips. After drinking continuously for about 3 weeks, the numbness decreased, and my hands don't feel as cold as before. I like that it's easy to brew and has a smooth taste.",
      zh: "我整天打包物品，以前手指经常发麻。连续喝了大约3周后，麻木感减轻了，手不再像以前那么冷。我喜欢它易于冲泡，味道圆润。"
    },
    avatarUrl: customer07,
    rating: 4
  },
  {
    id: 8,
    name: "ภาคิน",
    age: 47,
    occupation: {
      th: "วิศวกร",
      en: "Engineer",
      zh: "工程师"
    },
    review: {
      th: "อายุมากขึ้นเริ่มรู้สึกตัวเองไม่ค่อยฟิต เลยหาตัวช่วยเรื่องเลือดและระบบหมุนเวียน พอลอง V Flow แล้วรู้สึกว่าตื่นเช้ามาสดชื่นกว่าเดิม ไม่อึนๆ เหมือนแต่ก่อนครับ",
      en: "As I got older, I started feeling less fit, so I looked for help with blood and circulation. After trying V Flow, I wake up feeling more refreshed in the morning, not groggy like before.",
      zh: "随着年龄增长，我开始感觉不太健康，所以寻找血液和循环方面的帮助。尝试V Flow后，我早上醒来感觉更清爽，不像以前那样昏昏沉沉。"
    },
    avatarUrl: customer08,
    rating: 5
  },
  {
    id: 9,
    name: "ศิริพร",
    age: 58,
    occupation: {
      th: "ดูแลหลานที่บ้าน",
      en: "Grandchild Caregiver",
      zh: "照顾孙子的祖母"
    },
    review: {
      th: "เมื่อก่อนขึ้นลงบันไดแล้วมักจะมึนหัว หายใจไม่ค่อยทัน ลองดื่ม V Flow ดู ปรากฏว่ารู้สึกหัวโล่งขึ้น เดินขึ้นลงบันไดได้สบายขึ้นค่ะ",
      en: "I used to feel dizzy and short of breath when going up and down stairs. After trying V Flow, my head feels clearer and I can climb stairs more comfortably.",
      zh: "以前上下楼梯时经常头晕气短。尝试V Flow后，头脑感觉更清晰，上下楼梯也更舒服了。"
    },
    avatarUrl: customer09,
    rating: 4
  },
  {
    id: 10,
    name: "นฤดม",
    age: 53,
    occupation: {
      th: "เซลส์ขายสินค้า",
      en: "Sales Representative",
      zh: "销售代表"
    },
    review: {
      th: "ต้องขับรถเดินทางบ่อย รู้สึกขาบวมๆ และล้าบ่อย พอลองดื่ม V Flow ช่วงเช้าก่อนออกจากบ้าน รู้สึกว่าระหว่างวันไม่ล้าเท่าเดิม และไม่ค่อยมีอาการปวดตื้อที่น่องเหมือนเมื่อก่อนครับ",
      en: "I often drive and felt my legs swelling and fatigue. After drinking V Flow in the morning before leaving home, I feel less tired during the day and rarely have the dull ache in my calves like before.",
      zh: "我经常开车，感觉腿肿胀和疲劳。早上出门前喝V Flow后，白天感觉不那么累，小腿也很少像以前那样隐隐作痛了。"
    },
    avatarUrl: customer10,
    rating: 5
  },
  {
    id: 11,
    name: "ณัฐนันท์",
    age: 35,
    occupation: {
      th: "ฟรีแลนซ์",
      en: "Freelancer",
      zh: "自由职业者"
    },
    review: {
      th: "ทำงานหน้าคอมดึกๆ บางวันรู้สึกตาพร่าและเวียนหัว เลยลองหาตัวช่วยจากสมุนไพรแทนกาแฟ ดื่ม V Flow แล้วรู้สึกโล่งหัว ไม่สะเทือนกระเพาะเหมือนกาแฟด้วยค่ะ",
      en: "Working late on the computer, some days I feel blurred vision and dizziness. I tried herbal help instead of coffee. Drinking V Flow makes my head feel clear without upsetting my stomach like coffee does.",
      zh: "在电脑前工作到很晚，有些日子会感觉视力模糊和头晕。我尝试用草药代替咖啡。喝V Flow让我头脑清醒，而且不会像咖啡那样刺激胃。"
    },
    avatarUrl: customer11,
    rating: 4
  },
  {
    id: 12,
    name: "ประสิทธิ์",
    age: 62,
    occupation: {
      th: "ชาวสวน",
      en: "Farmer",
      zh: "农民"
    },
    review: {
      th: "ไปตรวจสุขภาพแล้วหมอแนะนำให้ดูแลเรื่องไขมันและเลือด เลยเริ่มหันมาดูแลตัวเองมากขึ้น ดื่ม V Flow ควบคู่กับการปรับอาหาร รู้สึกว่าร่างกายเบาขึ้นและเดินทำสวนได้ทั้งวันครับ",
      en: "After a health checkup, the doctor advised me to take care of my cholesterol and blood. I started taking better care of myself, drinking V Flow along with adjusting my diet. My body feels lighter and I can work in the garden all day.",
      zh: "体检后，医生建议我注意胆固醇和血液。我开始更好地照顾自己，在调整饮食的同时喝V Flow。我的身体感觉更轻，可以整天在花园里工作。"
    },
    avatarUrl: customer12,
    rating: 5
  },
  {
    id: 13,
    name: "วริศรา",
    age: 49,
    occupation: {
      th: "ครู",
      en: "Teacher",
      zh: "教师"
    },
    review: {
      th: "ยืนสอนทั้งวัน ปวดขาและเมื่อยตัวง่าย พอลองดื่มก่อนออกจากบ้าน รู้สึกว่าระหว่างวันไม่มึนหัว และไม่เพลียเหมือนเดิม ชอบที่เป็นสมุนไพร ไม่มีกลิ่นแรงจนดื่มยากค่ะ",
      en: "Standing and teaching all day made my legs hurt and body tired easily. After drinking it before leaving home, I don't feel dizzy during the day and not as exhausted as before. I like that it's herbal without a strong smell that makes it hard to drink.",
      zh: "整天站着教书让我腿疼身体容易疲劳。出门前喝了之后，白天不再头晕，也不像以前那么疲惫。我喜欢它是草药制成的，没有难闻的气味。"
    },
    avatarUrl: customer13,
    rating: 5
  },
  {
    id: 14,
    name: "ชาลี",
    age: 57,
    occupation: {
      th: "ขายอาหารตามสั่ง",
      en: "Food Vendor",
      zh: "餐饮供应商"
    },
    review: {
      th: "ทำกับข้าวทั้งวัน เหนื่อยและร้อนง่าย แต่มือเท้ากลับเย็นตลอด เพื่อนแนะนำ V Flow เลยลองดู ตอนนี้รู้สึกตัวอุ่นขึ้น และมีแรงทำงานมากขึ้นครับ",
      en: "Cooking all day made me tired and hot easily, but my hands and feet were always cold. A friend recommended V Flow, so I tried it. Now I feel warmer and have more energy to work.",
      zh: "整天做饭让我容易疲劳和发热，但手脚总是冰凉。朋友推荐了V Flow，所以我试了试。现在我感觉更温暖，工作也更有力气了。"
    },
    avatarUrl: customer14,
    rating: 4
  },
  {
    id: 15,
    name: "วิภา",
    age: 44,
    occupation: {
      th: "พนักงานบัญชี",
      en: "Accountant",
      zh: "会计"
    },
    review: {
      th: "นั่งนิ่งๆ นานๆ รู้สึกเหมือนเลือดไม่ค่อยเดิน ขาชาเป็นพักๆ ตอนนี้ดื่ม V Flow ควบคู่กับการลุกยืดเส้นยืดสาย รู้สึกว่าขาชาช้าลงกว่าเดิมค่ะ",
      en: "Sitting still for long periods makes me feel like my blood isn't circulating well, with intermittent leg numbness. Now drinking V Flow along with standing and stretching, the leg numbness has decreased.",
      zh: "长时间静坐让我感觉血液循环不好，腿间歇性发麻。现在喝V Flow的同时站起来伸展，腿部麻木减轻了。"
    },
    avatarUrl: customer15,
    rating: 5
  },
  {
    id: 16,
    name: "ทศพล",
    age: 39,
    occupation: {
      th: "IT Support",
      en: "IT Support",
      zh: "IT支持"
    },
    review: {
      th: "ทำงานดึกบ่อย นอนน้อย แล้วชอบมึนหัวตอนตื่นเช้า พอลองเปลี่ยนมาดื่ม V Flow แทนกาแฟมื้อเช้า รู้สึกหัวโล่งขึ้น ไม่ใจสั่นเหมือนกินกาแฟจัดๆ ครับ",
      en: "Working late often with little sleep, I'd wake up dizzy. After switching to V Flow instead of morning coffee, my head feels clearer without the jitters from strong coffee.",
      zh: "经常工作到很晚，睡眠不足，早上醒来总是头晕。换成早上喝V Flow代替咖啡后，头脑感觉更清醒，也不会像喝浓咖啡那样心悸。"
    },
    avatarUrl: customer16,
    rating: 4
  },
  {
    id: 17,
    name: "สุภาวดี",
    age: 51,
    occupation: {
      th: "เจ้าของร้านเสื้อผ้า",
      en: "Clothing Store Owner",
      zh: "服装店老板"
    },
    review: {
      th: "มีอาการเวียนหัวเวลายืนขายของนานๆ ลูกสาวเลยซื้อ V Flow มาให้ลอง ตอนนี้ดื่มมาประมาณเดือนกว่าๆ รู้สึกว่าเวียนหัวน้อยลง เดินไปมาในร้านสบายขึ้นค่ะ",
      en: "I'd get dizzy when standing and selling for long periods. My daughter bought V Flow for me to try. After drinking it for over a month, I feel less dizzy and can walk around the shop more comfortably.",
      zh: "长时间站着卖东西时会头晕。我女儿给我买了V Flow试试。喝了一个多月后，感觉头晕减少了，在店里走动也更舒服了。"
    },
    avatarUrl: customer17,
    rating: 5
  },
  {
    id: 18,
    name: "มนตรี",
    age: 59,
    occupation: {
      th: "พนักงานคลังสินค้า",
      en: "Warehouse Worker",
      zh: "仓库工人"
    },
    review: {
      th: "ต้องยกของ เดินขึ้นลงบันได ทั้งๆ ที่อายุมากขึ้นแล้ว เลยหาตัวช่วยเรื่องระบบเลือดและความอ่อนล้า ดื่ม V Flow ก่อนเข้างาน รู้สึกว่าระหว่างวันไม่เหนื่อยฮวบๆ เหมือนเดิมครับ",
      en: "Having to lift items and climb stairs despite getting older, I looked for help with blood circulation and fatigue. Drinking V Flow before work, I don't feel as suddenly exhausted during the day as before.",
      zh: "尽管年纪大了，还得搬东西爬楼梯，所以我寻找血液循环和疲劳方面的帮助。工作前喝V Flow，白天不会像以前那样突然感到筋疲力尽。"
    },
    avatarUrl: customer18,
    rating: 5
  },
  {
    id: 19,
    name: "ปรียา",
    age: 46,
    occupation: {
      th: "เจ้าหน้าที่โรงพยาบาล",
      en: "Hospital Staff",
      zh: "医院职员"
    },
    review: {
      th: "เห็นคนไข้เยอะทุกวัน ทำให้หันมาระวังสุขภาพตัวเองมากขึ้น เลยเลือกดื่มสมุนไพรที่ช่วยเรื่องเลือดอย่าง V Flow รู้สึกสบายตัว ไม่แน่นๆ หนักๆ เหมือนก่อนค่ะ",
      en: "Seeing many patients daily made me more cautious about my own health. I chose to drink herbal supplements for blood like V Flow. I feel more comfortable, not tight or heavy like before.",
      zh: "每天看到很多病人让我更加注意自己的健康。我选择喝像V Flow这样的血液草药补充剂。我感觉更舒服，不像以前那样紧绷沉重。"
    },
    avatarUrl: customer19,
    rating: 4
  },
  {
    id: 20,
    name: "ธนกร",
    age: 63,
    occupation: {
      th: "เกษตรกร",
      en: "Agriculturist",
      zh: "农业工作者"
    },
    review: {
      th: "เมื่อก่อนลุกเร็วๆ แล้วมักจะหน้ามืด เลยลองดื่ม V Flow ตามที่ลูกชายซื้อให้ ตอนนี้เวลาลุกจากเก้าอี้หรือเตียง รู้สึกว่าหัวไม่มึนเท่าเดิม เดินออกไปดูสวนก็คล่องตัวขึ้นครับ",
      en: "I used to get lightheaded when standing up quickly. I tried V Flow as my son bought it for me. Now when getting up from a chair or bed, my head doesn't feel as dizzy as before, and I can walk out to check the garden more easily.",
      zh: "以前快速站起来时会眼前发黑。我按儿子买的喝了V Flow。现在从椅子或床上起来时，头不再像以前那样晕，走出去看花园也更轻松了。"
    },
    avatarUrl: customer20,
    rating: 5
  }
];
