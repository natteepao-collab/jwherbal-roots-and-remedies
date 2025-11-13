import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { healthArticles } from "@/data/healthArticles";
import { useTranslation } from "react-i18next";
import ArticleLikeShare from "@/components/ArticleLikeShare";

const ArticleDetail = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "th" | "en" | "zh";
  
  const article = healthArticles.find((a) => a.slug === slug);

  if (!article) {
    return <Navigate to="/articles" replace />;
  }

  const relatedArticles = healthArticles
    .filter((a) => a.id !== article.id && a.category[currentLang] === article.category[currentLang])
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{article.title[currentLang]} | JWHERBAL</title>
        <meta name="description" content={article.metaDescription} />
        <meta name="keywords" content={article.keywords.join(", ")} />
        <meta name="author" content={article.author} />
        <meta property="og:title" content={article.title[currentLang]} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={article.coverImage} />
        <meta property="article:published_time" content={article.date} />
        <meta property="article:author" content={article.author} />
        <meta property="article:section" content={article.category[currentLang]} />
        {article.keywords.map((keyword) => (
          <meta key={keyword} property="article:tag" content={keyword} />
        ))}
        <link rel="canonical" href={`https://jwherbal.com/articles/${article.slug}`} />
      </Helmet>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("articles.backToAll")}
            </Link>
          </Button>

          <article className="mb-12">
            <img 
              src={article.coverImage} 
              alt={article.title[currentLang]}
              className="w-full h-[400px] object-cover rounded-lg mb-8"
            />
            
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
              {article.category[currentLang]}
            </div>
            
            <h1 className="text-4xl font-bold mb-6">{article.title[currentLang]}</h1>
            
            <div className="flex items-center justify-between mb-8 pb-8 border-b">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{article.author}</span>
                <span>•</span>
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
              
              <ArticleLikeShare
                articleId={article.id}
                articleTitle={article.title[currentLang]}
                articleUrl={`${window.location.origin}/articles/${article.slug}`}
                initialLikes={article.likes}
              />
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="text-xl text-muted-foreground mb-8 font-medium">
                {article.excerpt[currentLang]}
              </div>
              <div
                className="space-y-4"
                dangerouslySetInnerHTML={{
                  __html: article.content[currentLang].replace(/\n/g, "<br />"),
                }}
              />
            </div>

            <div className="mt-8 pt-8 border-t flex justify-center">
              <ArticleLikeShare
                articleId={article.id}
                articleTitle={article.title[currentLang]}
                articleUrl={`${window.location.origin}/articles/${article.slug}`}
                initialLikes={article.likes}
              />
            </div>
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="border-t pt-12">
              <h2 className="text-2xl font-bold mb-6">{t("articles.relatedArticles")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Card key={relatedArticle.id} className="hover:shadow-card-hover transition-shadow">
                    <img 
                      src={relatedArticle.coverImage} 
                      alt={relatedArticle.title[currentLang]}
                      className="w-full h-32 object-cover"
                    />
                    <CardContent className="p-4">
                      <div className="text-xs text-primary font-medium mb-2">
                        {relatedArticle.category[currentLang]}
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        <Link
                          to={`/articles/${relatedArticle.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {relatedArticle.title[currentLang]}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {relatedArticle.excerpt[currentLang]}
                      </p>
                      <Button variant="link" asChild className="p-0 h-auto text-xs">
                        <Link to={`/articles/${relatedArticle.slug}`}>
                          {t("articles.readMore")} →
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetail;
