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

    // --- Server-side price integrity check ---
    // Never trust the client-supplied order.total_amount or order_items.price.
    // Build the set of legitimate per-line prices straight from the DB:
    //  - products.price (base catalogue price)
    //  - promotion_tiers.price (bulk/package prices)
    // and verify every order line matches one of them, then recompute the total
    // ourselves (subtotal minus the active Hardsell promotion discount).
    const [{ data: products }, { data: tiers }, { data: promoRow }] =
      await Promise.all([
        supabase.from("products").select("price"),
        supabase.from("promotion_tiers").select("price").eq("is_active", true),
        supabase
          .from("popup_settings")
          .select("promo_enabled, promo_threshold, promo_discount")
          .eq("id", "00000000-0000-0000-0000-000000000001")
          .maybeSingle(),
      ]);

    const allowedPrices = new Set<number>();
    for (const p of products ?? []) allowedPrices.add(Math.round(Number(p.price) * 100));
    for (const t of tiers ?? []) allowedPrices.add(Math.round(Number(t.price) * 100));

    const lines = orderItems ?? [];
    if (lines.length === 0) {
      return new Response(JSON.stringify({ error: "Order has no items" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let subtotalSatang = 0;
    for (const item of lines) {
      const lineSatang = Math.round(Number(item.price) * 100);
      const qty = Number(item.quantity);
      if (!Number.isFinite(lineSatang) || lineSatang <= 0 || !Number.isInteger(qty) || qty <= 0) {
        return new Response(JSON.stringify({ error: "Invalid order line" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      if (!allowedPrices.has(lineSatang)) {
        console.error("Price mismatch on order", order_id, "line price", item.price);
        return new Response(
          JSON.stringify({ error: "Order pricing failed validation" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        );
      }
      subtotalSatang += lineSatang * qty;
    }

    // Apply the authoritative Hardsell promotion discount (server-side config).
    const promoEnabled = (promoRow as any)?.promo_enabled ?? true;
    const promoThresholdSatang = Math.round(Number((promoRow as any)?.promo_threshold ?? 2000) * 100);
    const promoDiscountSatang = Math.round(Number((promoRow as any)?.promo_discount ?? 50) * 100);
    const discountSatang =
      promoEnabled && promoDiscountSatang > 0 && subtotalSatang >= promoThresholdSatang
        ? promoDiscountSatang
        : 0;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // THB uses satang (1/100). Stripe expects the amount in the smallest currency unit.
    const amountSatang = Math.max(0, subtotalSatang - discountSatang);
    if (amountSatang <= 0) {
      return new Response(JSON.stringify({ error: "Invalid order total" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Persist the authoritative total so downstream records can't show a forged amount.
    const recomputedTotal = amountSatang / 100;
    if (Math.round(Number(order.total_amount) * 100) !== amountSatang) {
      await supabase.from("orders").update({ total_amount: recomputedTotal }).eq("id", order_id);
    }

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
