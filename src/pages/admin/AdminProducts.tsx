import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Package, ImageIcon, Star } from "lucide-react";
import { toast } from "sonner";
import { productImages } from "@/assets/products";
import ProductMediaManager from "@/components/admin/ProductMediaManager";

interface Product {
  id: string;
  name_th: string;
  name_en: string;
  name_zh: string;
  description_th: string;
  description_en: string;
  description_zh: string;
  detail_content_th: string;
  detail_content_en: string;
  detail_content_zh: string;
  suitable_for_th: string;
  suitable_for_en: string;
  suitable_for_zh: string;
  usage_instructions_th: string;
  usage_instructions_en: string;
  usage_instructions_zh: string;
  price: number;
  image_url: string;
  category: string;
  rating: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
}

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mediaProductId, setMediaProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name_th: "", name_en: "", name_zh: "",
    description_th: "", description_en: "", description_zh: "",
    detail_content_th: "", detail_content_en: "", detail_content_zh: "",
    suitable_for_th: "", suitable_for_en: "", suitable_for_zh: "",
    usage_instructions_th: "", usage_instructions_en: "", usage_instructions_zh: "",
    price: 0, image_url: "", category: "", stock: 0, is_active: true,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      let imageUrl = data.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { id: _id, ...productData } = { ...data, image_url: imageUrl };

      if (data.id) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editingProduct ? "อัปเดตสินค้าเรียบร้อย" : "เพิ่มสินค้าเรียบร้อย");
      resetForm();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("ลบสินค้าเรียบร้อย");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (product: Product) => {
      const { error } = await supabase
        .from("products")
        .update({ is_featured: !product.is_featured } as any)
        .eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("อัปเดตสถานะแนะนำเรียบร้อย");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const togglePromotedMutation = useMutation({
    mutationFn: async (product: Product) => {
      const { error } = await supabase
        .from("products")
        .update({ is_promoted: !(product as any).is_promoted } as any)
        .eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("อัปเดตสถานะโปรโมชั่นเรียบร้อย");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name_th: "", name_en: "", name_zh: "",
      description_th: "", description_en: "", description_zh: "",
      detail_content_th: "", detail_content_en: "", detail_content_zh: "",
      suitable_for_th: "", suitable_for_en: "", suitable_for_zh: "",
      usage_instructions_th: "", usage_instructions_en: "", usage_instructions_zh: "",
      price: 0, image_url: "", category: "", stock: 0, is_active: true,
    });
    setEditingProduct(null);
    setImageFile(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name_th: product.name_th, name_en: product.name_en, name_zh: product.name_zh,
      description_th: product.description_th, description_en: product.description_en, description_zh: product.description_zh,
      detail_content_th: product.detail_content_th || "", detail_content_en: product.detail_content_en || "", detail_content_zh: product.detail_content_zh || "",
      suitable_for_th: product.suitable_for_th || "", suitable_for_en: product.suitable_for_en || "", suitable_for_zh: product.suitable_for_zh || "",
      usage_instructions_th: product.usage_instructions_th || "", usage_instructions_en: product.usage_instructions_en || "", usage_instructions_zh: product.usage_instructions_zh || "",
      price: product.price, image_url: product.image_url, category: product.category,
      stock: product.stock, is_active: product.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingProduct?.id,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการสินค้า</h1>
          <p className="text-muted-foreground">เพิ่ม แก้ไข หรือลบสินค้า</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มสินค้า
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>ชื่อสินค้า (ไทย)</Label>
                  <Input
                    value={formData.name_th}
                    onChange={(e) =>
                      setFormData({ ...formData, name_th: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>ชื่อสินค้า (English)</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) =>
                      setFormData({ ...formData, name_en: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>ชื่อสินค้า (中文)</Label>
                  <Input
                    value={formData.name_zh}
                    onChange={(e) =>
                      setFormData({ ...formData, name_zh: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>รายละเอียด (ไทย)</Label>
                  <Textarea
                    value={formData.description_th}
                    onChange={(e) =>
                      setFormData({ ...formData, description_th: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>รายละเอียด (English)</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) =>
                      setFormData({ ...formData, description_en: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>รายละเอียด (中文)</Label>
                  <Textarea
                    value={formData.description_zh}
                    onChange={(e) =>
                      setFormData({ ...formData, description_zh: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Detail Content */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-semibold text-sm mb-3">รายละเอียดสินค้า (แสดงในหน้ารายละเอียด)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>รายละเอียดเพิ่มเติม (ไทย)</Label>
                    <Textarea rows={4} value={formData.detail_content_th} onChange={(e) => setFormData({ ...formData, detail_content_th: e.target.value })} placeholder="• คุณสมบัติสินค้า&#10;• ส่วนประกอบ&#10;• มาตรฐาน" />
                  </div>
                  <div>
                    <Label>รายละเอียดเพิ่มเติม (EN)</Label>
                    <Textarea rows={4} value={formData.detail_content_en} onChange={(e) => setFormData({ ...formData, detail_content_en: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Suitable For */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>เหมาะกับ (ไทย)</Label>
                  <Textarea rows={4} value={formData.suitable_for_th} onChange={(e) => setFormData({ ...formData, suitable_for_th: e.target.value })} placeholder="• กลุ่มเป้าหมาย 1&#10;• กลุ่มเป้าหมาย 2" />
                </div>
                <div>
                  <Label>เหมาะกับ (EN)</Label>
                  <Textarea rows={4} value={formData.suitable_for_en} onChange={(e) => setFormData({ ...formData, suitable_for_en: e.target.value })} />
                </div>
              </div>

              {/* Usage Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>วิธีใช้ (ไทย)</Label>
                  <Input value={formData.usage_instructions_th} onChange={(e) => setFormData({ ...formData, usage_instructions_th: e.target.value })} placeholder="เช่น ทานวันละ 2 เม็ด ก่อนอาหารเช้า" />
                </div>
                <div>
                  <Label>วิธีใช้ (EN)</Label>
                  <Input value={formData.usage_instructions_en} onChange={(e) => setFormData({ ...formData, usage_instructions_en: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>ราคา (บาท)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>หมวดหมู่</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>จำนวนในสต็อก</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label>รูปภาพสินค้า</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                {formData.image_url && !imageFile && (
                  <img
                    src={productImages[editingProduct?.id || ''] || formData.image_url}
                    alt="Preview"
                    className="mt-2 h-20 w-20 object-cover rounded"
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label>เปิดใช้งาน</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            รายการสินค้า ({products?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>กำลังโหลด...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รูป</TableHead>
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>สต็อก</TableHead>
                   <TableHead>สถานะ</TableHead>
                   <TableHead>แนะนำ</TableHead>
                   <TableHead>โปรโมชั่น</TableHead>
                   <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {(productImages[product.id] || product.image_url) ? (
                        <img
                          src={productImages[product.id] || product.image_url}
                          alt={product.name_th}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary/60" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name_th}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>฿{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          product.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </TableCell>
                     <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={product.is_featured ? "ยกเลิกแนะนำ" : "ตั้งเป็นสินค้าแนะนำ"}
                        onClick={() => toggleFeaturedMutation.mutate(product)}
                      >
                        <Star className={`h-4 w-4 ${product.is_featured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={(product as any).is_promoted ?? false}
                        onCheckedChange={() => togglePromotedMutation.mutate(product)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="จัดการสื่อ"
                          onClick={() => setMediaProductId(mediaProductId === product.id ? null : product.id)}
                        >
                          <ImageIcon className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Media Manager */}
      {mediaProductId && (
        <ProductMediaManager
          productId={mediaProductId}
          productName={products?.find((p) => p.id === mediaProductId)?.name_th || ""}
        />
      )}
    </div>
  );
};

export default AdminProducts;
