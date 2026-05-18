import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { JsonLd } from "@/components/JsonLd";
import { AlertCircle, ArrowLeft, BookOpen, ChevronLeft, ChevronRight, ExternalLink, Home, Loader2, MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react";
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
import DOMPurify from "dompurify";
import { getCategoryLabel } from "@/data/articleCategories";

const renderSafeHtml = (raw: string) => ({
  __html: DOMPurify.sanitize(raw.replace(/\n/g, "<br />"), { USE_PROFILES: { html: true } }),
});

// Reusable: medical disclaimer + internal CTA links
const ArticleFooterMeta = ({
  reviewer,
  references,
  lang,
}: {
  reviewer?: string | null;
  references?: string | null;
  lang: "th" | "en" | "zh";
}) => {
  const refLines = (references || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const urlRegex = /(https?:\/\/[^\s]+)/;

  const disclaimer = {
    th: "เนื้อหานี้เป็นข้อมูลทั่วไปเพื่อการศึกษา ไม่ใช่คำแนะนำทางการแพทย์ หากมีโรคประจำตัวหรือกำลังใช้ยา ควรปรึกษาแพทย์หรือเภสัชกรก่อนใช้ผลิตภัณฑ์เสริมอาหาร",
    en: "This content is general information for educational purposes only and is not medical advice. If you have a medical condition or take medication, consult a healthcare professional before using any supplement.",
    zh: "本内容仅供一般教育参考,并非医疗建议。如有疾病或正在服药,请在使用任何保健品前咨询医生或药师。",
  } as const;

  const titles = {
    th: {
      reviewer: "ตรวจทานโดย",
      references: "แหล่งอ้างอิง",
      related: "อ่านต่อบนเว็บไซต์",
      product: "ดูข้อมูลผลิตภัณฑ์ V FLOW",
      productSub: "ส่วนประกอบ • วิธีใช้ • คำถามที่พบบ่อย",
      faq: "คำถามที่พบบ่อย",
      faqSub: "รวมคำถามและคำตอบจากผู้ใช้จริง",
      line: "ปรึกษาทีมงานผ่าน LINE",
      lineSub: "ตอบกลับภายในเวลาทำการ",
    },
    en: {
      reviewer: "Reviewed by",
      references: "References",
      related: "Continue on our site",
      product: "View V FLOW product page",
      productSub: "Ingredients • Usage • FAQ",
      faq: "Frequently asked questions",
      faqSub: "Questions and answers from real users",
      line: "Chat with our team on LINE",
      lineSub: "We reply during business hours",
    },
    zh: {
      reviewer: "审核",
      references: "参考资料",
      related: "继续浏览",
      product: "查看 V FLOW 产品页",
      productSub: "成分 · 用法 · 常见问题",
      faq: "常见问题",
      faqSub: "来自真实用户的问题与回答",
      line: "通过 LINE 联系我们",
      lineSub: "营业时间内回复",
    },
  } as const;

  const t = titles[lang];

  return (
    <div className="mt-10 space-y-6">
      {reviewer && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-muted-foreground">{t.reviewer}</div>
            <div className="text-sm font-medium">{reviewer}</div>
          </div>
        </div>
      )}

      {refLines.length > 0 && (
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{t.references}</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-5">
            {refLines.map((line, i) => {
              const m = line.match(urlRegex);
              if (m) {
                const url = m[1];
                const label = line.replace(url, "").trim() || url;
                return (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {label} <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                );
              }
              return <li key={i}>{line}</li>;
            })}
          </ul>
        </div>
      )}

      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">{disclaimer[lang]}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">{t.related}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/product/vflow"
            className="group flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-medium group-hover:text-primary">{t.product}</div>
              <div className="text-[11px] text-muted-foreground">{t.productSub}</div>
            </div>
          </Link>
          <Link
            to="/faq"
            className="group flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <MessageCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-medium group-hover:text-primary">{t.faq}</div>
              <div className="text-[11px] text-muted-foreground">{t.faqSub}</div>
            </div>
          </Link>
          <a
            href="https://line.me/R/ti/p/@jwherbal"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <ExternalLink className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-medium group-hover:text-primary">{t.line}</div>
              <div className="text-[11px] text-muted-foreground">{t.lineSub}</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};


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
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: staticArticle.title[currentLang],
              description: staticArticle.metaDescription,
              image: staticArticle.coverImage,
              author: { "@type": "Person", name: staticArticle.author },
              publisher: {
                "@type": "Organization",
                name: "JW HERBAL",
                logo: { "@type": "ImageObject", url: "https://jwherbal-roots-and-remedies.lovable.app/favicon.png" },
              },
              datePublished: staticArticle.date,
              mainEntityOfPage: `https://jwherbal-roots-and-remedies.lovable.app/articles/${staticArticle.slug}`,
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://jwherbal-roots-and-remedies.lovable.app/" },
                { "@type": "ListItem", position: 2, name: "บทความ", item: "https://jwherbal-roots-and-remedies.lovable.app/articles" },
                { "@type": "ListItem", position: 3, name: staticArticle.title[currentLang], item: `https://jwherbal-roots-and-remedies.lovable.app/articles/${staticArticle.slug}` },
              ],
            },
          ]}
        />

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
                <div className="space-y-4" dangerouslySetInnerHTML={renderSafeHtml(staticArticle.content[currentLang])} />
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
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: excerpt,
            ...(article.image_url ? { image: article.image_url } : {}),
            author: { "@type": "Person", name: article.author || "JW HERBAL" },
            publisher: {
              "@type": "Organization",
              name: "JW HERBAL",
              logo: { "@type": "ImageObject", url: "https://jwherbal-roots-and-remedies.lovable.app/favicon.png" },
            },
            ...(article.published_date ? { datePublished: article.published_date } : {}),
            mainEntityOfPage: `https://jwherbal-roots-and-remedies.lovable.app/articles/${article.slug}`,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://jwherbal-roots-and-remedies.lovable.app/" },
              { "@type": "ListItem", position: 2, name: "บทความ", item: "https://jwherbal-roots-and-remedies.lovable.app/articles" },
              { "@type": "ListItem", position: 3, name: title, item: `https://jwherbal-roots-and-remedies.lovable.app/articles/${article.slug}` },
            ],
          },
        ]}
      />

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
              <div className="space-y-4" dangerouslySetInnerHTML={renderSafeHtml(content)} />
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
