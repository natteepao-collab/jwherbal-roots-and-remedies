import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, HelpCircle, ChevronLeft, LogIn } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import jwherbalLogo from "@/assets/jwherbal-logo-new.png";
import { toast } from "sonner";
import { useHideOnScroll } from "@/hooks/useScrollDirection";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";


type MessageType = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`;

// Render assistant message with inline markdown images: ![alt](url)
const renderMessageContent = (content: string) => {
  const parts: Array<{ type: "text" | "image"; value: string; alt?: string }> = [];
  const regex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    if (m.index > lastIndex) parts.push({ type: "text", value: content.slice(lastIndex, m.index) });
    parts.push({ type: "image", value: m[2], alt: m[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) parts.push({ type: "text", value: content.slice(lastIndex) });

  return parts.map((p, i) =>
    p.type === "image" ? (
      <img
        key={i}
        src={p.value}
        alt={p.alt || "image"}
        loading="lazy"
        className="my-2 rounded-xl max-w-full h-auto border border-border/40 shadow-sm"
      />
    ) : (
      <span key={i}>{p.value}</span>
    )
  );
};

const ChatbotWidget = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingNotice, setPendingNotice] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const STAFF_NAMES = ["เอมอร", "นันนพัส", "ธัญญ์สิริน", "ชญานิศ", "ณัฐวรินทร์"];
  // Pick a starting index once per chat session, then rotate sequentially
  const staffStartIndex = useRef(Math.floor(Math.random() * STAFF_NAMES.length));
  const staffTurn = useRef(0);
  const [currentStaff, setCurrentStaff] = useState<string>(
    STAFF_NAMES[staffStartIndex.current]
  );
  const GREETING_TEMPLATES = [
    (staff: string, customer: string) => `สวัสดีค่ะคุณ ${customer} 🌿 ดิฉัน ${staff} ยินดีให้บริการค่ะ คุณลูกค้าต้องการสอบถามข้อมูลด้านใดคะ?`,
    (staff: string, customer: string) => `สวัสดีค่า คุณ ${customer} 😊 ${staff} เองนะคะ มีอะไรให้ช่วยดูแลไหมคะ?`,
    (staff: string, customer: string) => `สวัสดีค่ะคุณ ${customer} 🙏 ${staff} รับเรื่องต่อเองนะคะ ขออนุญาตช่วยตอบคำถามค่ะ`,
    (staff: string, customer: string) => `หวัดดีค่า~ คุณ ${customer} 🌿 ${staff} มาแล้วนะคะ บอกได้เลยค่ะว่าอยากทราบเรื่องไหน`,
    (staff: string, customer: string) => `สวัสดีค่ะคุณ ${customer} ✨ ${staff} ยินดีต้อนรับสู่ JWHERBAL ค่ะ มีคำถามอะไรสอบถามได้เลยนะคะ`,
  ];
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [customerName, setCustomerName] = useState<string>("ลูกค้า");
  const [customerAvatar, setCustomerAvatar] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [adminTakeover, setAdminTakeover] = useState(false);
  const hideOnScroll = useHideOnScroll();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track auth + load profile display name + restore per-user chat history
  useEffect(() => {
    const loadName = async (user: User | null) => {
      if (!user) {
        setCustomerName("ลูกค้า");
        setCustomerAvatar(null);
        return;
      }
      const fallback =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.email ? user.email.split("@")[0] : "") ||
        "ลูกค้า";
      try {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, preferred_avatar")
          .eq("id", user.id)
          .maybeSingle();
        const name = data?.full_name?.trim() || fallback;
        setCustomerName(name.split(" ")[0] || fallback);
        setCustomerAvatar(data?.preferred_avatar || null);
      } catch {
        setCustomerName(fallback);
        setCustomerAvatar(null);
      }
    };

    const restoreHistory = async (user: User | null) => {
      if (!user) {
        setMessages([]);
        setHasGreeted(false);
        setHistoryLoaded(false);
        setConversationId(null);
        setAdminTakeover(false);
        setSessionId(crypto.randomUUID());
        return;
      }
      try {
        const { data: conv } = await supabase
          .from("chat_conversations")
          .select("id, session_id, admin_takeover")
          .eq("user_id", user.id)
          .order("last_message_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (conv?.session_id) {
          setSessionId(conv.session_id);
          setConversationId(conv.id);
          setAdminTakeover(!!conv.admin_takeover);
          const { data: msgs } = await supabase
            .from("chat_messages")
            .select("id, role, content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: true });

          if (msgs && msgs.length > 0) {
            setMessages(
              msgs.map((m, i) => ({
                id: Date.now() + i,
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
            );
            setHasGreeted(true);
          }
        } else {
          setMessages([]);
          setHasGreeted(false);
          setConversationId(null);
          setAdminTakeover(false);
        }
      } catch (e) {
        console.error("restoreHistory error:", e);
      } finally {
        setHistoryLoaded(true);
      }
    };


    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setAuthChecked(true);
      loadName(session?.user ?? null);
      restoreHistory(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setTimeout(() => {
        loadName(session?.user ?? null);
        restoreHistory(session?.user ?? null);
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Realtime: listen for admin replies + takeover state on the current conversation
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as { role: string; content: string; created_at: string };
          if (row.role !== "assistant") return;
          setMessages((prev) => {
            // Avoid duplicating a streamed message we just appended ourselves
            if (prev.some((m) => m.role === "assistant" && m.content === row.content)) return prev;
            return [
              ...prev,
              {
                id: Date.now() + Math.floor(Math.random() * 1000),
                role: "assistant",
                content: row.content,
              },
            ];
          });
          setIsTyping(false);
          setPendingNotice(false);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_conversations",
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as { admin_takeover: boolean };
          setAdminTakeover(!!row.admin_takeover);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingNotice, isTyping]);

  const handleOpen = (customGreeting?: string) => {
    setIsOpen(true);
    setIsTabVisible(false);
    if (messages.length === 0) {
      // Show local greeting only — do NOT call API to avoid triggering admin notifications
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content:
            customGreeting ||
            t(
              "chatbot.greeting",
              "สวัสดีค่ะ ยินดีต้อนรับสู่ JWHERBAL 🌿 มีอะไรให้ช่วยสอบถามไหมคะ? เลือกหัวข้อด้านล่าง หรือพิมพ์คำถามได้เลยค่ะ"
            ),
        },
      ]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsTabVisible(true);
  };

  // Proactive open after 15s on product pages
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    const isProductPage =
      path === "/shop" || /^\/shop\/[^/]+/.test(path) || path === "/products/vflow";
    if (!isProductPage) return;
    if (isOpen) return;
    if (sessionStorage.getItem("jwh_proactive_chat_shown") === "1") return;

    const timer = setTimeout(() => {
      if (sessionStorage.getItem("jwh_proactive_chat_shown") === "1") return;
      sessionStorage.setItem("jwh_proactive_chat_shown", "1");
      handleOpen(
        t(
          "chatbot.proactive",
          "สวัสดีค่ะคุณลูกค้า 🌿 เห็นคุณลูกค้ากำลังดูสินค้าอยู่ มีเรื่องใดที่ต้องการสอบถามเพิ่มเติมเพื่อช่วยในการตัดสินใจไหมคะ?"
        )
      );
    }, 15000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);


  const streamChat = async (chatMessages: { role: string; content: string }[], isGreeting = false) => {
    setIsLoading(true);
    setIsTyping(true);
    let assistantContent = "";

    // Add placeholder assistant message (use random id to avoid collision with user msg)
    const assistantId = Date.now() + Math.floor(Math.random() * 1_000_000) + 1;
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: chatMessages,
          language: i18n.language,
          sessionId,
          userJwt: accessToken,
          context: {
            pageUrl: typeof window !== "undefined" ? window.location.href : null,
            referrer: typeof document !== "undefined" ? document.referrer : null,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
            deviceType:
              typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
                ? "mobile"
                : "desktop",
          },
        }),
      });

      // Capture conversation id for realtime subscription
      const respConvId = resp.headers.get("x-conversation-id");
      if (respConvId && respConvId !== conversationId) {
        setConversationId(respConvId);
      }

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        toast.error(errData.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        setIsLoading(false);
        setIsTyping(false);
        return;
      }

      // Admin has taken over — no AI reply will come. Wait for human via realtime.
      if (resp.headers.get("x-admin-takeover") === "1") {
        setAdminTakeover(true);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        setIsLoading(false);
        setIsTyping(false);
        toast.info("พนักงานกำลังดูแลแชทนี้ค่ะ กรุณารอการตอบกลับสักครู่");
        return;
      }


      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      toast.error("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    }

    setIsLoading(false);
    // Linger the "typing..." status proportional to the response length,
    // simulating a human taking time to finish typing the message.
    // ~25ms per char + small jitter, clamped between 600ms and 4500ms.
    const charCount = assistantContent.trim().length;
    const lingerMs = Math.min(
      4500,
      Math.max(600, charCount * 25 + Math.floor(Math.random() * 600))
    );
    setTimeout(() => setIsTyping(false), lingerMs);
  };

  const scheduleBotReply = (history: { role: string; content: string }[]) => {
    setPendingNotice(true);
    setIsLoading(true);
    // Rotate staff sequentially (round-robin) starting from a random index per session
    const idx = (staffStartIndex.current + staffTurn.current) % STAFF_NAMES.length;
    const staff = STAFF_NAMES[idx];
    staffTurn.current += 1;
    setCurrentStaff(staff);
    const delay = 3000 + Math.floor(Math.random() * 2000); // 3-5s
    setTimeout(() => {
      setPendingNotice(false);
      // Only greet on first turn of the conversation, not on every user message
      if (!hasGreeted) {
        const template = GREETING_TEMPLATES[Math.floor(Math.random() * GREETING_TEMPLATES.length)];
        const greeting: MessageType = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          role: "assistant",
          content: template(staff, customerName),
        };
        setMessages((prev) => [...prev, greeting]);
        setHasGreeted(true);
        setTimeout(() => streamChat(history), 800);
      } else {
        streamChat(history);
      }
    }, delay);
  };

  const requireAuth = () => {
    if (!authUser) {
      toast.error("กรุณาเข้าสู่ระบบก่อนพูดคุยกับเจ้าหน้าที่ค่ะ");
      return false;
    }
    return true;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;
    if (!requireAuth()) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    const userMsg: MessageType = { id: Date.now(), role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    scheduleBotReply(history);
  };

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    if (!requireAuth()) return;
    const userMsg: MessageType = { id: Date.now(), role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    scheduleBotReply(history);
  };

  const quickQuestions = [
    { label: t("chatbot.quick.product", "สินค้าแนะนำ"), question: t("chatbot.quick.productQ", "สินค้าแนะนำของร้านมีอะไรบ้าง?") },
    { label: t("chatbot.quick.vflow", "V Flow คืออะไร"), question: t("chatbot.quick.vflowQ", "V Flow คืออะไร มีสรรพคุณอะไรบ้าง?") },
    { label: t("chatbot.quick.price", "ราคา/โปรโมชั่น"), question: t("chatbot.quick.priceQ", "ราคาสินค้าและโปรโมชั่นปัจจุบันเป็นอย่างไร?") },
    { label: t("chatbot.quick.howto", "วิธีใช้งาน"), question: t("chatbot.quick.howtoQ", "วิธีดื่ม V Flow ที่ถูกต้องเป็นอย่างไร?") },
    { label: t("chatbot.quick.contact", "ติดต่อแอดมิน"), question: t("chatbot.quick.contactQ", "ต้องการติดต่อแอดมินหรือสั่งซื้อสินค้า") },
  ];

  const showQuickButtons = messages.length <= 1 && !isLoading;

  return (
    <>
      {/* Side Tab Toggle */}
      {!isOpen && isTabVisible && (
        <button
          onClick={() => handleOpen()}
          className={cn(
            "fixed right-0 top-1/2 -translate-y-1/2 z-50 group transition-transform duration-300 ease-out",
            hideOnScroll ? "translate-x-full" : "translate-x-0"
          )}
          aria-label="JWHERBAL SUPPORT 24hr."
        >
          <div className="relative flex items-center gap-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground pl-3 pr-3.5 py-3 rounded-l-2xl shadow-xl ring-1 ring-white/20 transition-all duration-300 hover:shadow-2xl hover:pl-4">
            <span className="absolute -left-1 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
            </span>
            <span
              className="text-xs font-medium leading-tight tracking-wide"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              JWHERBAL SUPPORT 24hr.
            </span>
          </div>
        </button>
      )}

      {/* Minimal re-open tab */}
      {!isOpen && !isTabVisible && (
        <button
          onClick={() => setIsTabVisible(true)}
          className={cn(
            "fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-primary/80 text-primary-foreground p-1.5 rounded-l-md shadow-md hover:bg-primary transition-all duration-300 ease-out",
            hideOnScroll ? "translate-x-full" : "translate-x-0"
          )}
          aria-label="Show Help Tab"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Chat Window */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-96 max-w-[calc(100vw-1rem)] z-50 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <Card className="h-full rounded-none rounded-l-2xl shadow-2xl flex flex-col border-l">
          {/* Header */}
          <CardHeader className="border-b bg-primary text-primary-foreground py-4 rounded-tl-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img src={jwherbalLogo} alt="JWHERBAL" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <CardTitle className="text-base">JWHERBAL SUPPORT 24hr.</CardTitle>
                  <p className="text-[11px] opacity-80 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {adminTakeover && (
                <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 px-3 py-2 text-[12px] text-green-700 animate-fade-in">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span>พนักงาน (มนุษย์) กำลังดูแลแชทนี้แทน AI แล้วค่ะ 🌿</span>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex animate-fade-in gap-2",
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                      message.role === "assistant"
                        ? "bg-secondary text-foreground rounded-bl-sm order-2"
                        : "bg-primary text-primary-foreground rounded-br-sm order-1"
                    )}
                  >
                    {message.content ? (
                      renderMessageContent(message.content)
                    ) : (
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-border bg-muted flex items-center justify-center order-2 self-end">
                      {customerAvatar ? (
                        <img
                          src={customerAvatar}
                          alt={customerName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[11px] font-semibold text-foreground/70">
                          {customerName.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}


              {pendingNotice && (
                <div className="flex flex-col gap-1 animate-fade-in">
                  <p className="text-[11px] text-muted-foreground italic px-1">
                    ได้รับข้อความเรียบร้อยแล้ว กรุณารอการตอบกลับสักครู่ค่ะ
                  </p>
                  {currentStaff && (
                    <p className="text-[11px] text-primary/80 px-1">
                      • พนักงาน {currentStaff} กำลังเข้ามาให้บริการในแชท...
                    </p>
                  )}
                </div>
              )}

              {isTyping && !pendingNotice && currentStaff && (
                <p className="text-[11px] text-primary/80 italic px-1 animate-fade-in">
                  • พนักงาน {currentStaff} กำลังพิมพ์ตอบ...
                </p>
              )}



              {/* Quick Question Buttons */}
              {showQuickButtons && (
                <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
                  {quickQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                      onClick={() => handleQuickQuestion(q.question)}
                    >
                      {q.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <CardContent className="border-t p-4">
            {!authChecked ? (
              <div className="h-10 rounded-xl bg-muted/40 animate-pulse" />
            ) : !authUser ? (
              <div className="flex flex-col items-center gap-2 text-center py-1">
                <p className="text-xs text-muted-foreground">
                  กรุณาเข้าสู่ระบบเพื่อพูดคุยกับเจ้าหน้าที่ค่ะ 🌿
                </p>
                <Button asChild size="sm" className="rounded-xl w-full" onClick={handleClose}>
                  <Link to="/auth">
                    <LogIn className="h-4 w-4 mr-1.5" />
                    เข้าสู่ระบบ / สมัครสมาชิก
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={t("chatbot.placeholder")}
                  className="flex-1 rounded-xl"
                  disabled={isLoading}
                />
                <Button size="icon" onClick={handleSendMessage} className="rounded-xl" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[2px]"
          onClick={handleClose}
        />
      )}
    </>
  );
};

export default ChatbotWidget;
