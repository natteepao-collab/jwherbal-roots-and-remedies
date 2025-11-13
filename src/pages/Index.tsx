import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { articles } from "@/data/articles";
import { communityPosts } from "@/data/community";
import heroImage from "@/assets/hero-herbal.jpg";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const featuredProducts = products.slice(0, 4);
  const latestArticles = articles.slice(0, 3);
  const popularPosts = communityPosts.slice(0, 2);

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

      <Footer />
    </div>
  );
};

export default Index;
