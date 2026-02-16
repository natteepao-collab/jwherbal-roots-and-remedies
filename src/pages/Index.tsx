import { Link } from "react-router-dom";
import { ArrowRight, Star, ShieldCheck, Leaf, UserCheck, Award, Flame, Sparkles } from "lucide-react";
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
import { usePromotionTiers, getTiersByProduct, getLowestTierPrice } from "@/hooks/usePromotionTiers";
import { articles } from "@/data/articles";
import { communityPosts } from "@/data/community";
import { reviews } from "@/data/reviews";
import heroImage from "@/assets/hero-herbal.jpg";
import vflowProduct from "@/assets/vflow-product-transparent.png";
import trustPharmacist from "@/assets/trust-pharmacist.jpg";
import trustIngredients from "@/assets/trust-ingredients.jpg";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { getCommunityPostImage } from "@/lib/communityImages";

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

  // Fetch latest articles from DB (updated_at desc)
  const { data: latestDbArticles } = useQuery({
    queryKey: ["home-latest-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(3);
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
    <div className="min-h-screen flex flex-col">

      {/* Hero Section - Mobile Optimized */}
      <section className="relative min-h-[85vh] md:min-h-[600px] flex items-center justify-center overflow-hidden py-8 md:py-0">
        <div
          className="absolute inset-0 bg-cover bg-center animate-ken-burns"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="max-w-2xl space-y-4 md:space-y-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground animate-fade-in-up leading-tight">
                {t("hero.title")}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground animate-fade-in-up animation-delay-200 max-w-lg mx-auto lg:mx-0">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up animation-delay-400 justify-center lg:justify-start">
                <Button size="lg" asChild className="gap-2 hover:scale-105 transition-transform w-full sm:w-auto">
                  <Link to="/products/vflow">
                    {t("hero.vflowButton")}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="hover:scale-105 transition-transform w-full sm:w-auto">
                  <Link to="/shop">{t("hero.shopButton")}</Link>
                </Button>
              </div>
            </div>
            {/* Product image - visible on mobile too, smaller */}
            <div className="flex justify-center items-center mt-6 lg:mt-0">
              <div className="relative animate-fade-in-right">
                <img 
                  src={vflowProduct} 
                  alt="V Flow Herbal Drink Product" 
                  className="w-48 sm:w-64 md:w-80 lg:w-full lg:max-w-lg h-auto object-contain drop-shadow-2xl animate-float"
                />
                {/* Steam Effect */}
                <div className="steam-container hidden md:block">
                  <span className="steam steam-1"></span>
                  <span className="steam steam-2"></span>
                  <span className="steam steam-3"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Gallery Section */}
      <BrandStoryGallery />

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
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={expertInfo?.image_url || trustPharmacist}
                  alt="Expert pharmacist consultation"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Promotion */}
      {(promoSettings?.is_active !== false) && promotedProducts && promotedProducts.length > 0 && (
        <section id="monthly-promotion" className="py-8 md:py-12 scroll-mt-28">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Header with countdown */}
            <div className="relative mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Flame className="h-6 w-6 text-destructive" />
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                    {promoSettings?.title || (currentLanguage === "th" ? "โปรโมชั่นประจำเดือน" : currentLanguage === "en" ? "Monthly Promotion" : "本月促销")}
                  </h2>
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <CountdownTimer />
              </div>
            </div>

            {/* Promoted Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                  >
                    <Link to={`/shop/${product.id}`}>
                      <Card className="group overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl relative h-full">
                        {/* Savings badge */}
                        {savings > 0 && (
                          <div className="absolute top-3 right-3 z-10">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                            >
                              {currentLanguage === "th" ? `ประหยัด ${savings}%` : `Save ${savings}%`}
                            </motion.div>
                          </div>
                        )}
                        {productTiers.length === 0 && (
                          <div className="absolute top-3 right-3 z-10">
                            <motion.div
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                            >
                              {currentLanguage === "th" ? "โปรโมชั่นพิเศษ" : "Special Offer"}
                            </motion.div>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-2/5 aspect-square sm:aspect-auto overflow-hidden bg-secondary">
                            <img
                              src={productImages[product.id] || product.image_url}
                              alt={getText(product.name_th, product.name_en, product.name_zh)}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <CardContent className="flex-1 p-4 sm:p-6 flex flex-col justify-center">
                            <div className="text-xs text-primary font-medium mb-1">{product.category}</div>
                            <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 line-clamp-2">
                              {getText(product.name_th, product.name_en, product.name_zh)}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {getText(product.description_th, product.description_en, product.description_zh)}
                            </p>
                            <div className="flex items-end gap-2 mb-3">
                              {lowestPrice ? (
                                <>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">{currentLanguage === "th" ? "เริ่มต้นที่" : "From"}</span>
                                  <span className="text-lg sm:text-2xl font-bold text-primary">
                                    ฿{lowestPrice.toLocaleString("th-TH")}.-
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg sm:text-2xl font-bold text-primary">
                                  ฿{product.price?.toLocaleString("th-TH")}.-
                                </span>
                              )}
                            </div>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                              <Button size="sm" className="w-full gap-2">
                                <Sparkles className="h-4 w-4" />
                                {currentLanguage === "th" ? "ดูโปรโมชั่น" : "View Promotion"}
                              </Button>
                            </motion.div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
                    image: productImages[product.id] || product.image_url,
                    category: product.category,
                    description: getText(product.description_th, product.description_en, product.description_zh),
                    rating: product.rating || 0,
                  }}
                  productUuid={product.id}
                  tiers={allTiers ? getTiersByProduct(allTiers, product.id) : undefined}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-8">
                {currentLanguage === "th" ? "ยังไม่มีสินค้าแนะนำ" : currentLanguage === "en" ? "No featured products yet" : "暂无推荐产品"}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Latest Articles - from DB */}
      <section id="latest-articles" className="py-10 md:py-16 bg-secondary scroll-mt-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t("sections.latestArticles")}</h2>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link to="/articles">{t("sections.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(latestDbArticles && latestDbArticles.length > 0 ? latestDbArticles : articles.slice(0, 3)).map((article: any) => (
              <Card key={article.id} className="hover:shadow-card-hover transition-shadow overflow-hidden">
                {(article.image_url) && (
                  <img src={article.image_url} alt={article.title_th || article.title} className="w-full h-36 sm:h-44 md:h-48 object-cover" />
                )}
                <CardContent className="p-4 md:p-6">
                  <div className="text-xs text-primary font-medium mb-2">{article.category}</div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 md:mb-3 line-clamp-2">
                    {article.title_th ? getText(article.title_th, article.title_en, article.title_zh) : article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                    {article.excerpt_th ? getText(article.excerpt_th, article.excerpt_en, article.excerpt_zh) : article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">{article.author || ""}</span>
                    <Button variant="link" asChild className="p-0 h-auto text-xs sm:text-sm">
                      <Link to={`/articles/${article.slug || article.id}`}>{t("articles.readMore")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
                    {review.author_avatar || review.avatarUrl ? (
                      <img
                        src={review.author_avatar || review.avatarUrl}
                        alt={review.author_name || review.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
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

      <Footer />
    </div>
    </PageTransition>
  );
};

export default Index;
