import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const isUuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { questionId } = body ?? {};

    // Only accept a UUID — render content from DB, never from request body.
    if (!isUuid(questionId)) {
      return new Response(
        JSON.stringify({ error: "Invalid questionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: row, error } = await supabase
      .from("user_questions")
      .select("id, question, email")
      .eq("id", questionId)
      .maybeSingle();

    if (error || !row) {
      return new Response(
        JSON.stringify({ error: "Question not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const question = String(row.question ?? "").slice(0, 2000);
    const email = String(row.email ?? "").slice(0, 320);

    // LINE
    const lineNotifyToken = Deno.env.get("LINE_NOTIFY_TOKEN");
    if (lineNotifyToken) {
      const message = `\n🆕 คำถามใหม่จากลูกค้า!\n\n📧 Email: ${email || "ไม่ระบุ"}\n❓ คำถาม: ${question}\n\n📅 เวลา: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`;
      const lineResponse = await fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${lineNotifyToken}`,
        },
        body: `message=${encodeURIComponent(message)}`,
      });
      await lineResponse.text();
    }

    // Email — fully HTML-escaped values
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL");

    if (resendApiKey && adminEmail) {
      const html = `
        <div style="font-family: 'Sarabun', Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">🆕 คำถามใหม่จากลูกค้า</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>📧 Email:</strong> ${escapeHtml(email || "ไม่ระบุ")}</p>
            <p style="margin: 0;"><strong>❓ คำถาม:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px; margin: 10px 0 0 0; white-space: pre-wrap;">${escapeHtml(question)}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            📅 เวลา: ${escapeHtml(new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }))}
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            ตอบกลับคำถามนี้ได้ที่หน้า Admin Dashboard
          </p>
        </div>
      `;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "JWHERBAL FAQ <noreply@resend.dev>",
          to: [adminEmail],
          subject: "🆕 คำถามใหม่จากลูกค้า - JWHERBAL",
          html,
        }),
      });
      await emailResponse.text();
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Error in notify-new-question:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
