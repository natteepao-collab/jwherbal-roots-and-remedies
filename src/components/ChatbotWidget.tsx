import { useState } from "react";
import { MessageCircle, X, Send, ArrowLeft, HelpCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type MessageType = {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

type ChatView = "menu" | "productInfo" | "pricing" | "howToUse" | "contactAdmin";

const ChatbotWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentView, setCurrentView] = useState<ChatView>("menu");
  const [inputValue, setInputValue] = useState("");
  const [showTyping, setShowTyping] = useState(false);

  const addMessage = (text: string, isBot: boolean = false) => {
    const newMessage: MessageType = {
      id: Date.now(),
      text,
      isBot,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const showBotResponse = (text: string, delay: number = 500) => {
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      addMessage(text, true);
    }, delay);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsTabVisible(false);
    if (messages.length === 0) {
      addMessage(t("chatbot.greeting"), true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsTabVisible(true);
  };

  const handleMenuClick = (view: ChatView) => {
    setCurrentView(view);

    let userMessage = "";
    let botResponse = "";

    switch (view) {
      case "productInfo":
        userMessage = t("chatbot.menu.productInfo");
        botResponse = t("chatbot.productInfo.description");
        break;
      case "pricing":
        userMessage = t("chatbot.menu.pricing");
        botResponse = t("chatbot.pricing.description");
        break;
      case "howToUse":
        userMessage = t("chatbot.menu.howToUse");
        botResponse = t("chatbot.howToUse.description");
        break;
      case "contactAdmin":
        userMessage = t("chatbot.menu.talkToAdmin");
        botResponse = t("chatbot.contactAdmin.description");
        break;
    }

    if (userMessage) addMessage(userMessage, false);
    if (botResponse) showBotResponse(botResponse);
  };

  const handleBackToMenu = () => {
    setCurrentView("menu");
    showBotResponse(t("chatbot.greeting"));
  };

  const handleLineContact = () => {
    window.open("https://line.me/R/ti/p/@jwherbal", "_blank");
    addMessage(t("chatbot.contactAdmin.lineChat"), false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addMessage(inputValue, false);
    setInputValue("");

    const lowerInput = inputValue.toLowerCase();
    if (lowerInput.includes("ราคา") || lowerInput.includes("price") || lowerInput.includes("价格")) {
      setTimeout(() => handleMenuClick("pricing"), 500);
    } else if (lowerInput.includes("วิธี") || lowerInput.includes("how") || lowerInput.includes("饮用")) {
      setTimeout(() => handleMenuClick("howToUse"), 500);
    } else if (lowerInput.includes("สินค้า") || lowerInput.includes("product") || lowerInput.includes("产品")) {
      setTimeout(() => handleMenuClick("productInfo"), 500);
    } else {
      showBotResponse(t("chatbot.greeting"), 800);
    }
  };

  return (
    <>
      {/* Side Tab Toggle - visible when chat is closed */}
      {!isOpen && isTabVisible && (
        <button
          onClick={handleOpen}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group"
          aria-label="Open Help"
        >
          <div className="flex items-center gap-1.5 bg-primary text-primary-foreground pl-3 pr-1.5 py-3 rounded-l-xl shadow-lg transition-all duration-300 hover:pr-3 hover:shadow-xl hover:bg-primary/90">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium whitespace-nowrap">Help</span>
            <ChevronLeft className="h-3.5 w-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
          </div>
        </button>
      )}

      {/* Minimal re-open tab when tab is hidden */}
      {!isOpen && !isTabVisible && (
        <button
          onClick={() => setIsTabVisible(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-primary/80 text-primary-foreground p-1.5 rounded-l-md shadow-md hover:bg-primary transition-colors"
          aria-label="Show Help Tab"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Chat Window - slides in from right */}
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
              <div className="flex items-center gap-3">
                {currentView !== "menu" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToMenu}
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">JWHERBAL Help</CardTitle>
                    <p className="text-[11px] opacity-80 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                      Online
                    </p>
                  </div>
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
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex animate-fade-in",
                    message.isBot ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                      message.isBot
                        ? "bg-secondary text-foreground rounded-bl-sm"
                        : "bg-primary text-primary-foreground rounded-br-sm"
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {showTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-secondary text-foreground rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Buttons */}
              {currentView === "menu" && messages.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 text-left rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
                    onClick={() => handleMenuClick("productInfo")}
                  >
                    {t("chatbot.menu.productInfo")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 text-left rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
                    onClick={() => handleMenuClick("pricing")}
                  >
                    {t("chatbot.menu.pricing")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 text-left rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
                    onClick={() => handleMenuClick("howToUse")}
                  >
                    {t("chatbot.menu.howToUse")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 text-left rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
                    onClick={() => handleMenuClick("contactAdmin")}
                  >
                    {t("chatbot.menu.talkToAdmin")}
                  </Button>
                </div>
              )}

              {/* Contact Admin Buttons */}
              {currentView === "contactAdmin" && (
                <div className="grid grid-cols-1 gap-2 mt-4">
                  <Button
                    variant="default"
                    className="justify-start h-auto py-3 rounded-xl"
                    onClick={handleLineContact}
                  >
                    {t("chatbot.contactAdmin.lineChat")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 rounded-xl"
                    onClick={handleBackToMenu}
                  >
                    {t("chatbot.buttons.backToMenu")}
                  </Button>
                </div>
              )}

              {/* Other View Back Button */}
              {currentView !== "menu" && currentView !== "contactAdmin" && (
                <Button
                  variant="outline"
                  className="w-full mt-4 rounded-xl"
                  onClick={handleBackToMenu}
                >
                  {t("chatbot.buttons.backToMenu")}
                </Button>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <CardContent className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={t("chatbot.placeholder")}
                className="flex-1 rounded-xl"
              />
              <Button size="icon" onClick={handleSendMessage} className="rounded-xl">
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
