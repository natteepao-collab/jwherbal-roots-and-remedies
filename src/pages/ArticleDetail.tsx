import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { healthArticles } from "@/data/healthArticles";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ArticleLikeShare from "@/components/ArticleLikeShare";

const ArticleDetail = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "th" | "en" | "zh";

  // Try static data first
  const staticArticle = healthArticles.find((a) => a.slug === slug);

  // Fetch from DB if not found in static data
  const { data: dbArticle, isLoading } = useQuery({
    queryKey: ["article-detail", slug],
    queryFn: async () => {
      // Try by slug first, then by id
      let { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        const res = await supabase
          .from("articles")
          .select("*")
          .eq("id", slug!)
          .maybeSingle();
        if (res.error) throw res.error;
        data = res.data;
      }
      return data;
    },
    enabled: !staticArticle,
  });

  const getText = (th: string, en: string, zh: string) => {
    switch (currentLang) {
      case "en": return en || th;
      case "zh": return zh || th;
      default: return th;
    }
  };

  // Loading state for DB fetch
  if (!staticArticle && isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  // If neither static nor DB article found
  if (!staticArticle && !dbArticle) {
    return <Navigate to="/articles" replace />;
  }

  // Render static article
  if (staticArticle) {
    const relatedArticles = healthArticles
      .filter((a) => a.id !== staticArticle.id && a.category[currentLang] === staticArticle.category[currentLang])
      .slice(0, 3);

    return (
      <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>{staticArticle.title[currentLang]} | JWHERBAL</title>
          <meta name="description" content={staticArticle.metaDescription} />
          <meta name="keywords" content={staticArticle.keywords.join(", ")} />
          <meta name="author" content={staticArticle.author} />
          <meta property="og:title" content={staticArticle.title[currentLang]} />
          <meta property="og:description" content={staticArticle.metaDescription} />
          <meta property="og:type" content="article" />
          <meta property="og:image" content={staticArticle.coverImage} />
        </Helmet>

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/articles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("articles.backToAll")}
              </Link>
            </Button>

            <article className="mb-12">
              <img src={staticArticle.coverImage} alt={staticArticle.title[currentLang]} className="w-full h-[400px] object-cover rounded-lg mb-8" />
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
                {staticArticle.category[currentLang]}
              </div>
              <h1 className="text-4xl font-bold mb-6">{staticArticle.title[currentLang]}</h1>
              <div className="flex items-center justify-between mb-8 pb-8 border-b">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{staticArticle.author}</span>
                  <span>•</span>
                  <span>{staticArticle.date}</span>
                  <span>•</span>
                  <span>{staticArticle.readTime}</span>
                </div>
                <ArticleLikeShare articleId={staticArticle.id} articleTitle={staticArticle.title[currentLang]} articleUrl={`${window.location.origin}/articles/${staticArticle.slug}`} initialLikes={staticArticle.likes} />
              </div>
              <div className="prose prose-lg max-w-none">
                <div className="text-xl text-muted-foreground mb-8 font-medium">{staticArticle.excerpt[currentLang]}</div>
                <div className="space-y-4" dangerouslySetInnerHTML={{ __html: staticArticle.content[currentLang].replace(/\n/g, "<br />") }} />
              </div>
              <div className="mt-8 pt-8 border-t flex justify-center">
                <ArticleLikeShare articleId={staticArticle.id} articleTitle={staticArticle.title[currentLang]} articleUrl={`${window.location.origin}/articles/${staticArticle.slug}`} initialLikes={staticArticle.likes} />
              </div>
            </article>

            {relatedArticles.length > 0 && (
              <section className="border-t pt-12">
                <h2 className="text-2xl font-bold mb-6">{t("articles.relatedArticles")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((ra) => (
                    <Card key={ra.id} className="hover:shadow-card-hover transition-shadow">
                      <img src={ra.coverImage} alt={ra.title[currentLang]} className="w-full h-32 object-cover" />
                      <CardContent className="p-4">
                        <div className="text-xs text-primary font-medium mb-2">{ra.category[currentLang]}</div>
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          <Link to={`/articles/${ra.slug}`} className="hover:text-primary transition-colors">{ra.title[currentLang]}</Link>
                        </h3>
                        <Button variant="link" asChild className="p-0 h-auto text-xs">
                          <Link to={`/articles/${ra.slug}`}>{t("articles.readMore")} →</Link>
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
      </PageTransition>
    );
  }

  // Render DB article
  const article = dbArticle!;
  const title = getText(article.title_th, article.title_en, article.title_zh);
  const excerpt = getText(article.excerpt_th, article.excerpt_en, article.excerpt_zh);
  const content = getText(article.content_th, article.content_en, article.content_zh);

  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{title} | JWHERBAL</title>
        <meta name="description" content={excerpt} />
        <meta name="author" content={article.author} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={excerpt} />
        <meta property="og:type" content="article" />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
      </Helmet>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("articles.backToAll")}
            </Link>
          </Button>

          <article className="mb-12">
            {article.image_url && (
              <img src={article.image_url} alt={title} className="w-full h-[400px] object-cover rounded-lg mb-8" />
            )}
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
              {article.category}
            </div>
            <h1 className="text-4xl font-bold mb-6">{title}</h1>
            <div className="flex items-center justify-between mb-8 pb-8 border-b">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{article.author}</span>
                <span>•</span>
                <span>{article.published_date ? new Date(article.published_date).toLocaleDateString(currentLang === "th" ? "th-TH" : currentLang === "zh" ? "zh-CN" : "en-US") : ""}</span>
              </div>
              <ArticleLikeShare articleId={article.id} articleTitle={title} articleUrl={`${window.location.origin}/articles/${article.slug}`} initialLikes={article.likes || 0} />
            </div>
            <div className="prose prose-lg max-w-none">
              <div className="text-xl text-muted-foreground mb-8 font-medium">{excerpt}</div>
              <div className="space-y-4" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br />") }} />
            </div>
            <div className="mt-8 pt-8 border-t flex justify-center">
              <ArticleLikeShare articleId={article.id} articleTitle={title} articleUrl={`${window.location.origin}/articles/${article.slug}`} initialLikes={article.likes || 0} />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default ArticleDetail;
