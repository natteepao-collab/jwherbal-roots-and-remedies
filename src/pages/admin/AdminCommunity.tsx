import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, MoreHorizontal, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface CommunityPost {
  id: string;
  title_th: string;
  title_en: string;
  title_zh: string;
  preview_th: string;
  preview_en: string;
  preview_zh: string;
  content_th: string;
  content_en: string;
  content_zh: string;
  category: string;
  thumbnail: string;
  author_name: string;
  author_avatar: string;
  views: number;
  comments_count: number;
  created_at: string;
}

const emptyPost: Partial<CommunityPost> = {
  title_th: "",
  title_en: "",
  title_zh: "",
  preview_th: "",
  preview_en: "",
  preview_zh: "",
  content_th: "",
  content_en: "",
  content_zh: "",
  category: "herbs",
  thumbnail: "",
  author_name: "",
  author_avatar: "",
};

const categories = [
  { value: "herbs", label: "สมุนไพร" },
  { value: "elderly", label: "ผู้สูงอายุ" },
  { value: "caregiving", label: "ดูแลพ่อแม่" },
  { value: "health", label: "สุขภาพ" },
];

const AdminCommunity = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Partial<CommunityPost> | null>(null);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดโพสต์ได้",
        variant: "destructive",
      });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedPost) return;

    setSaving(true);

    const postData = {
      title_th: selectedPost.title_th || "",
      title_en: selectedPost.title_en || "",
      title_zh: selectedPost.title_zh || "",
      preview_th: selectedPost.preview_th || "",
      preview_en: selectedPost.preview_en || "",
      preview_zh: selectedPost.preview_zh || "",
      content_th: selectedPost.content_th || "",
      content_en: selectedPost.content_en || "",
      content_zh: selectedPost.content_zh || "",
      category: selectedPost.category || "herbs",
      thumbnail: selectedPost.thumbnail || "",
      author_name: selectedPost.author_name || "",
      author_avatar: selectedPost.author_avatar || "",
    };

    if (selectedPost.id) {
      // Update existing
      const { error } = await supabase
        .from("community_posts")
        .update(postData)
        .eq("id", selectedPost.id);

      if (error) {
        toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "สำเร็จ", description: "อัปเดตโพสต์เรียบร้อยแล้ว" });
        setIsDialogOpen(false);
        fetchPosts();
      }
    } else {
      // Create new
      const { error } = await supabase
        .from("community_posts")
        .insert(postData);

      if (error) {
        toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "สำเร็จ", description: "สร้างโพสต์ใหม่เรียบร้อยแล้ว" });
        setIsDialogOpen(false);
        fetchPosts();
      }
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    // First delete related replies
    await supabase
      .from("community_replies")
      .delete()
      .eq("post_id", postToDelete.id);

    // Then delete the post
    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postToDelete.id);

    if (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "สำเร็จ", description: "ลบโพสต์เรียบร้อยแล้ว" });
      fetchPosts();
    }

    setIsDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการคอมมูนิตี้</h1>
          <p className="text-muted-foreground mt-1">จัดการโพสต์และการสนทนาในชุมชน</p>
        </div>
        <Button onClick={() => { setSelectedPost(emptyPost); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มโพสต์
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium">{posts.length} โพสต์</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="font-medium">
            {posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()} ยอดเข้าชม
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาโพสต์..."
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
              <TableHead>ชื่อโพสต์</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>ผู้เขียน</TableHead>
              <TableHead className="text-center">เข้าชม</TableHead>
              <TableHead className="text-center">ความคิดเห็น</TableHead>
              <TableHead>วันที่</TableHead>
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
            ) : filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  ไม่พบโพสต์
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {post.title_th}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {categories.find(c => c.value === post.category)?.label || post.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{post.author_name}</TableCell>
                  <TableCell className="text-center">{post.views || 0}</TableCell>
                  <TableCell className="text-center">{post.comments_count || 0}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/community/${post.id}`, "_blank")}>
                          <Eye className="mr-2 h-4 w-4" />
                          ดูโพสต์
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedPost(post); setIsDialogOpen(true); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setPostToDelete(post);
                            setIsDeleteDialogOpen(true);
                          }}
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
            <DialogTitle>{selectedPost?.id ? "แก้ไขโพสต์" : "เพิ่มโพสต์ใหม่"}</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลโพสต์ในทุกภาษา
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>รูปภาพโพสต์</Label>
              <ImageUpload
                value={selectedPost?.thumbnail || ""}
                onChange={(url) => setSelectedPost({ ...selectedPost, thumbnail: url })}
                folder="community"
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <Select
                  value={selectedPost?.category || "herbs"}
                  onValueChange={(value) => setSelectedPost({ ...selectedPost, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ชื่อผู้เขียน</Label>
                <Input
                  value={selectedPost?.author_name || ""}
                  onChange={(e) => setSelectedPost({ ...selectedPost, author_name: e.target.value })}
                  placeholder="ชื่อผู้เขียน (ตำแหน่ง อายุ)"
                />
              </div>
            </div>

            {/* Author Avatar */}
            <div className="space-y-2">
              <Label>รูปโปรไฟล์ผู้เขียน</Label>
              <ImageUpload
                value={selectedPost?.author_avatar || ""}
                onChange={(url) => setSelectedPost({ ...selectedPost, author_avatar: url })}
                folder="avatars"
              />
            </div>

            {/* Thai Content */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold">🇹🇭 ภาษาไทย</h3>
              <div className="space-y-2">
                <Label>ชื่อโพสต์</Label>
                <Input
                  value={selectedPost?.title_th || ""}
                  onChange={(e) => setSelectedPost({ ...selectedPost, title_th: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>คำอธิบายสั้น</Label>
                <Textarea
                  value={selectedPost?.preview_th || ""}
                  onChange={(e) => setSelectedPost({ ...selectedPost, preview_th: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>เนื้อหา</Label>
                <Textarea
                  value={selectedPost?.content_th || ""}
                  onChange={(e) => setSelectedPost({ ...selectedPost, content_th: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            {/* English Content */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold">🇬🇧 English</h3>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={selectedPost?.title_en || ""}
                  onChange={(e) => setSelectedPost({ ...selectedPost, title_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Preview</Label>
                <Textarea
                  value={selectedPost?.preview_en || ""}
                  onChange={(e) => setSelectedPost({ ...selectedPost, preview_en: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={selectedPost?.content_en || ""}
                  onChange={(e) => setSelectedPost({ ...selectedPost, content_en: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            {/* Chinese Content */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold">🇨🇳 中文</h3>
              <div className="space-y-2">
                <Label>标题</Label>
                <Input
                  value={selectedPost?.title_zh || ""}
                  onChange={(e) => setSelectedPost({ ...selectedPost, title_zh: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>摘要</Label>
                <Textarea
                  value={selectedPost?.preview_zh || ""}
                  onChange={(e) => setSelectedPost({ ...selectedPost, preview_zh: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>内容</Label>
                <Textarea
                  value={selectedPost?.content_zh || ""}
                  onChange={(e) => setSelectedPost({ ...selectedPost, content_zh: e.target.value })}
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
            <AlertDialogTitle>ยืนยันการลบโพสต์</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์ "{postToDelete?.title_th}"?
              ความคิดเห็นทั้งหมดจะถูกลบไปด้วย การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบโพสต์
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCommunity;
