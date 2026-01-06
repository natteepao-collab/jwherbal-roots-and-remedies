import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

interface NewPostDialogProps {
  onPostCreated: () => void;
  userProfile: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

const postSchema = z.object({
  title: z.string().trim().min(5, "หัวข้อต้องมีอย่างน้อย 5 ตัวอักษร").max(200, "หัวข้อต้องไม่เกิน 200 ตัวอักษร"),
  content: z.string().trim().min(20, "เนื้อหาต้องมีอย่างน้อย 20 ตัวอักษร").max(5000, "เนื้อหาต้องไม่เกิน 5000 ตัวอักษร"),
  category: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
});

const NewPostDialog = ({ onPostCreated, userProfile }: NewPostDialogProps) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    // Validate input
    const result = postSchema.safeParse({ title, content, category });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (!userProfile) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      setLoading(false);
      return;
    }

    // Create preview from content (first 100 chars)
    const preview = content.substring(0, 100) + (content.length > 100 ? "..." : "");
    const authorName = userProfile.full_name || userProfile.email?.split("@")[0] || "Anonymous";

    const { error } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        title_th: title,
        title_en: title,
        title_zh: title,
        preview_th: preview,
        preview_en: preview,
        preview_zh: preview,
        content_th: content,
        content_en: content,
        content_zh: content,
        category,
        thumbnail: "/community/post01.jpg", // Default thumbnail
        author_name: authorName,
        author_avatar: "/community/author01.jpg", // Default avatar
        views: 0,
        comments_count: 0,
      });

    if (error) {
      console.error("Error creating post:", error);
      toast.error("ไม่สามารถสร้างกระทู้ได้ กรุณาลองใหม่อีกครั้ง");
    } else {
      toast.success("สร้างกระทู้สำเร็จ!");
      setTitle("");
      setContent("");
      setCategory("");
      setOpen(false);
      onPostCreated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("community.newPost")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            สร้างกระทู้ใหม่
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="category" className="text-sm font-medium">หมวดหมู่</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1.5 rounded-xl">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="herbs">{t("community.tags.herbs")}</SelectItem>
                <SelectItem value="elderly">{t("community.tags.elderly")}</SelectItem>
                <SelectItem value="caregiving">{t("community.tags.caregiving")}</SelectItem>
                <SelectItem value="health">{t("community.tags.health")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
          </div>

          <div>
            <Label htmlFor="title" className="text-sm font-medium">หัวข้อกระทู้</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="พิมพ์หัวข้อกระทู้..."
              className="mt-1.5 rounded-xl"
              maxLength={200}
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="content" className="text-sm font-medium">เนื้อหา</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนเนื้อหากระทู้ของคุณที่นี่..."
              className="mt-1.5 rounded-xl min-h-[200px]"
              maxLength={5000}
            />
            {errors.content && <p className="text-sm text-destructive mt-1">{errors.content}</p>}
            <p className="text-xs text-muted-foreground mt-1">{content.length}/5000 ตัวอักษร</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="rounded-full"
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                "สร้างกระทู้"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewPostDialog;
