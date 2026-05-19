import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, HelpCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import jwherbalLogo from "@/assets/jwherbal-logo-new.png";
import { toast } from "sonner";
import { useHideOnScroll } from "@/hooks/useScrollDirection";

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
  const [sessionId] = useState(() => crypto.randomUUID());
  const hideOnScroll = useHideOnScroll();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsTabVisible(false);
    if (messages.length === 0) {
      // Show local greeting only — do NOT call API to avoid triggering admin notifications
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content: t(
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

  const streamChat = async (chatMessages: { role: string; content: string }[], isGreeting = false) => {
    setIsLoading(true);
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
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        toast.error(errData.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        setIsLoading(false);
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
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    const userMsg: MessageType = { id: Date.now(), role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    streamChat(history);
  };

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    const userMsg: MessageType = { id: Date.now(), role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    streamChat(history);
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
          onClick={handleOpen}
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
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex animate-fade-in",
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                      message.role === "assistant"
                        ? "bg-secondary text-foreground rounded-bl-sm"
                        : "bg-primary text-primary-foreground rounded-br-sm"
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
                </div>
              ))}

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
