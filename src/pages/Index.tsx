import { Link } from "react-router-dom";
import { ArrowRight, Star, ShieldCheck, Leaf, UserCheck, Award, Flame, Sparkles, MessageCircle, Phone, Eye } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CountdownTimer } from "@/components/CountdownTimer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import BrandStoryGallery from "@/components/BrandStoryGallery";
import { productImages } from "@/assets/products";
import { products as staticProducts } from "@/data/products";
import { usePromotionTiers, getTiersByProduct, getLowestTierPrice } from "@/hooks/usePromotionTiers";
import { articles } from "@/data/articles";
import { FadeImage } from "@/components/ui/FadeImage";
import { communityPosts } from "@/data/community";
import { reviews } from "@/data/reviews";
import heroImage from "@/assets/hero-herbal.jpg";
import vflowProduct from "@/assets/vflow-hero-combo.png";
import trustPharmacist from "@/assets/trust-pharmacist.jpg";
import trustIngredients from "@/assets/trust-ingredients.jpg";
import herbGinger from "@/assets/herbs/ginger.png";
import herbJujube from "@/assets/herbs/jujube.png";
import herbBlackWoodEar from "@/assets/herbs/black-wood-ear.png";
import herbalArtisan from "@/assets/herbs/herbal-artisan.png";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { getCommunityPostImage } from "@/lib/communityImages";
import { resolveAvatar } from "@/lib/avatarUtils";
import { SeoHead } from "@/components/SeoHead";

const Index = () => {
  const { t, i18n } = useTranslation();
  // Fetch featured products from DB (active + featured only)
  const { data: featuredProducts } = useQuery({
    queryKey: ["home-featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .order("updated_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  // Fetch promoted products for monthly promotion section
  const { data: promotedProducts } = useQuery({
    queryKey: ["home-promoted-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_promoted", true)
        .order("updated_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });
  const { data: allTiers } = usePromotionTiers();
  const currentLanguage = i18n.language as "th" | "en" | "zh";

  const getText = (th: string, en: string, zh: string) => {
    switch (currentLanguage) {
      case "en": return en || th;
      case "zh": return zh || th;
      default: return th;
    }
  };

  // Fetch trust data
  const { data: certifications } = useQuery({
    queryKey: ["trust-certifications-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_certifications")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: ingredients } = useQuery({
    queryKey: ["trust-ingredients-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_ingredients")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: expertInfo } = useQuery({
    queryKey: ["trust-expert-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_expert")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: trustSettings } = useQuery({
    queryKey: ["trust-settings-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_section_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch promotion settings
  const { data: promoSettings } = useQuery({
    queryKey: ["promotion-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotion_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Fetch latest articles from DB (ordered by upload date desc)
  const { data: latestDbArticles } = useQuery({
    queryKey: ["home-latest-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .order("published_date", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  // Fetch featured/recommended articles (admin starred)
  const { data: featuredDbArticles } = useQuery({
    queryKey: ["home-featured-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("is_featured", true)
        .order("updated_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  // Fetch latest community posts from DB (updated_at desc)
  const { data: latestCommunityPosts } = useQuery({
    queryKey: ["home-latest-community"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(2);
      if (error) throw error;
      return data;
    },
  });

  // Fetch latest reviews from DB (updated_at desc)
  const { data: latestDbReviews } = useQuery({
    queryKey: ["home-latest-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("updated_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "shield": return ShieldCheck;
      case "award": return Award;
      case "leaf": return Leaf;
      default: return ShieldCheck;
    }
  };

  return (
    <PageTransition>
    <SeoHead
      title="JWHERBAL - สุขภาพดีเริ่มจากสมุนไพรใกล้ตัว"
      description="ร้านค้าออนไลน์สมุนไพรและผลิตภัณฑ์เพื่อสุขภาพคุณภาพ V Flow พร้อมบทความความรู้และชุมชนแลกเปลี่ยนประสบการณ์"
      path="/"
    />
    <div className="min-h-screen flex flex-col">

      {/* Hero Section - 5-second pitch */}
      <section className="relative min-h-[85vh] md:min-h-[600px] flex items-center justify-center overflow-hidden py-8 md:py-0">
        <div
          className="absolute inset-0 bg-cover bg-center animate-ken-burns"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Mobile Layout */}
          <div className="flex flex-col lg:hidden items-center text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="relative animate-fade-in-up">
                <img
                  src={vflowProduct}
                  alt="V FLOW Capsule และ V FLOW Herbal Drink ผลิตภัณฑ์เสริมอาหารดูแลระบบไหลเวียนโลหิต"
                  width={1000}
                  height={1000}
                  {...({ fetchpriority: "high" } as any)}
                  decoding="async"
                  className="w-64 sm:w-72 md:w-96 h-auto object-contain drop-shadow-2xl animate-float"
                />
              </div>
            </div>
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>ผ่านมาตรฐาน อย. & GMP</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tighter leading-tight animate-fade-in-up animation-delay-200">
                สุขภาพดี เริ่มที่
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">V FLOW</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground animate-fade-in-up animation-delay-400 max-w-lg mx-auto">
                ผลิตภัณฑ์ V FLOW Capsule และ V FLOW Herbal Drink ผ่านการวิจัยจากมหาวิทยาลัยเชียงใหม่ ในการทำสารสกัดด้วยกรรมวิธีทางเภสัชศาสตร์ที่เหมาะสม คงฤทธิ์ของสารที่มีคุณสมบัติที่ดีต่อสุขภาพและหลอดเลือด พร้อมวัตถุดิบที่ได้รับการคัดสรรให้มีคุณภาพที่ดี
              </p>
              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up animation-delay-600 justify-center">
                <Button size="lg" asChild className="gap-2 hover:scale-105 transition-transform w-full sm:w-auto">
                  <Link to="/products/vflow">
                    ดูสินค้า V FLOW
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="hover:scale-105 transition-transform w-full sm:w-auto">
                  <Link to="/shop">สั่งซื้อ</Link>
                </Button>
                <Button
                  size="lg"
                  onClick={() => window.open("https://line.me/R/ti/p/@jwherbal", "_blank")}
                  className="hover:scale-105 transition-transform w-full sm:w-auto gap-2 bg-[#06C755] hover:bg-[#06C755]/90 text-white"
                >
                  <MessageCircle className="h-5 w-5" />
                  ปรึกษาผ่าน LINE
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span>ผ่านมาตรฐาน อย. & GMP — สมุนไพรไทย 100%</span>
              </div>
              <p role="heading" aria-level={2} className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter leading-tight animate-fade-in-up">
                สุขภาพดี เริ่มที่
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">V FLOW</span>
              </p>
              <p className="text-lg md:text-xl text-muted-foreground animate-fade-in-up animation-delay-200 max-w-lg">
                ผลิตภัณฑ์ V FLOW Capsule และ V FLOW Herbal Drink ผ่านการวิจัยจากมหาวิทยาลัยเชียงใหม่ ในการทำสารสกัดด้วยกรรมวิธีทางเภสัชศาสตร์ที่เหมาะสม คงฤทธิ์ของสารที่มีคุณสมบัติที่ดีต่อสุขภาพและหลอดเลือด พร้อมวัตถุดิบที่ได้รับการคัดสรรให้มีคุณภาพที่ดี
              </p>
              <div className="flex flex-row flex-wrap gap-3 animate-fade-in-up animation-delay-400 justify-start">
                <Button size="lg" asChild className="gap-2 hover:scale-105 transition-transform">
                  <Link to="/products/vflow">
                    ดูสินค้า V FLOW
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="hover:scale-105 transition-transform">
                  <Link to="/shop">สั่งซื้อ</Link>
                </Button>
                <Button
                  size="lg"
                  onClick={() => window.open("https://line.me/R/ti/p/@jwherbal", "_blank")}
                  className="hover:scale-105 transition-transform gap-2 bg-[#06C755] hover:bg-[#06C755]/90 text-white"
                >
                  <MessageCircle className="h-5 w-5" />
                  ปรึกษาผ่าน LINE
                </Button>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="relative animate-fade-in-right">
                <img
                  src={vflowProduct}
                  alt="V FLOW Capsule และ V FLOW Herbal Drink ผลิตภัณฑ์เสริมอาหารดูแลระบบไหลเวียนโลหิต"
                  width={1000}
                  height={1000}
                  {...({ fetchpriority: "high" } as any)}
                  decoding="async"
                  className="w-80 lg:w-full lg:max-w-xl h-auto object-contain drop-shadow-2xl animate-float"
                />
                <div className="steam-container">
                  <span className="steam steam-1"></span>
                  <span className="steam steam-2"></span>
                  <span className="steam steam-3"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Gallery */}
      <BrandStoryGallery />

      {/* Featured Products */}
      <section id="featured-products" className="py-10 md:py-16 scroll-mt-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t("sections.featuredProducts")}</h2>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link to="/shop">{t("sections.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {featuredProducts && featuredProducts.length > 0 ? (
              featuredProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: parseInt(product.id.replace(/-/g, "").slice(0, 8), 16),
                    name: getText(product.name_th, product.name_en, product.name_zh),
                    price: product.price,
                    image: product.image_url || productImages[product.id],
                    category: product.category,
                    description: getText(product.description_th, product.description_en, product.description_zh),
                    rating: product.rating || 0,
                  }}
                  productUuid={product.id}
                  tiers={allTiers ? getTiersByProduct(allTiers, product.id) : undefined}
                />
              ))
            ) : (
              staticProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>
      {/* Monthly Promotion */}
      {(promoSettings?.is_active !== false) && promotedProducts && promotedProducts.length > 0 && (
        <section id="monthly-promotion" className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-destructive/5 via-background to-primary/5 scroll-mt-28">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Header Card with countdown */}
            <div className="relative mb-6 sm:mb-8 md:mb-10 p-4 sm:p-6 md:p-8 rounded-2xl bg-white/50 dark:bg-foreground/5 border border-destructive/20 backdrop-blur-sm overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                {/* Top section: Title with icon */}
                <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-5">
                  <motion.div 
                    animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex-shrink-0 mt-0.5"
                  >
                    <Flame className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-destructive drop-shadow-lg" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
                      {promoSettings?.title || (currentLanguage === "th" ? "โปรโมชั่นประจำเดือน" : currentLanguage === "en" ? "Monthly Promotion" : "本月促销")}
                    </h2>
                    <p className="text-2xs sm:text-xs md:text-sm text-muted-foreground mt-1 leading-snug">
                      {currentLanguage === "th" ? "ลดราคาส่วนลดสูงสุดสำหรับสิค้าเลือกสรร" : currentLanguage === "en" ? "Maximum discounts on selected items" : "精选产品最大优惠"}
                    </p>
                  </div>
                </div>
                
                {/* Countdown Timer */}
                <CountdownTimer />
              </div>
            </div>

            {/* Promoted Products Grid - Deal-focused layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {promotedProducts.map((product: any, idx: number) => {
                const productTiers = allTiers ? getTiersByProduct(allTiers, product.id) : [];
                const lowestPrice = getLowestTierPrice(allTiers || [], product.id);
                const bestTier = productTiers.find((t: any) => t.is_best_seller);
                const savings = bestTier ? Math.round(((bestTier.normal_price - bestTier.price) / bestTier.normal_price) * 100) : 0;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <Link to={`/shop/${product.id}`} className="block h-full">
                      <Card className="group overflow-hidden border-2 border-primary/30 hover:border-destructive/50 transition-all duration-300 hover:shadow-2xl relative h-full flex flex-col bg-gradient-to-br from-white/80 to-background dark:from-foreground/10 dark:to-background">
                        {/* Hot Deal Badge */}
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute top-3 right-3 z-20"
                        >
                          <div className="bg-gradient-to-br from-destructive to-destructive/80 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black shadow-lg drop-shadow">
                            <div className="flex items-center gap-1">
                              <Flame className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{savings > 0 ? `${savings}%` : "สุดคุ้ม"}</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Image Section */}
                        <div className="relative overflow-hidden bg-secondary w-full aspect-square sm:aspect-auto sm:h-48 lg:h-56">
                          <img
                            src={product.image_url || productImages[product.id]}
                            alt={getText(product.name_th, product.name_en, product.name_zh)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {/* Price Tag Overlay */}
                          <div className="absolute bottom-0 right-0 bg-gradient-to-l from-black/80 to-transparent px-3 sm:px-4 py-2 sm:py-3 text-right">
                            {lowestPrice && bestTier ? (
                              <div className="space-y-0.5">
                                <div className="text-2xs sm:text-xs text-white/70 line-through">
                                  ฿{bestTier.normal_price?.toLocaleString("th-TH")}
                                </div>
                                <div className="text-lg sm:text-xl md:text-2xl font-black text-primary">
                                  ฿{lowestPrice.toLocaleString("th-TH")}
                                </div>
                              </div>
                            ) : (
                              <div className="text-lg sm:text-xl md:text-2xl font-black text-primary">
                                ฿{product.price?.toLocaleString("th-TH")}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content Section */}
                        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
                          <div className="text-2xs sm:text-xs text-primary font-bold uppercase tracking-wider mb-1">{product.category}</div>
                          <h3 className="text-sm sm:text-base font-bold text-foreground mb-2 line-clamp-2 flex-grow group-hover:text-primary transition-colors">
                            {getText(product.name_th, product.name_en, product.name_zh)}
                          </h3>
                          <p className="text-2xs sm:text-xs text-muted-foreground mb-3 line-clamp-2">
                            {getText(product.description_th, product.description_en, product.description_zh)}
                          </p>

                          {/* CTA Button */}
                          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-auto">
                            <Button size="sm" className="w-full gap-1.5 font-bold text-xs sm:text-sm bg-destructive hover:bg-destructive/90 shadow-lg hover:shadow-xl transition-all">
                              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                              ดูดีล
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}
      {/* Trust Elements Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-3 md:mb-4">
              <span className="text-primary font-medium text-xs sm:text-sm">
                {currentLanguage === "th" ? "ความน่าเชื่อถือ" : currentLanguage === "en" ? "Trust & Quality" : "信任与品质"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 px-2">
              {trustSettings 
                ? (currentLanguage === "th" ? trustSettings.section_title_th : currentLanguage === "en" ? trustSettings.section_title_en : trustSettings.section_title_zh)
                : (currentLanguage === "th" ? "มาตรฐานที่คุณวางใจได้" : currentLanguage === "en" ? "Standards You Can Trust" : "您可以信赖的标准")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              {trustSettings 
                ? (currentLanguage === "th" ? trustSettings.section_subtitle_th : currentLanguage === "en" ? trustSettings.section_subtitle_en : trustSettings.section_subtitle_zh)
                : (currentLanguage === "th" 
                  ? "เราผ่านการรับรองมาตรฐานจากหน่วยงานที่เชื่อถือได้ พร้อมทีมผู้เชี่ยวชาญคอยให้คำปรึกษา" 
                  : currentLanguage === "en" 
                  ? "We are certified by trusted authorities with a team of experts ready to assist you." 
                  : "我们获得了可信机构的认证，并有专家团队随时为您提供帮助。")}
            </p>
          </div>

          {/* Certifications - Mobile optimized grid */}
          {certifications && certifications.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-10 md:mb-16">
              {certifications.map((cert) => {
                const IconComponent = getIconComponent(cert.icon);
                return (
                  <Card key={cert.id} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10">
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm md:text-lg text-foreground mb-1">
                        {currentLanguage === "th" ? cert.title_th : currentLanguage === "en" ? cert.title_en : cert.title_zh}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {currentLanguage === "th" ? cert.description_th : currentLanguage === "en" ? cert.description_en : cert.description_zh}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Ingredients Highlight */}
          {ingredients && ingredients.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="order-2 lg:order-1 space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  {trustSettings 
                    ? (currentLanguage === "th" ? trustSettings.ingredients_title_th : currentLanguage === "en" ? trustSettings.ingredients_title_en : trustSettings.ingredients_title_zh)
                    : (currentLanguage === "th" ? "วัตถุดิบพรีเมียม คัดสรรอย่างพิถีพิถัน" : currentLanguage === "en" ? "Premium Ingredients, Carefully Selected" : "优质原料，精心挑选")}
                </h3>
                <div className="space-y-4">
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {currentLanguage === "th" ? ingredient.name_th : currentLanguage === "en" ? ingredient.name_en : ingredient.name_zh}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {currentLanguage === "th" ? ingredient.description_th : currentLanguage === "en" ? ingredient.description_en : ingredient.description_zh}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={trustSettings?.ingredients_image_url || trustIngredients}
                    alt="Premium herbal ingredients"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              </div>
            </div>
          )}

          {/* Expert Consultation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl min-h-[320px] flex items-center justify-center bg-secondary">
                <img
                  src={expertInfo?.image_url || trustPharmacist}
                  alt="Expert pharmacist consultation"
                  className="max-w-full h-auto max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] lg:max-h-[70vh] object-contain mx-auto transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium text-sm">
                  {currentLanguage === "th" ? "ปรึกษาผู้เชี่ยวชาญ" : currentLanguage === "en" ? "Expert Consultation" : "专家咨询"}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {expertInfo 
                  ? (currentLanguage === "th" ? expertInfo.title_th : currentLanguage === "en" ? expertInfo.title_en : expertInfo.title_zh)
                  : (currentLanguage === "th" ? "ทีมเภสัชกรพร้อมให้คำปรึกษา" : currentLanguage === "en" ? "Pharmacist Team Ready to Assist" : "药剂师团队随时为您服务")}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {expertInfo 
                  ? (currentLanguage === "th" ? expertInfo.description_th : currentLanguage === "en" ? expertInfo.description_en : expertInfo.description_zh)
                  : (currentLanguage === "th" 
                    ? "เรามีทีมเภสัชกรและผู้เชี่ยวชาญด้านสมุนไพรไทยคอยให้คำปรึกษาตลอดเวลา เพื่อให้คุณมั่นใจในการเลือกผลิตภัณฑ์ที่เหมาะกับสุขภาพของคุณ" 
                    : currentLanguage === "en" 
                    ? "Our team of pharmacists and Thai herbal experts are always available to advise you, ensuring you choose the right products for your health." 
                    : "我们的药剂师和泰国草药专家团队随时为您提供建议，确保您选择适合您健康的产品。")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/contact">
                    {currentLanguage === "th" ? "ติดต่อปรึกษา" : currentLanguage === "en" ? "Contact Us" : "联系我们"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link to="/certifications">
                    {currentLanguage === "th" ? "ดูใบรับรองทั้งหมด" : currentLanguage === "en" ? "View All Certifications" : "查看所有认证"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Main Ingredients V FLOW */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-3">
              <span className="text-primary font-medium text-xs sm:text-sm">ส่วนประกอบหลัก V FLOW</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">สมุนไพร 3 ชนิด คัดสรรเพื่อการดูแลสุขภาพ</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              วัตถุดิบธรรมชาติ 100% ผ่านการคัดเลือกอย่างพิถีพิถัน
            </p>
          </div>

          {/* Artisan storytelling banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative max-w-6xl mx-auto mb-12 md:mb-16 rounded-3xl overflow-hidden shadow-2xl border border-primary/10 bg-card"
          >
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Text panel */}
              <div className="md:col-span-2 p-6 md:p-10 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-primary/5 via-background to-background order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 mb-4 self-start">
                  <Leaf className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] md:text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                    Handcrafted with Care
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
                  คัดสรรด้วยมือ<br />
                  จากภูมิปัญญาดั้งเดิม
                </h3>
                <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent mb-4" />
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                  ทุกเม็ดสมุนไพรผ่านการคัดเลือกอย่างพิถีพิถัน
                  ตากแห้งตามธรรมชาติ เพื่อคงคุณค่าสูงสุดส่งถึงคุณ
                </p>
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/60">
                  <div>
                    <div className="text-lg md:text-xl font-bold text-primary">100%</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">ธรรมชาติ</div>
                  </div>
                  <div>
                    <div className="text-lg md:text-xl font-bold text-primary">GMP</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">มาตรฐาน</div>
                  </div>
                  <div>
                    <div className="text-lg md:text-xl font-bold text-primary">3</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">สมุนไพรหลัก</div>
                  </div>
                </div>
              </div>

              {/* Image panel */}
              <div className="md:col-span-3 relative order-1 md:order-2 min-h-[280px] md:min-h-[420px]">
                <img
                  src={herbalArtisan}
                  alt="ช่างฝีมือคัดสรรสมุนไพรด้วยมือ"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Subtle edge fade only on desktop left edge to blend with text panel */}
                <div className="hidden md:block absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                {/* Floating caption */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 shadow-md">
                  <span className="text-[10px] md:text-xs text-foreground font-medium inline-flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Traditional Craft
                  </span>
                </div>
              </div>
            </div>
          </motion.div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
            {[
              { img: herbGinger, name: "ขิง (Ginger)", sci: "Zingiber officinale", desc: "ต้านการแข็งตัวของหลอดเลือด ลดไขมัน และความดันโลหิต", tint: "from-amber-100/60 to-orange-50/40", badge: "🫚" },
              { img: herbJujube, name: "พุทราจีน (Jujube)", sci: "Ziziphus jujuba", desc: "เสริมสารต้านอนุมูลอิสระ เสริมการทำงานของหัวใจ", tint: "from-rose-100/60 to-red-50/40", badge: "🍒" },
              { img: herbBlackWoodEar, name: "เห็ดหูหนูดำ (Black Wood Ear)", sci: "Auricularia auricula-judae", desc: "ลดหลอดเลือดแข็งตัว เพิ่มการไหลเวียนของเลือด", tint: "from-stone-200/60 to-emerald-50/40", badge: "🍄" },
            ].map((it, idx) => (
              <motion.div
                key={it.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
              >
                <Card className="group relative overflow-hidden rounded-2xl border-primary/10 bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={it.img}
                      alt={it.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${it.tint} mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                    {/* Floating badge */}
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-2xl border border-white">
                      {it.badge}
                    </div>
                    {/* Leaf accent */}
                    <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-semibold backdrop-blur-sm shadow-md">
                      <Leaf className="h-3 w-3" />
                      100% Natural
                    </div>
                  </div>
                  {/* Content */}
                  <CardContent className="relative px-6 pt-4 pb-6 text-center -mt-10 z-10">
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">{it.name}</h3>
                    <p className="text-xs text-primary/80 italic mb-3 font-medium">{it.sci}</p>
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews - from DB */}
      <section id="reviews" className="py-10 md:py-16 bg-secondary scroll-mt-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t("sections.customerReviews")}</h2>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link to="/reviews">{t("sections.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(latestDbReviews && latestDbReviews.length > 0 ? latestDbReviews : reviews.slice(0, 3)).map((review: any) => (
              <Card key={review.id} className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 mb-4">
                  {resolveAvatar(review.author_avatar) || review.avatarUrl ? (
                      <img
                        src={resolveAvatar(review.author_avatar) || review.avatarUrl}
                        alt={review.author_name || review.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                        {(review.author_name || review.name || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{review.author_name || review.name}</h3>
                      {review.occupation && (
                        <p className="text-sm text-muted-foreground">
                          {review.age} {currentLanguage === "th" ? "ปี" : "yrs"} • {review.occupation[currentLanguage]}
                        </p>
                      )}
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`h-3 w-3 ${
                              index < (review.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {review.comment || (review.review ? review.review[currentLanguage] : "")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ ก่อนซื้อ */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-3">
              <span className="text-primary font-medium text-xs sm:text-sm">คำถามที่พบบ่อย</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">FAQ ก่อนตัดสินใจ</h2>
            <p className="text-sm sm:text-base text-muted-foreground">รวมข้อสงสัยที่ลูกค้าถามบ่อยที่สุด</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "V FLOW เหมาะกับใคร?", a: "เหมาะสำหรับผู้ที่ต้องการดูแลสุขภาพหัวใจและหลอดเลือดในชีวิตประจำวัน ผู้สูงอายุ และผู้ที่ต้องการเสริมสมุนไพรในชีวิตประจำวัน" },
              { q: "ดื่มอย่างไรและบ่อยแค่ไหน?", a: "ฉีกซองผสมในน้ำร้อน 150–200 มล. คนให้เข้ากัน ดื่มก่อนอาหารเช้า วันละ 1 ซอง แนะนำดื่มต่อเนื่อง 14–28 วัน" },
              { q: "มี อย. หรือมาตรฐานอะไรบ้าง?", a: "ได้รับเลข อย. 50-1-16657-2-0226 ผลิตในโรงงานมาตรฐาน GMP, HACCP, ISO 9001/22000 ดูใบรับรองทั้งหมดที่หน้า /certifications" },
              { q: "สั่งซื้อและจัดส่งอย่างไร?", a: "สั่งซื้อผ่านเว็บไซต์ หรือแชท LINE @jwherbal จัดส่งทั่วประเทศ ผ่านขนส่งมาตรฐาน 2–4 วันทำการ" },
              { q: "ผลิตภัณฑ์นี้รักษาโรคได้ไหม?", a: "เป็นผลิตภัณฑ์เสริมอาหาร ไม่มีผลในการป้องกันหรือรักษาโรค ใช้เสริมการดูแลสุขภาพควบคู่กับอาหารหลากหลายครบ 5 หมู่และการพักผ่อน" },
            ].map((it, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{it.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-6">
            <Button variant="outline" asChild>
              <Link to="/faq">ดู FAQ ทั้งหมด</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Articles - from DB with 1:1 aspect ratio */}
      <section id="featured-articles" className="py-10 md:py-16 bg-secondary scroll-mt-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t("sections.latestArticles")}</h2>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link to="/articles">{t("sections.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
            {(latestDbArticles && latestDbArticles.length > 0 ? latestDbArticles : articles.slice(0, 6)).map((article: any) => (
              <Card key={article.id} className="hover:shadow-card-hover transition-shadow overflow-hidden flex flex-col">
                {(article.image_url) && (
                  <Link to={`/articles/${article.slug || article.id}`} className="relative w-full pb-[100%] bg-muted overflow-hidden block">
                    <FadeImage
                      src={article.image_url}
                      alt={article.title_th || article.title}
                      loading="lazy"
                      decoding="async"
                      wrapperClassName="absolute inset-0"
                      className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    />
                  </Link>
                )}
                <CardContent className="p-3 md:p-4 flex-1 flex flex-col">
                  <div className="text-2xs text-primary font-medium mb-1 md:mb-2">{article.category}</div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 line-clamp-2 flex-grow">
                    {article.title_th ? getText(article.title_th, article.title_en, article.title_zh) : article.title}
                  </h3>
                  <div className="flex items-center justify-between text-2xs sm:text-xs mt-auto">
                    <span className="text-muted-foreground line-clamp-1 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {(article.views || 0).toLocaleString()}
                    </span>
                    <Button variant="link" asChild className="p-0 h-auto text-2xs sm:text-xs">
                      <Link to={`/articles/${article.slug || article.id}`}>{t("articles.readMore")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured/Recommended Articles - admin starred */}
      {featuredDbArticles && featuredDbArticles.length > 0 && (
        <section id="recommended-articles" className="py-10 md:py-16 scroll-mt-28">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Star className="h-5 w-5 md:h-6 md:w-6 fill-amber-500 text-amber-500" />
                {t("sections.featuredArticles")}
              </h2>
              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                <Link to="/articles">{t("sections.viewAll")}</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredDbArticles.map((article: any) => (
                <Card key={article.id} className="hover:shadow-card-hover transition-shadow overflow-hidden flex flex-col relative">
                  <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-2xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="h-3 w-3 fill-white" />
                    <span>{t("sections.featuredArticles")}</span>
                  </div>
                  {article.image_url && (
                    <Link to={`/articles/${article.slug || article.id}`} className="relative w-full pb-[100%] bg-muted overflow-hidden block">
                      <FadeImage
                        src={article.image_url}
                        alt={article.title_th || article.title}
                        loading="lazy"
                        decoding="async"
                        wrapperClassName="absolute inset-0"
                        className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    </Link>
                  )}
                  <CardContent className="p-3 md:p-4 flex-1 flex flex-col">
                    <div className="text-2xs text-primary font-medium mb-1 md:mb-2">{article.category}</div>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 line-clamp-2 flex-grow">
                      {article.title_th ? getText(article.title_th, article.title_en, article.title_zh) : article.title}
                    </h3>
                    <div className="flex items-center justify-between text-2xs sm:text-xs mt-auto">
                      <span className="text-muted-foreground line-clamp-1 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {(article.views || 0).toLocaleString()}
                      </span>
                      <Button variant="link" asChild className="p-0 h-auto text-2xs sm:text-xs">
                        <Link to={`/articles/${article.slug || article.id}`}>{t("articles.readMore")}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Highlights - from DB */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t("sections.communityHighlights")}</h2>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link to="/community">{t("sections.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {(latestCommunityPosts && latestCommunityPosts.length > 0 ? latestCommunityPosts : communityPosts.slice(0, 2)).map((post: any) => (
              <Card key={post.id} className="hover:shadow-card-hover transition-shadow overflow-hidden">
                <div className="flex gap-4 p-4 md:p-6">
                  {(post.thumbnail) && (
                    <img
                      src={getCommunityPostImage(post.thumbnail)}
                      alt={post.title_th || post.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-primary font-medium mb-1">{post.category}</div>
                    <h3 className="text-sm sm:text-base font-semibold mb-1 line-clamp-2">
                      {post.title_th ? getText(post.title_th, post.title_en, post.title_zh) : post.title}
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <span>{post.author_name || post.author}</span>
                      <span className="mx-2">•</span>
                      <span>{post.comments_count || post.comments || 0} {currentLanguage === "th" ? "ความคิดเห็น" : "comments"}</span>
                    </div>
                    <Button variant="link" asChild className="p-0 h-auto text-xs sm:text-sm">
                      <Link to={`/community/${post.id}`}>{currentLanguage === "th" ? "อ่านกระทู้" : "Read post"}</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Contact / LINE CTA */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-primary/10 via-background to-[#06C755]/10">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="rounded-3xl bg-card border border-primary/20 shadow-xl p-6 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium text-xs sm:text-sm">ปรึกษา / สั่งซื้อ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              พร้อมให้คำปรึกษาทุกวัน
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              ทีมงานยินดีให้คำแนะนำเรื่องการเลือกผลิตภัณฑ์และการดูแลสุขภาพ ติดต่อเราได้ผ่านช่องทางที่สะดวก
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => window.open("https://line.me/R/ti/p/@jwherbal", "_blank")}
                className="gap-2 bg-[#06C755] hover:bg-[#06C755]/90 text-white hover:scale-105 transition-transform"
              >
                <MessageCircle className="h-5 w-5" />
                แชท LINE @jwherbal
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 hover:scale-105 transition-transform">
                <Link to="/contact">
                  <Phone className="h-5 w-5" />
                  ดูช่องทางติดต่อทั้งหมด
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
    </PageTransition>
  );
};

export default Index;
