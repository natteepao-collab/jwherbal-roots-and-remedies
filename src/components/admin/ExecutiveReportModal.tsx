import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, FileText, FileSpreadsheet, Sparkles, TrendingUp, ShoppingCart, Eye, MessageSquare, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import DOMPurify from "dompurify";
import { marked } from "marked";
import jsPDF from "jspdf";

import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from "date-fns";
import { th } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import jwLogo from "@/assets/jw-group-logo.png";

async function loadImageDataUrl(src: string): Promise<{ dataUrl: string; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      resolve({ dataUrl: c.toDataURL("image/png"), w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
}

type Period = "week" | "month" | "year" | "custom";

interface Metrics {
  period: Period;
  sinceISO: string;
  untilISO: string;
  revenue: number;
  orders: number;
  pageViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  avgOrderValue: number;
  chats: number;
  afterHoursChats: number;
  aiHandled: number;
  aiSuccessRate: number;
  newArticles: number;
  hoursSavedByAi: number;
  newUsers: number;
  newCommunityPosts: number;
  activeProducts: number;
  topPages: { path: string; count: number }[];
  sources: { source: string; count: number }[];
  timeseries: { date: string; revenue: number; orders: number; views: number; chats: number }[];
}

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];
const PERIOD_LABEL: Record<Period, string> = { week: "สัปดาห์", month: "เดือน", year: "ปี", custom: "กำหนดเอง" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExecutiveReportModal({ open, onOpenChange }: Props) {
  const [period, setPeriod] = useState<Period>("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const runReport = async (p: Period, range?: DateRange) => {
    setLoading(true);
    setMetrics(null);
    setAiSummary("");
    try {
      const body: any = { period: p };
      if (p === "custom" && range?.from && range?.to) {
        body.fromISO = startOfDay(range.from).toISOString();
        body.toISO = endOfDay(range.to).toISOString();
      }
      const { data, error } = await supabase.functions.invoke("executive-report", { body });
      if (error) throw error;
      setMetrics(data.metrics);
      setAiSummary(data.aiSummary || "");
    } catch (e: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (p: Period) => {
    setPeriod(p);
    const now = new Date();
    let from: Date;
    if (p === "week") from = subDays(now, 7);
    else if (p === "month") from = subMonths(now, 1);
    else from = subYears(now, 1);
    setDateRange({ from, to: now });
    runReport(p);
  };

  const applyCustomRange = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({ title: "เลือกช่วงวันที่ให้ครบ", variant: "destructive" });
      return;
    }
    setPeriod("custom");
    runReport("custom", dateRange);
  };



  const exportPDF = async () => {
    if (!metrics || !reportRef.current) return;
    try {
      toast({ title: "กำลังสร้าง PDF...", description: "กำลังเรนเดอร์หน้ารายงาน กรุณารอสักครู่" });

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      // Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Executive Report - JW HERBAL", margin, margin + 6);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(
        `${PERIOD_LABEL[metrics.period]} | ${new Date(metrics.sinceISO).toLocaleDateString("th-TH")} - ${new Date(metrics.untilISO).toLocaleDateString("th-TH")} | Generated: ${new Date().toLocaleString("th-TH")}`,
        margin,
        margin + 12
      );
      let cursorY = margin + 18;

      // Collect printable sections (direct children of reportRef)
      const sections = Array.from(reportRef.current.children) as HTMLElement[];

      for (let i = 0; i < sections.length; i++) {
        const el = sections[i];
        const canvas = await html2canvas(el, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          windowWidth: el.scrollWidth,
        });
        const imgData = canvas.toDataURL("image/png");
        const imgW = contentWidth;
        const imgH = (canvas.height * imgW) / canvas.width;

        // If the section fits, place it; otherwise paginate this section across pages
        if (imgH <= contentHeight - (cursorY - margin)) {
          pdf.addImage(imgData, "PNG", margin, cursorY, imgW, imgH);
          cursorY += imgH + 4;
        } else if (imgH <= contentHeight) {
          // Doesn't fit on current page but fits on a fresh page → start new page
          pdf.addPage();
          cursorY = margin;
          pdf.addImage(imgData, "PNG", margin, cursorY, imgW, imgH);
          cursorY += imgH + 4;
        } else {
          // Section is taller than a page → slice across pages
          pdf.addPage();
          cursorY = margin;
          let remaining = imgH;
          let yPos = cursorY;
          let sliceTop = 0;
          // Source pixel ratio (canvas px per mm)
          const pxPerMm = canvas.width / imgW;
          while (remaining > 0) {
            const availableMm = contentHeight - (yPos - margin);
            const sliceMm = Math.min(remaining, availableMm);
            const sliceHeightPx = sliceMm * pxPerMm;

            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = sliceHeightPx;
            const ctx = sliceCanvas.getContext("2d")!;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(
              canvas,
              0, sliceTop * pxPerMm, canvas.width, sliceHeightPx,
              0, 0, canvas.width, sliceHeightPx
            );
            pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", margin, yPos, imgW, sliceMm);

            remaining -= sliceMm;
            sliceTop += sliceMm;
            if (remaining > 0) {
              pdf.addPage();
              yPos = margin;
            } else {
              cursorY = yPos + sliceMm + 4;
            }
          }
        }
      }

      // Footer page numbers
      const pageCount = pdf.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        pdf.setPage(p);
        pdf.setFontSize(8);
        pdf.setTextColor(120);
        pdf.text(`หน้า ${p} / ${pageCount}`, pageWidth - margin, pageHeight - 4, { align: "right" });
      }

      pdf.save(`executive-report-${metrics.period}-${Date.now()}.pdf`);
      toast({ title: "ดาวน์โหลด PDF สำเร็จ" });
    } catch (e: any) {
      toast({ title: "ส่งออก PDF ไม่สำเร็จ", description: e.message, variant: "destructive" });
    }
  };

  const exportExcel = () => {
    if (!metrics) return;
    const wb = XLSX.utils.book_new();

    const kpis = [
      ["รายงานผู้บริหาร", PERIOD_LABEL[metrics.period]],
      ["สร้างเมื่อ", new Date().toLocaleString("th-TH")],
      [],
      ["ตัวชี้วัด", "ค่า"],
      ["ยอดขายรวม (บาท)", metrics.revenue],
      ["จำนวนคำสั่งซื้อ", metrics.orders],
      ["Page Views", metrics.pageViews],
      ["ผู้เข้าชมไม่ซ้ำ", metrics.uniqueVisitors],
      ["อัตราการแปลง (%)", metrics.conversionRate],
      ["มูลค่าเฉลี่ยต่อออเดอร์ (บาท)", metrics.avgOrderValue],
      ["จำนวนแชท AI", metrics.chats],
      ["แชทช่วงดึก (00-06)", metrics.afterHoursChats],
      ["อัตรา AI ตอบเอง (%)", metrics.aiSuccessRate],
      ["บทความใหม่", metrics.newArticles],
      ["ชั่วโมงที่ AI ประหยัด", metrics.hoursSavedByAi],
      ["ผู้ใช้ใหม่", metrics.newUsers],
      ["โพสต์ชุมชนใหม่", metrics.newCommunityPosts],
      ["สินค้าที่ใช้งาน", metrics.activeProducts],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpis), "KPIs");

    const ts = [["วันที่", "ยอดขาย", "คำสั่งซื้อ", "Views", "Chats"],
      ...metrics.timeseries.map((t) => [t.date, t.revenue, t.orders, t.views, t.chats])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ts), "Timeseries");

    const tp = [["หน้า", "Views"], ...metrics.topPages.map((p) => [p.path, p.count])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tp), "TopPages");

    const sr = [["ที่มา", "Visits"], ...metrics.sources.map((s) => [s.source, s.count])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sr), "Sources");

    if (aiSummary) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["AI Executive Summary"], [aiSummary]]), "AI_Summary");
    }

    XLSX.writeFile(wb, `executive-report-${metrics.period}-${Date.now()}.xlsx`);
    toast({ title: "ดาวน์โหลด Excel สำเร็จ" });
  };

  // Split markdown into blocks (headings, paragraphs, bullet groups) for zebra striping
  const summaryBlocks: { type: "heading" | "bullets" | "para"; html: string }[] = (() => {
    if (!aiSummary) return [];
    const blocks: { type: "heading" | "bullets" | "para"; html: string }[] = [];
    const lines = aiSummary.split(/\r?\n/);
    let bulletBuf: string[] = [];
    const flushBullets = () => {
      if (bulletBuf.length) {
        const html = "<ul>" + bulletBuf.map((b) => `<li>${marked.parseInline(b)}</li>`).join("") + "</ul>";
        blocks.push({ type: "bullets", html });
        bulletBuf = [];
      }
    };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flushBullets(); continue; }
      const bulletMatch = line.match(/^[-*]\s+(.*)/);
      if (bulletMatch) { bulletBuf.push(bulletMatch[1]); continue; }
      flushBullets();
      const h = line.match(/^(#{1,6})\s+(.*)/);
      if (h) {
        const level = h[1].length;
        blocks.push({ type: "heading", html: `<h${level}>${marked.parseInline(h[2])}</h${level}>` });
      } else {
        blocks.push({ type: "para", html: marked.parseInline(line) as string });
      }
    }
    flushBullets();
    return blocks.map((b) => ({ ...b, html: DOMPurify.sanitize(b.html) }));
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            สรุปรายงานผู้บริหาร (AI-Powered)
          </DialogTitle>
          <DialogDescription>
            เลือกช่วงเวลาเพื่อให้ AI วิเคราะห์ข้อมูลและสร้างรายงานสำหรับผู้บริหาร
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={period === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => selectPreset("week")}
            >
              รายสัปดาห์
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => selectPreset("month")}
            >
              รายเดือน
            </Button>
            <Button
              variant={period === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => selectPreset("year")}
            >
              รายปี
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={period === "custom" ? "default" : "outline"}
                  size="sm"
                  className={cn("justify-start text-left font-normal min-w-[220px]")}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange?.from && dateRange?.to && period === "custom" ? (
                    <>
                      {format(dateRange.from, "d MMM yy", { locale: th })} – {format(dateRange.to, "d MMM yy", { locale: th })}
                    </>
                  ) : (
                    <span>เลือกช่วงวันที่ย้อนหลัง</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                  disabled={(d) => d > new Date()}
                  className="pointer-events-auto"
                />
                <div className="p-3 border-t flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setDateRange(undefined)}>ล้าง</Button>
                  <Button size="sm" onClick={applyCustomRange} disabled={!dateRange?.from || !dateRange?.to}>
                    สร้างรายงาน
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportPDF} disabled={!metrics || loading}>
              <FileText className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel} disabled={!metrics || loading}>
              <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">AI กำลังวิเคราะห์ข้อมูล...</p>
          </div>
        )}

        {!loading && !metrics && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Sparkles className="h-12 w-12 text-primary opacity-50" />
            <p className="text-muted-foreground">เลือกช่วงเวลา (Preset) หรือกำหนดวันที่เองเพื่อเริ่มสร้างรายงาน</p>
            <Button onClick={() => selectPreset("month")}>เริ่มวิเคราะห์รายเดือน</Button>
          </div>
        )}

        {metrics && !loading && (
          <div ref={reportRef} className="space-y-6 mt-2">
            {/* KPI Cards */}
            <div data-section data-section-title="ตัวชี้วัดหลัก (Key Performance Indicators)" className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard icon={TrendingUp} label="ยอดขายรวม" value={`฿${metrics.revenue.toLocaleString()}`} />
              <KpiCard icon={ShoppingCart} label="คำสั่งซื้อ" value={metrics.orders} />
              <KpiCard icon={Eye} label="Page Views" value={metrics.pageViews.toLocaleString()} />
              <KpiCard icon={MessageSquare} label="AI Chats" value={metrics.chats} />
            </div>

            {/* AI Summary */}
            {aiSummary && (
              <Card data-section data-section-title="บทสรุปสำหรับผู้บริหาร (Executive Summary)">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> สรุปโดย AI สำหรับผู้บริหาร
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {summaryBlocks.map((block, i) => (
                      <div
                        key={i}
                        className={cn(
                          "px-5 py-3 prose prose-sm max-w-none dark:prose-invert prose-headings:my-0 prose-headings:font-semibold prose-h2:text-base prose-h2:text-primary prose-p:my-0 prose-ul:my-0 prose-li:my-0.5",
                          block.type === "heading"
                            ? "bg-primary/10 border-l-4 border-primary"
                            : i % 2 === 0
                            ? "bg-muted/40"
                            : "bg-background"
                        )}
                        dangerouslySetInnerHTML={{ __html: block.html }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts */}
            <div data-section data-section-title="การวิเคราะห์ด้วยกราฟ (Analytics & Charts)" data-charts className="space-y-4 bg-background p-2">
              <Card>
                <CardHeader><CardTitle className="text-base">แนวโน้มยอดขาย & การเข้าชม</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={metrics.timeseries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="ยอดขาย" stroke={COLORS[0]} />
                      <Line type="monotone" dataKey="views" name="Views" stroke={COLORS[1]} />
                      <Line type="monotone" dataKey="chats" name="Chats" stroke={COLORS[2]} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">หน้ายอดนิยม</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={metrics.topPages.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={11} />
                        <YAxis type="category" dataKey="path" fontSize={10} width={120} />
                        <Tooltip />
                        <Bar dataKey="count" fill={COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">แหล่งที่มาของผู้เข้าชม</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={metrics.sources} dataKey="count" nameKey="source" outerRadius={90} label>
                          {metrics.sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Business Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <HighlightCard
                title="AI ช่วยรับลูกค้าช่วงดึก"
                value={`${metrics.afterHoursChats} เคส`}
                desc="ระหว่าง 00:00 - 06:00 น."
              />
              <HighlightCard
                title="ประหยัดเวลาทำงาน"
                value={`${metrics.hoursSavedByAi} ชม.`}
                desc={`จากบทความ ${metrics.newArticles} บทความที่สร้างอัตโนมัติ`}
              />
              <HighlightCard
                title="AI ตอบเองสำเร็จ"
                value={`${metrics.aiSuccessRate}%`}
                desc={`${metrics.aiHandled} จาก ${metrics.chats} แชท`}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function HighlightCard({ title, value, desc }: { title: string; value: string; desc: string }) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-primary my-1">{value}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
