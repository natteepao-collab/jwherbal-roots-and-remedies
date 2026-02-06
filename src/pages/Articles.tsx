import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock, User } from "lucide-react";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { healthArticles } from "@/data/healthArticles";
import { useTranslation } from "react-i18next";
import ArticleLikeShare from "@/components/ArticleLikeShare";

const Articles = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "th" | "en" | "zh";
  
  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t("articles.title")} | JWHERBAL</title>
        <meta 
          name="description" 
          content={t("articles.description")}
        />
      </Helmet>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">{t("articles.title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 md:mb-8">
            {t("articles.description")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {healthArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-card-hover transition-shadow overflow-hidden">
                <img 
                  src={article.coverImage} 
                  alt={article.title[currentLang]}
                  className="w-full h-36 sm:h-44 md:h-48 object-cover"
                />
                <CardContent className="p-4 md:p-6">
                  <div className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 text-primary text-[10px] sm:text-xs font-medium rounded-full mb-2 sm:mb-3">
                    {article.category[currentLang]}
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 line-clamp-2">
                    <Link
                      to={`/articles/${article.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {article.title[currentLang]}
                    </Link>
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2 sm:line-clamp-3">
                    {article.excerpt[currentLang]}
                  </p>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime}</span>
                    </div>
                    <ArticleLikeShare
                      articleId={article.id}
                      articleTitle={article.title[currentLang]}
                      articleUrl={`${window.location.origin}/articles/${article.slug}`}
                      initialLikes={article.likes}
                    />
                  </div>
                  <Button variant="link" asChild className="p-0 h-auto w-full justify-start text-xs sm:text-sm">
                    <Link to={`/articles/${article.slug}`}>{t("articles.readMore")} →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
};

export default Articles;
