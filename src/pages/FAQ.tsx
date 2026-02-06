import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, HelpCircle, Search, ChevronDown, Sparkles, Send, ChevronUp, ListCollapse, Expand } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import FAQImageCarousel from "@/components/FAQImageCarousel";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question_th: string;
  question_en: string;
  question_zh: string;
  answer_th: string;
  answer_en: string;
  answer_zh: string;
  category: string;
  sort_order: number;
}

const INITIAL_DISPLAY_COUNT = 5;

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as "th" | "en" | "zh";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAskDialogOpen, setIsAskDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || "" });
        
        // Check if user is admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authUser.id)
          .eq("role", "admin")
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      }
    };
    checkUser();
  }, []);

  const { data: faqItems = [], isLoading } = useQuery({
    queryKey: ["faq-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as FAQItem[];
    },
  });

  const categories = [
    { value: "all", label: currentLanguage === "th" ? "ทั้งหมด" : currentLanguage === "en" ? "All" : "全部", icon: "📋" },
    { value: "product", label: currentLanguage === "th" ? "ผลิตภัณฑ์" : currentLanguage === "en" ? "Product" : "产品", icon: "🌿" },
    { value: "usage", label: currentLanguage === "th" ? "วิธีใช้" : currentLanguage === "en" ? "Usage" : "使用方法", icon: "💊" },
    { value: "health", label: currentLanguage === "th" ? "สุขภาพ" : currentLanguage === "en" ? "Health" : "健康", icon: "❤️" },
    { value: "shipping", label: currentLanguage === "th" ? "จัดส่ง" : currentLanguage === "en" ? "Shipping" : "运输", icon: "📦" },
    { value: "general", label: currentLanguage === "th" ? "ทั่วไป" : currentLanguage === "en" ? "General" : "一般", icon: "💬" },
  ];

  const getCategoryIcon = (category: string) => {
    const found = categories.find(c => c.value === category);
    return found?.icon || "💬";
  };

  const getQuestion = (item: FAQItem) => {
    return item[`question_${currentLanguage}` as keyof FAQItem] as string || item.question_th;
  };

  const getAnswer = (item: FAQItem) => {
    return item[`answer_${currentLanguage}` as keyof FAQItem] as string || item.answer_th;
  };

  const filteredItems = faqItems.filter((item) => {
    const matchesSearch = 
      getQuestion(item).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAnswer(item).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Display limited items unless expanded or searching
  const displayedItems = (searchTerm || isExpanded) 
    ? filteredItems 
    : filteredItems.slice(0, INITIAL_DISPLAY_COUNT);
  
  const hasMoreItems = filteredItems.length > INITIAL_DISPLAY_COUNT;
  const remainingCount = filteredItems.length - INITIAL_DISPLAY_COUNT;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Save question to database
      const { data: questionData, error } = await supabase
        .from("user_questions")
        .insert({
          question: newQuestion.trim(),
          email: user?.email || null,
          user_id: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to admin
      try {
        await supabase.functions.invoke("notify-new-question", {
          body: {
            question: newQuestion.trim(),
            email: user?.email || "ไม่ระบุ",
            questionId: questionData.id,
          },
        });
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
        // Don't fail the submission if notification fails
      }

      toast.success(currentLanguage === "th" 
        ? "ส่งคำถามสำเร็จ! ทีมงานจะตอบกลับโดยเร็ว" 
        : "Question submitted! Our team will respond soon."
      );
      setNewQuestion("");
      setIsAskDialogOpen(false);
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error(currentLanguage === "th" 
        ? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" 
        : "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset expansion when category changes
  useEffect(() => {
    setIsExpanded(false);
  }, [selectedCategory]);

  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-secondary/20 to-background">
      <Helmet>
        <title>{currentLanguage === "th" ? "ถามตอบ" : currentLanguage === "en" ? "Q&A" : "问答"} - JWHERBAL</title>
        <meta name="description" content={currentLanguage === "th" ? "คำถามที่พบบ่อยเกี่ยวกับผลิตภัณฑ์ V Flow" : "Frequently asked questions about V Flow products"} />
      </Helmet>

      <main className="flex-1">
        {/* FAQ Images Carousel */}
        <section className="bg-gradient-to-b from-secondary/40 to-secondary/20">
          <div className="container mx-auto px-4 py-6">
            <FAQImageCarousel isAdmin={isAdmin} />
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Compact Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {currentLanguage === "th" ? "คำถามที่พบบ่อย" : currentLanguage === "en" ? "FAQ" : "常见问题"}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                {currentLanguage === "th" ? "ถาม-ตอบ" : currentLanguage === "en" ? "Q & A" : "问与答"}
              </h1>
              
              <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
                {currentLanguage === "th"
                  ? "รวมคำถามที่พบบ่อยพร้อมคำตอบจากทีมผู้เชี่ยวชาญ"
                  : currentLanguage === "en"
                  ? "Frequently asked questions with answers from our expert team"
                  : "专家团队解答的常见问题"}
              </p>
            </div>

            {/* Search & Filter Card */}
            <Card className="max-w-3xl mx-auto mb-8 border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={currentLanguage === "th" ? "ค้นหาคำถาม..." : currentLanguage === "en" ? "Search questions..." : "搜索问题..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-2 border-border/50 focus:border-primary/50 bg-background/50 text-base"
                  />
                </div>
                
                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((cat) => (
                    <Button
                      key={cat.value}
                      variant={selectedCategory === cat.value ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "rounded-full transition-all duration-200 h-9",
                        selectedCategory === cat.value 
                          ? "shadow-md" 
                          : "hover:bg-accent/50 border-border/50"
                      )}
                      onClick={() => setSelectedCategory(cat.value)}
                    >
                      <span className="mr-1.5">{cat.icon}</span>
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="font-normal">
                  {filteredItems.length} {currentLanguage === "th" ? "คำถาม" : "questions"}
                </Badge>
                {searchTerm && (
                  <span className="text-xs">
                    {currentLanguage === "th" ? `ค้นหา "${searchTerm}"` : `Searching "${searchTerm}"`}
                  </span>
                )}
              </div>
              
              {/* Ask Question Button - Compact */}
              <Dialog open={isAskDialogOpen} onOpenChange={setIsAskDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full shadow-md hover:shadow-lg transition-all">
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {currentLanguage === "th" ? "ถามคำถาม" : "Ask"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center flex items-center justify-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {currentLanguage === "th" ? "ถามคำถามของคุณ" : currentLanguage === "en" ? "Ask Your Question" : "提交您的问题"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder={currentLanguage === "th" ? "พิมพ์คำถามของคุณที่นี่..." : "Type your question here..."}
                      className="min-h-[120px] resize-none"
                    />
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmitQuestion}
                      disabled={!newQuestion.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          {currentLanguage === "th" ? "กำลังส่ง..." : "Sending..."}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {currentLanguage === "th" ? "ส่งคำถาม" : currentLanguage === "en" ? "Submit Question" : "提交问题"}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {currentLanguage === "th" 
                        ? "ทีมงานจะตอบคำถามของคุณโดยเร็วที่สุด" 
                        : "Our team will respond to your question as soon as possible"}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* FAQ Items */}
            <div className="max-w-4xl mx-auto">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {currentLanguage === "th" ? "กำลังโหลด..." : "Loading..."}
                    </span>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/30">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <HelpCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {currentLanguage === "th" ? "ไม่พบคำถาม" : currentLanguage === "en" ? "No questions found" : "未找到问题"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {currentLanguage === "th" 
                        ? "ลองค้นหาด้วยคำอื่นหรือเลือกหมวดหมู่อื่น" 
                        : "Try a different search or category"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Accordion type="single" collapsible className="space-y-3">
                    {displayedItems.map((item, index) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="border-0"
                      >
                        <Card className={cn(
                          "overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200",
                          "bg-card/80 backdrop-blur-sm"
                        )}>
                          <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
                            <div className="flex items-center gap-3 md:gap-4 text-left w-full">
                              {/* Category Icon & Number */}
                              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-inner">
                                <span className="text-lg md:text-xl">{getCategoryIcon(item.category)}</span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                {/* Question Label */}
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-primary">
                                    Q{index + 1}
                                  </span>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border/50 text-muted-foreground font-normal">
                                    {categories.find(c => c.value === item.category)?.label || item.category}
                                  </Badge>
                                </div>
                                
                                <h3 className="font-medium text-foreground text-sm md:text-base leading-snug line-clamp-2">
                                  {getQuestion(item)}
                                </h3>
                              </div>
                              
                              <ChevronDown className="chevron h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0" />
                            </div>
                          </AccordionTrigger>
                          
                          <AccordionContent className="px-4 md:px-6 pb-4">
                            <div className="ml-13 md:ml-16">
                              {/* Answer Section */}
                              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/10">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  <span className="text-xs font-semibold text-primary">
                                    {currentLanguage === "th" ? "V Flow ตอบ" : currentLanguage === "en" ? "V Flow answers" : "V Flow回答"}
                                  </span>
                                </div>
                                
                                <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                                  {getAnswer(item)}
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </Card>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {/* Expand/Collapse Button */}
                  {hasMoreItems && !searchTerm && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full px-8 shadow-sm hover:shadow-md transition-all border-2"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            {currentLanguage === "th" ? "ย่อคำถาม" : currentLanguage === "en" ? "Show Less" : "显示更少"}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            {currentLanguage === "th" 
                              ? `ดูเพิ่มเติม (${remainingCount} คำถาม)` 
                              : currentLanguage === "en" 
                              ? `Show More (${remainingCount} questions)` 
                              : `查看更多 (${remainingCount} 个问题)`}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Contact CTA */}
            <div className="max-w-2xl mx-auto mt-12">
              <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <CardContent className="py-8 px-6 md:px-8 relative">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-semibold mb-1">
                        {currentLanguage === "th" ? "ยังไม่พบคำตอบที่ต้องการ?" : currentLanguage === "en" ? "Can't find your answer?" : "找不到答案?"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {currentLanguage === "th" 
                          ? "ติดต่อทีมงานของเราเพื่อรับคำตอบโดยตรง" 
                          : "Contact our team for a direct answer"}
                      </p>
                    </div>
                    <Button variant="default" className="rounded-full px-6" asChild>
                      <a href="/contact">
                        {currentLanguage === "th" ? "ติดต่อเรา" : currentLanguage === "en" ? "Contact Us" : "联系我们"}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
};

export default FAQ;