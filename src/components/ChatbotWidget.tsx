import { useState } from "react";
import { MessageCircle, X, Send, ArrowLeft } from "lucide-react";
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
    if (messages.length === 0) {
      addMessage(t("chatbot.greeting"), true);
    }
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
    
    // Auto-response based on keywords
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
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elegant z-50 hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[80vh] shadow-elegant z-50 flex flex-col">
          {/* Header */}
          <CardHeader className="border-b bg-primary text-primary-foreground py-4">
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
                <div>
                  <CardTitle className="text-lg">JWHERBAL Assistant</CardTitle>
                  <p className="text-xs opacity-90">Online</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
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
                    "flex",
                    message.isBot ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 whitespace-pre-line",
                      message.isBot
                        ? "bg-secondary text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              
              {showTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-foreground rounded-lg p-3">
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
                    className="justify-start h-auto py-3 text-left"
                    onClick={() => handleMenuClick("productInfo")}
                  >
                    {t("chatbot.menu.productInfo")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 text-left"
                    onClick={() => handleMenuClick("pricing")}
                  >
                    {t("chatbot.menu.pricing")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 text-left"
                    onClick={() => handleMenuClick("howToUse")}
                  >
                    {t("chatbot.menu.howToUse")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 text-left"
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
                    className="justify-start h-auto py-3"
                    onClick={handleLineContact}
                  >
                    {t("chatbot.contactAdmin.lineChat")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3"
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
                  className="w-full mt-4"
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
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatbotWidget;
