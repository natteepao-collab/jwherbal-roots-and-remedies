import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
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
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{t("articles.title")}</h1>
          <p className="text-muted-foreground mb-8">
            {t("articles.description")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-card-hover transition-shadow overflow-hidden">
                <img 
                  src={article.coverImage} 
                  alt={article.title[currentLang]}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                    {article.category[currentLang]}
                  </div>
                  <h2 className="text-xl font-bold mb-3 line-clamp-2">
                    <Link
                      to={`/articles/${article.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {article.title[currentLang]}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                    {article.excerpt[currentLang]}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                  <Button variant="link" asChild className="p-0 h-auto w-full justify-start">
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
