import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock, User, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { articles } from "@/data/articles";

const ArticleDetail = () => {
  const { id } = useParams();
  const article = articles.find((a) => a.id === Number(id));

  if (!article) {
    return <Navigate to="/articles" replace />;
  }

  const relatedArticles = articles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{article.title} | JWHERBAL</title>
        <meta name="description" content={article.metaDescription} />
        <meta name="keywords" content={article.keywords.join(", ")} />
        <meta name="author" content={article.author} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.date} />
        <meta property="article:author" content={article.author} />
        <meta property="article:section" content={article.category} />
        {article.keywords.map((keyword) => (
          <meta key={keyword} property="article:tag" content={keyword} />
        ))}
        <link rel="canonical" href={`https://jwherbal.com/articles/${article.id}`} />
      </Helmet>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปบทความทั้งหมด
            </Link>
          </Button>

          <article className="mb-12">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
              {article.category}
            </div>
            <h1 className="text-4xl font-bold mb-6">{article.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
              <span>{article.date}</span>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="text-xl text-muted-foreground mb-8 font-medium">
                {article.excerpt}
              </div>
              <div
                className="space-y-4"
                dangerouslySetInnerHTML={{
                  __html: article.content.replace(/\n/g, "<br />"),
                }}
              />
            </div>
          </article>

          {/* Related Articles */}
          <section className="border-t pt-12">
            <h2 className="text-2xl font-bold mb-6">บทความที่เกี่ยวข้อง</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Card key={relatedArticle.id} className="hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-4">
                    <div className="text-xs text-primary font-medium mb-2">
                      {relatedArticle.category}
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      <Link
                        to={`/articles/${relatedArticle.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {relatedArticle.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {relatedArticle.excerpt}
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto text-sm">
                      <Link to={`/articles/${relatedArticle.id}`}>อ่านต่อ →</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetail;
