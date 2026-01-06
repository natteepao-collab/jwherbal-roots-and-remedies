import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Save, Upload } from "lucide-react";
import { toast } from "sonner";

interface BrandStory {
  id: string;
  title_th: string;
  title_en: string;
  title_zh: string;
  description_th: string;
  description_en: string;
  description_zh: string;
  image_url: string | null;
  updated_at: string;
}

const AdminBrandStory = () => {
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<BrandStory, "id" | "updated_at">>({
    title_th: "",
    title_en: "",
    title_zh: "",
    description_th: "",
    description_en: "",
    description_zh: "",
    image_url: null,
  });

  const { data: brandStory, isLoading } = useQuery({
    queryKey: ["brand-story"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_story")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as BrandStory | null;
    },
  });

  useEffect(() => {
    if (brandStory) {
      setFormData({
        title_th: brandStory.title_th,
        title_en: brandStory.title_en,
        title_zh: brandStory.title_zh,
        description_th: brandStory.description_th,
        description_en: brandStory.description_en,
        description_zh: brandStory.description_zh,
        image_url: brandStory.image_url,
      });
      if (brandStory.image_url) {
        setImagePreview(brandStory.image_url);
      }
    }
  }, [brandStory]);

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `brand-story-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from("article-images")
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("article-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const updateData = {
        ...formData,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      if (brandStory?.id) {
        const { error } = await supabase
          .from("brand_story")
          .update(updateData)
          .eq("id", brandStory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("brand_story")
          .insert(updateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-story"] });
      toast.success("บันทึกข้อมูลเรียบร้อย");
      setImageFile(null);
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
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

  if (isLoading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการเรื่องราวแบรนด์</h1>
        <p className="text-muted-foreground">แก้ไขข้อความและรูปภาพในส่วน "เรื่องราวของเรา" บนหน้าแรก</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              รูปภาพ
            </CardTitle>
            <CardDescription>อัปโหลดรูปภาพสำหรับส่วนเรื่องราวของเรา</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">ยังไม่มีรูปภาพ</p>
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
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อความ</CardTitle>
            <CardDescription>แก้ไขหัวข้อและเนื้อหาในแต่ละภาษา</CardDescription>
          </CardHeader>
          <CardContent>
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
                    placeholder="จากแปลงปลูกอินทรีย์ สู่มือคุณ"
                  />
                </div>
                <div>
                  <Label>เนื้อหา (ไทย)</Label>
                  <Textarea
                    value={formData.description_th}
                    onChange={(e) => setFormData({ ...formData, description_th: e.target.value })}
                    rows={5}
                    placeholder="เราคัดสรรเฉพาะสมุนไพรเกรดพรีเมียม..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="en" className="space-y-4 mt-4">
                <div>
                  <Label>Title (English)</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="From Organic Farms to Your Hands"
                  />
                </div>
                <div>
                  <Label>Description (English)</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={5}
                    placeholder="We carefully select only premium-grade herbs..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="zh" className="space-y-4 mt-4">
                <div>
                  <Label>标题 (中文)</Label>
                  <Input
                    value={formData.title_zh}
                    onChange={(e) => setFormData({ ...formData, title_zh: e.target.value })}
                    placeholder="从有机农场到您手中"
                  />
                </div>
                <div>
                  <Label>描述 (中文)</Label>
                  <Textarea
                    value={formData.description_zh}
                    onChange={(e) => setFormData({ ...formData, description_zh: e.target.value })}
                    rows={5}
                    placeholder="我们精心挑选来自泰国最好农场的优质草药..."
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </Button>
      </div>
    </div>
  );
};

export default AdminBrandStory;
