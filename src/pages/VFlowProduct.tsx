import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Check, MessageCircle, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { vflowData } from "@/data/vflow";
import { toast } from "sonner";
import productTea from "@/assets/product-tea.jpg";

const VFlowProduct = () => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: 100,
      name: vflowData.productName,
      price: vflowData.price,
      image: productTea,
    });
    toast.success("เพิ่มสินค้าลงในตะกร้าแล้ว");
  };

  const handleLineOrder = () => {
    window.open("https://line.me/R/ti/p/@jwherbal", "_blank");
  };

  return (
    <>
      <Helmet>
        <title>{vflowData.productName} - JWHERBAL</title>
        <meta name="description" content={vflowData.tagline} />
        <meta name="keywords" content="V Flow, สมุนไพร, เลือดข้น, ไหลเวียนเลือด, ขิง, พุทราจีน, เห็ดหูหนู, IRTC" />
        <meta property="og:title" content={`${vflowData.productName} - JWHERBAL`} />
        <meta property="og:description" content={vflowData.tagline} />
        <meta property="og:type" content="product" />
        <link rel="canonical" href="https://jwherbal.com/products/vflow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-20">
          <div className="container px-4">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
              <div className="relative aspect-square max-w-md mx-auto">
                <img
                  src={productTea}
                  alt={vflowData.productName}
                  className="w-full h-full object-cover rounded-2xl shadow-elegant"
                />
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                  IRTC วิจัย
                </Badge>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                    {vflowData.productName}
                  </h1>
                  <p className="text-xl text-muted-foreground mb-4">
                    {vflowData.tagline}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                    <span className="text-sm text-muted-foreground">(4.9/5 จาก 128 รีวิว)</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">฿{vflowData.price}</p>
                </div>

                <div className="space-y-3">
                  {vflowData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                    <ShoppingCart className="h-5 w-5" />
                    ซื้อเลย
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1 gap-2" onClick={handleLineOrder}>
                    <MessageCircle className="h-5 w-5" />
                    สั่งผ่านไลน์
                  </Button>
                </div>

                <div className="bg-accent/50 p-4 rounded-lg">
                  <p className="text-sm text-accent-foreground font-semibold">
                    🎁 โปรโมชั่น: ซื้อ 2 กล่อง ลดเพิ่ม 10%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Research Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge variant="outline" className="mb-4">IRTC Research</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {vflowData.research.title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {vflowData.research.description}
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {vflowData.research.points.map((point, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <Check className="h-8 w-8 text-primary mx-auto mb-3" />
                      <p className="text-foreground">{point}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
                เหมาะสำหรับผู้ที่มีปัญหาเหล่านี้
              </h2>
              <p className="text-center text-muted-foreground mb-12">
                V Flow ช่วยเสริมสมดุลระบบเลือดจากภายในด้วยพลังสมุนไพรธรรมชาติ
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {vflowData.painPoints.map((point, index) => (
                  <Card key={index} className="hover:shadow-card-hover transition-shadow">
                    <CardContent className="p-6 text-center space-y-2">
                      <div className="text-4xl mb-2">{point.icon}</div>
                      <p className="text-sm text-foreground">{point.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
                เสียงจากผู้ใช้ V Flow
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {vflowData.testimonials.map((testimonial, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                      <p className="text-sm font-semibold text-foreground">— {testimonial.author}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
                วิธีดื่ม V Flow ให้เห็นผลดีที่สุด
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {vflowData.howToUse.map((step) => (
                  <div key={step.step} className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                      {step.step}
                    </div>
                    <div className="text-4xl">{step.icon}</div>
                    <p className="text-foreground">{step.text}</p>
                  </div>
                ))}
              </div>
              <Card className="bg-accent/50 border-accent">
                <CardContent className="p-6">
                  <p className="text-center text-accent-foreground">
                    <strong>เคล็ดลับ:</strong> {vflowData.tip}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Certificates Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
                มาตรฐานที่คุณมั่นใจได้
              </h2>
              <Card>
                <CardContent className="p-8">
                  <p className="text-center text-muted-foreground mb-6">
                    V Flow Herbal Drink ผ่านการรับรองจากหน่วยงานมาตรฐานด้านอาหารและสมุนไพร
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {vflowData.certificates.map((cert, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-foreground">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Brand Value Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
                ทำไมต้องเลือก JWHERBAL
              </h2>
              <p className="text-center text-muted-foreground mb-12">
                แบรนด์ของเรามุ่งเน้นความจริงใจ ความปลอดภัย และคุณภาพของสมุนไพรทุกชนิด
              </p>
              <div className="space-y-4">
                {vflowData.brandValues.map((value, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 flex items-start gap-4">
                      <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-foreground">{value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
                คำถามที่ลูกค้าถามบ่อย
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {vflowData.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 bg-card">
                    <AccordionTrigger className="text-left text-foreground hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Related Articles Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
                บทความที่เกี่ยวข้อง
              </h2>
              <p className="text-center text-muted-foreground mb-12">
                เรียนรู้เพิ่มเติมเกี่ยวกับสมุนไพรและสุขภาพ
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {vflowData.relatedArticles.map((article) => (
                  <Link key={article.id} to={`/articles/${article.id}`}>
                    <Card className="h-full hover:shadow-card-hover transition-shadow">
                      <CardContent className="p-6 flex items-center justify-between gap-4">
                        <p className="text-foreground font-medium">{article.title}</p>
                        <ChevronRight className="h-5 w-5 text-primary flex-shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4">
            <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  พร้อมดูแลสุขภาพของคุณแล้วหรือยัง?
                </h2>
                <p className="text-lg opacity-90">
                  ดื่ม V Flow ทุกเช้า เพื่อสุขภาพเลือดที่ดี
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" className="gap-2" onClick={handleAddToCart}>
                    <ShoppingCart className="h-5 w-5" />
                    ซื้อเลย
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={handleLineOrder}>
                    <MessageCircle className="h-5 w-5" />
                    สั่งผ่านไลน์
                  </Button>
                </div>
                <p className="text-sm opacity-80">
                  🎁 ซื้อ 2 กล่อง ลดเพิ่ม 10% | จัดส่งฟรีทั่วไทย
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default VFlowProduct;
