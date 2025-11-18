import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Trash2, Edit, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { healthArticles, HealthArticle } from "@/data/healthArticles";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<HealthArticle[]>(healthArticles);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"th" | "en" | "zh">("th");

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = sessionStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    toast({
      title: "ออกจากระบบสำเร็จ",
      description: "ขอบคุณที่ใช้บริการ",
    });
    navigate("/admin");
  };

  const handleDeleteArticle = (id: number) => {
    setArticles(articles.filter((article) => article.id !== id));
    toast({
      title: "ลบบทความสำเร็จ",
      description: "บทความถูกลบออกจากระบบแล้ว",
    });
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
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        เพิ่มบทความใหม่
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>เพิ่มบทความใหม่</DialogTitle>
                        <DialogDescription>กรอกข้อมูลบทความในภาษาต่างๆ</DialogDescription>
                      </DialogHeader>
                      <Tabs value={selectedLang} onValueChange={(v) => setSelectedLang(v as "th" | "en" | "zh")}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="th">ไทย</TabsTrigger>
                          <TabsTrigger value="en">English</TabsTrigger>
                          <TabsTrigger value="zh">中文</TabsTrigger>
                        </TabsList>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>หัวข้อบทความ</Label>
                            <Input placeholder="กรอกหัวข้อบทความ" />
                          </div>
                          <div className="space-y-2">
                            <Label>คำอธิบายสั้น (Excerpt)</Label>
                            <Textarea placeholder="กรอกคำอธิบายสั้นๆ" rows={3} />
                          </div>
                          <div className="space-y-2">
                            <Label>เนื้อหาบทความ</Label>
                            <Textarea placeholder="กรอกเนื้อหาบทความ" rows={10} />
                          </div>
                        </div>
                      </Tabs>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          ยกเลิก
                        </Button>
                        <Button onClick={() => {
                          toast({
                            title: "ฟีเจอร์ยังไม่พร้อมใช้งาน",
                            description: "กรุณาใช้ Lovable Cloud สำหรับระบบจัดการข้อมูลที่สมบูรณ์",
                          });
                          setIsAddDialogOpen(false);
                        }}>
                          บันทึก
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>หัวข้อ (ภาษาไทย)</TableHead>
                        <TableHead>หมวดหมู่</TableHead>
                        <TableHead>ผู้เขียน</TableHead>
                        <TableHead>วันที่</TableHead>
                        <TableHead>การกระทำ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.id}</TableCell>
                          <TableCell className="max-w-md truncate">{article.title.th}</TableCell>
                          <TableCell>{article.category.th}</TableCell>
                          <TableCell>{article.author}</TableCell>
                          <TableCell>{article.date}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
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
                                    description: "กรุณาใช้ Lovable Cloud สำหรับการแก้ไขข้อมูล",
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
                                onClick={() => {
                                  if (confirm(`ต้องการลบบทความ "${article.title.th}" หรือไม่?`)) {
                                    handleDeleteArticle(article.id);
                                  }
                                }}
                                className="gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                ลบ
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
