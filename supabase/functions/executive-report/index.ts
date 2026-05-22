import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  period: "week" | "month" | "year";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { period = "month" } = (await req.json()) as ReqBody;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    const since = new Date(now);
    if (period === "week") since.setDate(since.getDate() - 7);
    else if (period === "month") since.setMonth(since.getMonth() - 1);
    else since.setFullYear(since.getFullYear() - 1);
    const sinceISO = since.toISOString();

    // Fetch data in parallel
    const [ordersRes, viewsRes, chatsRes, articlesRes, productsRes, usersRes, postsRes] =
      await Promise.all([
        supabase.from("orders").select("id,total_amount,status,payment_status,created_at,customer_name").gte("created_at", sinceISO),
        supabase.from("page_views").select("id,path,referrer,country,session_id,created_at").gte("created_at", sinceISO).limit(5000),
        supabase.from("chat_conversations").select("id,started_at,last_message_at,message_count,admin_takeover,sentiment,intent,language").gte("started_at", sinceISO),
        supabase.from("articles").select("id,title_th,created_at,likes").gte("created_at", sinceISO),
        supabase.from("products").select("id,name_th,price,stock,is_active"),
        supabase.from("profiles").select("id,created_at").gte("created_at", sinceISO),
        supabase.from("community_posts").select("id,title_th,views,comments_count,created_at").gte("created_at", sinceISO),
      ]);

    const orders = ordersRes.data || [];
    const views = viewsRes.data || [];
    const chats = chatsRes.data || [];
    const articles = articlesRes.data || [];
    const products = productsRes.data || [];
    const users = usersRes.data || [];
    const posts = postsRes.data || [];

    // Aggregates
    const activeOrders = orders.filter((o: any) => o.status !== "cancelled");
    const totalRevenue = activeOrders.reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0);
    const uniqueSessions = new Set(views.map((v: any) => v.session_id).filter(Boolean)).size;
    const afterHoursChats = chats.filter((c: any) => {
      const h = new Date(c.started_at).getHours();
      return h >= 0 && h < 6;
    }).length;
    const aiHandled = chats.filter((c: any) => !c.admin_takeover).length;
    const aiSuccessRate = chats.length ? Math.round((aiHandled / chats.length) * 100) : 100;

    // Top pages
    const pageCount: Record<string, number> = {};
    views.forEach((v: any) => { pageCount[v.path] = (pageCount[v.path] || 0) + 1; });
    const topPages = Object.entries(pageCount).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Traffic sources
    const srcCount: Record<string, number> = {};
    views.forEach((v: any) => {
      const ref = v.referrer ? new URL(v.referrer).hostname.replace("www.", "") : "Direct";
      srcCount[ref] = (srcCount[ref] || 0) + 1;
    });
    const sources = Object.entries(srcCount).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([source, count]) => ({ source, count }));

    // Daily series
    const dayBuckets: Record<string, { revenue: number; orders: number; views: number; chats: number }> = {};
    const initDay = (d: string) => (dayBuckets[d] ||= { revenue: 0, orders: 0, views: 0, chats: 0 });
    activeOrders.forEach((o: any) => {
      const d = o.created_at.slice(0, 10);
      initDay(d).revenue += Number(o.total_amount || 0);
      dayBuckets[d].orders += 1;
    });
    views.forEach((v: any) => { initDay(v.created_at.slice(0, 10)).views += 1; });
    chats.forEach((c: any) => { initDay(c.started_at.slice(0, 10)).chats += 1; });
    const timeseries = Object.entries(dayBuckets).sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    const metrics = {
      period,
      sinceISO,
      revenue: totalRevenue,
      orders: activeOrders.length,
      pageViews: views.length,
      uniqueVisitors: uniqueSessions,
      conversionRate: uniqueSessions ? +((activeOrders.length / uniqueSessions) * 100).toFixed(2) : 0,
      avgOrderValue: activeOrders.length ? Math.round(totalRevenue / activeOrders.length) : 0,
      chats: chats.length,
      afterHoursChats,
      aiHandled,
      aiSuccessRate,
      newArticles: articles.length,
      hoursSavedByAi: articles.length * 2,
      newUsers: users.length,
      newCommunityPosts: posts.length,
      activeProducts: products.filter((p: any) => p.is_active).length,
      topPages,
      sources,
      timeseries,
    };

    // AI analysis via Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiSummary = "";
    if (LOVABLE_API_KEY) {
      const periodLabel = period === "week" ? "7 วันที่ผ่านมา" : period === "month" ? "30 วันที่ผ่านมา" : "365 วันที่ผ่านมา";
      const prompt = `คุณคือที่ปรึกษาทางธุรกิจระดับผู้บริหาร วิเคราะห์ข้อมูลเว็บไซต์ JWHERBAL ในช่วง ${periodLabel} แล้วเขียนรายงานสรุปสำหรับผู้บริหารเป็นภาษาไทย ใช้รูปแบบ Markdown ที่กระชับ ชัดเจน อ่านง่าย แบ่งเป็นหัวข้อ:

## 📊 ภาพรวมเชิงกลยุทธ์
สรุป 2-3 ประโยคถึงสถานะธุรกิจ

## ✨ ไฮไลต์สำคัญ
3-5 bullet ที่ผู้บริหารต้องรู้ (ใช้ตัวเลขจริง)

## 📈 จุดแข็ง & โอกาส
สิ่งที่ทำได้ดี และโอกาสเติบโต

## ⚠️ ความเสี่ยง & สิ่งที่ต้องระวัง
ข้อสังเกตที่ต้องจัดการ

## 🎯 ข้อเสนอแนะเชิงปฏิบัติ
3-5 action items ที่ทำได้ทันที

ข้อมูลจริง:
${JSON.stringify(metrics, null, 2)}`;

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: "คุณเป็นที่ปรึกษาทางธุรกิจที่เขียนรายงานผู้บริหารด้วยภาษาไทยที่กระชับ ตรงประเด็น และมีข้อมูลตัวเลขรองรับเสมอ" },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        aiSummary = data.choices?.[0]?.message?.content || "";
      } else if (aiRes.status === 429) {
        aiSummary = "⚠️ ระบบ AI กำลังถูกใช้งานหนัก กรุณาลองอีกครั้งในอีกสักครู่";
      } else if (aiRes.status === 402) {
        aiSummary = "⚠️ เครดิต AI หมด กรุณาเติมเครดิตที่ Settings > Workspace > Usage";
      } else {
        aiSummary = `⚠️ ไม่สามารถสร้างรายงาน AI ได้ (${aiRes.status})`;
      }
    }

    return new Response(JSON.stringify({ metrics, aiSummary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("executive-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
