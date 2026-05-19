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
  Headset, Send, Undo2,
} from "lucide-react";
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
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [togglingTakeover, setTogglingTakeover] = useState(false);
  const qc = useQueryClient();

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
            <Button
              size="sm"
              onClick={() => handleAnalyzeOne(conv.id)}
              disabled={analyzingId === conv.id}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {analyzingId === conv.id ? "กำลังวิเคราะห์..." : conv.analyzed_at ? "วิเคราะห์ใหม่" : "วิเคราะห์ด้วย AI"}
            </Button>
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
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className="w-full flex items-start justify-between px-4 py-3 hover:bg-accent/50 border-b border-border last:border-b-0 transition-colors text-left gap-3"
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
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminChatHistory;
