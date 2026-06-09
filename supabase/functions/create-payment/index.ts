import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (!order_id || typeof order_id !== "string") {
      return new Response(JSON.stringify({ error: "order_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Service-role client to read the authoritative order total (never trust the client amount).
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, customer_email, customer_name, total_amount")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_name, quantity, price")
      .eq("order_id", order_id);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const totalAmount = Number(order.total_amount) || 0;
    // THB uses satang (1/100). Stripe expects the amount in the smallest currency unit.
    const amountSatang = Math.round(totalAmount * 100);

    // Single dynamic line item so the Hardsell-discounted bill total is charged exactly.
    const itemSummary = (orderItems ?? [])
      .map((i) => `${i.product_name} x${i.quantity}`)
      .join(", ")
      .slice(0, 250);

    const customers = await stripe.customers.list({
      email: order.customer_email,
      limit: 1,
    });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const origin = req.headers.get("origin") || "";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : order.customer_email,
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: `คำสั่งซื้อ ${order.id.slice(0, 8).toUpperCase()}`,
              description: itemSummary || "JW HERBAL order",
            },
            unit_amount: amountSatang,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { order_id: order.id },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&order=${order.id}`,
      cancel_url: `${origin}/checkout`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
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
