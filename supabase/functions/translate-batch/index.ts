import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANG_NAME: Record<string, string> = {
  en: "English",
  zh: "Simplified Chinese",
  ja: "Japanese",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { texts, targetLang } = await req.json();
    if (!Array.isArray(texts) || !LANG_NAME[targetLang]) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const target = LANG_NAME[targetLang];
    const numbered = texts.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n");

    const sys = `You are a professional UI translator for a Thai herbal e-commerce website (JWHERBAL).
Translate each numbered Thai text to natural ${target}.
Rules:
- Preserve numbering exactly: "1. ...", "2. ..." on separate lines.
- Keep brand names "JW HERBAL" and "V FLOW" unchanged (with the space).
- Keep emojis, URLs, numbers, currency, and HTML/markdown intact.
- Do NOT add explanations. Output ONLY the numbered translations.
- Translation must be concise and natural for UI labels/buttons/short copy.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: numbered },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      return new Response(JSON.stringify({ error: "Translation failed", status: res.status }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content || "";

    // Parse "N. ..." lines back into ordered translations
    const map = new Map<number, string>();
    const lines = content.split("\n");
    let current = -1;
    let buf = "";
    const flush = () => { if (current > 0) map.set(current, buf.trim()); };
    for (const line of lines) {
      const m = line.match(/^\s*(\d+)\.\s?(.*)$/);
      if (m) {
        flush();
        current = parseInt(m[1], 10);
        buf = m[2];
      } else if (current > 0) {
        buf += "\n" + line;
      }
    }
    flush();

    const translations = texts.map((_: string, i: number) => map.get(i + 1) ?? texts[i]);

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate-batch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
