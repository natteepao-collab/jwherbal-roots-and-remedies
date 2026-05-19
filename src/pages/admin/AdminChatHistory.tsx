import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare, Clock, Globe, ChevronRight, ArrowLeft, User, Bot,
  Sparkles, Download, Search, Phone, Mail, Smartphone, TrendingUp,
  Headset, Send, Undo2, Trash2, UserCircle2, Users,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Conversation = {
  id: string;
  session_id: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
  language: string;
  status: string;
  page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  device_type: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_line: string | null;
  intent: string | null;
  topics: string[] | null;
  products_mentioned: string[] | null;
  sentiment: string | null;
  lead_score: number | null;
  summary: string | null;
  tags: string[] | null;
  analyzed_at: string | null;
  admin_notes: string | null;
  admin_takeover: boolean | null;
  admin_takeover_by: string | null;
  admin_takeover_at: string | null;
};

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

const INTENT_LABEL: Record<string, string> = {
  inquiry: "สอบถามข้อมูล",
  purchase_intent: "สนใจจะซื้อ",
  ready_to_buy: "พร้อมซื้อ",
  complaint: "ร้องเรียน",
  support: "ขอความช่วยเหลือ",
  browsing: "ดูเล่นๆ",
  other: "อื่นๆ",
};

const INTENT_COLOR: Record<string, string> = {
  ready_to_buy: "bg-green-500/15 text-green-700 border-green-500/30",
  purchase_intent: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  inquiry: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  complaint: "bg-red-500/15 text-red-700 border-red-500/30",
  support: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  browsing: "bg-gray-500/15 text-gray-700 border-gray-500/30",
  other: "bg-muted text-foreground",
};

const SENTIMENT_LABEL: Record<string, string> = {
  positive: "😊 บวก",
  neutral: "😐 กลาง",
  negative: "🙁 ลบ",
};

const AdminChatHistory = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | "registered" | "guest">("all");
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"conversations" | "users">("conversations");
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [togglingTakeover, setTogglingTakeover] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; label: string } | null>(null);
  const [deletePin, setDeletePin] = useState("");
  const [deleting, setDeleting] = useState(false);
  const qc = useQueryClient();

  const DELETE_PIN = "696969";

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deletePin !== DELETE_PIN) {
      toast.error("รหัสไม่ถูกต้อง");
      return;
    }
    setDeleting(true);
    try {
      // Delete messages first (no FK cascade), then conversations
      const { error: msgErr } = await supabase
        .from("chat_messages")
        .delete()
        .in("conversation_id", deleteTarget.ids);
      if (msgErr) throw msgErr;
      const { error: convErr } = await supabase
        .from("chat_conversations")
        .delete()
        .in("id", deleteTarget.ids);
      if (convErr) throw convErr;
      toast.success(`ลบ ${deleteTarget.ids.length} บทสนทนาเรียบร้อย`);
      if (selectedConversation && deleteTarget.ids.includes(selectedConversation)) {
        setSelectedConversation(null);
      }
      setDeleteTarget(null);
      setDeletePin("");
      qc.invalidateQueries({ queryKey: ["admin-chat-conversations"] });
    } catch (e: any) {
      toast.error(e.message || "ลบไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  };

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["admin-chat-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return data as Conversation[];
    },
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["admin-chat-messages", selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", selectedConversation)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!selectedConversation,
  });

  // Realtime: refresh messages + conversation when changes occur in the selected chat
  useEffect(() => {
    if (!selectedConversation) return;
    const channel = supabase
      .channel(`admin-chat-${selectedConversation}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["admin-chat-messages", selectedConversation] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_conversations",
          filter: `id=eq.${selectedConversation}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["admin-chat-conversations"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, qc]);

  const toggleTakeover = async (conv: Conversation) => {
    setTogglingTakeover(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const next = !conv.admin_takeover;
      const { error } = await supabase
        .from("chat_conversations")
        .update({
          admin_takeover: next,
          admin_takeover_by: next ? user?.id ?? null : null,
          admin_takeover_at: next ? new Date().toISOString() : null,
        })
        .eq("id", conv.id);
      if (error) throw error;
      toast.success(next ? "เข้าควบคุมแชทเรียบร้อย" : "ส่งคืนให้ AI ดูแลแล้ว");
      qc.invalidateQueries({ queryKey: ["admin-chat-conversations"] });
    } catch (e: any) {
      toast.error(e.message || "ดำเนินการไม่สำเร็จ");
    } finally {
      setTogglingTakeover(false);
    }
  };

  const sendAdminReply = async () => {
    const text = adminReply.trim();
    if (!text || !selectedConversation) return;
    setSendingReply(true);
    try {
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: selectedConversation,
        role: "assistant",
        content: text,
      });
      if (error) throw error;
      setAdminReply("");
      qc.invalidateQueries({ queryKey: ["admin-chat-messages", selectedConversation] });
    } catch (e: any) {
      toast.error(e.message || "ส่งข้อความไม่สำเร็จ");
    } finally {
      setSendingReply(false);
    }
  };


  const langLabel = (lang: string) => {
    switch (lang) {
      case "th": return "ไทย";
      case "en": return "English";
      case "zh": return "中文";
      default: return lang;
    }
  };

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      if (intentFilter !== "all" && c.intent !== intentFilter) return false;
      if (sentimentFilter !== "all" && c.sentiment !== sentimentFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = [
          c.summary, c.customer_name, c.customer_phone, c.customer_email,
          c.customer_line, ...(c.topics || []), ...(c.products_mentioned || []),
          ...(c.tags || []),
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [conversations, intentFilter, sentimentFilter, search]);

  const analyze = async (ids: string[]) => {
    const { data, error } = await supabase.functions.invoke("analyze-chat", {
      body: ids.length === 1 ? { conversationId: ids[0] } : { conversationIds: ids },
    });
    if (error) throw error;
    return data;
  };

  const handleAnalyzeOne = async (id: string) => {
    setAnalyzingId(id);
    try {
      await analyze([id]);
      toast.success("วิเคราะห์เสร็จแล้ว");
      qc.invalidateQueries({ queryKey: ["admin-chat-conversations"] });
    } catch (e: any) {
      toast.error(e.message || "วิเคราะห์ไม่สำเร็จ");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleAnalyzeAll = async () => {
    const unanalyzed = conversations.filter((c) => !c.analyzed_at && c.message_count >= 2);
    if (unanalyzed.length === 0) {
      toast.info("ไม่มีบทสนทนาใหม่ที่ต้องวิเคราะห์");
      return;
    }
    setAnalyzingAll(true);
    try {
      // process in batches of 5
      for (let i = 0; i < unanalyzed.length; i += 5) {
        await analyze(unanalyzed.slice(i, i + 5).map((c) => c.id));
      }
      toast.success(`วิเคราะห์ ${unanalyzed.length} บทสนทนาเรียบร้อย`);
      qc.invalidateQueries({ queryKey: ["admin-chat-conversations"] });
    } catch (e: any) {
      toast.error(e.message || "วิเคราะห์ไม่สำเร็จ");
    } finally {
      setAnalyzingAll(false);
    }
  };

  const exportCsv = () => {
    const rows = filtered.map((c) => ({
      วันที่เริ่ม: format(new Date(c.started_at), "yyyy-MM-dd HH:mm"),
      ภาษา: c.language || "",
      อุปกรณ์: c.device_type || "",
      หน้าเว็บ: c.page_url || "",
      จำนวนข้อความ: c.message_count,
      ความต้องการ: c.intent ? (INTENT_LABEL[c.intent] || c.intent) : "",
      อารมณ์: c.sentiment || "",
      คะแนนlead: c.lead_score ?? "",
      ชื่อลูกค้า: c.customer_name || "",
      เบอร์: c.customer_phone || "",
      อีเมล: c.customer_email || "",
      ไลน์: c.customer_line || "",
      สินค้าที่สนใจ: (c.products_mentioned || []).join(" | "),
      หัวข้อ: (c.topics || []).join(" | "),
      แท็ก: (c.tags || []).join(" | "),
      สรุป: (c.summary || "").replace(/\n/g, " "),
    }));
    if (rows.length === 0) {
      toast.error("ไม่มีข้อมูลให้ export");
      return;
    }
    const headers = Object.keys(rows[0]);
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv =
      headers.join(",") + "\n" +
      rows.map((r) => headers.map((h) => esc((r as any)[h])).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-analytics-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Export ${rows.length} รายการ`);
  };

  const deleteDialog = (
    <AlertDialog
      open={!!deleteTarget}
      onOpenChange={(o) => {
        if (!o) {
          setDeleteTarget(null);
          setDeletePin("");
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบ {deleteTarget?.label}</AlertDialogTitle>
          <AlertDialogDescription>
            การลบไม่สามารถกู้คืนได้ กรุณากรอกรหัสยืนยัน 6 หลักเพื่อดำเนินการต่อ
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="รหัสยืนยัน"
          value={deletePin}
          onChange={(e) => setDeletePin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          autoFocus
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              confirmDelete();
            }}
            disabled={deleting || deletePin.length !== 6}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "กำลังลบ..." : "ยืนยันลบ"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const exportTranscriptCsv = (conv: Conversation, msgs: ChatMessage[]) => {
    if (msgs.length === 0) {
      toast.error("ไม่มีข้อความให้ส่งออก");
      return;
    }
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = ["เวลา", "ผู้พูด", "ข้อความ"];
    const rows = msgs.map((m) => [
      format(new Date(m.created_at), "yyyy-MM-dd HH:mm:ss"),
      m.role === "user" ? "ลูกค้า" : "JW HERBAL",
      (m.content || "").replace(/\r?\n/g, " "),
    ]);
    const csv =
      headers.join(",") + "\n" +
      rows.map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${conv.id.slice(0, 8)}-${format(new Date(conv.started_at), "yyyyMMdd-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`ส่งออก ${msgs.length} ข้อความเป็น CSV`);
  };

  const exportTranscriptPdf = (conv: Conversation, msgs: ChatMessage[]) => {
    if (msgs.length === 0) {
      toast.error("ไม่มีข้อความให้ส่งออก");
      return;
    }
    const esc = (s: string) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const meta: string[] = [];
    meta.push(`เริ่ม: ${format(new Date(conv.started_at), "d MMM yyyy HH:mm", { locale: th })}`);
    meta.push(`จำนวนข้อความ: ${conv.message_count}`);
    if (conv.language) meta.push(`ภาษา: ${conv.language.toUpperCase()}`);
    if (conv.customer_name) meta.push(`ลูกค้า: ${esc(conv.customer_name)}`);
    if (conv.customer_phone) meta.push(`โทร: ${esc(conv.customer_phone)}`);
    if (conv.customer_email) meta.push(`อีเมล: ${esc(conv.customer_email)}`);
    if (conv.page_url) meta.push(`หน้า: ${esc(conv.page_url)}`);

    const bubbles = msgs
      .map((m) => {
        const isUser = m.role === "user";
        const who = isUser ? "ลูกค้า" : "JW HERBAL";
        const time = format(new Date(m.created_at), "d MMM HH:mm", { locale: th });
        return `
          <div class="row ${isUser ? "user" : "bot"}">
            <div class="who">${who} · <span class="time">${time}</span></div>
            <div class="bubble">${esc(m.content)}</div>
          </div>`;
      })
      .join("");

    const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<title>Chat Transcript ${conv.id.slice(0, 8)}</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: "Sarabun","Noto Sans Thai","Tahoma",sans-serif; color:#111; font-size: 12pt; line-height: 1.5; margin: 0; padding: 24px; }
  h1 { font-size: 18pt; margin: 0 0 4px; }
  .meta { color:#555; font-size: 10pt; margin-bottom: 16px; border-bottom:1px solid #ddd; padding-bottom: 10px; }
  .meta div { margin: 2px 0; }
  .row { margin: 10px 0; max-width: 78%; }
  .row.user { margin-left:auto; text-align:right; }
  .row.bot { margin-right:auto; }
  .who { font-size: 9pt; color:#666; margin-bottom: 2px; }
  .time { color:#999; }
  .bubble { display:inline-block; padding: 8px 12px; border-radius: 10px; white-space: pre-wrap; word-break: break-word; text-align:left; }
  .user .bubble { background:#0a7d3b; color:#fff; }
  .bot .bubble { background:#f1f3f5; color:#111; border:1px solid #e6e8eb; }
  .footer { margin-top: 24px; font-size: 9pt; color:#888; text-align:center; border-top:1px solid #eee; padding-top: 8px; }
  @media print { .no-print { display:none; } }
  .no-print { position: fixed; top: 12px; right: 12px; }
  .no-print button { padding: 8px 14px; font-size: 12pt; cursor:pointer; }
</style></head><body>
<div class="no-print"><button onclick="window.print()">พิมพ์ / บันทึก PDF</button></div>
<h1>JW HERBAL — Chat Transcript</h1>
<div class="meta">${meta.map((m) => `<div>${m}</div>`).join("")}</div>
${bubbles}
<div class="footer">ส่งออกเมื่อ ${format(new Date(), "d MMM yyyy HH:mm", { locale: th })} · Conversation ${conv.id}</div>
<script>setTimeout(() => window.print(), 400);</script>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) {
      toast.error("เบราว์เซอร์บล็อกการเปิดหน้าต่างใหม่ — กรุณาอนุญาต popup");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    toast.success("เปิดหน้าต่างพิมพ์ — เลือก 'บันทึกเป็น PDF'");
  };

  if (selectedConversation) {
    const conv = conversations.find((c) => c.id === selectedConversation);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">รายละเอียดสนทนา</h2>
            {conv && (
              <p className="text-sm text-muted-foreground">
                {format(new Date(conv.started_at), "d MMM yyyy HH:mm", { locale: th })} · {conv.message_count} ข้อความ · {langLabel(conv.language || "th")}
              </p>
            )}
          </div>
          {conv && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={conv.admin_takeover ? "destructive" : "secondary"}
                onClick={() => toggleTakeover(conv)}
                disabled={togglingTakeover}
              >
                {conv.admin_takeover ? (
                  <><Undo2 className="h-4 w-4 mr-1" /> คืนให้ AI ดูแล</>
                ) : (
                  <><Headset className="h-4 w-4 mr-1" /> เข้าควบคุมแชท</>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => handleAnalyzeOne(conv.id)}
                disabled={analyzingId === conv.id}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {analyzingId === conv.id ? "กำลังวิเคราะห์..." : conv.analyzed_at ? "วิเคราะห์ใหม่" : "วิเคราะห์ด้วย AI"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportTranscriptCsv(conv, messages)}
                disabled={messagesLoading || messages.length === 0}
              >
                <Download className="h-4 w-4 mr-1" /> CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportTranscriptPdf(conv, messages)}
                disabled={messagesLoading || messages.length === 0}
              >
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteTarget({ ids: [conv.id], label: "บทสนทนานี้" })}
              >
                <Trash2 className="h-4 w-4 mr-1" /> ลบ
              </Button>
            </div>
          )}
        </div>

        {conv && (conv.analyzed_at || conv.page_url) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> ข้อมูลเชิงการตลาด
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {conv.summary && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">สรุปบทสนทนา</p>
                  <p className="leading-relaxed">{conv.summary}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {conv.intent && (
                  <Badge variant="outline" className={cn(INTENT_COLOR[conv.intent])}>
                    {INTENT_LABEL[conv.intent] || conv.intent}
                  </Badge>
                )}
                {conv.sentiment && <Badge variant="outline">{SENTIMENT_LABEL[conv.sentiment] || conv.sentiment}</Badge>}
                {typeof conv.lead_score === "number" && (
                  <Badge variant="outline" className={cn(conv.lead_score >= 70 ? "bg-green-500/10 text-green-700" : conv.lead_score >= 40 ? "bg-amber-500/10 text-amber-700" : "")}>
                    Lead Score: {conv.lead_score}
                  </Badge>
                )}
                {(conv.tags || []).map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
                ))}
              </div>
              {(conv.products_mentioned || []).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">สินค้าที่ลูกค้าสนใจ</p>
                  <div className="flex flex-wrap gap-1">
                    {conv.products_mentioned!.map((p) => (
                      <Badge key={p} variant="outline">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(conv.topics || []).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">หัวข้อที่พูดคุย</p>
                  <p>{conv.topics!.join(" · ")}</p>
                </div>
              )}
              {(conv.customer_name || conv.customer_phone || conv.customer_email || conv.customer_line) && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-1">ข้อมูลติดต่อลูกค้า</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {conv.customer_name && <p>👤 {conv.customer_name}</p>}
                    {conv.customer_phone && <p><Phone className="inline h-3 w-3" /> {conv.customer_phone}</p>}
                    {conv.customer_email && <p><Mail className="inline h-3 w-3" /> {conv.customer_email}</p>}
                    {conv.customer_line && <p>💬 LINE: {conv.customer_line}</p>}
                  </div>
                </div>
              )}
              <div className="border-t pt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {conv.page_url && <p>📄 หน้า: {conv.page_url}</p>}
                {conv.referrer && <p>↩️ มาจาก: {conv.referrer}</p>}
                {conv.device_type && <p><Smartphone className="inline h-3 w-3" /> {conv.device_type}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            {messagesLoading ? (
              <p className="text-muted-foreground text-center py-8">กำลังโหลด...</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-line",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      )}
                    >
                      {msg.content}
                      <p className="text-[10px] opacity-60 mt-1">
                        {format(new Date(msg.created_at), "HH:mm")}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {conv?.admin_takeover && (
          <Card>
            <CardContent className="p-3">
              <div className="flex gap-2">
                <Input
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendAdminReply())}
                  placeholder="พิมพ์ข้อความตอบลูกค้า (ส่งในนามแอดมิน)..."
                  disabled={sendingReply}
                />
                <Button onClick={sendAdminReply} disabled={sendingReply || !adminReply.trim()}>
                  <Send className="h-4 w-4 mr-1" /> ส่ง
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                ลูกค้าจะเห็นข้อความนี้ทันทีในแชทผ่าน Realtime — AI ถูกพักไว้จนกว่าจะกด "คืนให้ AI ดูแล"
              </p>
            </CardContent>
          </Card>
        )}
        {deleteDialog}
      </div>
    );
  }

  const hotLeads = conversations.filter((c) => (c.lead_score || 0) >= 70).length;
  const analyzedCount = conversations.filter((c) => c.analyzed_at).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">ประวัติสนทนา & Marketing Analytics</h1>
          <p className="text-muted-foreground">วิเคราะห์ข้อมูลแชทเพื่อนำไปทำการตลาดต่อ</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAnalyzeAll} disabled={analyzingAll}>
            <Sparkles className="h-4 w-4 mr-1" />
            {analyzingAll ? "กำลังวิเคราะห์..." : "วิเคราะห์ทั้งหมดด้วย AI"}
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              setDeleteTarget({
                ids: filtered.map((c) => c.id),
                label: `${filtered.length} บทสนทนาที่กรองอยู่`,
              })
            }
            disabled={filtered.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" /> ลบที่กรองอยู่
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{conversations.length}</p>
              <p className="text-xs text-muted-foreground">สนทนาทั้งหมด</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {conversations.filter((c) => Date.now() - new Date(c.last_message_at).getTime() < 86400000).length}
              </p>
              <p className="text-xs text-muted-foreground">สนทนาวันนี้</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{hotLeads}</p>
              <p className="text-xs text-muted-foreground">Hot Leads (≥70)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{analyzedCount}/{conversations.length}</p>
              <p className="text-xs text-muted-foreground">วิเคราะห์แล้ว</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา ชื่อ/เบอร์/สินค้า/หัวข้อ..."
              className="pl-9"
            />
          </div>
          <Select value={intentFilter} onValueChange={setIntentFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="ความต้องการ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกความต้องการ</SelectItem>
              {Object.entries(INTENT_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="อารมณ์" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกอารมณ์</SelectItem>
              <SelectItem value="positive">😊 บวก</SelectItem>
              <SelectItem value="neutral">😐 กลาง</SelectItem>
              <SelectItem value="negative">🙁 ลบ</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">กำลังโหลด...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>ไม่พบบทสนทนา</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">รายการสนทนา ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px]">
              {filtered.map((conv) => (
                <div
                  key={conv.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedConversation(conv.id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedConversation(conv.id)}
                  className="w-full flex items-start justify-between px-4 py-3 hover:bg-accent/50 border-b border-border last:border-b-0 transition-colors text-left gap-3 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">
                        {format(new Date(conv.started_at), "d MMM HH:mm", { locale: th })}
                      </p>
                      {conv.intent && (
                        <Badge variant="outline" className={cn("text-[10px]", INTENT_COLOR[conv.intent])}>
                          {INTENT_LABEL[conv.intent] || conv.intent}
                        </Badge>
                      )}
                      {typeof conv.lead_score === "number" && (
                        <Badge variant="outline" className={cn("text-[10px]", conv.lead_score >= 70 ? "bg-green-500/10 text-green-700" : conv.lead_score >= 40 ? "bg-amber-500/10 text-amber-700" : "")}>
                          ⚡ {conv.lead_score}
                        </Badge>
                      )}
                      {conv.sentiment && (
                        <span className="text-xs">{SENTIMENT_LABEL[conv.sentiment]?.split(" ")[0]}</span>
                      )}
                      <Badge variant="secondary" className="text-[10px]">{conv.message_count} ข้อความ</Badge>
                      <Badge variant="outline" className="text-[10px]">{langLabel(conv.language || "th")}</Badge>
                    </div>
                    {conv.summary ? (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{conv.summary}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 mt-1 italic">ยังไม่ได้วิเคราะห์</p>
                    )}
                    {(conv.products_mentioned || []).length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {conv.products_mentioned!.slice(0, 3).map((p) => (
                          <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ ids: [conv.id], label: "บทสนทนานี้" });
                      }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="ลบบทสนทนา"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      {deleteDialog}
    </div>
  );
};

export default AdminChatHistory;
