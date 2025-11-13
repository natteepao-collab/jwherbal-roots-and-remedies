import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Users, BookOpen, Star } from "lucide-react";
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
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t, i18n } = useTranslation();
  const featuredProducts = products.slice(0, 4);
  const latestArticles = articles.slice(0, 3);
  const popularPosts = communityPosts.slice(0, 2);
  const currentLanguage = i18n.language as "th" | "en" | "zh";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/70" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                {t("hero.title")}
              </h1>
              <p className="text-xl mb-8 text-muted-foreground">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/products/vflow">
                    {t("hero.vflowButton")}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/shop">{t("hero.shopButton")}</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
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

      {/* Features */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("features.natural.title")}</h3>
                <p className="text-muted-foreground">
                  {t("features.natural.description")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("features.community.title")}</h3>
                <p className="text-muted-foreground">
                  {t("features.community.description")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("features.articles.title")}</h3>
                <p className="text-muted-foreground">
                  {t("features.articles.description")}
                </p>
              </CardContent>
            </Card>
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
