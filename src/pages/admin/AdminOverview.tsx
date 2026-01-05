import { useEffect, useState } from "react";
import { FileText, Users, MessageSquare, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Stats {
  articles: number;
  users: number;
  communityPosts: number;
  totalViews: number;
}

interface RecentArticle {
  id: string;
  title_th: string;
  category: string;
  published_date: string;
  likes: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    articles: 0,
    users: 0,
    communityPosts: 0,
    totalViews: 0,
  });
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    // Fetch counts in parallel
    const [articlesRes, usersRes, communityRes] = await Promise.all([
      supabase.from("articles").select("id, title_th, category, published_date, likes", { count: "exact" }).order("published_date", { ascending: false }).limit(5),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("community_posts").select("id, views", { count: "exact" }),
    ]);

    const totalViews = communityRes.data?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;

    setStats({
      articles: articlesRes.count || 0,
      users: usersRes.count || 0,
      communityPosts: communityRes.count || 0,
      totalViews,
    });

    setRecentArticles(articlesRes.data || []);
    setLoading(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">ภาพรวม</h1>
        <p className="text-muted-foreground mt-1">สรุปข้อมูลและสถิติของระบบ</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="บทความทั้งหมด"
          value={stats.articles}
          icon={FileText}
          description="บทความสุขภาพ"
        />
        <StatsCard
          title="ผู้ใช้ทั้งหมด"
          value={stats.users}
          icon={Users}
          description="ผู้ใช้ที่ลงทะเบียน"
        />
        <StatsCard
          title="โพสต์คอมมูนิตี้"
          value={stats.communityPosts}
          icon={MessageSquare}
          description="โพสต์ในชุมชน"
        />
        <StatsCard
          title="ยอดเข้าชมรวม"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
          description="ยอดเข้าชมโพสต์"
        />
      </div>

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">บทความล่าสุด</CardTitle>
          <CardDescription>บทความที่เผยแพร่ล่าสุด 5 รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
          ) : recentArticles.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">ยังไม่มีบทความ</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อบทความ</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead className="text-right">ไลค์</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {article.title_th}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{article.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(article.published_date).toLocaleDateString("th-TH")}
                    </TableCell>
                    <TableCell className="text-right">{article.likes || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
