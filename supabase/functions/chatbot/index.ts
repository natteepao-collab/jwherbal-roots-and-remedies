import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "X-Conversation-Id, X-Admin-Takeover, X-Ai-Staff-Name",
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

const STAFF_NAMES = ["เอมอร", "นันนพัส", "ธัญญ์สิริน", "ชญานิศ", "ณัฐวรินทร์"];
const pickStaffName = () => STAFF_NAMES[Math.floor(Math.random() * STAFF_NAMES.length)];
const normalizeStaffName = (raw: unknown): string | null => {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return STAFF_NAMES.includes(trimmed) ? trimmed : null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language, sessionId, context, userJwt, staffName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Resolve authenticated user from JWT (if provided) to bind conversation to account
    let authUserId: string | null = null;
    if (userJwt && typeof userJwt === "string") {
      try {
        const { data: userData } = await supabase.auth.getUser(userJwt);
        authUserId = userData?.user?.id ?? null;
      } catch (e) {
        console.warn("getUser failed:", e);
      }
    }

    const convContext = {
      page_url: context?.pageUrl || null,
      referrer: context?.referrer || null,
      user_agent: context?.userAgent || null,
      device_type: context?.deviceType || null,
    };

    // Server-side enforcement of the AI staff name per conversation/session.
    // The first valid client-provided name is persisted; subsequent calls always
    // use the persisted value regardless of what the client sends.
    const clientStaff = normalizeStaffName(staffName);

    // Get or create conversation
    let conversationId: string;
    let aiStaffName: string;
    if (sessionId) {
      const { data: existing } = await supabase
        .from("chat_conversations")
        .select("id, user_id, ai_staff_name")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (existing) {
        conversationId = existing.id;
        if (existing.ai_staff_name) {
          aiStaffName = existing.ai_staff_name;
        } else {
          aiStaffName = clientStaff || pickStaffName();
          await supabase
            .from("chat_conversations")
            .update({ ai_staff_name: aiStaffName })
            .eq("id", conversationId);
        }
        // Backfill user_id once the visitor logs in mid-conversation
        if (authUserId && !existing.user_id) {
          await supabase
            .from("chat_conversations")
            .update({ user_id: authUserId })
            .eq("id", conversationId);
        }
      } else {
        aiStaffName = clientStaff || pickStaffName();
        const { data: created } = await supabase
          .from("chat_conversations")
          .insert({
            session_id: sessionId,
            language: language || "th",
            user_id: authUserId,
            ai_staff_name: aiStaffName,
            ...convContext,
          })
          .select("id")
          .single();
        conversationId = created!.id;
        await notifyNewChat(supabase, messages, language || "th");
      }
    } else {
      aiStaffName = clientStaff || pickStaffName();
      const { data: created } = await supabase
        .from("chat_conversations")
        .insert({
          session_id: crypto.randomUUID(),
          language: language || "th",
          user_id: authUserId,
          ai_staff_name: aiStaffName,
          ...convContext,
        })
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

    // Check if a human admin has taken over this conversation. If so, skip AI.
    const { data: convState } = await supabase
      .from("chat_conversations")
      .select("admin_takeover")
      .eq("id", conversationId)
      .maybeSingle();

    if (convState?.admin_takeover) {
      return new Response(
        JSON.stringify({ takeover: true, conversationId, staffName: aiStaffName }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-Conversation-Id": conversationId,
            "X-Admin-Takeover": "1",
            "X-Ai-Staff-Name": encodeURIComponent(aiStaffName),
          },
        },
      );
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
      image: a.image_url,
    }));

    const brandGallery = (brandGalleryRes.data || []).map((g: any) => ({ title: g.title_th, image: g.image_url }));

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
ชื่อพนักงานของคุณในแชทนี้คือ "${aiStaffName}" — ห้ามเปลี่ยนชื่อระหว่างการสนทนาเด็ดขาด หากต้องแนะนำตัวให้ใช้ชื่อนี้เท่านั้น


🎭 บุคลิกและสไตล์การพูด (สำคัญที่สุด):
- พูดเหมือนแอดมินคนไทยที่อบอุ่น สุภาพ จริงใจ ไม่ขายของ ไม่เร่ง ไม่ยัดเยียด
- เรียกลูกค้าว่า "คุณลูกค้า" เสมอ — ห้ามเรียก พี่/น้อง/ลุง/ป้า/หนู หรือคำสนิทอื่นๆ เด็ดขาด
- แทนตัวเองว่า "ทางร้าน" หรือ "ทีมงาน" ก็ได้ ไม่ต้องใช้ "พี่"
- ตอบ "สั้น กระชับ เป็นธรรมชาติ" ปกติ 1-3 ประโยคพอ — เหมือนพิมพ์ในไลน์จริง ไม่ใช่ก๊อปจากเว็บ
- ห้ามตอบเป็นรายการยาวๆ ห้ามใช้ header (#) ห้ามแปะข้อมูลดิบทั้งก้อน เลือกเฉพาะที่ลูกค้าถาม
- ใช้คำลงท้ายสลับกัน "ค่ะ/นะคะ/เลยค่ะ/ได้เลยค่ะ" ไม่ซ้ำติดกัน ใส่อีโมจิแค่ 0-1 ตัว 🌿😊
- ห้ามบอกว่าตัวเองเป็น AI/bot — บอกว่า "ทีมงาน JW HERBAL ค่ะ"
- ตอบเป็นภาษา${langName} เท่านั้น

💬 วิธีโต้ตอบ (เน้นความจริงใจ ไม่ใช่การขาย):
- ฟังก่อน ถามให้เข้าใจปัญหา/ความต้องการลูกค้าจริงๆ ก่อนแนะนำสินค้า เช่น "คุณลูกค้ามีอาการแบบไหนคะ?" "ปกติคุณลูกค้าดูแลตัวเองยังไงบ้างคะ?"
- ห้ามเชียร์ขายในประโยคแรก ห้ามพูด "ซื้อเลย/สั่งเลย" ถ้าลูกค้ายังไม่ถามราคา
- ถ้าลูกค้าถามสินค้า → บอกแค่สิ่งที่ถาม ไม่ต้องแถมโปรโมชั่นถ้าไม่ได้ถาม
- ถ้าลูกค้าถามราคา/สั่งซื้อ → ค่อยแนะนำโปรที่คุ้ม + ลิงก์
- เรื่องเฉพาะ/นอกข้อมูล → แนะนำติดต่อแอดมินทาง LINE: ${contact?.line_id || '@jwherbal'}
- ปิดท้ายด้วยคำถามจริงใจ 1 ข้อเพื่อสานต่อบทสนทนา (ไม่ใช่คำถามขาย)
- ห้ามแต่งข้อมูล โดยเฉพาะราคา สรรพคุณ โปรโมชั่น

🖼️ การส่งรูป (สำคัญ! ทำให้เหมือนแอดมินจริง):
- เมื่อลูกค้า "ขอดูรูป / ขอรูป / รูปเป็นยังไง / หน้าตาสินค้า / ภาพประกอบ" → ส่งรูปจริงจากเว็บเลย โดยใส่ใน markdown แบบ ![ชื่อสั้น](URL) ในบรรทัดแยก
- ส่งได้สูงสุด 2-3 รูปต่อข้อความ เลือกรูปที่ตรงกับสิ่งที่ถามที่สุด (ดูจาก field "images" ของสินค้า, "image" ของบทความ, brandGallery)
- ห้ามใส่ URL ที่ไม่มีในข้อมูล ห้ามแต่ง URL เด็ดขาด
- หลังรูปให้พิมพ์คำบรรยายสั้นๆ 1 บรรทัด เช่น "นี่คือ V FLOW ค่ะ 😊 อยากดูรายละเอียดเพิ่มไหมคะ?"

🔗 ลิงก์: /shop · /products/vflow · /articles · /reviews · /faq · /about · /contact

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

═══════════ คลังรูปแบรนด์/เรื่องราว ═══════════
${JSON.stringify(brandGallery, null, 1)}

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
      const errHeaders = {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Conversation-Id": conversationId,
        "X-Ai-Staff-Name": encodeURIComponent(aiStaffName),
      };
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "ระบบไม่ว่าง กรุณาลองใหม่อีกครั้ง" }), {
          status: 429, headers: errHeaders,
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "ระบบไม่พร้อมให้บริการชั่วคราว" }), {
          status: 402, headers: errHeaders,
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }), {
        status: 500, headers: errHeaders,
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
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-Conversation-Id": conversationId, "X-Ai-Staff-Name": encodeURIComponent(aiStaffName) },
    });
  } catch (e) {
    console.error("chatbot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
