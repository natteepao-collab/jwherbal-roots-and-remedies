import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, email, questionId } = await req.json();

    console.log("Received new question notification request:", { question, email, questionId });

    // Send LINE Notify
    const lineNotifyToken = Deno.env.get("LINE_NOTIFY_TOKEN");
    
    if (lineNotifyToken) {
      const message = `\n🆕 คำถามใหม่จากลูกค้า!\n\n📧 Email: ${email || "ไม่ระบุ"}\n❓ คำถาม: ${question}\n\n📅 เวลา: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`;
      
      console.log("Sending LINE Notify...");
      
      const lineResponse = await fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${lineNotifyToken}`,
        },
        body: `message=${encodeURIComponent(message)}`,
      });

      const lineResult = await lineResponse.json();
      console.log("LINE Notify response:", lineResult);

      if (!lineResponse.ok) {
        console.error("LINE Notify failed:", lineResult);
      }
    } else {
      console.log("LINE_NOTIFY_TOKEN not configured, skipping LINE notification");
    }

    // Send email notification to admin
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL");

    if (resendApiKey && adminEmail) {
      console.log("Sending email notification to admin...");
      
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
          html: `
            <div style="font-family: 'Sarabun', Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">🆕 คำถามใหม่จากลูกค้า</h2>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>📧 Email:</strong> ${email || "ไม่ระบุ"}</p>
                <p style="margin: 0;"><strong>❓ คำถาม:</strong></p>
                <p style="background: white; padding: 15px; border-radius: 4px; margin: 10px 0 0 0;">${question}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                📅 เวลา: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px;">
                ตอบกลับคำถามนี้ได้ที่หน้า Admin Dashboard
              </p>
            </div>
          `,
        }),
      });

      const emailResult = await emailResponse.json();
      console.log("Email notification response:", emailResult);

      if (!emailResponse.ok) {
        console.error("Email notification failed:", emailResult);
      }
    } else {
      console.log("RESEND_API_KEY or ADMIN_EMAIL not configured, skipping email notification");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-new-question:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
