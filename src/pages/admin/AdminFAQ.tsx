import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FAQItem {
  id: string;
  question_th: string;
  question_en: string;
  question_zh: string;
  answer_th: string;
  answer_en: string;
  answer_zh: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

const emptyFormData = {
  question_th: "",
  question_en: "",
  question_zh: "",
  answer_th: "",
  answer_en: "",
  answer_zh: "",
  category: "general",
  is_active: true,
};

const AdminFAQ = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState(emptyFormData);

  const { data: faqItems = [], isLoading } = useQuery({
    queryKey: ["admin-faq-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as FAQItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const maxOrder = faqItems.length > 0 
        ? Math.max(...faqItems.map(item => item.sort_order)) 
        : -1;
      
      const { error } = await supabase.from("faq_items").insert({
        ...data,
        sort_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-items"] });
      toast.success("เพิ่มคำถามสำเร็จ");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FAQItem> }) => {
      const { error } = await supabase
        .from("faq_items")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-items"] });
      toast.success("อัพเดทสำเร็จ");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-items"] });
      toast.success("ลบสำเร็จ");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("faq_items")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-items"] });
      toast.success("อัพเดทสถานะสำเร็จ");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const handleOpenDialog = (item?: FAQItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        question_th: item.question_th,
        question_en: item.question_en,
        question_zh: item.question_zh,
        answer_th: item.answer_th,
        answer_en: item.answer_en,
        answer_zh: item.answer_zh,
        category: item.category,
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = () => {
    if (!formData.question_th.trim() || !formData.answer_th.trim()) {
      toast.error("กรุณากรอกคำถามและคำตอบภาษาไทย");
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const categories = [
    { value: "general", label: "ทั่วไป" },
    { value: "product", label: "เกี่ยวกับผลิตภัณฑ์" },
    { value: "usage", label: "วิธีใช้งาน" },
    { value: "health", label: "สุขภาพ" },
    { value: "shipping", label: "การจัดส่ง" },
  ];

  const getCategoryLabel = (value: string) => {
    return categories.find(c => c.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการถาม-ตอบ (FAQ)</h1>
          <p className="text-muted-foreground">จัดการคำถามที่พบบ่อยและคำตอบ</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มคำถามใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "แก้ไขคำถาม" : "เพิ่มคำถามใหม่"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>หมวดหมู่</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
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
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>แสดงคำถามนี้</Label>
                </div>
              </div>

              <Tabs defaultValue="th" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="th">🇹🇭 ภาษาไทย</TabsTrigger>
                  <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
                  <TabsTrigger value="zh">🇨🇳 中文</TabsTrigger>
                </TabsList>
                
                <TabsContent value="th" className="space-y-4 mt-4">
                  <div>
                    <Label>คำถาม (ไทย) *</Label>
                    <Textarea
                      value={formData.question_th}
                      onChange={(e) => setFormData({ ...formData, question_th: e.target.value })}
                      placeholder="ผลิตภัณฑ์ V Flow เหมาะสมกับใครบ้าง?"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>คำตอบ (ไทย) *</Label>
                    <Textarea
                      value={formData.answer_th}
                      onChange={(e) => setFormData({ ...formData, answer_th: e.target.value })}
                      placeholder="V Flow Capsule เหมาะกับวัยรุ่นหรือวัยทำงาน..."
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label>Question (English)</Label>
                    <Textarea
                      value={formData.question_en}
                      onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                      placeholder="Who is V Flow product suitable for?"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Answer (English)</Label>
                    <Textarea
                      value={formData.answer_en}
                      onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
                      placeholder="V Flow Capsule is suitable for teenagers and working adults..."
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="zh" className="space-y-4 mt-4">
                  <div>
                    <Label>问题 (中文)</Label>
                    <Textarea
                      value={formData.question_zh}
                      onChange={(e) => setFormData({ ...formData, question_zh: e.target.value })}
                      placeholder="V Flow产品适合哪些人?"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>回答 (中文)</Label>
                    <Textarea
                      value={formData.answer_zh}
                      onChange={(e) => setFormData({ ...formData, answer_zh: e.target.value })}
                      placeholder="V Flow胶囊适合青少年和职场人士..."
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  ยกเลิก
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  )}
                  {editingItem ? "บันทึก" : "เพิ่ม"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{faqItems.length}</div>
            <p className="text-muted-foreground">คำถามทั้งหมด</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {faqItems.filter(item => item.is_active).length}
            </div>
            <p className="text-muted-foreground">แสดงอยู่</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-400">
              {faqItems.filter(item => !item.is_active).length}
            </div>
            <p className="text-muted-foreground">ซ่อนอยู่</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการคำถาม-ตอบ</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : faqItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>ยังไม่มีคำถาม กดปุ่ม "เพิ่มคำถามใหม่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    item.is_active ? "bg-card" : "bg-muted/50 opacity-60"
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(item.category)}
                      </Badge>
                      {!item.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          ซ่อนอยู่
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-foreground mb-1 line-clamp-1">
                      {item.question_th}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.answer_th}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) => 
                        toggleActiveMutation.mutate({ id: item.id, is_active: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                          <AlertDialogDescription>
                            คุณต้องการลบคำถามนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            ลบ
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFAQ;