import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock, User, Loader2, Heart, Star, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ArticleLikeShare from "@/components/ArticleLikeShare";
import { getArticleImage } from "@/assets/articles/index";

interface Article {
  id: string;
  slug: string;
  title_th: string;
  title_en: string;
  title_zh: string;
  excerpt_th: string;
  excerpt_en: string;
  excerpt_zh: string;
  image_url: string;
  category: string;
  author: string;
  likes: number | null;
  published_date: string | null;
  is_featured: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08 },
  }),
};

const Articles = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "th" | "en" | "zh";

  const { data: dbArticles, isLoading } = useQuery({
    queryKey: ["articles-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Article[];
    },
  });

  const getText = (th: string, en: string, zh: string) => {
    switch (currentLang) {
      case "en": return en || th;
      case "zh": return zh || th;
      default: return th;
    }
  };

  const articles = dbArticles || [];

  // Category sections
  const latestArticles = articles.slice(0, 6);
  const mostLikedArticles = [...articles].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 6);
  const featuredArticles = articles.filter(a => a.is_featured);
  const allArticles = articles;

  // Hero featured article (latest one)
  const heroArticle = latestArticles[0];

  const ArticleCard = ({ article, index, size = "normal" }: { article: Article; index: number; size?: "normal" | "small" }) => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={index}
    >
      <Card className="group overflow-hidden border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full">
        <Link to={`/articles/${article.slug}`} className="block">
          <div className={`relative overflow-hidden ${size === "small" ? "aspect-square" : "aspect-square"}`}>
            <img
              src={getArticleImage(article.image_url)}
              alt={getText(article.title_th, article.title_en, article.title_zh)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Badge className="absolute top-3 left-3 text-[10px] bg-primary/90 text-primary-foreground border-0">
              {article.category}
            </Badge>
            {article.is_featured && (
              <Badge className="absolute top-3 right-3 text-[10px] bg-amber-500 text-white border-0 gap-1">
                <Star className="h-2.5 w-2.5 fill-current" /> แนะนำ
              </Badge>
            )}
          </div>
        </Link>
        <CardContent className="p-4 space-y-3">
          <h3 className={`font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors ${size === "small" ? "text-sm" : "text-base"}`}>
            <Link to={`/articles/${article.slug}`}>
              {getText(article.title_th, article.title_en, article.title_zh)}
            </Link>
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {getText(article.excerpt_th, article.excerpt_en, article.excerpt_zh)}
          </p>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{article.author}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Heart className="h-3 w-3" />
              <span>{article.likes || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const HeroArticleCard = ({ article }: { article: Article }) => (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="group overflow-hidden border-border/50 hover:shadow-xl transition-all duration-300">
        <div className="grid md:grid-cols-2 gap-0">
          <Link to={`/articles/${article.slug}`} className="block">
            <div className="aspect-square md:aspect-auto md:h-full overflow-hidden">
              <img
                src={getArticleImage(article.image_url)}
                alt={getText(article.title_th, article.title_en, article.title_zh)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
          <CardContent className="p-6 md:p-8 flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="text-[10px] bg-primary/90 text-primary-foreground border-0">
                {article.category}
              </Badge>
              {article.is_featured && (
                <Badge className="text-[10px] bg-amber-500 text-white border-0 gap-1">
                  <Star className="h-2.5 w-2.5 fill-current" /> แนะนำ
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] gap-1">
                <Sparkles className="h-2.5 w-2.5" /> ล่าสุด
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
              <Link to={`/articles/${article.slug}`}>
                {getText(article.title_th, article.title_en, article.title_zh)}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {getText(article.excerpt_th, article.excerpt_en, article.excerpt_zh)}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>{article.author}</span>
              </div>
              <ArticleLikeShare
                articleId={article.id}
                articleTitle={getText(article.title_th, article.title_en, article.title_zh)}
                articleUrl={`${window.location.origin}/articles/${article.slug}`}
                initialLikes={article.likes || 0}
              />
            </div>
            <Button variant="outline" asChild className="w-fit gap-2">
              <Link to={`/articles/${article.slug}`}>
                {t("articles.readMore")} <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={0}
      className="flex items-center gap-3 mb-6"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </motion.div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>{t("articles.title")} | JWHERBAL</title>
          <meta name="description" content={t("articles.description")} />
        </Helmet>

        <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{t("articles.title")}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("articles.description")}
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Hero - Latest Article */}
                {heroArticle && <HeroArticleCard article={heroArticle} />}

                {/* Featured / Recommended Articles */}
                {featuredArticles.length > 0 && (
                  <section>
                    <SectionHeader icon={Star} title="บทความแนะนำ" subtitle="คัดสรรโดยทีมบรรณาธิการ" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {featuredArticles.map((article, i) => (
                        <ArticleCard key={article.id} article={article} index={i} size="small" />
                      ))}
                    </div>
                  </section>
                )}

                {/* Most Liked Articles */}
                <section>
                  <SectionHeader icon={Heart} title="บทความยอดนิยม" subtitle="บทความที่ได้รับความสนใจมากที่สุด" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                    {mostLikedArticles.map((article, i) => (
                      <ArticleCard key={article.id} article={article} index={i} />
                    ))}
                  </div>
                </section>

                {/* Latest Articles */}
                {latestArticles.length > 1 && (
                  <section>
                    <SectionHeader icon={Sparkles} title="บทความล่าสุด" subtitle="อัปเดตความรู้สมุนไพรใหม่ๆ" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                      {latestArticles.slice(1).map((article, i) => (
                        <ArticleCard key={article.id} article={article} index={i} />
                      ))}
                    </div>
                  </section>
                )}

                {/* All Articles */}
                {allArticles.length > 6 && (
                  <section>
                    <SectionHeader icon={TrendingUp} title="บทความทั้งหมด" subtitle={`${allArticles.length} บทความ`} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {allArticles.map((article, i) => (
                        <ArticleCard key={article.id} article={article} index={i} size="small" />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Articles;
