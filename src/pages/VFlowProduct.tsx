import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Check, MessageCircle, ChevronRight, Droplets, Shield, Award, Beaker, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { vflowData } from "@/data/vflow";
import { usePromotionTiers, getTiersByProduct } from "@/hooks/usePromotionTiers";
import { productImages } from "@/assets/products";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import vflowProductImg from "@/assets/vflow-product-transparent.png";
import vflowCapsuleInfo from "@/assets/products/vflow-capsule-info.jpg";
import vflowDrinkInfo from "@/assets/products/vflow-drink-info.jpg";
import PromotionModal from "@/components/PromotionModal";
import { useState } from "react";

const VFLOW_DRINK_ID = "b2f2c2d2-2222-4222-8222-222222222222";
const VFLOW_CAPSULE_ID = "a1f1c1d1-1111-4111-8111-111111111111";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const VFlowProduct = () => {
  const { addItem } = useCart();
  const { i18n } = useTranslation();
  const currentLang = i18n.language as "th" | "en" | "zh";
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPromoProduct, setSelectedPromoProduct] = useState<any>(null);

  const getText = (th: string, en: string, zh: string) => {
    switch (currentLang) {
      case "en": return en || th;
      case "zh": return zh || th;
      default: return th;
    }
  };

  // Fetch V Flow products from DB
  const { data: vflowProducts } = useQuery({
    queryKey: ["vflow-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", [VFLOW_DRINK_ID, VFLOW_CAPSULE_ID]);
      if (error) throw error;
      return data;
    },
  });
  const { data: allTiers } = usePromotionTiers();

  // Fetch V Flow page settings from DB
  const { data: pageSettings } = useQuery({
    queryKey: ["vflow-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vflow_page_settings" as any)
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as any;
    },
  });

  // Fetch reviews for V Flow products
  const { data: vflowReviews } = useQuery({
    queryKey: ["vflow-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .in("product_id", [VFLOW_DRINK_ID, VFLOW_CAPSULE_ID])
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  // Fetch product images
  const { data: productImagesDb } = useQuery({
    queryKey: ["vflow-product-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .in("product_id", [VFLOW_DRINK_ID, VFLOW_CAPSULE_ID])
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const drinkProduct = vflowProducts?.find(p => p.id === VFLOW_DRINK_ID);
  const capsuleProduct = vflowProducts?.find(p => p.id === VFLOW_CAPSULE_ID);

  // Use DB settings with vflowData as fallback
  const ps = pageSettings || vflowData as any;
  const highlightsList: string[] = ps.highlights || vflowData.highlights;
  const painPointsList: { icon: string; text: string }[] = ps.pain_points || vflowData.painPoints;
  const howToUseList: { step: number; text: string; icon: string }[] = ps.how_to_use || vflowData.howToUse;
  const certificatesList: string[] = ps.certificates || vflowData.certificates;
  const brandValuesList: string[] = ps.brand_values || vflowData.brandValues;
  const faqsList: { question: string; answer: string }[] = ps.faqs || vflowData.faqs;
  const researchTitle = ps.research_title || vflowData.research.title;
  const researchDescription = ps.research_description || vflowData.research.description;
  const researchPointsList: string[] = ps.research_points || vflowData.research.points;
  const tipText = ps.tip || vflowData.tip;

  const handleSelectPackage = (product: any) => {
    const productTiers = allTiers ? getTiersByProduct(allTiers, product.id) : [];
    if (productTiers.length > 0) {
      setSelectedPromoProduct(product);
      setModalOpen(true);
    } else {
      addItem({
        id: parseInt(product.id.replace(/-/g, "").slice(0, 8), 16),
        name: getText(product.name_th, product.name_en, product.name_zh),
        price: product.price,
        image: productImages[product.id] || product.image_url,
      });
      toast.success("เพิ่มสินค้าลงในตะกร้าแล้ว");
    }
  };

  const handleLineOrder = () => {
    window.open("https://line.me/R/ti/p/@jwherbal", "_blank");
  };

  return (
    <PageTransition>
      <>
        <Helmet>
          <title>V FLOW HERBAL - ผลิตภัณฑ์สมุนไพรเพื่อการไหลเวียนโลหิต | JWHERBAL</title>
          <meta name="description" content="V Flow ผลิตภัณฑ์สมุนไพรไทย 100% จากโครงการวิจัย IRTC ช่วยการไหลเวียนโลหิต ลดภาวะเลือดข้น มีทั้งแบบแคปซูลและเครื่องดื่ม" />
        </Helmet>

        <div className="min-h-screen bg-background">

          {/* Hero */}
          <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
            <div className="container px-4 relative">
              <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-center max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center"
                >
                  <img
                    src={vflowProductImg}
                    alt="V Flow Herbal Products"
                    className="w-64 md:w-80 lg:w-96 h-auto object-contain drop-shadow-xl"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <Badge variant="outline" className="mb-3 text-xs tracking-wider">
                      IRTC RESEARCH
                    </Badge>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                      V FLOW
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2">
                      ผลิตภัณฑ์สมุนไพรเพื่อการไหลเวียนโลหิตที่ดี
                    </p>
                  </div>

                  {drinkProduct && (
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                      <span className="text-sm text-muted-foreground">
                        ({drinkProduct.rating}/5)
                      </span>
                    </div>
                  )}

                  <p className="text-muted-foreground leading-relaxed">
                    {drinkProduct
                      ? getText(drinkProduct.description_th, drinkProduct.description_en, drinkProduct.description_zh)
                      : (ps.description || vflowData.description)}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" className="gap-2" onClick={() => {
                      const el = document.getElementById("vflow-products");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}>
                      <ShoppingCart className="h-4 w-4" />
                      ดูผลิตภัณฑ์ทั้งหมด
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2" onClick={handleLineOrder}>
                      <MessageCircle className="h-4 w-4" />
                      สั่งผ่านไลน์
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Highlights */}
          <section className="py-16 md:py-20">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <motion.h2
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={0}
                  className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10"
                >
                  จุดเด่นของ V Flow
                </motion.h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {highlightsList.map((highlight, i) => (
                    <motion.div
                      key={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      custom={i}
                    >
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{highlight}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Products Section */}
          <section id="vflow-products" className="py-16 md:py-20 bg-secondary/30 scroll-mt-28">
            <div className="container px-4">
              <div className="max-w-5xl mx-auto">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={0}
                  className="text-center mb-10"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">เลือกผลิตภัณฑ์ V Flow</h2>
                  <p className="text-muted-foreground">มีให้เลือก 2 รูปแบบ ตามไลฟ์สไตล์ของคุณ</p>
                </motion.div>

                {/* Product Info Images */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  {[
                    { src: vflowCapsuleInfo, alt: "V Flow Capsule - ข้อมูลผลิตภัณฑ์แคปซูล" },
                    { src: vflowDrinkInfo, alt: "V Flow Herbal Drink - ข้อมูลเครื่องดื่มสมุนไพร" },
                  ].map((img, idx) => (
                    <motion.div
                      key={idx}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      custom={idx}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-auto rounded-xl shadow-md"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[drinkProduct, capsuleProduct].filter(Boolean).map((product: any, idx) => {
                    const productTiers = allTiers ? getTiersByProduct(allTiers, product.id) : [];
                    const lowestPrice = productTiers.length > 0 ? Math.min(...productTiers.map((t: any) => t.price)) : null;
                    return (
                      <motion.div
                        key={product.id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={idx}
                      >
                        <Card className="overflow-hidden h-full border-border/50 hover:shadow-lg transition-shadow duration-300">
                          <div className="aspect-[4/3] bg-muted/30 overflow-hidden">
                            <img
                              src={productImages[product.id] || product.image_url}
                              alt={getText(product.name_th, product.name_en, product.name_zh)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-6 space-y-4">
                            <div>
                              <Badge variant="secondary" className="text-[10px] mb-2">{product.category}</Badge>
                              <h3 className="text-lg font-bold text-foreground">
                                {getText(product.name_th, product.name_en, product.name_zh)}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {getText(product.description_th, product.description_en, product.description_zh)}
                            </p>
                            {lowestPrice ? (
                              <div>
                                <span className="text-xs text-muted-foreground">เริ่มต้นที่</span>
                                <span className="block text-2xl font-bold text-primary">
                                  ฿{lowestPrice.toLocaleString("th-TH")}.-
                                </span>
                              </div>
                            ) : (
                              <span className="text-2xl font-bold text-primary">
                                ฿{product.price?.toLocaleString("th-TH")}
                              </span>
                            )}
                            <div className="flex gap-2">
                              <Button className="flex-1 gap-2" onClick={() => handleSelectPackage(product)}>
                                <Package className="h-4 w-4" />
                                {productTiers.length > 0 ? "เลือกแพ็กเกจ" : "เพิ่มลงตะกร้า"}
                              </Button>
                              <Button variant="outline" asChild>
                                <Link to={`/shop/${product.id}`}>ดูรายละเอียด</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Research */}
          <section className="py-16 md:py-20">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={0}
                >
                  <Badge variant="outline" className="mb-4 text-xs tracking-wider">IRTC RESEARCH</Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {researchTitle}
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
                    {researchDescription}
                  </p>
                </motion.div>
                <div className="grid md:grid-cols-3 gap-4">
                  {researchPointsList.map((point, i) => (
                    <motion.div
                      key={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      custom={i}
                    >
                      <Card className="border-border/50">
                        <CardContent className="p-6 text-center">
                          <Beaker className="h-6 w-6 text-primary mx-auto mb-3" />
                          <p className="text-sm text-foreground">{point}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Pain Points */}
          <section className="py-16 md:py-20">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={0}
                  className="text-center mb-10"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    เหมาะสำหรับผู้ที่มีปัญหาเหล่านี้
                  </h2>
                  <p className="text-muted-foreground">V Flow ช่วยเสริมสมดุลระบบเลือดจากภายใน</p>
                </motion.div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {painPointsList.map((point, i) => (
                    <motion.div
                      key={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      custom={i}
                    >
                      <div className="text-center p-5 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors">
                        <div className="text-3xl mb-2">{point.icon}</div>
                        <p className="text-xs text-foreground">{point.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Suitable For (from DB) */}
          {drinkProduct?.suitable_for_th && (
            <section className="py-16 md:py-20 bg-secondary/30">
              <div className="container px-4">
                <div className="max-w-4xl mx-auto">
                  <motion.h2
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={0}
                    className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10"
                  >
                    เหมาะสำหรับใคร
                  </motion.h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {getText(
                      drinkProduct.suitable_for_th,
                      drinkProduct.suitable_for_en,
                      drinkProduct.suitable_for_zh
                    )
                      .split("•")
                      .filter((s: string) => s.trim())
                      .map((item: string, i: number) => (
                        <motion.div
                          key={i}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          variants={fadeUp}
                          custom={i}
                          className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card"
                        >
                          <Droplets className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{item.trim()}</span>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* How to Use */}
          <section className="py-16 md:py-20">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <motion.h2
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={0}
                  className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10"
                >
                  วิธีดื่ม V Flow
                </motion.h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {howToUseList.map((step, i) => (
                    <motion.div
                      key={step.step}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      custom={i}
                      className="text-center space-y-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto">
                        {step.step}
                      </div>
                      <div className="text-2xl">{step.icon}</div>
                      <p className="text-sm text-foreground">{step.text}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    <strong>เคล็ดลับ:</strong> {tipText}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Reviews from DB */}
          <section className="py-16 md:py-20">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <motion.h2
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={0}
                  className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10"
                >
                  เสียงจากผู้ใช้ V Flow
                </motion.h2>
                {vflowReviews && vflowReviews.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {vflowReviews.map((review, i) => (
                      <motion.div
                        key={review.id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={i}
                      >
                        <Card className="h-full border-border/50">
                          <CardContent className="p-5 space-y-3">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, j) => (
                                <Star
                                  key={j}
                                  className={`h-3.5 w-3.5 ${j < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground italic leading-relaxed">"{review.comment}"</p>
                            <p className="text-xs font-medium text-foreground">— {review.author_name}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {vflowData.testimonials.map((t, i) => (
                      <Card key={i} className="border-border/50">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex gap-0.5">
                            {[...Array(t.rating)].map((_, j) => (
                              <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
                          <p className="text-xs font-medium text-foreground">— {t.author}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Certificates */}
          <section className="py-16 md:py-20 bg-secondary/30">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <motion.h2
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={0}
                  className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10"
                >
                  มาตรฐานที่คุณมั่นใจได้
                </motion.h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {certificatesList.map((cert, i) => (
                    <motion.div
                      key={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      custom={i}
                      className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card"
                    >
                      <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{cert}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Brand Values */}
          <section className="py-16 md:py-20">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={0}
                  className="text-center mb-10"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    ทำไมต้องเลือก JWHERBAL
                  </h2>
                  <p className="text-muted-foreground">ความจริงใจ ความปลอดภัย และคุณภาพ</p>
                </motion.div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {brandValuesList.map((value, i) => (
                    <motion.div
                      key={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      custom={i}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card"
                    >
                      <Award className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* FAQ */}
          <section className="py-16 md:py-20">
            <div className="container px-4">
              <div className="max-w-3xl mx-auto">
                <motion.h2
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={0}
                  className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10"
                >
                  คำถามที่พบบ่อย
                </motion.h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqsList.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`item-${i}`}
                      className="border border-border/50 rounded-lg px-5 bg-card"
                    >
                      <AccordionTrigger className="text-left text-sm text-foreground hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 md:py-20 bg-primary/[0.03]">
            <div className="container px-4">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  พร้อมดูแลสุขภาพของคุณแล้วหรือยัง?
                </h2>
                <p className="text-muted-foreground">
                  ดื่ม V Flow ทุกเช้า เพื่อสุขภาพเลือดที่ดี
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="gap-2" onClick={() => {
                    const el = document.getElementById("vflow-products");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}>
                    <ShoppingCart className="h-4 w-4" />
                    เลือกซื้อผลิตภัณฑ์
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2" onClick={handleLineOrder}>
                    <MessageCircle className="h-4 w-4" />
                    สั่งผ่านไลน์
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </>

      {selectedPromoProduct && (() => {
        const promoTiers = allTiers ? getTiersByProduct(allTiers, selectedPromoProduct.id) : [];
        return promoTiers.length > 0 ? (
          <PromotionModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            productName={getText(selectedPromoProduct.name_th, selectedPromoProduct.name_en, selectedPromoProduct.name_zh)}
            productImage={productImages[selectedPromoProduct.id] || selectedPromoProduct.image_url}
            productId={parseInt(selectedPromoProduct.id.replace(/-/g, "").slice(0, 8), 16)}
            tiers={promoTiers}
          />
        ) : null;
      })()}
    </PageTransition>
  );
};

export default VFlowProduct;
