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
    review_id?: string;
    slip_url?: string;
    cancelled_by?: string;
    reason?: string;
  };
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Escape any value that gets interpolated into HTML to prevent injection
const escapeHtml = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// Only allow https URLs for slip preview to avoid javascript: / data: injection
const safeSlipUrl = (url: unknown): string | null => {
  if (typeof url !== "string") return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
};

const isUuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

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
    console.log("Notification request:", { type, ref: data?.order_id ?? data?.review_id, force });

    // ---- Validation ----
    const allowedTypes = new Set([
      "new_order",
      "new_review",
      "slip_uploaded",
      "order_cancelled",
    ]);
    if (!allowedTypes.has(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid notification type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ---- Resolve trusted data from DB (never trust client-supplied content) ----
    // This closes both the spam-with-arbitrary-content vector and HTML injection,
    // since we only render values that exist in our own database.
    let trusted: {
      orderIdShort?: string;
      orderId?: string;
      customerName?: string;
      totalAmount?: number;
      reviewId?: string;
      authorName?: string;
      rating?: number;
      comment?: string;
      slipSignedUrl?: string | null;
      cancelledBy?: string;
    } = {};

    if (type === "new_order" || type === "slip_uploaded" || type === "order_cancelled") {
      if (!isUuid(data?.order_id)) {
        return new Response(
          JSON.stringify({ error: "Invalid order_id" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      const { data: order, error } = await supabase
        .from("orders")
        .select("id, customer_name, total_amount, payment_slip_url")
        .eq("id", data.order_id!)
        .maybeSingle();
      if (error || !order) {
        return new Response(
          JSON.stringify({ error: "Order not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      trusted.orderId = order.id;
      trusted.orderIdShort = order.id.slice(0, 8).toUpperCase();
      trusted.customerName = order.customer_name ?? "";
      trusted.totalAmount = Number(order.total_amount ?? 0);

      if (type === "slip_uploaded" && order.payment_slip_url) {
        // Generate a fresh signed URL server-side rather than trusting the client
        const path = order.payment_slip_url;
        if (!/^https?:\/\//i.test(path)) {
          const { data: signed } = await supabase.storage
            .from("payment-slips")
            .createSignedUrl(path, 60 * 60 * 24 * 7);
          trusted.slipSignedUrl = signed?.signedUrl ?? null;
        }
      }

      if (type === "order_cancelled") {
        // cancelled_by is metadata only — sanitize to a short string, no HTML
        const cb = typeof data?.cancelled_by === "string" ? data.cancelled_by : "Admin";
        trusted.cancelledBy = cb.slice(0, 60);
      }
    } else if (type === "new_review") {
      if (!isUuid(data?.review_id)) {
        return new Response(
          JSON.stringify({ error: "Invalid review_id" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      const { data: review, error } = await supabase
        .from("reviews")
        .select("id, author_name, rating, comment")
        .eq("id", data.review_id!)
        .maybeSingle();
      if (error || !review) {
        return new Response(
          JSON.stringify({ error: "Review not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      trusted.reviewId = review.id;
      trusted.authorName = review.author_name ?? "";
      trusted.rating = Number(review.rating ?? 5);
      trusted.comment = review.comment ?? "";
    }

    // ---- Dedupe (60s) ----
    const dedupeKey = `${type}:${trusted.orderId ?? trusted.reviewId ?? ""}:${trusted.slipSignedUrl ? "slip" : ""}`;
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
        reference_id: trusted.orderId ?? trusted.reviewId,
        reference_type: type,
        dedupe_key: dedupeKey,
      });
      return new Response(
        JSON.stringify({ success: true, deduped: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ---- Build messages from trusted data, all HTML-escaped ----
    let lineMessage = "";
    let emailSubject = "";
    let emailHtml = "";
    let deepLink: string | undefined;

    if (type === "new_order") {
      deepLink = ADMIN_ORDER_URL;
      lineMessage = `🛒 คำสั่งซื้อใหม่!
📦 หมายเลข: ${trusted.orderIdShort}
👤 ลูกค้า: ${trusted.customerName}
💰 ยอดรวม: ฿${trusted.totalAmount?.toLocaleString()}
📅 เวลา: ${new Date().toLocaleString("th-TH")}`;
      emailSubject = `🛒 คำสั่งซื้อใหม่ - ${trusted.orderIdShort}`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#16a34a;">🛒 คำสั่งซื้อใหม่!</h1>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;">
          <p><strong>หมายเลข:</strong> ${escapeHtml(trusted.orderIdShort)}</p>
          <p><strong>ลูกค้า:</strong> ${escapeHtml(trusted.customerName)}</p>
          <p><strong>ยอดรวม:</strong> ฿${escapeHtml(trusted.totalAmount?.toLocaleString())}</p>
        </div>
        <p style="margin-top:20px;"><a href="${deepLink}" style="background:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">ดูคำสั่งซื้อ</a></p>
      </div>`;
    } else if (type === "new_review") {
      deepLink = ADMIN_REVIEW_URL;
      const stars = "⭐".repeat(Math.max(0, Math.min(5, trusted.rating ?? 5)));
      const commentPreview = (trusted.comment ?? "").slice(0, 50);
      const commentEllipsis = (trusted.comment?.length || 0) > 50 ? "..." : "";
      lineMessage = `📝 รีวิวใหม่รอตรวจสอบ!
👤 ${trusted.authorName}
${stars}
💬 "${commentPreview}${commentEllipsis}"`;
      emailSubject = `📝 รีวิวใหม่รอตรวจสอบ - ${trusted.authorName}`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#f59e0b;">📝 รีวิวใหม่รอตรวจสอบ!</h1>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;">
          <p><strong>ผู้รีวิว:</strong> ${escapeHtml(trusted.authorName)}</p>
          <p><strong>คะแนน:</strong> ${escapeHtml(stars)}</p>
          <blockquote style="border-left:4px solid #f59e0b;padding-left:16px;">${escapeHtml(trusted.comment)}</blockquote>
        </div>
        <p style="margin-top:20px;"><a href="${deepLink}" style="background:#f59e0b;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">ตรวจสอบรีวิว</a></p>
      </div>`;
    } else if (type === "slip_uploaded") {
      deepLink = ADMIN_ORDER_URL;
      const slipUrlSafe = safeSlipUrl(trusted.slipSignedUrl);
      lineMessage = `💸 มีการอัปโหลดสลิปใหม่!
📦 หมายเลข: ${trusted.orderIdShort}
👤 ลูกค้า: ${trusted.customerName || "-"}
💰 ยอดรวม: ฿${trusted.totalAmount?.toLocaleString() ?? "-"}
📅 เวลา: ${new Date().toLocaleString("th-TH")}
🔗 สลิป: ${slipUrlSafe ?? "-"}`;
      emailSubject = `💸 ลูกค้าอัปโหลดสลิป - ${trusted.orderIdShort}`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#2563eb;">💸 ลูกค้าอัปโหลดสลิปการชำระเงิน</h1>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;">
          <p><strong>หมายเลข:</strong> ${escapeHtml(trusted.orderIdShort)}</p>
          <p><strong>ลูกค้า:</strong> ${escapeHtml(trusted.customerName || "-")}</p>
          <p><strong>ยอดรวม:</strong> ฿${escapeHtml(trusted.totalAmount?.toLocaleString() ?? "-")}</p>
          ${slipUrlSafe ? `<p><strong>สลิป:</strong></p><img src="${escapeHtml(slipUrlSafe)}" alt="payment slip" style="max-width:100%;border-radius:8px;border:1px solid #e5e7eb;" />` : ""}
        </div>
        <p style="margin-top:20px;"><a href="${deepLink}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">ตรวจสอบสลิป</a></p>
      </div>`;
    } else if (type === "order_cancelled") {
      deepLink = ADMIN_ORDER_URL;
      lineMessage = `❌ คำสั่งซื้อถูกยกเลิก
📦 หมายเลข: ${trusted.orderIdShort}
👤 ลูกค้า: ${trusted.customerName || "-"}
💰 ยอดรวม: ฿${trusted.totalAmount?.toLocaleString() ?? "-"}
🛠 ยกเลิกโดย: ${trusted.cancelledBy ?? "Admin"}
📅 เวลา: ${new Date().toLocaleString("th-TH")}`;
      emailSubject = `❌ คำสั่งซื้อถูกยกเลิก - ${trusted.orderIdShort}`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#dc2626;">❌ คำสั่งซื้อถูกยกเลิก</h1>
        <div style="background:#fef2f2;padding:20px;border-radius:8px;border:1px solid #fecaca;">
          <p><strong>หมายเลข:</strong> ${escapeHtml(trusted.orderIdShort)}</p>
          <p><strong>ลูกค้า:</strong> ${escapeHtml(trusted.customerName || "-")}</p>
          <p><strong>ยอดรวม:</strong> ฿${escapeHtml(trusted.totalAmount?.toLocaleString() ?? "-")}</p>
          <p><strong>ยกเลิกโดย:</strong> ${escapeHtml(trusted.cancelledBy ?? "Admin")}</p>
        </div>
        <p style="margin-top:20px;"><a href="${deepLink}" style="background:#dc2626;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">ดูคำสั่งซื้อ</a></p>
      </div>`;
    }

    const refId = trusted.orderId ?? trusted.reviewId;

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
        error_message: emailRes.status === "rejected" ? String(emailRes.reason) : undefined,
      }),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        results: {
          line: { status: lineRes.status },
          email: { status: emailRes.status },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-admin-notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
