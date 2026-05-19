import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function notifyNewChat(supabase: any, messages: any[], language: string) {
  try {
    const { data: cfg } = await supabase
      .from("contact_settings")
      .select("chat_line_notify_enabled")
      .limit(1)
      .single();
    if (cfg && cfg.chat_line_notify_enabled === false) return;

    const channelToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
    const userId = Deno.env.get("LINE_USER_ID");
    if (!channelToken || !userId) {
      console.warn("LINE_CHANNEL_ACCESS_TOKEN หรือ LINE_USER_ID ไม่ได้ตั้งค่า");
      return;
    }
    const firstUserMsg = messages.find((m: any) => m.role === "user")?.content || "(ไม่มีข้อความ)";
    const text = `💬 มีลูกค้าเริ่มแชทใหม่ใน JWHERBAL Help!\n\n🌐 ภาษา: ${language}\n❓ ข้อความแรก: ${firstUserMsg}\n\n📅 ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}\n\n⚠️ กรุณาตรวจสอบเพื่อให้ลูกค้าได้รับการตอบกลับ`;
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelToken}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text }],
      }),
    });
    if (!res.ok) {
      console.error("LINE push failed:", res.status, await res.text());
    }
  } catch (e) {
    console.error("notifyNewChat error:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language, sessionId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create conversation
    let conversationId: string;
    if (sessionId) {
      const { data: existing } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("session_id", sessionId)
        .single();

      if (existing) {
        conversationId = existing.id;
      } else {
        const { data: created } = await supabase
          .from("chat_conversations")
          .insert({ session_id: sessionId, language: language || "th" })
          .select("id")
          .single();
        conversationId = created!.id;
        await notifyNewChat(supabase, messages, language || "th");
      }
    } else {
      const { data: created } = await supabase
        .from("chat_conversations")
        .insert({ session_id: crypto.randomUUID(), language: language || "th" })
        .select("id")
        .single();
      conversationId = created!.id;
      await notifyNewChat(supabase, messages, language || "th");
    }

    // Save the latest user message
    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop();
    if (lastUserMsg) {
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: lastUserMsg.content,
      });
    }

    // Fetch comprehensive data from database
    const [
      productsRes, articlesRes, faqRes, contactRes, vflowRes,
      promoTiersRes, promoSettingsRes, reviewsRes, aboutRes,
      brandStoryRes, trustCertRes, trustIngrRes, trustExpertRes,
      paymentRes,
    ] = await Promise.all([
      supabase.from("products").select("id, name_th, name_en, name_zh, price, description_th, description_en, description_zh, category, usage_instructions_th, suitable_for_th, detail_content_th, stock, rating, image_url").eq("is_active", true).limit(30),
      supabase.from("articles").select("title_th, title_en, title_zh, excerpt_th, excerpt_en, excerpt_zh, slug, category, author, image_url").order("updated_at", { ascending: false }).limit(15),
      supabase.from("faq_items").select("question_th, question_en, question_zh, answer_th, answer_en, answer_zh, category").eq("is_active", true).order("sort_order").limit(50),
      supabase.from("contact_settings").select("*").limit(1).single(),
      supabase.from("vflow_page_settings").select("*").limit(1).single(),
      supabase.from("promotion_tiers").select("quantity, unit, price, normal_price, is_best_seller, product_id").eq("is_active", true).order("sort_order"),
      supabase.from("promotion_settings").select("title, is_active, is_monthly, custom_end_date").eq("is_active", true).limit(1).maybeSingle(),
      supabase.from("reviews").select("author_name, rating, comment").eq("is_approved", true).order("created_at", { ascending: false }).limit(10),
      supabase.from("about_settings").select("*").limit(1).maybeSingle(),
      supabase.from("brand_story").select("*").limit(1).maybeSingle(),
      supabase.from("trust_certifications").select("title_th, description_th").eq("is_active", true).order("sort_order"),
      supabase.from("trust_ingredients").select("name_th, description_th").eq("is_active", true).order("sort_order"),
      supabase.from("trust_expert").select("*").limit(1).maybeSingle(),
      supabase.from("payment_settings").select("*").limit(1).maybeSingle(),
    ]);

    // Extra galleries for image responses
    const [productImagesRes, brandGalleryRes] = await Promise.all([
      supabase.from("product_images").select("product_id, image_url, title").eq("is_active", true).order("sort_order").limit(40),
      supabase.from("brand_story_gallery").select("image_url, title_th").eq("is_active", true).order("sort_order").limit(12),
    ]);

    const lang = language || "th";
    const langSuffix = `_${lang}`;

    const productImagesByProduct: Record<string, string[]> = {};
    for (const pi of productImagesRes.data || []) {
      if (!productImagesByProduct[pi.product_id]) productImagesByProduct[pi.product_id] = [];
      productImagesByProduct[pi.product_id].push(pi.image_url);
    }

    const products = (productsRes.data || []).map((p: any) => ({
      name: p[`name${langSuffix}`] || p.name_th,
      price: p.price,
      description: p[`description${langSuffix}`] || p.description_th,
      category: p.category,
      usage: p.usage_instructions_th,
      suitableFor: p.suitable_for_th,
      stock: p.stock,
      rating: p.rating,
      images: [p.image_url, ...(productImagesByProduct[p.id] || [])].filter(Boolean).slice(0, 4),
    }));

    const articles = (articlesRes.data || []).map((a: any) => ({
      title: a[`title${langSuffix}`] || a.title_th,
      excerpt: a[`excerpt${langSuffix}`] || a.excerpt_th,
      slug: a.slug,
      category: a.category,
      author: a.author,
    }));

    const faqs = (faqRes.data || []).map((f: any) => ({
      q: f[`question${langSuffix}`] || f.question_th,
      a: f[`answer${langSuffix}`] || f.answer_th,
      category: f.category,
    }));

    const contact = contactRes.data;
    const vflow = vflowRes.data;
    const promoTiers = promoTiersRes.data || [];
    const promoSettings = promoSettingsRes.data;
    const reviews = (reviewsRes.data || []).map((r: any) => ({ name: r.author_name, rating: r.rating, comment: r.comment }));
    const about = aboutRes.data;
    const brandStory = brandStoryRes.data;
    const certifications = (trustCertRes.data || []).map((c: any) => `${c.title_th}: ${c.description_th}`);
    const ingredients = (trustIngrRes.data || []).map((i: any) => `${i.name_th}: ${i.description_th}`);
    const expert = trustExpertRes.data;
    const payment = paymentRes.data;

    const langName = lang === 'th' ? 'ไทย' : lang === 'en' ? 'อังกฤษ' : lang === 'zh' ? 'จีน' : 'ญี่ปุ่น';

    const systemPrompt = `คุณคือ "พี่แอดมิน" ของแบรนด์ JW HERBAL ทีมงานคนไทยที่ดูแลลูกค้าผ่านแชท ไม่ใช่ AI

🎭 บุคลิกและสไตล์การพูด (สำคัญมาก):
- พูดเหมือนพี่สาว/น้องสาวคนไทยที่อบอุ่น เป็นกันเอง สุภาพแต่ไม่ทางการเกินไป
- ใช้คำลงท้ายธรรมชาติ เช่น "ค่ะ" "นะคะ" "เลยค่ะ" "ได้เลยค่ะ" "ยินดีค่ะ" สลับกันไป ไม่ซ้ำๆ
- ใส่อีโมจิเบาๆ บ้าง 🌿 💚 ✨ 😊 🙏 (ไม่เกิน 1-2 ตัวต่อข้อความ)
- ตอบสั้นกระชับ 2-4 ประโยค ไม่บรรยายยาว เหมือนแชทไลน์จริง
- อย่าใช้ Markdown headers (#) หรือ bullet **bold** เยอะ — ใช้เครื่องหมาย • หรือเว้นบรรทัดแทน
- ห้ามบอกว่าตัวเองคือ AI, bot, chatbot, ผู้ช่วยอัตโนมัติ — ถ้าโดนถามให้เลี่ยงว่า "เป็นทีมงาน JW HERBAL ค่ะ"
- ตอบเป็นภาษา${langName} เท่านั้น

💬 วิธีโต้ตอบ:
- ทักทาย/เปิดบทสนทนาด้วยน้ำเสียงอบอุ่น เช่น "สวัสดีค่ะ 😊" "ยินดีต้อนรับค่ะ"
- ถ้าลูกค้าถามสินค้า → บอกชื่อ ราคา สรรพคุณสั้นๆ แล้วชวนต่อ เช่น "สนใจดูรายละเอียดเพิ่มไหมคะ?"
- ถ้าลูกค้าสนใจซื้อ → แนะนำโปรโมชั่นที่คุ้มที่สุด + ส่งลิงก์ /shop หรือ /products/vflow
- ถ้าลูกค้าถามวิธีสั่ง/ชำระเงิน → อธิบายขั้นตอนสั้นๆ + บอกช่องทาง PromptPay/โอนธนาคาร
- ถ้าเรื่องที่ลูกค้าถามไม่มีในข้อมูล หรือเป็นเคสเฉพาะ (เช่น สั่งซื้อจำนวนมาก, ปัญหาสุขภาพเฉพาะ) → แนะนำติดต่อแอดมินตัวจริงทาง LINE: ${contact?.line_id || '@jwherbal'}
- จบทุกคำตอบด้วยคำถามเชิญชวนต่อ 1 ข้อ เพื่อให้สนทนาไหลลื่น
- ห้ามแต่งข้อมูลที่ไม่มีในฐานข้อมูล โดยเฉพาะราคา สรรพคุณ และโปรโมชั่น

🔗 ลิงก์เว็บ: /shop (สินค้า) · /products/vflow (V Flow) · /articles (บทความสุขภาพ) · /reviews (รีวิวลูกค้า) · /faq (คำถามที่พบบ่อย) · /about (เกี่ยวกับเรา) · /contact (ติดต่อ) · /community (ชุมชน)

═══════════ ข้อมูลแบรนด์ JW HERBAL ═══════════
${about ? `วิสัยทัศน์: ${about.vision_quote_th}\nเรื่องราว: ${about.story_paragraph1_th} ${about.story_paragraph2_th}\nผลงาน: ${about.achievement_years} ปีประสบการณ์, ลูกค้า ${about.achievement_customers} คน, ความพึงพอใจ ${about.achievement_satisfaction}` : ''}

${brandStory ? `\nเรื่องราวแบรนด์: ${brandStory.title_th} - ${brandStory.description_th}` : ''}

ผู้เชี่ยวชาญ: ${expert ? `${expert.title_th} - ${expert.description_th}` : ''}

═══════════ มาตรฐาน & การรับรอง ═══════════
${certifications.join('\n')}

═══════════ วัตถุดิบหลัก ═══════════
${ingredients.join('\n')}

═══════════ สินค้าทั้งหมด (${products.length} รายการ) ═══════════
${JSON.stringify(products, null, 1)}

═══════════ V FLOW (สินค้าเรือธง) ═══════════
${vflow ? JSON.stringify(vflow, null, 1) : 'ไม่มีข้อมูล'}

═══════════ โปรโมชั่นปัจจุบัน ═══════════
${promoSettings ? `🎁 ${promoSettings.title}` : ''}
${promoTiers.length > 0 ? `ราคาแพ็คเกจ:\n${promoTiers.map((t: any) => `• ${t.quantity} ${t.unit} = ${t.price} บาท (ปกติ ${t.normal_price}) ${t.is_best_seller ? '⭐ ขายดี' : ''}`).join('\n')}` : ''}

═══════════ ช่องทางชำระเงิน ═══════════
${payment ? `PromptPay: ${payment.promptpay_number} (${payment.promptpay_name})\nโอนธนาคาร: ${payment.bank_name} - ${payment.bank_account_number} (${payment.bank_account_name})` : ''}

═══════════ บทความสุขภาพล่าสุด ═══════════
${JSON.stringify(articles, null, 1)}

═══════════ คำถามที่พบบ่อย (${faqs.length} ข้อ) ═══════════
${JSON.stringify(faqs, null, 1)}

═══════════ รีวิวลูกค้าจริง ═══════════
${JSON.stringify(reviews, null, 1)}

═══════════ ติดต่อ ═══════════
${contact ? `📞 ${contact.phone} (${contact.phone_hours})\n💬 LINE: ${contact.line_id}\n📧 ${contact.email}\n📍 ${contact.address}\n⏰ จันทร์-ศุกร์ ${contact.weekday_hours}, เสาร์-อาทิตย์ ${contact.weekend_hours}` : ''}`;

    // Call AI with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "ระบบไม่พร้อมให้บริการชั่วคราว" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream response and collect full text to save
    const reader = response.body!.getReader();
    let fullAssistantText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Forward chunk to client
            controller.enqueue(value);

            // Parse to collect full text
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullAssistantText += content;
              } catch { /* partial */ }
            }
          }
        } finally {
          controller.close();
          // Save assistant response to DB after streaming completes
          if (fullAssistantText) {
            await supabase.from("chat_messages").insert({
              conversation_id: conversationId,
              role: "assistant",
              content: fullAssistantText,
            });
          }
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-Conversation-Id": conversationId },
    });
  } catch (e) {
    console.error("chatbot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
