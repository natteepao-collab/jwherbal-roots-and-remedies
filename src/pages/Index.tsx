import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { articles } from "@/data/articles";
import { communityPosts } from "@/data/community";
import { reviews } from "@/data/reviews";
import heroImage from "@/assets/hero-herbal.jpg";
import vflowProduct from "@/assets/vflow-product-transparent.png";
import brandStoryImageDefault from "@/assets/brand-story-farm.jpg";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

interface BrandStory {
  id: string;
  title_th: string;
  title_en: string;
  title_zh: string;
  description_th: string;
  description_en: string;
  description_zh: string;
  image_url: string | null;
}

const Index = () => {
  const { t, i18n } = useTranslation();
  const featuredProducts = products.slice(0, 4);
  const latestArticles = articles.slice(0, 3);
  const popularPosts = communityPosts.slice(0, 2);
  const currentLanguage = i18n.language as "th" | "en" | "zh";

  const { data: brandStory } = useQuery({
    queryKey: ["brand-story-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_story")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as BrandStory | null;
    },
  });

  const getBrandStoryTitle = () => {
    if (!brandStory) {
      return currentLanguage === "th" 
        ? "จากแปลงปลูกอินทรีย์ สู่มือคุณ" 
        : currentLanguage === "en" 
        ? "From Organic Farms to Your Hands" 
        : "从有机农场到您手中";
    }
    switch (currentLanguage) {
      case "en": return brandStory.title_en;
      case "zh": return brandStory.title_zh;
      default: return brandStory.title_th;
    }
  };

  const getBrandStoryDescription = () => {
    if (!brandStory) {
      return currentLanguage === "th"
        ? "เราคัดสรรเฉพาะสมุนไพรเกรดพรีเมียมจากแหล่งปลูกที่ดีที่สุดในประเทศไทย ผ่านกระบวนการผลิตที่ได้มาตรฐาน เพื่อให้คุณมั่นใจได้ในคุณภาพทุกหยดที่ดื่ม"
        : currentLanguage === "en"
        ? "We carefully select only premium-grade herbs from the finest farms in Thailand, processed through certified production standards, ensuring quality in every drop you drink."
        : "我们精心挑选来自泰国最好农场的优质草药，通过认证的生产标准加工，确保您饮用的每一滴都是高品质的。";
    }
    switch (currentLanguage) {
      case "en": return brandStory.description_en;
      case "zh": return brandStory.description_zh;
      default: return brandStory.description_th;
    }
  };

  const brandStoryImage = brandStory?.image_url || brandStoryImageDefault;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center animate-ken-burns"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/70" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground animate-fade-in-up">
                {t("hero.title")}
              </h1>
              <p className="text-xl mb-8 text-muted-foreground animate-fade-in-up animation-delay-200">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-400">
                <Button size="lg" asChild className="gap-2 hover:scale-105 transition-transform">
                  <Link to="/products/vflow">
                    {t("hero.vflowButton")}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="hover:scale-105 transition-transform">
                  <Link to="/shop">{t("hero.shopButton")}</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative animate-fade-in-right">
                <img 
                  src={vflowProduct} 
                  alt="V Flow Herbal Drink Product" 
                  className="w-full max-w-lg h-auto object-contain drop-shadow-2xl animate-float"
                />
                {/* Steam Effect */}
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

      {/* Brand Story Section */}
      <section className="py-20 bg-secondary overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={brandStoryImage}
                  alt="Organic herbal farm"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-1 bg-primary/10 rounded-full">
                <span className="text-primary font-medium text-sm">
                  {currentLanguage === "th" ? "เรื่องราวของเรา" : currentLanguage === "en" ? "Our Story" : "我们的故事"}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {getBrandStoryTitle()}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {getBrandStoryDescription()}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/about">
                    {currentLanguage === "th" ? "เรียนรู้เพิ่มเติม" : currentLanguage === "en" ? "Learn More" : "了解更多"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/products/vflow">
                    {currentLanguage === "th" ? "ดูผลิตภัณฑ์ V Flow" : currentLanguage === "en" ? "View V Flow Product" : "查看V Flow产品"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">{t("sections.featuredProducts")}</h2>
            <Button variant="outline" asChild>
              <Link to="/shop">{t("sections.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>{t("shop.disclaimer")}</p>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">{t("sections.latestArticles")}</h2>
            <Button variant="outline" asChild>
              <Link to="/articles">{t("sections.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="text-xs text-primary font-medium mb-2">{article.category}</div>
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{article.readTime}</span>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link to={`/articles/${article.id}`}>{t("articles.readMore")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">{t("sections.communityHighlights")}</h2>
            <Button variant="outline" asChild>
              <Link to="/community">{t("sections.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="text-xs text-primary font-medium mb-2">{post.category}</div>
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <span>{post.author}</span>
                    <span className="mx-2">•</span>
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.comments} ความคิดเห็น</span>
                  </div>
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link to={`/community/${post.id}`}>อ่านกระทู้</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section id="reviews" className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">{t("sections.customerReviews")}</h2>
            <Button variant="outline" asChild>
              <Link to="/reviews">{t("sections.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((review) => (
              <Card key={review.id} className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={review.avatarUrl}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{review.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {review.age} {currentLanguage === "th" ? "ปี" : currentLanguage === "en" ? "years old" : "岁"} • {review.occupation[currentLanguage]}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`h-3 w-3 ${
                              index < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {review.review[currentLanguage]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
