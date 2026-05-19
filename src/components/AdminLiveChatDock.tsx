import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Headset,
  X,
  ChevronLeft,
  Send,
  Bot,
  User as UserIcon,
  Undo2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { th as thLocale } from "date-fns/locale";

type Conv = {
  id: string;
  session_id: string;
  last_message_at: string;
  started_at: string;
  message_count: number;
  language: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  summary: string | null;
  admin_takeover: boolean | null;
  admin_takeover_by: string | null;
  ai_staff_name: string | null;
};

type Msg = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

const ACTIVE_WINDOW_MS = 60 * 60 * 1000; // 1h

const AdminLiveChatDock = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [seenAt, setSeenAt] = useState<number>(() => Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Draggable position (persisted). null = default placement.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("admin-live-dock-pos");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
    pointerId: number;
    curX: number;
    curY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const clampPos = (x: number, y: number, w: number, h: number) => {
    const maxX = window.innerWidth - w - 4;
    const maxY = window.innerHeight - h - 4;
    return {
      x: Math.max(4, Math.min(x, maxX)),
      y: Math.max(4, Math.min(y, maxY)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const currentX = pos?.x ?? rect.left;
    const currentY = pos?.y ?? rect.top;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: currentX,
      origY: currentY,
      curX: currentX,
      curY: currentY,
      moved: false,
      pointerId: e.pointerId,
    };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > 5) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) {
      const el = e.currentTarget as HTMLElement;
      const next = clampPos(
        d.origX + dx,
        d.origY + dy,
        el.offsetWidth,
        el.offsetHeight
      );
      d.curX = next.x;
      d.curY = next.y;
      setPos(next);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(d.pointerId);
    } catch {}
    if (d.moved) {
      try {
        localStorage.setItem(
          "admin-live-dock-pos",
          JSON.stringify({ x: d.curX, y: d.curY })
        );
      } catch {}
    }
    const wasDragged = d.moved;
    dragRef.current = null;
    setTimeout(() => setDragging(false), 0);
    if (wasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  };


  // 1. Detect admin role
  useEffect(() => {
    let mounted = true;
    const check = async (userId: string | null) => {
      if (!userId) {
        if (mounted) {
          setIsAdmin(false);
          setAdminId(null);
        }
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!mounted) return;
      setIsAdmin(!!data);
      setAdminId(userId);
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      check(session?.user.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session?.user.id ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Load active conversations + realtime
  const loadConvs = async () => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("chat_conversations")
      .select(
        "id, session_id, last_message_at, started_at, message_count, language, customer_name, customer_phone, summary, admin_takeover, admin_takeover_by, ai_staff_name"
      )
      .gte("last_message_at", since)
      .order("last_message_at", { ascending: false })
      .limit(40);
    if (error) return;
    setConvs((data || []) as Conv[]);
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadConvs();
    const channel = supabase
      .channel("admin-live-dock")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations" },
        () => loadConvs()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => loadConvs()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // 3. Load messages of selected conversation + realtime
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    const fetchMsgs = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      setMessages((data || []) as Msg[]);
    };
    fetchMsgs();
    const channel = supabase
      .channel(`admin-dock-conv-${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${selectedId}`,
        },
        () => fetchMsgs()
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [selectedId]);

  // Auto-scroll the conversation view
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedId]);

  // Mark dock as "seen" whenever opened
  useEffect(() => {
    if (open) setSeenAt(Date.now());
  }, [open, selectedId]);

  const activeNow = useMemo(
    () =>
      convs.filter(
        (c) => Date.now() - new Date(c.last_message_at).getTime() < ACTIVE_WINDOW_MS
      ),
    [convs]
  );

  const unseenCount = useMemo(
    () =>
      activeNow.filter(
        (c) =>
          !c.admin_takeover && new Date(c.last_message_at).getTime() > seenAt
      ).length,
    [activeNow, seenAt]
  );

  const selected = convs.find((c) => c.id === selectedId) || null;

  const toggleTakeover = async (conv: Conv) => {
    setToggling(true);
    try {
      const next = !conv.admin_takeover;
      const { error } = await supabase
        .from("chat_conversations")
        .update({
          admin_takeover: next,
          admin_takeover_by: next ? adminId : null,
          admin_takeover_at: next ? new Date().toISOString() : null,
        })
        .eq("id", conv.id);
      if (error) throw error;
      toast.success(next ? "เข้าควบคุมแชทเรียบร้อย" : "ส่งคืนให้ AI ดูแลแล้ว");
      loadConvs();
    } catch (e: any) {
      toast.error(e.message || "ดำเนินการไม่สำเร็จ");
    } finally {
      setToggling(false);
    }
  };

  const sendReply = async () => {
    const text = replyText.trim();
    if (!text || !selectedId) return;
    setSending(true);
    try {
      // Auto-takeover if not already taken
      if (selected && !selected.admin_takeover) {
        await supabase
          .from("chat_conversations")
          .update({
            admin_takeover: true,
            admin_takeover_by: adminId,
            admin_takeover_at: new Date().toISOString(),
          })
          .eq("id", selectedId);
      }
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: selectedId,
        role: "assistant",
        content: text,
      });
      if (error) throw error;
      setReplyText("");
    } catch (e: any) {
      toast.error(e.message || "ส่งข้อความไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Floating launcher button (draggable; default bottom-left) */}
      {!open && (
        <button
          type="button"
          onClick={() => {
            if (dragging) return;
            setOpen(true);
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="เปิด Admin Live Chat (ลากเพื่อย้าย)"
          title="ลากเพื่อย้ายตำแหน่ง · คลิกเพื่อเปิด"
          style={
            pos
              ? { left: pos.x, top: pos.y, touchAction: "none" }
              : { touchAction: "none" }
          }
          className={cn(
            "fixed z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center transition-transform select-none",
            dragging ? "cursor-grabbing scale-110" : "cursor-grab hover:scale-105 active:scale-95",
            !pos && "bottom-40 left-4 lg:bottom-24"
          )}
        >
          <Headset className="h-5 w-5 pointer-events-none" />

          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unseenCount}
            </span>
          )}
          {activeNow.length > 0 && unseenCount === 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeNow.length}
            </span>
          )}
        </button>
      )}

      {open && (
        <Card
          style={pos ? { left: pos.x, top: pos.y } : undefined}
          className={cn(
            "fixed z-50 w-[min(92vw,380px)] h-[min(80vh,560px)] shadow-2xl flex flex-col overflow-hidden",
            !pos && "bottom-40 left-4 lg:bottom-24"
          )}
        >
          {/* Header (drag handle) */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "none" }}
            className={cn(
              "px-3 py-2.5 border-b bg-primary text-primary-foreground flex items-center gap-2 select-none",
              dragging ? "cursor-grabbing" : "cursor-grab"
            )}
            title="ลากเพื่อย้ายหน้าต่าง"
          >
            {selectedId && (
              <button
                onClick={() => setSelectedId(null)}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="กลับ"
                className="p-1 -ml-1 hover:bg-white/15 rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <Headset className="h-4 w-4" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">
                {selectedId ? "ห้องแชท" : "Admin Live Chat"}
              </p>
              <p className="text-[11px] opacity-80 leading-tight truncate">
                {selectedId
                  ? selected?.customer_name || selected?.customer_phone || "ลูกค้า"
                  : `${activeNow.length} ห้อง · ใช้งานใน 1 ชม.`}
              </p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setSelectedId(null);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="ปิด"
              className="p-1 hover:bg-white/15 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          {!selectedId ? (
            <ScrollArea className="flex-1">
              {convs.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  ยังไม่มีบทสนทนาใน 24 ชั่วโมงล่าสุด
                </div>
              ) : (
                <div className="divide-y">
                  {convs.map((c) => {
                    const isActive =
                      Date.now() - new Date(c.last_message_at).getTime() <
                      ACTIVE_WINDOW_MS;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className="w-full text-left px-3 py-2.5 hover:bg-accent/60 transition-colors flex flex-col gap-1"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-medium truncate max-w-[180px]">
                            {c.customer_name ||
                              c.customer_phone ||
                              `ลูกค้า · ${c.session_id.slice(0, 6)}`}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ออนไลน์
                            </span>
                          )}
                          {c.admin_takeover ? (
                            <Badge variant="secondary" className="text-[10px] py-0">
                              <UserIcon className="h-2.5 w-2.5 mr-0.5" />
                              แอดมิน
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] py-0">
                              <Bot className="h-2.5 w-2.5 mr-0.5" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {c.summary || "ยังไม่ได้สรุป"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {format(new Date(c.last_message_at), "d MMM HH:mm", {
                            locale: thLocale,
                          })}{" "}
                          · {c.message_count} ข้อความ
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          ) : (
            <>
              {selected && (
                <div className="px-3 py-2 border-b bg-muted/40 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={selected.admin_takeover ? "destructive" : "default"}
                    onClick={() => toggleTakeover(selected)}
                    disabled={toggling}
                    className="h-7 text-xs"
                  >
                    {selected.admin_takeover ? (
                      <>
                        <Undo2 className="h-3 w-3 mr-1" /> คืนให้ AI
                      </>
                    ) : (
                      <>
                        <Headset className="h-3 w-3 mr-1" /> เข้าควบคุม
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-muted-foreground flex-1 truncate">
                    {selected.admin_takeover
                      ? "คุณกำลังตอบแทน AI"
                      : `AI: ${selected.ai_staff_name || "—"}`}
                  </p>
                </div>
              )}

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">
                    กำลังโหลด...
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex gap-2",
                        m.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {m.role === "assistant" && (
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[78%] rounded-xl px-3 py-2 text-xs whitespace-pre-line",
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        )}
                      >
                        {m.content}
                        <p className="text-[9px] opacity-60 mt-0.5">
                          {format(new Date(m.created_at), "HH:mm")}
                        </p>
                      </div>
                      {m.role === "user" && (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <UserIcon className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="border-t p-2 flex gap-1.5">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), sendReply())
                  }
                  placeholder={
                    selected?.admin_takeover
                      ? "พิมพ์ตอบลูกค้า..."
                      : "พิมพ์เพื่อเข้าควบคุมและตอบลูกค้า..."
                  }
                  className="h-9 text-sm"
                  disabled={sending}
                />
                <Button
                  size="sm"
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  className="h-9"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default AdminLiveChatDock;
