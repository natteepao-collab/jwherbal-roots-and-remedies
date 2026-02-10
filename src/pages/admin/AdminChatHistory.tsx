import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Clock, Globe, ChevronRight, ArrowLeft, User, Bot } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  session_id: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
  language: string;
  status: string;
};

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

const AdminChatHistory = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

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

  if (selectedConversation) {
    const conv = conversations.find(c => c.id === selectedConversation);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">รายละเอียดสนทนา</h2>
            {conv && (
              <p className="text-sm text-muted-foreground">
                {format(new Date(conv.started_at), "d MMM yyyy HH:mm", { locale: th })} · {conv.message_count} ข้อความ · {langLabel(conv.language || "th")}
              </p>
            )}
          </div>
        </div>

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ประวัติสนทนา Chatbot</h1>
        <p className="text-muted-foreground">ดูประวัติการสนทนาของลูกค้ากับ Chatbot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{conversations.length}</p>
              <p className="text-sm text-muted-foreground">สนทนาทั้งหมด</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {conversations.filter(c => {
                  const d = new Date(c.last_message_at);
                  const now = new Date();
                  return now.getTime() - d.getTime() < 24 * 60 * 60 * 1000;
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">สนทนาวันนี้</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {conversations.reduce((sum, c) => sum + (c.message_count || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">ข้อความทั้งหมด</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">กำลังโหลด...</p>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>ยังไม่มีประวัติสนทนา</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">รายการสนทนา</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 border-b border-border last:border-b-0 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(conv.started_at), "d MMM yyyy HH:mm", { locale: th })}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {conv.message_count} ข้อความ
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {langLabel(conv.language || "th")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
