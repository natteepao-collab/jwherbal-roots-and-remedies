import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch real data from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products, articles, FAQ, contact info in parallel
    const [productsRes, articlesRes, faqRes, contactRes, vflowRes] = await Promise.all([
      supabase.from("products").select("name_th, name_en, name_zh, price, description_th, description_en, description_zh, category, usage_instructions_th, suitable_for_th").eq("is_active", true).limit(20),
      supabase.from("articles").select("title_th, title_en, title_zh, excerpt_th, excerpt_en, excerpt_zh, slug, category").order("updated_at", { ascending: false }).limit(10),
      supabase.from("faq_items").select("question_th, question_en, question_zh, answer_th, answer_en, answer_zh, category").eq("is_active", true).order("sort_order").limit(20),
      supabase.from("contact_settings").select("*").limit(1).single(),
      supabase.from("vflow_page_settings").select("description, tagline, highlights, how_to_use, faqs").limit(1).single(),
    ]);

    const lang = language || "th";
    const langSuffix = `_${lang}`;

    // Build context from real data
    const products = (productsRes.data || []).map(p => ({
      name: p[`name${langSuffix}`] || p.name_th,
      price: p.price,
      description: p[`description${langSuffix}`] || p.description_th,
      category: p.category,
      usage: p.usage_instructions_th,
      suitableFor: p.suitable_for_th,
    }));

    const articles = (articlesRes.data || []).map(a => ({
      title: a[`title${langSuffix}`] || a.title_th,
      excerpt: a[`excerpt${langSuffix}`] || a.excerpt_th,
      slug: a.slug,
      category: a.category,
    }));

    const faqs = (faqRes.data || []).map(f => ({
      question: f[`question${langSuffix}`] || f.question_th,
      answer: f[`answer${langSuffix}`] || f.answer_th,
    }));

    const contact = contactRes.data;
    const vflow = vflowRes.data;

    const systemPrompt = `คุณคือผู้ช่วยของเว็บไซต์ JWHERBAL ร้านขายสมุนไพรและผลิตภัณฑ์เพื่อสุขภาพ

กฎสำคัญ:
1. ตอบสั้นกระชับ ไม่เกิน 2-3 ประโยค ตรงประเด็น
2. หลังตอบแต่ละครั้ง ให้แนะนำคำถามต่อ 1-2 ข้อที่เกี่ยวข้อง เพื่อให้ลูกค้าสนทนาต่อ
3. ใช้ข้อมูลจริงจากฐานข้อมูลเท่านั้น ห้ามแต่งเอง
4. พูดจาสุภาพ เป็นมิตร ใช้ภาษา${lang === 'th' ? 'ไทย' : lang === 'en' ? 'อังกฤษ' : 'จีนตัวย่อ'}
5. หากลูกค้าถามเรื่องที่ไม่มีในข้อมูล ให้แนะนำติดต่อแอดมินผ่าน LINE
6. เมื่อเหมาะสม ให้แนะนำลิงก์ไปยังหน้าต่างๆ ของเว็บไซต์ เช่น /shop, /articles, /products/vflow, /faq, /contact, /reviews
7. ถ้าลูกค้าทักทาย ให้แนะนำตัวสั้นๆ แล้วถามว่าสนใจเรื่องอะไร พร้อมแนะนำหัวข้อ เช่น สินค้า, บทความสุขภาพ, โปรโมชั่น

ข้อมูลสินค้า:
${JSON.stringify(products, null, 1)}

ข้อมูล V Flow (สินค้าแนะนำ):
${vflow ? JSON.stringify(vflow, null, 1) : 'ไม่มีข้อมูล'}

บทความล่าสุด:
${JSON.stringify(articles, null, 1)}

คำถามที่พบบ่อย:
${JSON.stringify(faqs, null, 1)}

ข้อมูลติดต่อ:
${contact ? `โทร: ${contact.phone}, LINE: ${contact.line_id}, อีเมล: ${contact.email}` : 'ไม่มีข้อมูล'}

URL เว็บไซต์หลัก: /shop (สินค้า), /articles (บทความ), /products/vflow (V Flow), /faq (ถามตอบ), /contact (ติดต่อ), /reviews (รีวิว)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "ระบบไม่ว่าง กรุณาลองใหม่อีกครั้ง" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "ระบบไม่พร้อมให้บริการชั่วคราว" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chatbot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
