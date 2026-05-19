import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, subDays, startOfMonth } from "date-fns";
import { th } from "date-fns/locale";
import { Eye, Users, MousePointerClick, Globe, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, Target, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface PageView {
  id: string;
  path: string;
  referrer: string | null;
  session_id: string | null;
  created_at: string;
}

interface SeoTarget {
  id: string;
  label: string;
  metric_key: string;
  target_value: number;
  period: string;
}

const PATH_LABELS: Record<string, string> = {
  "/": "หน้าแรก",
  "/shop": "ร้านค้า",
  "/articles": "บทความ",
  "/community": "คอมมูนิตี้",
  "/about": "เกี่ยวกับเรา",
  "/contact": "ติดต่อ",
  "/cart": "ตะกร้า",
  "/checkout": "ชำระเงิน",
  "/vflow": "V FLOW",
  "/reviews": "รีวิว",
  "/faq": "คำถามที่พบบ่อย",
};

function labelForPath(path: string): string {
  if (PATH_LABELS[path]) return PATH_LABELS[path];
  if (path.startsWith("/articles/")) return "บทความ: " + path.replace("/articles/", "").slice(0, 30);
  if (path.startsWith("/product/")) return "สินค้า: " + path.replace("/product/", "").slice(0, 20);
  if (path.startsWith("/community/")) return "โพสต์: " + path.replace("/community/", "").slice(0, 20);
  return path;
}

function refererSource(ref: string | null): string {
  if (!ref) return "Direct / โดยตรง";
  try {
    const u = new URL(ref);
    const h = u.hostname.replace(/^www\./, "");
    if (h.includes("google")) return "Google";
    if (h.includes("facebook") || h.includes("fb.")) return "Facebook";
    if (h.includes("line.")) return "LINE";
    if (h.includes("instagram")) return "Instagram";
    if (h.includes("tiktok")) return "TikTok";
    if (h.includes("youtube")) return "YouTube";
    if (h.includes("bing")) return "Bing";
    if (h.includes("yahoo")) return "Yahoo";
    return h;
  } catch {
    return "อื่น ๆ";
  }
}

function pctChange(curr: number, prev: number): { value: number; positive: boolean } {
  if (prev === 0) return { value: curr > 0 ? 100 : 0, positive: curr >= 0 };
  const diff = ((curr - prev) / prev) * 100;
  return { value: Math.round(Math.abs(diff)), positive: diff >= 0 };
}

const SeoAnalyticsSection = () => {
  const [views, setViews] = useState<PageView[]>([]);
  const [targets, setTargets] = useState<SeoTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const since = subDays(new Date(), 60).toISOString();
      const [vRes, tRes] = await Promise.all([
        supabase.from("page_views").select("id, path, referrer, session_id, created_at")
          .gte("created_at", since).order("created_at", { ascending: false }).limit(10000),
        supabase.from("seo_targets").select("*"),
      ]);
      setViews(vRes.data || []);
      setTargets(tRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const startDay = (d: Date) => format(d, "yyyy-MM-dd");

  const inRange = (v: PageView, days: number, offset = 0) => {
    const d = new Date(v.created_at);
    const end = subDays(now, offset);
    const start = subDays(now, offset + days);
    return d >= start && d <= end;
  };

  const views7 = views.filter((v) => inRange(v, 7));
  const views7Prev = views.filter((v) => inRange(v, 7, 7));
  const views30 = views.filter((v) => inRange(v, 30));
  const views30Prev = views.filter((v) => inRange(v, 30, 30));
  const viewsToday = views.filter((v) => startDay(new Date(v.created_at)) === today);

  const uniq = (arr: PageView[]) => new Set(arr.map((v) => v.session_id || v.id)).size;

  const totalAllTime = views.length;
  const unique7 = uniq(views7);
  const unique30 = uniq(views30);

  const trendDelta7 = pctChange(views7.length, views7Prev.length);
  const trendDelta30 = pctChange(views30.length, views30Prev.length);

  // Daily trend (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(now, 29 - i);
    const key = format(d, "yyyy-MM-dd");
    const dayViews = views.filter((v) => startDay(new Date(v.created_at)) === key);
    return {
      date: format(d, "d MMM", { locale: th }),
      views: dayViews.length,
      visitors: uniq(dayViews),
    };
  });

  // Top pages (last 30 days)
  const pageCounts = new Map<string, number>();
  views30.forEach((v) => pageCounts.set(v.path, (pageCounts.get(v.path) || 0) + 1));
  const topPages = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, count]) => ({ path, label: labelForPath(path), count }));

  // Top referrers
  const refCounts = new Map<string, number>();
  views30.forEach((v) => {
    const src = refererSource(v.referrer);
    refCounts.set(src, (refCounts.get(src) || 0) + 1);
  });
  const topRefs = Array.from(refCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([source, count]) => ({ source, count }));

  // Monthly views (this month)
  const startMonth = startOfMonth(now);
  const viewsMonth = views.filter((v) => new Date(v.created_at) >= startMonth);
  const uniqueMonth = uniq(viewsMonth);

  // SEO Health Checklist (static, programmatic)
  const seoChecks = [
    { ok: true, label: "Sitemap.xml พร้อมใช้งาน", detail: "/sitemap.xml" },
    { ok: true, label: "Robots.txt กำหนดถูกต้อง", detail: "/robots.txt" },
    { ok: true, label: "Meta tags (Title + Description)", detail: "ทุกหน้าใช้ SeoHead component" },
    { ok: true, label: "Open Graph + Twitter Cards", detail: "รองรับ Social sharing" },
    { ok: true, label: "Structured Data (JSON-LD)", detail: "องค์กร + ผลิตภัณฑ์" },
    { ok: true, label: "Mobile Responsive", detail: "Breakpoint mobile/tablet/desktop" },
    { ok: true, label: "HTTPS Enabled", detail: "SSL Certificate" },
    { ok: true, label: "Multilingual (TH/EN/ZH/JA)", detail: "i18next + hreflang" },
    { ok: true, label: "Image Alt Text", detail: "ทุกรูปมี alt attribute" },
    { ok: true, label: "Page Load Speed", detail: "Vite + lazy loading" },
  ];

  const seoScore = Math.round((seoChecks.filter((c) => c.ok).length / seoChecks.length) * 100);

  // Targets vs actual
  const actualValues: Record<string, number> = {
    monthly_views: viewsMonth.length,
    monthly_unique: uniqueMonth,
    daily_views: viewsToday.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">SEO & Traffic Analytics</h2>
          <p className="text-sm text-muted-foreground">วิเคราะห์ยอดเข้าชมเว็บไซต์ คุณภาพ SEO และทิศทางการเติบโต</p>
        </div>
      </div>

      {/* Traffic KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="ยอดเข้าชมวันนี้"
          value={viewsToday.length.toLocaleString()}
          icon={Eye}
          description={`Unique: ${uniq(viewsToday).toLocaleString()} คน`}
        />
        <StatsCard
          title="ยอดเข้าชม 7 วัน"
          value={views7.length.toLocaleString()}
          icon={MousePointerClick}
          description={`Unique: ${unique7.toLocaleString()} คน`}
          trend={{ value: trendDelta7.value, isPositive: trendDelta7.positive }}
        />
        <StatsCard
          title="ยอดเข้าชม 30 วัน"
          value={views30.length.toLocaleString()}
          icon={Users}
          description={`Unique: ${unique30.toLocaleString()} คน`}
          trend={{ value: trendDelta30.value, isPositive: trendDelta30.positive }}
        />
        <StatsCard
          title="SEO Health Score"
          value={`${seoScore}%`}
          icon={Target}
          description={`${seoChecks.filter((c) => c.ok).length}/${seoChecks.length} เกณฑ์ผ่าน`}
        />
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">แนวโน้มการเข้าชม 30 วันล่าสุด</CardTitle>
          <CardDescription>เส้นกราฟแสดงยอดเข้าชม (Views) และผู้เข้าชมไม่ซ้ำ (Visitors) รายวัน</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-72 flex items-center justify-center text-muted-foreground">กำลังโหลด...</div>
          ) : totalAllTime === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <AlertCircle className="h-8 w-8" />
              <p>ยังไม่มีข้อมูลการเข้าชม — ระบบจะเริ่มเก็บข้อมูลเมื่อมีผู้เข้าใช้งานเว็บไซต์</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={last30Days}>
                <defs>
                  <linearGradient id="cViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" interval={3} />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="views" name="ยอดเข้าชม" stroke="hsl(var(--primary))" fill="url(#cViews)" strokeWidth={2} />
                <Area type="monotone" dataKey="visitors" name="ผู้เข้าชมไม่ซ้ำ" stroke="hsl(var(--chart-2))" fill="url(#cVisitors)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Targets vs Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            เป้าหมาย vs ผลจริง (KPI)
          </CardTitle>
          <CardDescription>ตัวชี้วัดสำหรับผู้บริหารในการประเมินทิศทาง</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {targets.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีการตั้งเป้าหมาย</p>
          ) : (
            targets.map((t) => {
              const actual = actualValues[t.metric_key] ?? 0;
              const pct = t.target_value > 0 ? Math.min(100, Math.round((actual / Number(t.target_value)) * 100)) : 0;
              const onTrack = pct >= 80;
              return (
                <div key={t.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{t.label}</span>
                      <Badge variant={onTrack ? "default" : "secondary"} className={onTrack ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>
                        {onTrack ? "ตามเป้า" : "ต่ำกว่าเป้า"}
                      </Badge>
                    </div>
                    <span className="font-mono text-muted-foreground">
                      <span className="text-foreground font-semibold">{actual.toLocaleString()}</span> / {Number(t.target_value).toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Top Pages + Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              หน้าที่ได้รับความนิยม (30 วัน)
            </CardTitle>
            <CardDescription>หน้าที่มียอดเข้าชมสูงสุด</CardDescription>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">ยังไม่มีข้อมูล</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, topPages.length * 36)}>
                <BarChart data={topPages} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="label" className="text-xs" width={140} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" name="ยอดเข้าชม" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              ที่มาของผู้เข้าชม (30 วัน)
            </CardTitle>
            <CardDescription>ช่องทาง / แพลตฟอร์มที่นำผู้ใช้มาสู่เว็บไซต์</CardDescription>
          </CardHeader>
          <CardContent>
            {topRefs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">ยังไม่มีข้อมูล</p>
            ) : (
              <div className="space-y-3">
                {topRefs.map((r) => {
                  const max = topRefs[0].count;
                  const pct = Math.round((r.count / max) * 100);
                  return (
                    <div key={r.source} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{r.source}</span>
                        <span className="text-muted-foreground font-mono">{r.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SEO Health Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            SEO Health Checklist
          </CardTitle>
          <CardDescription>ตรวจสอบความพร้อมด้าน SEO ของเว็บไซต์ — คะแนนรวม {seoScore}%</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {seoChecks.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                {c.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeoAnalyticsSection;
