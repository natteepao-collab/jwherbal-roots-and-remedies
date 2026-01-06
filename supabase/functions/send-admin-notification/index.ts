import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "new_order" | "new_review";
  data: {
    order_id?: string;
    customer_name?: string;
    total_amount?: number;
    review_id?: string;
    author_name?: string;
    rating?: number;
    comment?: string;
  };
}

const sendLineMessage = async (message: string) => {
  const channelAccessToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
  const userId = Deno.env.get("LINE_USER_ID");
  
  if (!channelAccessToken) {
    console.log("LINE_CHANNEL_ACCESS_TOKEN not set, skipping LINE notification");
    return;
  }
  
  if (!userId) {
    console.log("LINE_USER_ID not set, skipping LINE notification");
    return;
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${channelAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LINE Messaging API error:", response.status, errorText);
      throw new Error(`LINE API error: ${response.status} - ${errorText}`);
    }

    console.log("LINE message sent successfully");
    return { success: true };
  } catch (error) {
    console.error("LINE Messaging error:", error);
    throw error;
  }
};

const sendEmailNotify = async (subject: string, htmlContent: string) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_EMAIL");
  
  if (!apiKey) {
    console.log("RESEND_API_KEY not set, skipping email notification");
    return;
  }
  
  if (!adminEmail) {
    console.log("ADMIN_EMAIL not set, skipping email notification");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "JWHERBAL <onboarding@resend.dev>",
        to: [adminEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    const result = await response.json();
    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: NotificationRequest = await req.json();
    console.log("Received notification request:", { type, data });

    let lineMessage = "";
    let emailSubject = "";
    let emailHtml = "";

    if (type === "new_order") {
      lineMessage = `
🛒 คำสั่งซื้อใหม่!
📦 หมายเลข: ${data.order_id?.slice(0, 8).toUpperCase()}
👤 ลูกค้า: ${data.customer_name}
💰 ยอดรวม: ฿${data.total_amount?.toLocaleString()}
📅 เวลา: ${new Date().toLocaleString("th-TH")}
      `.trim();

      emailSubject = `🛒 คำสั่งซื้อใหม่ - ${data.order_id?.slice(0, 8).toUpperCase()}`;
      emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">🛒 คำสั่งซื้อใหม่!</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p><strong>หมายเลขคำสั่งซื้อ:</strong> ${data.order_id?.slice(0, 8).toUpperCase()}</p>
            <p><strong>ลูกค้า:</strong> ${data.customer_name}</p>
            <p><strong>ยอดรวม:</strong> <span style="color: #16a34a; font-size: 24px;">฿${data.total_amount?.toLocaleString()}</span></p>
            <p><strong>เวลา:</strong> ${new Date().toLocaleString("th-TH")}</p>
          </div>
          <p style="margin-top: 20px;">
            <a href="https://guauobzuxgvkluxwfvxt.lovableproject.com/admin/dashboard/orders" 
               style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              ดูคำสั่งซื้อ
            </a>
          </p>
        </div>
      `;
    } else if (type === "new_review") {
      const stars = "⭐".repeat(data.rating || 5);
      lineMessage = `
📝 รีวิวใหม่รอตรวจสอบ!
👤 ผู้รีวิว: ${data.author_name}
${stars}
💬 "${data.comment?.slice(0, 50)}${(data.comment?.length || 0) > 50 ? "..." : ""}"
📅 เวลา: ${new Date().toLocaleString("th-TH")}
      `.trim();

      emailSubject = `📝 รีวิวใหม่รอตรวจสอบ - ${data.author_name}`;
      emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">📝 รีวิวใหม่รอตรวจสอบ!</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p><strong>ผู้รีวิว:</strong> ${data.author_name}</p>
            <p><strong>คะแนน:</strong> ${"⭐".repeat(data.rating || 5)}</p>
            <p><strong>ความคิดเห็น:</strong></p>
            <blockquote style="border-left: 4px solid #f59e0b; padding-left: 16px; margin: 16px 0; color: #374151;">
              ${data.comment}
            </blockquote>
            <p><strong>เวลา:</strong> ${new Date().toLocaleString("th-TH")}</p>
          </div>
          <p style="margin-top: 20px;">
            <a href="https://guauobzuxgvkluxwfvxt.lovableproject.com/admin/dashboard/reviews" 
               style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              ตรวจสอบรีวิว
            </a>
          </p>
        </div>
      `;
    }

    // Send notifications in parallel
    const results = await Promise.allSettled([
      sendLineMessage(lineMessage),
      sendEmailNotify(emailSubject, emailHtml),
    ]);

    console.log("Notification results:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notifications sent",
        results: results.map((r, i) => ({
          channel: i === 0 ? "line" : "email",
          status: r.status,
          value: r.status === "fulfilled" ? r.value : undefined,
          reason: r.status === "rejected" ? String(r.reason) : undefined,
        }))
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
