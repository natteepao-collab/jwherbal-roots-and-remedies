import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ImageIcon, Save, Upload, Plus, Trash2, GripVertical, Edit, Image } from "lucide-react";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  image_url: string;
  title_th: string;
  title_en: string;
  title_zh: string;
  description_th: string;
  description_en: string;
  description_zh: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const AdminBrandStoryGallery = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title_th: "",
    title_en: "",
    title_zh: "",
    description_th: "",
    description_en: "",
    description_zh: "",
    is_active: true,
  });

  const { data: galleryItems = [], isLoading } = useQuery({
    queryKey: ["admin-brand-story-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_story_gallery")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title_th: editingItem.title_th,
        title_en: editingItem.title_en,
        title_zh: editingItem.title_zh,
        description_th: editingItem.description_th,
        description_en: editingItem.description_en,
        description_zh: editingItem.description_zh,
        is_active: editingItem.is_active,
      });
      setImagePreview(editingItem.image_url);
    } else {
      resetForm();
    }
  }, [editingItem]);

  const resetForm = () => {
    setFormData({
      title_th: "",
      title_en: "",
      title_zh: "",
      description_th: "",
      description_en: "",
      description_zh: "",
      is_active: true,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `gallery-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from("brand-story-gallery")
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("brand-story-gallery").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = editingItem?.image_url || "";
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (!imageUrl && !editingItem) {
        throw new Error("กรุณาอัปโหลดรูปภาพ");
      }

      const itemData = {
        ...formData,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      if (editingItem) {
        const { error } = await supabase
          .from("brand_story_gallery")
          .update(itemData)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        // Get max sort_order
        const maxSortOrder = galleryItems.length > 0 
          ? Math.max(...galleryItems.map(i => i.sort_order)) + 1 
          : 0;
        
        const { error } = await supabase
          .from("brand_story_gallery")
          .insert({ ...itemData, sort_order: maxSortOrder });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brand-story-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["brand-story-gallery"] });
      toast.success(editingItem ? "อัปเดตรูปภาพเรียบร้อย" : "เพิ่มรูปภาพเรียบร้อย");
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("brand_story_gallery")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brand-story-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["brand-story-gallery"] });
      toast.success("ลบรูปภาพเรียบร้อย");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("brand_story_gallery")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brand-story-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["brand-story-gallery"] });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditDialog = (item: GalleryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingItem(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">แกลเลอรี่กิจกรรม & รางวัล</h1>
          <p className="text-muted-foreground">จัดการรูปภาพกิจกรรมและรางวัลที่ได้รับ สำหรับแสดงในส่วน "เรื่องราวของเรา"</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มรูปภาพใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "แก้ไขรูปภาพ" : "เพิ่มรูปภาพใหม่"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
              {/* Image Upload */}
              <div className="space-y-4">
                <Label>รูปภาพ</Label>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">อัปโหลดรูปภาพ (16:9)</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>เลือกรูปภาพ</span>
                    </div>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is-active">แสดงผล</Label>
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-4">
                <Label>ข้อความ</Label>
                <Tabs defaultValue="th">
                  <TabsList className="w-full">
                    <TabsTrigger value="th" className="flex-1">ไทย</TabsTrigger>
                    <TabsTrigger value="en" className="flex-1">English</TabsTrigger>
                    <TabsTrigger value="zh" className="flex-1">中文</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="th" className="space-y-4 mt-4">
                    <div>
                      <Label>หัวข้อ (ไทย)</Label>
                      <Input
                        value={formData.title_th}
                        onChange={(e) => setFormData({ ...formData, title_th: e.target.value })}
                        placeholder="รางวัลผลิตภัณฑ์ยอดเยี่ยม"
                      />
                    </div>
                    <div>
                      <Label>คำอธิบาย (ไทย)</Label>
                      <Textarea
                        value={formData.description_th}
                        onChange={(e) => setFormData({ ...formData, description_th: e.target.value })}
                        rows={4}
                        placeholder="รายละเอียดเกี่ยวกับรางวัลหรือกิจกรรม..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="en" className="space-y-4 mt-4">
                    <div>
                      <Label>Title (English)</Label>
                      <Input
                        value={formData.title_en}
                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                        placeholder="Best Product Award"
                      />
                    </div>
                    <div>
                      <Label>Description (English)</Label>
                      <Textarea
                        value={formData.description_en}
                        onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                        rows={4}
                        placeholder="Details about the award or activity..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="zh" className="space-y-4 mt-4">
                    <div>
                      <Label>标题 (中文)</Label>
                      <Input
                        value={formData.title_zh}
                        onChange={(e) => setFormData({ ...formData, title_zh: e.target.value })}
                        placeholder="最佳产品奖"
                      />
                    </div>
                    <div>
                      <Label>描述 (中文)</Label>
                      <Textarea
                        value={formData.description_zh}
                        onChange={(e) => setFormData({ ...formData, description_zh: e.target.value })}
                        rows={4}
                        placeholder="奖项或活动的详细信息..."
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gallery Grid */}
      {galleryItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มีรูปภาพ</h3>
            <p className="text-muted-foreground mb-4">เริ่มต้นเพิ่มรูปภาพกิจกรรมและรางวัลของคุณ</p>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มรูปภาพแรก
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <Card key={item.id} className={!item.is_active ? "opacity-50" : ""}>
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={item.image_url}
                  alt={item.title_th}
                  className="w-full h-full object-cover"
                />
                {!item.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">ซ่อน</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  #{index + 1}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 truncate">{item.title_th || "ไม่มีหัวข้อ"}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description_th || "ไม่มีคำอธิบาย"}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={(checked) => 
                      toggleActiveMutation.mutate({ id: item.id, is_active: checked })
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        if (confirm("ต้องการลบรูปภาพนี้?")) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBrandStoryGallery;
