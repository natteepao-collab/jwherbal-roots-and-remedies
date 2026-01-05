import { useEffect, useState } from "react";
import { Search, Eye, Trash2, MoreHorizontal, MessageSquare } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CommunityPost {
  id: string;
  title_th: string;
  title_en: string;
  category: string;
  author_name: string;
  views: number;
  comments_count: number;
  created_at: string;
}

const AdminCommunity = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">จัดการคอมมูนิตี้</h1>
        <p className="text-muted-foreground mt-1">จัดการโพสต์และการสนทนาในชุมชน</p>
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
                    <Badge variant="secondary">{post.category}</Badge>
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
