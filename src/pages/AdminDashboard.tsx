import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Trash2, Edit, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Article {
  id: string;
  slug: string;
  title_th: string;
  title_en: string;
  title_zh: string;
  excerpt_th: string;
  excerpt_en: string;
  excerpt_zh: string;
  author: string;
  category: string;
  published_date: string;
  likes: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchArticles();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      toast({
        title: "ไม่มีสิทธิ์เข้าถึง",
        description: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate("/");
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("published_date", { ascending: false });

    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดบทความได้",
        variant: "destructive",
      });
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "ออกจากระบบสำเร็จ",
      description: "ขอบคุณที่ใช้บริการ",
    });
    navigate("/auth");
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?")) return;

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบบทความได้",
        variant: "destructive",
      });
    } else {
      await fetchArticles();
      toast({
        title: "ลบบทความสำเร็จ",
        description: "บทความถูกลบออกจากระบบแล้ว",
      });
    }
  };

  const handleViewArticle = (slug: string) => {
    window.open(`/articles/${slug}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">ระบบจัดการหลังบ้าน</h1>
            <p className="text-muted-foreground">จัดการบทความสุขภาพและเนื้อหาของเว็บไซต์</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </Button>
        </div>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="articles" className="gap-2">
              <FileText className="h-4 w-4" />
              จัดการบทความ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>บทความสุขภาพทั้งหมด</CardTitle>
                    <CardDescription>จัดการบทความสุขภาพและสมุนไพร ({articles.length} บทความ)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>ชื่อบทความ</TableHead>
                        <TableHead>หมวดหมู่</TableHead>
                        <TableHead>ผู้เขียน</TableHead>
                        <TableHead>วันที่</TableHead>
                        <TableHead className="text-right">การจัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            กำลังโหลดข้อมูล...
                          </TableCell>
                        </TableRow>
                      ) : articles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            ยังไม่มีบทความในระบบ
                          </TableCell>
                        </TableRow>
                      ) : (
                        articles.map((article) => (
                          <TableRow key={article.id}>
                            <TableCell className="font-medium">{article.id.substring(0, 8)}...</TableCell>
                            <TableCell className="max-w-md truncate">{article.title_th}</TableCell>
                            <TableCell>{article.category}</TableCell>
                            <TableCell>{article.author}</TableCell>
                            <TableCell>{new Date(article.published_date).toLocaleDateString('th-TH')}</TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewArticle(article.slug)}
                                  className="gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  ดู
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    toast({
                                      title: "ฟีเจอร์ยังไม่พร้อมใช้งาน",
                                      description: "กรุณาใช้ Backend Dashboard สำหรับการแก้ไขข้อมูล",
                                    });
                                  }}
                                  className="gap-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  แก้ไข
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteArticle(article.id)}
                                  className="gap-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  ลบ
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
