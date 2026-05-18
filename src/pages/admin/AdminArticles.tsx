import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, MoreHorizontal, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ARTICLE_CATEGORIES } from "@/data/articleCategories";

interface Article {
  id: string;
  slug: string;
  title_th: string;
  title_en: string;
  title_zh: string;
  excerpt_th: string;
  excerpt_en: string;
  excerpt_zh: string;
  content_th: string;
  content_en: string;
  content_zh: string;
  author: string;
  reviewer?: string | null;
  references_text?: string | null;
  category: string;
  image_url: string;
  published_date: string;
  likes: number;
  is_featured: boolean;
}

const emptyArticle: Partial<Article> = {
  title_th: "",
  title_en: "",
  title_zh: "",
  excerpt_th: "",
  excerpt_en: "",
  excerpt_zh: "",
  content_th: "",
  content_en: "",
  content_zh: "",
  author: "",
  category: "",
  image_url: "",
  slug: "",
};

const AdminArticles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Partial<Article> | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

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

  const handleSave = async () => {
    if (!selectedArticle) return;

    setSaving(true);

    // Generate slug from title if not set
    const slug = selectedArticle.slug || selectedArticle.title_en?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `article-${Date.now()}`;

    const articleData = {
      ...selectedArticle,
      slug,
      published_date: selectedArticle.published_date || new Date().toISOString(),
    };

    if (selectedArticle.id) {
      // Update existing
      const { error } = await supabase
        .from("articles")
        .update(articleData)
        .eq("id", selectedArticle.id);

      if (error) {
        toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "สำเร็จ", description: "อัปเดตบทความเรียบร้อยแล้ว" });
        setIsDialogOpen(false);
        fetchArticles();
      }
    } else {
      // Create new
      const { error } = await supabase
        .from("articles")
        .insert(articleData as any);

      if (error) {
        toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "สำเร็จ", description: "สร้างบทความใหม่เรียบร้อยแล้ว" });
        setIsDialogOpen(false);
        fetchArticles();
      }
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", articleToDelete.id);

    if (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "สำเร็จ", description: "ลบบทความเรียบร้อยแล้ว" });
      fetchArticles();
    }

    setIsDeleteDialogOpen(false);
    setArticleToDelete(null);
  };

  const toggleFeatured = async (article: Article) => {
    const { error } = await supabase
      .from("articles")
      .update({ is_featured: !article.is_featured } as any)
      .eq("id", article.id);
    if (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "สำเร็จ", description: article.is_featured ? "ยกเลิกบทความแนะนำ" : "ตั้งเป็นบทความแนะนำ" });
      fetchArticles();
    }
  };

  const filteredArticles = articles.filter(
    (article) =>
      article.title_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการบทความ</h1>
          <p className="text-muted-foreground mt-1">จัดการบทความสุขภาพและสมุนไพร</p>
        </div>
        <Button onClick={() => { setSelectedArticle(emptyArticle); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มบทความ
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาบทความ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">⭐</TableHead>
              <TableHead>ชื่อบทความ</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>ผู้เขียน</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead className="text-right">ไลค์</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  ไม่พบบทความ
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleFeatured(article)}
                    >
                      <Star className={`h-4 w-4 ${article.is_featured ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
                    </Button>
                  </TableCell>
                   <TableCell className="font-medium max-w-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={article.image_url}
                        alt={article.title_th}
                        className="h-10 w-10 rounded object-cover bg-muted flex-shrink-0"
                      />
                      <span className="truncate">{article.title_th}</span>
                    </div>
                   </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{article.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{article.author}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(article.published_date).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell className="text-right">{article.likes || 0}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/articles/${article.slug}`, "_blank")}>
                          <Eye className="mr-2 h-4 w-4" />
                          ดูบทความ
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleFeatured(article)}>
                          <Star className={`mr-2 h-4 w-4 ${article.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                          {article.is_featured ? "ยกเลิกแนะนำ" : "ตั้งเป็นแนะนำ"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedArticle(article); setIsDialogOpen(true); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => { setArticleToDelete(article); setIsDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.id ? "แก้ไขบทความ" : "เพิ่มบทความใหม่"}</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลบทความในทุกภาษา
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>รูปภาพหน้าปก</Label>
              <ImageUpload
                value={selectedArticle?.image_url || ""}
                onChange={(url) => setSelectedArticle({ ...selectedArticle, image_url: url })}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <Input
                  value={selectedArticle?.category || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, category: e.target.value })}
                  placeholder="สุขภาพ, สมุนไพร..."
                />
              </div>
              <div className="space-y-2">
                <Label>ผู้เขียน</Label>
                <Input
                  value={selectedArticle?.author || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, author: e.target.value })}
                  placeholder="ชื่อผู้เขียน"
                />
              </div>
            </div>

            {/* Thai */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold">🇹🇭 ภาษาไทย</h3>
              <div className="space-y-2">
                <Label>ชื่อบทความ</Label>
                <Input
                  value={selectedArticle?.title_th || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, title_th: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>คำอธิบายสั้น</Label>
                <Textarea
                  value={selectedArticle?.excerpt_th || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, excerpt_th: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>เนื้อหา</Label>
                <Textarea
                  value={selectedArticle?.content_th || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, content_th: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            {/* English */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold">🇬🇧 English</h3>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={selectedArticle?.title_en || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, title_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={selectedArticle?.excerpt_en || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, excerpt_en: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={selectedArticle?.content_en || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, content_en: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            {/* Chinese */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold">🇨🇳 中文</h3>
              <div className="space-y-2">
                <Label>标题</Label>
                <Input
                  value={selectedArticle?.title_zh || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, title_zh: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>摘要</Label>
                <Textarea
                  value={selectedArticle?.excerpt_zh || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, excerpt_zh: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>内容</Label>
                <Textarea
                  value={selectedArticle?.content_zh || ""}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, content_zh: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบบทความ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบบทความ "{articleToDelete?.title_th}"? 
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ลบบทความ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminArticles;
