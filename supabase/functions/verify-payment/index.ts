import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const sendLineCardPaymentNotify = async (order: {
  id: string;
  customer_name?: string | null;
  total_amount?: number | null;
}) => {
  const channelAccessToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
  const userId = Deno.env.get("LINE_USER_ID");
  if (!channelAccessToken || !userId) {
    console.log("LINE config missing, skipping LINE notification");
    return;
  }

  const orderIdShort = order.id.slice(0, 8).toUpperCase();
  const total = Number(order.total_amount ?? 0).toLocaleString();
  const message = `💳 ชำระเงินผ่านบัตรเครดิตสำเร็จ!
📦 หมายเลข: ${orderIdShort}
👤 ลูกค้า: ${order.customer_name || "-"}
💰 ยอดรวม: ฿${total}
📅 เวลา: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`;

  const messages = [
    { type: "text", text: message },
    {
      type: "template",
      altText: "เปิดหน้ารายละเอียดคำสั่งซื้อ",
      template: {
        type: "buttons",
        text: "กดปุ่มด้านล่างเพื่อเปิดหน้ารายละเอียดคำสั่งซื้อ",
        actions: [
          {
            type: "uri",
            label: "เปิดรายละเอียดคำสั่งซื้อ",
            uri: "https://jwherbal-roots-and-remedies.lovable.app/admin/dashboard/orders",
          },
        ],
      },
    },
  ];

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: userId, messages }),
    });
    if (!response.ok) {
      console.error("LINE API error:", response.status, await response.text());
    }
  } catch (e) {
    console.error("Failed to send LINE notification:", e);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id || typeof session_id !== "string") {
      return new Response(JSON.stringify({ error: "session_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === "paid";
    const orderId = session.metadata?.order_id;

    if (paid && orderId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );

      // Only notify on the first transition to paid (avoid duplicate LINE
      // notifications when the success page is reloaded / re-verified).
      const { data: current } = await supabase
        .from("orders")
        .select("id, customer_name, total_amount, payment_status")
        .eq("id", orderId)
        .maybeSingle();

      if (current && current.payment_status !== "paid") {
        await supabase
          .from("orders")
          .update({ payment_status: "paid", status: "paid" })
          .eq("id", orderId);

        await sendLineCardPaymentNotify(current);
      }
    }

    return new Response(
      JSON.stringify({ paid, order_id: orderId ?? null }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
