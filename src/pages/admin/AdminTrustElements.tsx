import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, X, GripVertical, ShieldCheck, Award, Leaf } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";

const iconOptions = [
  { value: "shield", label: "Shield", icon: ShieldCheck },
  { value: "award", label: "Award", icon: Award },
  { value: "leaf", label: "Leaf", icon: Leaf },
];

const AdminTrustElements = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("certifications");
  
  // Certification state
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<any>(null);
  const [certForm, setCertForm] = useState({
    icon: "shield",
    title_th: "",
    title_en: "",
    title_zh: "",
    description_th: "",
    description_en: "",
    description_zh: "",
    sort_order: 0,
    is_active: true,
  });

  // Ingredient state
  const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);
  const [ingredientForm, setIngredientForm] = useState({
    name_th: "",
    name_en: "",
    name_zh: "",
    description_th: "",
    description_en: "",
    description_zh: "",
    sort_order: 0,
    is_active: true,
  });

  // Fetch certifications
  const { data: certifications, isLoading: loadingCerts } = useQuery({
    queryKey: ["admin-certifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_certifications")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch ingredients
  const { data: ingredients, isLoading: loadingIngredients } = useQuery({
    queryKey: ["admin-ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_ingredients")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch expert info
  const { data: expertInfo } = useQuery({
    queryKey: ["admin-expert"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_expert")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch section settings
  const { data: sectionSettings } = useQuery({
    queryKey: ["admin-trust-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_section_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Certification mutations
  const saveCertMutation = useMutation({
    mutationFn: async (data: typeof certForm & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("trust_certifications")
          .update(data)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("trust_certifications")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      setCertDialogOpen(false);
      setEditingCert(null);
      toast({ title: "บันทึกสำเร็จ" });
    },
  });

  const deleteCertMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("trust_certifications")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      toast({ title: "ลบสำเร็จ" });
    },
  });

  // Ingredient mutations
  const saveIngredientMutation = useMutation({
    mutationFn: async (data: typeof ingredientForm & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("trust_ingredients")
          .update(data)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("trust_ingredients")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ingredients"] });
      setIngredientDialogOpen(false);
      setEditingIngredient(null);
      toast({ title: "บันทึกสำเร็จ" });
    },
  });

  const deleteIngredientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("trust_ingredients")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ingredients"] });
      toast({ title: "ลบสำเร็จ" });
    },
  });

  // Expert mutation
  const saveExpertMutation = useMutation({
    mutationFn: async (data: any) => {
      if (expertInfo?.id) {
        const { error } = await supabase
          .from("trust_expert")
          .update(data)
          .eq("id", expertInfo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("trust_expert").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-expert"] });
      toast({ title: "บันทึกสำเร็จ" });
    },
  });

  // Section settings mutation
  const saveSectionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (sectionSettings?.id) {
        const { error } = await supabase
          .from("trust_section_settings")
          .update(data)
          .eq("id", sectionSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("trust_section_settings").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trust-settings"] });
      toast({ title: "บันทึกสำเร็จ" });
    },
  });

  const openCertDialog = (cert?: any) => {
    if (cert) {
      setEditingCert(cert);
      setCertForm({
        icon: cert.icon,
        title_th: cert.title_th,
        title_en: cert.title_en,
        title_zh: cert.title_zh,
        description_th: cert.description_th,
        description_en: cert.description_en,
        description_zh: cert.description_zh,
        sort_order: cert.sort_order,
        is_active: cert.is_active,
      });
    } else {
      setEditingCert(null);
      setCertForm({
        icon: "shield",
        title_th: "",
        title_en: "",
        title_zh: "",
        description_th: "",
        description_en: "",
        description_zh: "",
        sort_order: (certifications?.length || 0) + 1,
        is_active: true,
      });
    }
    setCertDialogOpen(true);
  };

  const openIngredientDialog = (ingredient?: any) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setIngredientForm({
        name_th: ingredient.name_th,
        name_en: ingredient.name_en,
        name_zh: ingredient.name_zh,
        description_th: ingredient.description_th,
        description_en: ingredient.description_en,
        description_zh: ingredient.description_zh,
        sort_order: ingredient.sort_order,
        is_active: ingredient.is_active,
      });
    } else {
      setEditingIngredient(null);
      setIngredientForm({
        name_th: "",
        name_en: "",
        name_zh: "",
        description_th: "",
        description_en: "",
        description_zh: "",
        sort_order: (ingredients?.length || 0) + 1,
        is_active: true,
      });
    }
    setIngredientDialogOpen(true);
  };

  const [expertForm, setExpertForm] = useState<any>(null);
  const [settingsForm, setSettingsForm] = useState<any>(null);

  // Initialize forms when data loads
  if (expertInfo && !expertForm) {
    setExpertForm(expertInfo);
  }
  if (sectionSettings && !settingsForm) {
    setSettingsForm(sectionSettings);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">จัดการความน่าเชื่อถือ</h1>
        <p className="text-muted-foreground">จัดการเครื่องหมายรับรอง วัตถุดิบ และข้อมูลผู้เชี่ยวชาญ</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="certifications">เครื่องหมายรับรอง</TabsTrigger>
          <TabsTrigger value="ingredients">วัตถุดิบ</TabsTrigger>
          <TabsTrigger value="expert">ผู้เชี่ยวชาญ</TabsTrigger>
          <TabsTrigger value="settings">ตั้งค่า Section</TabsTrigger>
        </TabsList>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openCertDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มเครื่องหมาย
            </Button>
          </div>
          <div className="grid gap-4">
            {certifications?.map((cert) => {
              const IconComponent = iconOptions.find(i => i.value === cert.icon)?.icon || ShieldCheck;
              return (
                <Card key={cert.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{cert.title_th}</h3>
                      <p className="text-sm text-muted-foreground">{cert.description_th}</p>
                    </div>
                    <Switch
                      checked={cert.is_active}
                      onCheckedChange={(checked) => {
                        saveCertMutation.mutate({ ...cert, is_active: checked });
                      }}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openCertDialog(cert)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("ยืนยันการลบ?")) {
                          deleteCertMutation.mutate(cert.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Ingredients Tab */}
        <TabsContent value="ingredients" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openIngredientDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มวัตถุดิบ
            </Button>
          </div>
          <div className="grid gap-4">
            {ingredients?.map((ingredient) => (
              <Card key={ingredient.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{ingredient.name_th}</h3>
                    <p className="text-sm text-muted-foreground">{ingredient.description_th}</p>
                  </div>
                  <Switch
                    checked={ingredient.is_active}
                    onCheckedChange={(checked) => {
                      saveIngredientMutation.mutate({ ...ingredient, is_active: checked });
                    }}
                  />
                  <Button variant="ghost" size="icon" onClick={() => openIngredientDialog(ingredient)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm("ยืนยันการลบ?")) {
                        deleteIngredientMutation.mutate(ingredient.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Expert Tab */}
        <TabsContent value="expert" className="space-y-4">
          {expertForm && (
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลผู้เชี่ยวชาญ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>หัวข้อ (ไทย)</Label>
                    <Input
                      value={expertForm.title_th}
                      onChange={(e) => setExpertForm({ ...expertForm, title_th: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Title (EN)</Label>
                    <Input
                      value={expertForm.title_en}
                      onChange={(e) => setExpertForm({ ...expertForm, title_en: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>标题 (中文)</Label>
                    <Input
                      value={expertForm.title_zh}
                      onChange={(e) => setExpertForm({ ...expertForm, title_zh: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>รายละเอียด (ไทย)</Label>
                    <Textarea
                      value={expertForm.description_th}
                      onChange={(e) => setExpertForm({ ...expertForm, description_th: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Description (EN)</Label>
                    <Textarea
                      value={expertForm.description_en}
                      onChange={(e) => setExpertForm({ ...expertForm, description_en: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>描述 (中文)</Label>
                    <Textarea
                      value={expertForm.description_zh}
                      onChange={(e) => setExpertForm({ ...expertForm, description_zh: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <div>
                  <Label>รูปภาพผู้เชี่ยวชาญ</Label>
                  <ImageUpload
                    value={expertForm.image_url || ""}
                    onChange={(url) => setExpertForm({ ...expertForm, image_url: url })}
                    bucket="product-images"
                    folder="trust"
                  />
                </div>
                <Button
                  onClick={() => saveExpertMutation.mutate(expertForm)}
                  disabled={saveExpertMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  บันทึก
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {settingsForm && (
            <Card>
              <CardHeader>
                <CardTitle>ตั้งค่า Section ความน่าเชื่อถือ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">หัวข้อหลัก</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>หัวข้อ (ไทย)</Label>
                      <Input
                        value={settingsForm.section_title_th}
                        onChange={(e) => setSettingsForm({ ...settingsForm, section_title_th: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Title (EN)</Label>
                      <Input
                        value={settingsForm.section_title_en}
                        onChange={(e) => setSettingsForm({ ...settingsForm, section_title_en: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>标题 (中文)</Label>
                      <Input
                        value={settingsForm.section_title_zh}
                        onChange={(e) => setSettingsForm({ ...settingsForm, section_title_zh: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">คำอธิบายหลัก</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>คำอธิบาย (ไทย)</Label>
                      <Textarea
                        value={settingsForm.section_subtitle_th}
                        onChange={(e) => setSettingsForm({ ...settingsForm, section_subtitle_th: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Subtitle (EN)</Label>
                      <Textarea
                        value={settingsForm.section_subtitle_en}
                        onChange={(e) => setSettingsForm({ ...settingsForm, section_subtitle_en: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>副标题 (中文)</Label>
                      <Textarea
                        value={settingsForm.section_subtitle_zh}
                        onChange={(e) => setSettingsForm({ ...settingsForm, section_subtitle_zh: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">หัวข้อส่วนวัตถุดิบ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>หัวข้อ (ไทย)</Label>
                      <Input
                        value={settingsForm.ingredients_title_th}
                        onChange={(e) => setSettingsForm({ ...settingsForm, ingredients_title_th: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Title (EN)</Label>
                      <Input
                        value={settingsForm.ingredients_title_en}
                        onChange={(e) => setSettingsForm({ ...settingsForm, ingredients_title_en: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>标题 (中文)</Label>
                      <Input
                        value={settingsForm.ingredients_title_zh}
                        onChange={(e) => setSettingsForm({ ...settingsForm, ingredients_title_zh: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>รูปภาพส่วนวัตถุดิบ</Label>
                  <ImageUpload
                    value={settingsForm.ingredients_image_url || ""}
                    onChange={(url) => setSettingsForm({ ...settingsForm, ingredients_image_url: url })}
                    bucket="product-images"
                    folder="trust"
                  />
                </div>
                <Button
                  onClick={() => saveSectionMutation.mutate(settingsForm)}
                  disabled={saveSectionMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  บันทึก
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Certification Dialog */}
      <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCert ? "แก้ไขเครื่องหมายรับรอง" : "เพิ่มเครื่องหมายรับรอง"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ไอคอน</Label>
                <Select value={certForm.icon} onValueChange={(v) => setCertForm({ ...certForm, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="h-4 w-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ลำดับ</Label>
                <Input
                  type="number"
                  value={certForm.sort_order}
                  onChange={(e) => setCertForm({ ...certForm, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>ชื่อ (ไทย)</Label>
                <Input
                  value={certForm.title_th}
                  onChange={(e) => setCertForm({ ...certForm, title_th: e.target.value })}
                />
              </div>
              <div>
                <Label>Title (EN)</Label>
                <Input
                  value={certForm.title_en}
                  onChange={(e) => setCertForm({ ...certForm, title_en: e.target.value })}
                />
              </div>
              <div>
                <Label>标题 (中文)</Label>
                <Input
                  value={certForm.title_zh}
                  onChange={(e) => setCertForm({ ...certForm, title_zh: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>คำอธิบาย (ไทย)</Label>
                <Textarea
                  value={certForm.description_th}
                  onChange={(e) => setCertForm({ ...certForm, description_th: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Description (EN)</Label>
                <Textarea
                  value={certForm.description_en}
                  onChange={(e) => setCertForm({ ...certForm, description_en: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>描述 (中文)</Label>
                <Textarea
                  value={certForm.description_zh}
                  onChange={(e) => setCertForm({ ...certForm, description_zh: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={certForm.is_active}
                onCheckedChange={(checked) => setCertForm({ ...certForm, is_active: checked })}
              />
              <Label>เปิดใช้งาน</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCertDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                onClick={() => saveCertMutation.mutate(editingCert ? { ...certForm, id: editingCert.id } : certForm)}
                disabled={saveCertMutation.isPending}
              >
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ingredient Dialog */}
      <Dialog open={ingredientDialogOpen} onOpenChange={setIngredientDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIngredient ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ลำดับ</Label>
              <Input
                type="number"
                value={ingredientForm.sort_order}
                onChange={(e) => setIngredientForm({ ...ingredientForm, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>ชื่อ (ไทย)</Label>
                <Input
                  value={ingredientForm.name_th}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, name_th: e.target.value })}
                />
              </div>
              <div>
                <Label>Name (EN)</Label>
                <Input
                  value={ingredientForm.name_en}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, name_en: e.target.value })}
                />
              </div>
              <div>
                <Label>名称 (中文)</Label>
                <Input
                  value={ingredientForm.name_zh}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, name_zh: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>คำอธิบาย (ไทย)</Label>
                <Textarea
                  value={ingredientForm.description_th}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, description_th: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Description (EN)</Label>
                <Textarea
                  value={ingredientForm.description_en}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, description_en: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>描述 (中文)</Label>
                <Textarea
                  value={ingredientForm.description_zh}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, description_zh: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={ingredientForm.is_active}
                onCheckedChange={(checked) => setIngredientForm({ ...ingredientForm, is_active: checked })}
              />
              <Label>เปิดใช้งาน</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIngredientDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                onClick={() => saveIngredientMutation.mutate(editingIngredient ? { ...ingredientForm, id: editingIngredient.id } : ingredientForm)}
                disabled={saveIngredientMutation.isPending}
              >
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTrustElements;
