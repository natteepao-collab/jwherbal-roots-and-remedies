import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Image, Video, Trash2, Upload, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface ProductMediaManagerProps {
  productId: string;
  productName: string;
}

const MAX_IMAGES = 10;
const MAX_VIDEO_SIZE_MB = 100;

const ProductMediaManager = ({ productId, productName }: ProductMediaManagerProps) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: mediaItems, isLoading } = useQuery({
    queryKey: ["product-media", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const imageCount = mediaItems?.filter((m) => m.media_type === "image").length || 0;
  const hasVideo = mediaItems?.some((m) => m.media_type === "video") || false;

  const deleteMutation = useMutation({
    mutationFn: async (item: any) => {
      // Delete from storage
      const url = new URL(item.image_url);
      const pathParts = url.pathname.split("/storage/v1/object/public/");
      if (pathParts[1]) {
        const [bucket, ...fileParts] = pathParts[1].split("/");
        await supabase.storage.from(bucket).remove([fileParts.join("/")]);
      }
      // Delete DB record
      const { error } = await supabase.from("product_images").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-media", productId] });
      toast.success("ลบสื่อเรียบร้อย");
    },
    onError: (e) => toast.error("ลบไม่สำเร็จ: " + e.message),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const total = files.length;
    let completed = 0;

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) {
        toast.error(`${file.name} - รองรับเฉพาะรูปภาพหรือวิดีโอ MP4`);
        completed++;
        continue;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} - วิดีโอต้องไม่เกิน ${MAX_VIDEO_SIZE_MB}MB`);
        completed++;
        continue;
      }

      if (isVideo && hasVideo) {
        toast.error("อัพโหลดวิดีโอได้สูงสุด 1 ไฟล์ต่อสินค้า");
        completed++;
        continue;
      }

      if (isImage && imageCount + completed >= MAX_IMAGES) {
        toast.error(`อัพโหลดรูปภาพได้สูงสุด ${MAX_IMAGES} รูป`);
        break;
      }

      try {
        const bucket = isVideo ? "product-videos" : "product-images";
        const ext = file.name.split(".").pop();
        const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

        // Video always gets sort_order 0 (first)
        const sortOrder = isVideo ? 0 : (imageCount + completed + 1);

        const { error: dbError } = await supabase.from("product_images").insert({
          product_id: productId,
          image_url: urlData.publicUrl,
          media_type: isVideo ? "video" : "image",
          sort_order: sortOrder,
          is_active: true,
          title: file.name,
        });
        if (dbError) throw dbError;

        completed++;
        setUploadProgress(Math.round((completed / total) * 100));
      } catch (err: any) {
        toast.error(`อัพโหลด ${file.name} ไม่สำเร็จ: ${err.message}`);
        completed++;
      }
    }

    queryClient.invalidateQueries({ queryKey: ["product-media", productId] });
    setUploading(false);
    setUploadProgress(0);
    toast.success("อัพโหลดสื่อเรียบร้อย");

    // Reset input
    e.target.value = "";
  };

  // Sort: videos first
  const sorted = [...(mediaItems || [])].sort((a, b) => {
    if (a.media_type === "video" && b.media_type !== "video") return -1;
    if (a.media_type !== "video" && b.media_type === "video") return 1;
    return a.sort_order - b.sort_order;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Image className="h-4 w-4" />
          จัดการสื่อสินค้า — {productName}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          รูปภาพสูงสุด {MAX_IMAGES} รูป • วิดีโอ MP4 สูงสุด 1 ไฟล์ (ไม่เกิน {MAX_VIDEO_SIZE_MB}MB) • วิดีโอจะแสดงเป็นลำดับแรกเสมอ
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload area */}
        <div>
          <Label htmlFor={`media-upload-${productId}`} className="cursor-pointer">
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                คลิกเพื่ออัพโหลดรูปภาพหรือวิดีโอ
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                รูปภาพ: {imageCount}/{MAX_IMAGES} • วิดีโอ: {hasVideo ? "1/1" : "0/1"}
              </p>
            </div>
          </Label>
          <Input
            id={`media-upload-${productId}`}
            type="file"
            accept="image/*,video/mp4"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>

        {uploading && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">กำลังอัพโหลด...</p>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Media grid */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีสื่อ</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {sorted.map((item, idx) => (
              <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border bg-secondary">
                {item.media_type === "video" ? (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-black/80">
                    <Video className="h-8 w-8 text-white mb-1" />
                    <span className="text-[10px] text-white/70">วิดีโอ</span>
                  </div>
                ) : (
                  <img src={item.image_url} alt={item.title || ""} className="h-full w-full object-cover" />
                )}
                {/* Order badge */}
                <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {item.media_type === "video" ? "🎬" : `#${idx + 1}`}
                </span>
                {/* Delete button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMutation.mutate(item)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductMediaManager;
