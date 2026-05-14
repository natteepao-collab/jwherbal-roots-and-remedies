import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_ORDER_URL = "https://jwherbal-roots-and-remedies.lovable.app/admin/dashboard/orders";
const ADMIN_REVIEW_URL = "https://jwherbal-roots-and-remedies.lovable.app/admin/dashboard/reviews";

interface NotificationRequest {
  type: "new_order" | "new_review" | "slip_uploaded" | "order_cancelled";
  data: {
    order_id?: string;
    customer_name?: string;
    total_amount?: number;
    review_id?: string;
    author_name?: string;
    rating?: number;
    comment?: string;
    slip_url?: string;
    cancelled_by?: string;
    reason?: string;
  };
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const logNotification = async (entry: {
  notification_type: string;
  channel: string;
  status: string;
  reference_id?: string;
  reference_type?: string;
  dedupe_key?: string;
  payload?: any;
  error_message?: string;
}) => {
  try {
    await supabase.from("notification_logs").insert(entry as any);
  } catch (e) {
    console.error("Failed to write notification_logs:", e);
  }
};

const sendLineMessage = async (message: string, deepLinkUrl?: string) => {
  const channelAccessToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
  const userId = Deno.env.get("LINE_USER_ID");

  if (!channelAccessToken || !userId) {
    console.log("LINE config missing, skipping LINE notification");
    return { skipped: true };
  }

  const messages: any[] = [{ type: "text", text: message }];
  if (deepLinkUrl) {
    messages.push({
      type: "template",
      altText: "เปิดหน้ารายละเอียดคำสั่งซื้อ",
      template: {
        type: "buttons",
        text: "กดปุ่มด้านล่างเพื่อเปิดหน้ารายละเอียดคำสั่งซื้อทันที",
        actions: [
          { type: "uri", label: "เปิดรายละเอียดคำสั่งซื้อ", uri: deepLinkUrl },
        ],
      },
    });
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to: userId, messages }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LINE API ${response.status}: ${errorText}`);
  }
  return { success: true };
};

const sendEmailNotify = async (subject: string, htmlContent: string) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_EMAIL");

  if (!apiKey || !adminEmail) {
    console.log("Email config missing, skipping email");
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "JWHERBAL <onboarding@resend.dev>",
      to: [adminEmail],
      subject,
      html: htmlContent,
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(`Resend error: ${JSON.stringify(result)}`);
  return result;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, data, force }: NotificationRequest & { force?: boolean } = body;
    console.log("Notification request:", { type, data, force });

    // Dedupe: prevent same notification within 60s (skipped when force=true)
    const dedupeKey = `${type}:${data.order_id ?? data.review_id ?? ""}:${data.slip_url ?? ""}`;
    const sinceIso = new Date(Date.now() - 60_000).toISOString();
    const { data: recent } = !force
      ? await supabase
          .from("notification_logs")
          .select("id")
          .eq("dedupe_key", dedupeKey)
          .eq("status", "success")
          .gte("created_at", sinceIso)
          .limit(1)
      : { data: [] as any[] };

    if (!force && recent && recent.length > 0) {
      console.log("Duplicate notification suppressed:", dedupeKey);
      await logNotification({
        notification_type: type,
        channel: "system",
        status: "deduped",
        reference_id: data.order_id ?? data.review_id,
        reference_type: type,
        dedupe_key: dedupeKey,
        payload: data,
      });
      return new Response(
        JSON.stringify({ success: true, deduped: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let lineMessage = "";
    let emailSubject = "";
    let emailHtml = "";
    let deepLink: string | undefined;

    if (type === "new_order") {
      deepLink = ADMIN_ORDER_URL;
      lineMessage = `🛒 คำสั่งซื้อใหม่!
📦 หมายเลข: ${data.order_id?.slice(0, 8).toUpperCase()}
👤 ลูกค้า: ${data.customer_name}
💰 ยอดรวม: ฿${data.total_amount?.toLocaleString()}
📅 เวลา: ${new Date().toLocaleString("th-TH")}`;
      emailSubject = `🛒 คำสั่งซื้อใหม่ - ${data.order_id?.slice(0, 8).toUpperCase()}`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#16a34a;">🛒 คำสั่งซื้อใหม่!</h1>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;">
          <p><strong>หมายเลข:</strong> ${data.order_id?.slice(0, 8).toUpperCase()}</p>
          <p><strong>ลูกค้า:</strong> ${data.customer_name}</p>
          <p><strong>ยอดรวม:</strong> ฿${data.total_amount?.toLocaleString()}</p>
        </div>
        <p style="margin-top:20px;"><a href="${deepLink}" style="background:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">ดูคำสั่งซื้อ</a></p>
      </div>`;
    } else if (type === "new_review") {
      deepLink = ADMIN_REVIEW_URL;
      const stars = "⭐".repeat(data.rating || 5);
      lineMessage = `📝 รีวิวใหม่รอตรวจสอบ!
👤 ${data.author_name}
${stars}
💬 "${data.comment?.slice(0, 50)}${(data.comment?.length || 0) > 50 ? "..." : ""}"`;
      emailSubject = `📝 รีวิวใหม่รอตรวจสอบ - ${data.author_name}`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#f59e0b;">📝 รีวิวใหม่รอตรวจสอบ!</h1>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;">
          <p><strong>ผู้รีวิว:</strong> ${data.author_name}</p>
          <p><strong>คะแนน:</strong> ${stars}</p>
          <blockquote style="border-left:4px solid #f59e0b;padding-left:16px;">${data.comment}</blockquote>
        </div>
        <p style="margin-top:20px;"><a href="${deepLink}" style="background:#f59e0b;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">ตรวจสอบรีวิว</a></p>
      </div>`;
    } else if (type === "slip_uploaded") {
      deepLink = ADMIN_ORDER_URL;
      lineMessage = `💸 มีการอัปโหลดสลิปใหม่!
📦 หมายเลข: ${data.order_id?.slice(0, 8).toUpperCase()}
👤 ลูกค้า: ${data.customer_name ?? "-"}
💰 ยอดรวม: ฿${data.total_amount?.toLocaleString() ?? "-"}
📅 เวลา: ${new Date().toLocaleString("th-TH")}
🔗 สลิป: ${data.slip_url ?? "-"}`;
      emailSubject = `💸 ลูกค้าอัปโหลดสลิป - ${data.order_id?.slice(0, 8).toUpperCase()}`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#2563eb;">💸 ลูกค้าอัปโหลดสลิปการชำระเงิน</h1>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;">
          <p><strong>หมายเลข:</strong> ${data.order_id?.slice(0, 8).toUpperCase()}</p>
          <p><strong>ลูกค้า:</strong> ${data.customer_name ?? "-"}</p>
          <p><strong>ยอดรวม:</strong> ฿${data.total_amount?.toLocaleString() ?? "-"}</p>
          ${data.slip_url ? `<p><strong>สลิป:</strong></p><img src="${data.slip_url}" alt="payment slip" style="max-width:100%;border-radius:8px;border:1px solid #e5e7eb;" />` : ""}
        </div>
        <p style="margin-top:20px;"><a href="${deepLink}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">ตรวจสอบสลิป</a></p>
      </div>`;
    } else if (type === "order_cancelled") {
      deepLink = ADMIN_ORDER_URL;
      lineMessage = `❌ คำสั่งซื้อถูกยกเลิก
📦 หมายเลข: ${data.order_id?.slice(0, 8).toUpperCase()}
👤 ลูกค้า: ${data.customer_name ?? "-"}
💰 ยอดรวม: ฿${data.total_amount?.toLocaleString() ?? "-"}
🛠 ยกเลิกโดย: ${data.cancelled_by ?? "Admin"}
📅 เวลา: ${new Date().toLocaleString("th-TH")}`;
      emailSubject = `❌ คำสั่งซื้อถูกยกเลิก - ${data.order_id?.slice(0, 8).toUpperCase()}`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#dc2626;">❌ คำสั่งซื้อถูกยกเลิก</h1>
        <div style="background:#fef2f2;padding:20px;border-radius:8px;border:1px solid #fecaca;">
          <p><strong>หมายเลข:</strong> ${data.order_id?.slice(0, 8).toUpperCase()}</p>
          <p><strong>ลูกค้า:</strong> ${data.customer_name ?? "-"}</p>
          <p><strong>ยอดรวม:</strong> ฿${data.total_amount?.toLocaleString() ?? "-"}</p>
          <p><strong>ยกเลิกโดย:</strong> ${data.cancelled_by ?? "Admin"}</p>
        </div>
        <p style="margin-top:20px;"><a href="${deepLink}" style="background:#dc2626;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">ดูคำสั่งซื้อ</a></p>
      </div>`;
    }

    const refId = data.order_id ?? data.review_id;

    const [lineRes, emailRes] = await Promise.allSettled([
      sendLineMessage(lineMessage, deepLink),
      sendEmailNotify(emailSubject, emailHtml),
    ]);

    await Promise.all([
      logNotification({
        notification_type: type,
        channel: "line",
        status: lineRes.status === "fulfilled"
          ? ((lineRes.value as any)?.skipped ? "skipped" : "success")
          : "failed",
        reference_id: refId,
        reference_type: type,
        dedupe_key: dedupeKey,
        payload: { message: lineMessage, deepLink },
        error_message: lineRes.status === "rejected" ? String(lineRes.reason) : undefined,
      }),
      logNotification({
        notification_type: type,
        channel: "email",
        status: emailRes.status === "fulfilled"
          ? ((emailRes.value as any)?.skipped ? "skipped" : "success")
          : "failed",
        reference_id: refId,
        reference_type: type,
        dedupe_key: dedupeKey,
        payload: { subject: emailSubject },
        error_message: emailRes.status === "rejected" ? String(emailRes.reason) : undefined,
      }),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        results: {
          line: { status: lineRes.status, value: lineRes.status === "fulfilled" ? lineRes.value : undefined, error: lineRes.status === "rejected" ? String(lineRes.reason) : undefined },
          email: { status: emailRes.status, value: emailRes.status === "fulfilled" ? emailRes.value : undefined, error: emailRes.status === "rejected" ? String(emailRes.reason) : undefined },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-admin-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
