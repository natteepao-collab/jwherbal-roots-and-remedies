import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { articles } from "@/data/articles";

const Articles = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>บทความสุขภาพและความรู้เกี่ยวกับสมุนไพร | JWHERBAL</title>
        <meta 
          name="description" 
          content="รวมบทความสุขภาพและความรู้เกี่ยวกับสมุนไพรไทย วิธีใช้สมุนไพร การดูแลสุขภาพ ลดน้ำหนัก เสริมภูมิคุ้มกัน และเคล็ดลับสุขภาพดี" 
        />
        <meta 
          name="keywords" 
          content="บทความสมุนไพร, สุขภาพ, ความรู้สมุนไพร, ชาสมุนไพร, ลดน้ำหนัก, เสริมภูมิคุ้มกัน" 
        />
        <meta property="og:title" content="บทความสุขภาพและความรู้เกี่ยวกับสมุนไพร | JWHERBAL" />
        <meta 
          property="og:description" 
          content="รวมบทความสุขภาพและความรู้เกี่ยวกับสมุนไพรไทย วิธีใช้สมุนไพร การดูแลสุขภาพ" 
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://jwherbal.com/articles" />
      </Helmet>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">บทความสุขภาพ</h1>
          <p className="text-muted-foreground mb-8">
            ความรู้และข้อมูลเกี่ยวกับสมุนไพรและการดูแลสุขภาพ
          </p>

          <div className="space-y-6">
            {articles.map((article) => (
              <Card key={article.id} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                        {article.category}
                      </div>
                      <h2 className="text-2xl font-bold mb-3">
                        <Link
                          to={`/articles/${article.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
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
                      <Button variant="link" asChild className="p-0 h-auto">
                        <Link to={`/articles/${article.id}`}>อ่านเพิ่มเติม →</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Articles;
