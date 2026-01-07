import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, HelpCircle, Search, ChevronDown, ChevronUp, Sparkles, Send } from "lucide-react";
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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewImageCarousel from "@/components/ReviewImageCarousel";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

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

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as "th" | "en" | "zh";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAskDialogOpen, setIsAskDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || "" });
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
    { value: "all", label: currentLanguage === "th" ? "ทั้งหมด" : currentLanguage === "en" ? "All" : "全部" },
    { value: "product", label: currentLanguage === "th" ? "เกี่ยวกับผลิตภัณฑ์" : currentLanguage === "en" ? "Product" : "产品" },
    { value: "usage", label: currentLanguage === "th" ? "วิธีใช้งาน" : currentLanguage === "en" ? "Usage" : "使用方法" },
    { value: "health", label: currentLanguage === "th" ? "สุขภาพ" : currentLanguage === "en" ? "Health" : "健康" },
    { value: "shipping", label: currentLanguage === "th" ? "การจัดส่ง" : currentLanguage === "en" ? "Shipping" : "运输" },
    { value: "general", label: currentLanguage === "th" ? "ทั่วไป" : currentLanguage === "en" ? "General" : "一般" },
  ];

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

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) return;
    toast.success(currentLanguage === "th" 
      ? "ส่งคำถามสำเร็จ! ทีมงานจะตอบกลับโดยเร็ว" 
      : "Question submitted! Our team will respond soon."
    );
    setNewQuestion("");
    setIsAskDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary/30 via-background to-secondary/20">
      <Helmet>
        <title>{currentLanguage === "th" ? "ถามตอบ" : currentLanguage === "en" ? "Q&A" : "问答"} - JWHERBAL</title>
        <meta name="description" content={currentLanguage === "th" ? "คำถามที่พบบ่อยเกี่ยวกับผลิตภัณฑ์ V Flow" : "Frequently asked questions about V Flow products"} />
      </Helmet>
      
      <Navbar />

      <main className="flex-1">
        {/* Review Images Carousel */}
        <section className="py-8 bg-secondary/30">
          <div className="container mx-auto px-4">
            <ReviewImageCarousel />
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5">
                <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                {currentLanguage === "th" ? "คำถามที่พบบ่อย" : currentLanguage === "en" ? "FAQ" : "常见问题"}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                {currentLanguage === "th" ? "ถาม-ตอบ" : currentLanguage === "en" ? "Q & A" : "问与答"}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {currentLanguage === "th"
                  ? "รวมคำถามที่พบบ่อยเกี่ยวกับผลิตภัณฑ์ V Flow พร้อมคำตอบจากทีมผู้เชี่ยวชาญ"
                  : currentLanguage === "en"
                  ? "Frequently asked questions about V Flow products with answers from our expert team"
                  : "关于V Flow产品的常见问题及专家团队的解答"}
              </p>

              {/* Ask Question Button */}
              <Dialog open={isAskDialogOpen} onOpenChange={setIsAskDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-shadow">
                    <Send className="h-4 w-4 mr-2" />
                    {currentLanguage === "th" ? "ส่งคำถามของคุณ" : currentLanguage === "en" ? "Ask a Question" : "提交问题"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      {currentLanguage === "th" ? "ถามคำถามของคุณ" : currentLanguage === "en" ? "Ask Your Question" : "提交您的问题"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder={currentLanguage === "th" ? "พิมพ์คำถามของคุณที่นี่..." : "Type your question here..."}
                      className="min-h-[120px]"
                    />
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmitQuestion}
                      disabled={!newQuestion.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {currentLanguage === "th" ? "ส่งคำถาม" : currentLanguage === "en" ? "Submit Question" : "提交问题"}
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

            {/* Search and Filter */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={currentLanguage === "th" ? "ค้นหาคำถาม..." : currentLanguage === "en" ? "Search questions..." : "搜索问题..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>
              </div>
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedCategory(cat.value)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ Items */}
            <div className="max-w-4xl mx-auto">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16">
                  <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {currentLanguage === "th" ? "ไม่พบคำถาม" : currentLanguage === "en" ? "No questions found" : "未找到问题"}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentLanguage === "th" 
                      ? "ลองค้นหาด้วยคำอื่นหรือเลือกหมวดหมู่อื่น" 
                      : "Try a different search or category"}
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredItems.map((item, index) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className="border-0"
                    >
                      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                        <AccordionTrigger className="px-6 py-5 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
                          <div className="flex items-start gap-4 text-left w-full">
                            {/* Question Number Badge */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
                              Q{index + 1}
                            </div>
                            
                            <div className="flex-1">
                              {/* Customer Question Label */}
                              <Badge variant="outline" className="mb-2 text-xs border-primary/30 text-primary">
                                {currentLanguage === "th" ? "คุณลูกค้าถาม" : currentLanguage === "en" ? "Customer asks" : "客户询问"}
                              </Badge>
                              
                              <h3 className="font-semibold text-foreground text-lg leading-tight">
                                {getQuestion(item)}
                              </h3>
                            </div>
                            
                            <ChevronDown className="chevron h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0" />
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-6 pb-6">
                          <div className="ml-14">
                            {/* Answer Section */}
                            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                              <Badge className="mb-3 bg-primary/20 text-primary hover:bg-primary/30">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {currentLanguage === "th" ? "V Flow ตอบ" : currentLanguage === "en" ? "V Flow answers" : "V Flow回答"}
                              </Badge>
                              
                              <p className="text-foreground leading-relaxed whitespace-pre-line">
                                {getAnswer(item)}
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>

            {/* Contact CTA */}
            <div className="max-w-2xl mx-auto mt-16 text-center">
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {currentLanguage === "th" ? "ยังไม่พบคำตอบที่ต้องการ?" : currentLanguage === "en" ? "Can't find your answer?" : "找不到答案?"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {currentLanguage === "th" 
                      ? "ติดต่อทีมงานของเราเพื่อรับคำตอบโดยตรง" 
                      : "Contact our team for a direct answer"}
                  </p>
                  <Button variant="outline" className="rounded-full" asChild>
                    <a href="/contact">
                      {currentLanguage === "th" ? "ติดต่อเรา" : currentLanguage === "en" ? "Contact Us" : "联系我们"}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;