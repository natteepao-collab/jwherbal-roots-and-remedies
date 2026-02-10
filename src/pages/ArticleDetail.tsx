import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ChevronLeft, ChevronRight, Home, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { healthArticles } from "@/data/healthArticles";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ArticleLikeShare from "@/components/ArticleLikeShare";
import { getArticleImage } from "@/assets/articles/index";
import { useEffect } from "react";

const ArticleNavButtons = ({
  prevSlug,
  nextSlug,
  prevLabel,
  nextLabel,
}: {
  prevSlug?: string;
  nextSlug?: string;
  prevLabel?: string;
  nextLabel?: string;
}) => {
  const { t } = useTranslation();
  return (
    <div className="mt-12 pt-8 border-t">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {prevSlug ? (
          <Button variant="outline" asChild className="justify-start gap-2 h-auto py-3 rounded-xl">
            <Link to={`/articles/${prevSlug}`}>
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-[10px] text-muted-foreground">{t("articles.prevArticle", "บทความก่อนหน้า")}</div>
                <div className="text-xs font-medium truncate">{prevLabel}</div>
              </div>
            </Link>
          </Button>
        ) : (
          <div />
        )}

        <Button variant="outline" asChild className="justify-center gap-2 h-auto py-3 rounded-xl">
          <Link to="/articles">
            <Home className="h-4 w-4" />
            <span className="text-sm">{t("articles.backToAll", "กลับไปหน้าบทความ")}</span>
          </Link>
        </Button>

        {nextSlug ? (
          <Button variant="outline" asChild className="justify-end gap-2 h-auto py-3 rounded-xl">
            <Link to={`/articles/${nextSlug}`}>
              <div className="text-right min-w-0">
                <div className="text-[10px] text-muted-foreground">{t("articles.nextArticle", "บทความถัดไป")}</div>
                <div className="text-xs font-medium truncate">{nextLabel}</div>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

const ArticleDetail = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "th" | "en" | "zh";

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // Try static data first
  const staticArticle = healthArticles.find((a) => a.slug === slug);

  // Fetch all DB articles for prev/next navigation
  const { data: allDbArticles = [] } = useQuery({
    queryKey: ["all-articles-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title_th, title_en, title_zh")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch from DB if not found in static data
  const { data: dbArticle, isLoading } = useQuery({
    queryKey: ["article-detail", slug],
    queryFn: async () => {
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

  // Find prev/next for DB articles
  const getDbNavigation = (currentSlug: string) => {
    const idx = allDbArticles.findIndex((a) => a.slug === currentSlug || a.id === currentSlug);
    const prev = idx > 0 ? allDbArticles[idx - 1] : undefined;
    const next = idx >= 0 && idx < allDbArticles.length - 1 ? allDbArticles[idx + 1] : undefined;
    return {
      prevSlug: prev?.slug,
      prevLabel: prev ? getText(prev.title_th, prev.title_en, prev.title_zh) : undefined,
      nextSlug: next?.slug,
      nextLabel: next ? getText(next.title_th, next.title_en, next.title_zh) : undefined,
    };
  };

  // Render static article
  if (staticArticle) {
    const staticIdx = healthArticles.findIndex((a) => a.slug === slug);
    const prevStatic = staticIdx > 0 ? healthArticles[staticIdx - 1] : undefined;
    const nextStatic = staticIdx < healthArticles.length - 1 ? healthArticles[staticIdx + 1] : undefined;

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
              <img src={staticArticle.coverImage} alt={staticArticle.title[currentLang]} className="w-full max-h-[500px] object-contain rounded-lg mb-8 bg-muted" />
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

            <ArticleNavButtons
              prevSlug={prevStatic?.slug}
              prevLabel={prevStatic?.title[currentLang]}
              nextSlug={nextStatic?.slug}
              nextLabel={nextStatic?.title[currentLang]}
            />

            {relatedArticles.length > 0 && (
              <section className="border-t pt-12 mt-8">
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
  const nav = getDbNavigation(article.slug);

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
              <img src={getArticleImage(article.image_url)} alt={title} className="w-full max-h-[500px] object-contain rounded-lg mb-8 bg-muted" />
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

          <ArticleNavButtons
            prevSlug={nav.prevSlug}
            prevLabel={nav.prevLabel}
            nextSlug={nav.nextSlug}
            nextLabel={nav.nextLabel}
          />
        </div>
      </main>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default ArticleDetail;
