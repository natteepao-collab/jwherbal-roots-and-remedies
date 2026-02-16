import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Package, Star } from "lucide-react";
import { toast } from "sonner";

interface PromotionTier {
  id: string;
  product_id: string;
  quantity: number;
  unit: string;
  price: number;
  normal_price: number;
  is_best_seller: boolean;
  sort_order: number;
  is_active: boolean;
}

const AdminPromotionTiers = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PromotionTier | null>(null);
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: 1,
    unit: "กระปุก",
    price: 0,
    normal_price: 0,
    is_best_seller: false,
    sort_order: 0,
    is_active: true,
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_th")
        .order("name_th");
      if (error) throw error;
      return data;
    },
  });

  const { data: tiers, isLoading } = useQuery({
    queryKey: ["admin-promotion-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotion_tiers")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as PromotionTier[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const { id, ...tierData } = data;
      if (id) {
        const { error } = await supabase
          .from("promotion_tiers")
          .update(tierData as any)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("promotion_tiers")
          .insert(tierData as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotion-tiers"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-tiers"] });
      toast.success(editingTier ? "อัปเดตแพ็กเกจเรียบร้อย" : "เพิ่มแพ็กเกจเรียบร้อย");
      resetForm();
    },
    onError: (error) => toast.error("เกิดข้อผิดพลาด: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("promotion_tiers")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotion-tiers"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-tiers"] });
      toast.success("ลบแพ็กเกจเรียบร้อย");
    },
    onError: (error) => toast.error("เกิดข้อผิดพลาด: " + error.message),
  });

  const resetForm = () => {
    setFormData({
      product_id: "",
      quantity: 1,
      unit: "กระปุก",
      price: 0,
      normal_price: 0,
      is_best_seller: false,
      sort_order: 0,
      is_active: true,
    });
    setEditingTier(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (tier: PromotionTier) => {
    setEditingTier(tier);
    setFormData({
      product_id: tier.product_id,
      quantity: tier.quantity,
      unit: tier.unit,
      price: tier.price,
      normal_price: tier.normal_price,
      is_best_seller: tier.is_best_seller,
      sort_order: tier.sort_order,
      is_active: tier.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingTier?.id });
  };

  const getProductName = (productId: string) =>
    products?.find((p) => p.id === productId)?.name_th || productId;

  const filteredTiers = tiers?.filter(
    (t) => filterProduct === "all" || t.product_id === filterProduct
  );

  const formatPrice = (n: number) => n.toLocaleString("th-TH");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการแพ็กเกจโปรโมชั่น</h1>
          <p className="text-muted-foreground">เพิ่ม แก้ไข ราคาแพ็กเกจของแต่ละสินค้า</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มแพ็กเกจ
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Label>กรองตามสินค้า:</Label>
        <Select value={filterProduct} onValueChange={setFilterProduct}>
          <SelectTrigger className="w-[250px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {products?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name_th}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            รายการแพ็กเกจ ({filteredTiers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>กำลังโหลด...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>จำนวน</TableHead>
                  <TableHead>หน่วย</TableHead>
                  <TableHead>ราคาโปร</TableHead>
                  <TableHead>ราคาปกติ</TableHead>
                  <TableHead>ส่วนลด</TableHead>
                  <TableHead>Best Seller</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTiers?.map((tier) => {
                  const savings = tier.normal_price - tier.price;
                  const discountPct = Math.round((savings / tier.normal_price) * 100);
                  return (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium text-sm">
                        {getProductName(tier.product_id)}
                      </TableCell>
                      <TableCell>{tier.quantity}</TableCell>
                      <TableCell>{tier.unit}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        ฿{formatPrice(tier.price)}
                      </TableCell>
                      <TableCell className="text-muted-foreground line-through">
                        ฿{formatPrice(tier.normal_price)}
                      </TableCell>
                      <TableCell>
                        <span className="text-destructive font-medium text-sm">
                          -{discountPct}% (฿{formatPrice(savings)})
                        </span>
                      </TableCell>
                      <TableCell>
                        {tier.is_best_seller && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          tier.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {tier.is_active ? "เปิด" : "ปิด"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(tier)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(tier.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTier ? "แก้ไขแพ็กเกจ" : "เพิ่มแพ็กเกจใหม่"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>สินค้า</Label>
              <Select
                value={formData.product_id}
                onValueChange={(v) => setFormData({ ...formData, product_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name_th}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>จำนวน</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>หน่วย</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ราคาโปรโมชั่น (บาท)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>ราคาปกติ (บาท)</Label>
                <Input
                  type="number"
                  value={formData.normal_price}
                  onChange={(e) => setFormData({ ...formData, normal_price: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>ลำดับการแสดง</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_best_seller}
                  onCheckedChange={(v) => setFormData({ ...formData, is_best_seller: v })}
                />
                <Label>Best Seller</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>เปิดใช้งาน</Label>
              </div>
            </div>
            {formData.price > 0 && formData.normal_price > 0 && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p>ส่วนลด: <span className="font-bold text-destructive">
                  ฿{formatPrice(formData.normal_price - formData.price)} ({Math.round(((formData.normal_price - formData.price) / formData.normal_price) * 100)}%)
                </span></p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>ยกเลิก</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPromotionTiers;
