import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Image, Trash2, Upload, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";

interface ProductMediaManagerProps {
  productId: string;
  productName: string;
}

const MAX_IMAGES = 10;

const ProductMediaManager = ({ productId, productName }: ProductMediaManagerProps) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const primaryInputRef = useRef<HTMLInputElement | null>(null);

  const { data: product } = useQuery({
    queryKey: ["product-media-product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, image_url")
        .eq("id", productId)
        .single();
      if (error) throw error;
      return data as { id: string; image_url: string };
    },
  });

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

  const galleryImages = mediaItems || [];
  const totalImageCount = galleryImages.length + (product?.image_url ? 1 : 0);

  const uploadImageFile = async (file: File) => {
    const ext = file.name.split(".").pop();
    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

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

  const replacePrimaryMutation = useMutation({
    mutationFn: async (file: File) => {
      const imageUrl = await uploadImageFile(file);
      const { error } = await supabase
        .from("products")
        .update({ image_url: imageUrl })
        .eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-media-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["vflow-products"] });
      toast.success("อัปเดตรูปหลักเรียบร้อย");
    },
    onError: (e) => toast.error("เปลี่ยนรูปหลักไม่สำเร็จ: " + e.message),
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (item: any) => {
      const currentPrimaryUrl = product?.image_url;
      const remainingItems = galleryImages.filter((media) => media.id !== item.id);
      const nextSortOrder = remainingItems.length > 0
        ? Math.max(...remainingItems.map((media) => media.sort_order || 0)) + 1
        : 1;

      const { error: productError } = await supabase
        .from("products")
        .update({ image_url: item.image_url })
        .eq("id", productId);
      if (productError) throw productError;

      const { error: deleteError } = await supabase
        .from("product_images")
        .delete()
        .eq("id", item.id);
      if (deleteError) throw deleteError;

      if (currentPrimaryUrl && currentPrimaryUrl !== item.image_url) {
        const { error: insertError } = await supabase.from("product_images").insert({
          product_id: productId,
          image_url: currentPrimaryUrl,
          sort_order: nextSortOrder,
          is_active: true,
          title: "รูปหลักเดิม",
        } as any);
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-media", productId] });
      queryClient.invalidateQueries({ queryKey: ["product-media-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["vflow-products"] });
      toast.success("ตั้งค่ารูปหลักเรียบร้อย");
    },
    onError: (e) => toast.error("ตั้งค่ารูปหลักไม่สำเร็จ: " + e.message),
  });

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const total = files.length;
    let completed = 0;
    let hasPrimaryImage = Boolean(product?.image_url);
    let galleryCount = galleryImages.length;

    for (const file of files) {
      const isImage = file.type.startsWith("image/");

      if (!isImage) {
        toast.error(`${file.name} - รองรับเฉพาะไฟล์รูปภาพ`);
        completed++;
        continue;
      }

      if (galleryCount + (hasPrimaryImage ? 1 : 0) >= MAX_IMAGES) {
        toast.error(`อัพโหลดรูปภาพได้สูงสุด ${MAX_IMAGES} รูป`);
        break;
      }

      try {
        const imageUrl = await uploadImageFile(file);

        if (!hasPrimaryImage) {
          const { error: productError } = await supabase
            .from("products")
            .update({ image_url: imageUrl })
            .eq("id", productId);
          if (productError) throw productError;
          hasPrimaryImage = true;
        } else {
          const { error: dbError } = await supabase.from("product_images").insert({
            product_id: productId,
            image_url: imageUrl,
            sort_order: galleryCount + 1,
            is_active: true,
            title: file.name,
          } as any);
          if (dbError) throw dbError;
          galleryCount += 1;
        }

        completed++;
        setUploadProgress(Math.round((completed / total) * 100));
      } catch (err: any) {
        toast.error(`อัพโหลด ${file.name} ไม่สำเร็จ: ${err.message}`);
        completed++;
      }
    }

    queryClient.invalidateQueries({ queryKey: ["product-media", productId] });
    queryClient.invalidateQueries({ queryKey: ["product-media-product", productId] });
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product", productId] });
    queryClient.invalidateQueries({ queryKey: ["vflow-products"] });
    setUploading(false);
    setUploadProgress(0);
    if (completed > 0) toast.success("อัปโหลดรูปสินค้าเรียบร้อย");
  };

  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ");
      e.target.value = "";
      return;
    }
    await replacePrimaryMutation.mutateAsync(file);
    e.target.value = "";
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const sorted = [...galleryImages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Image className="h-4 w-4" />
          จัดการรูปสินค้า — {productName}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          1 สินค้าใส่รูปได้สูงสุด {MAX_IMAGES} รูป โดยมีรูปหลัก 1 รูป และรูปเสริมได้อีกสูงสุด 9 รูป
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">รูปหลักสินค้า</p>
              <p className="text-xs text-muted-foreground">รูปนี้จะแสดงในหน้ารายการสินค้า หน้าร้าน และหน้าหลัก</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => primaryInputRef.current?.click()}
              disabled={replacePrimaryMutation.isPending}
            >
              <RefreshCw className="h-4 w-4" />
              {product?.image_url ? "เปลี่ยนรูปหลัก" : "อัปโหลดรูปหลัก"}
            </Button>
          </div>

          <input
            ref={primaryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePrimaryUpload}
          />

          {product?.image_url ? (
            <div className="relative aspect-square w-32 overflow-hidden rounded-lg border bg-secondary">
              <img src={product.image_url} alt={`${productName} รูปหลัก`} className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[10px] font-medium">
                <Star className="h-3 w-3 fill-primary text-primary" />
                รูปหลัก
              </span>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              ยังไม่มีรูปหลัก ระบบจะใช้รูปแรกที่อัปโหลดเป็นรูปหลักให้อัตโนมัติ
            </div>
          )}
        </div>

        {/* Upload area with drag & drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Label htmlFor={`media-upload-${productId}`} className="cursor-pointer">
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? "border-primary bg-primary/10" : "hover:border-primary/50"}`}>
              <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm text-muted-foreground">
                {isDragging ? "ปล่อยไฟล์เพื่ออัพโหลด" : "ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                รูปทั้งหมด: {totalImageCount}/{MAX_IMAGES} • รูปเสริม: {galleryImages.length}/{Math.max(MAX_IMAGES - 1, 0)}
              </p>
            </div>
          </Label>
          <Input
            id={`media-upload-${productId}`}
            type="file"
            accept="image/*"
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
          <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีรูปเสริม</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {sorted.map((item, idx) => (
              <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border bg-secondary">
                <img src={item.image_url} alt={item.title || ""} className="h-full w-full object-cover" />
                {/* Order badge */}
                <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  #{idx + 2}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-1 left-1 right-1 h-7 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setPrimaryMutation.mutate(item)}
                  disabled={setPrimaryMutation.isPending}
                >
                  ตั้งเป็นรูปหลัก
                </Button>
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
