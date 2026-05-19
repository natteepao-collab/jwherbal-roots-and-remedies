import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ANALYSIS_TOOL = {
  type: "function",
  function: {
    name: "save_chat_analysis",
    description: "บันทึกผลการวิเคราะห์บทสนทนาแชทเพื่อนำไปทำการตลาด",
    parameters: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          description: "ความต้องการหลักของลูกค้า",
          enum: ["inquiry", "purchase_intent", "ready_to_buy", "complaint", "support", "browsing", "other"],
        },
        sentiment: {
          type: "string",
          enum: ["positive", "neutral", "negative"],
        },
        lead_score: {
          type: "integer",
          minimum: 0,
          maximum: 100,
          description: "คะแนนโอกาสปิดการขาย 0-100 (พิจารณาจากความสนใจ คำถามเฉพาะเจาะจง การถามราคา การให้ข้อมูลติดต่อ)",
        },
        topics: {
          type: "array",
          items: { type: "string" },
          description: "หัวข้อที่พูดคุย เช่น 'อาการเส้นเลือดขอด', 'วิธีดื่ม V Flow', 'โปรโมชั่น'",
        },
        products_mentioned: {
          type: "array",
          items: { type: "string" },
          description: "ชื่อสินค้าที่ลูกค้าถาม/สนใจ",
        },
        summary: {
          type: "string",
          description: "สรุปบทสนทนาเป็นภาษาไทยแบบกระชับ 2-4 ประโยค เน้นสิ่งที่ลูกค้าต้องการและสิ่งที่ตอบไป",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "แท็กสำหรับ segment การตลาด เช่น 'hot-lead', 'price-sensitive', 'first-time', 'returning'",
        },
        customer_name: { type: "string", description: "ชื่อลูกค้าถ้ามีบอกในแชท (ไม่มีให้เว้นว่าง)" },
        customer_phone: { type: "string", description: "เบอร์โทรลูกค้าถ้ามีบอกในแชท" },
        customer_email: { type: "string", description: "อีเมลลูกค้าถ้ามีบอกในแชท" },
        customer_line: { type: "string", description: "ไลน์ไอดีลูกค้าถ้ามีบอกในแชท" },
      },
      required: ["intent", "sentiment", "lead_score", "topics", "products_mentioned", "summary", "tags"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { conversationId, conversationIds } = await req.json();
    const ids: string[] = conversationIds || (conversationId ? [conversationId] : []);
    if (!ids.length) {
      return new Response(JSON.stringify({ error: "conversationId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const results: any[] = [];

    for (const id of ids) {
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (!msgs || msgs.length === 0) {
        results.push({ id, skipped: true, reason: "no messages" });
        continue;
      }

      const transcript = msgs
        .map((m: any) => `[${m.role === "user" ? "ลูกค้า" : "แอดมิน"}]: ${m.content}`)
        .join("\n");

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "คุณคือนักวิเคราะห์การตลาดให้แบรนด์ JW HERBAL วิเคราะห์บทสนทนาระหว่างลูกค้ากับแอดมินเพื่อสกัดข้อมูลทำการตลาดต่อ ตอบเป็นภาษาไทยและเรียก tool save_chat_analysis เท่านั้น",
            },
            { role: "user", content: `วิเคราะห์บทสนทนานี้:\n\n${transcript}` },
          ],
          tools: [ANALYSIS_TOOL],
          tool_choice: { type: "function", function: { name: "save_chat_analysis" } },
        }),
      });

      if (!aiResp.ok) {
        const txt = await aiResp.text();
        console.error("AI gateway error for", id, aiResp.status, txt);
        results.push({ id, error: `AI ${aiResp.status}` });
        continue;
      }

      const aiJson = await aiResp.json();
      const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        results.push({ id, error: "no tool call" });
        continue;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        results.push({ id, error: "parse failed" });
        continue;
      }

      const update: Record<string, any> = {
        intent: parsed.intent,
        sentiment: parsed.sentiment,
        lead_score: parsed.lead_score,
        topics: parsed.topics || [],
        products_mentioned: parsed.products_mentioned || [],
        summary: parsed.summary,
        tags: parsed.tags || [],
        analyzed_at: new Date().toISOString(),
      };
      if (parsed.customer_name) update.customer_name = parsed.customer_name;
      if (parsed.customer_phone) update.customer_phone = parsed.customer_phone;
      if (parsed.customer_email) update.customer_email = parsed.customer_email;
      if (parsed.customer_line) update.customer_line = parsed.customer_line;

      const { error: upErr } = await supabase
        .from("chat_conversations")
        .update(update)
        .eq("id", id);

      if (upErr) {
        results.push({ id, error: upErr.message });
      } else {
        results.push({ id, ok: true, analysis: parsed });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
