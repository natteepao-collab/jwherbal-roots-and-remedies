import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Plus, Trash2, Loader2, Home, Eye, Target, BookOpen, Heart, Award, BarChart3, Upload } from "lucide-react";

interface AboutSettings {
  id: string;
  hero_title_th: string;
  hero_title_en: string;
  hero_title_zh: string;
  hero_subtitle_th: string;
  hero_subtitle_en: string;
  hero_subtitle_zh: string;
  vision_title_th: string;
  vision_title_en: string;
  vision_title_zh: string;
  vision_quote_th: string;
  vision_quote_en: string;
  vision_quote_zh: string;
  vision_subtitle_th: string;
  vision_subtitle_en: string;
  vision_subtitle_zh: string;
  vision_image_url: string | null;
  mission_subtitle_th: string;
  mission_subtitle_en: string;
  mission_subtitle_zh: string;
  story_title_th: string;
  story_title_en: string;
  story_title_zh: string;
  story_paragraph1_th: string;
  story_paragraph1_en: string;
  story_paragraph1_zh: string;
  story_paragraph2_th: string;
  story_paragraph2_en: string;
  story_paragraph2_zh: string;
  story_paragraph3_th: string;
  story_paragraph3_en: string;
  story_paragraph3_zh: string;
  values_title_th: string;
  values_title_en: string;
  values_title_zh: string;
  values_subtitle_th: string;
  values_subtitle_en: string;
  values_subtitle_zh: string;
  certifications_title_th: string;
  certifications_title_en: string;
  certifications_title_zh: string;
  certifications_subtitle_th: string;
  certifications_subtitle_en: string;
  certifications_subtitle_zh: string;
  achievement_years: string;
  achievement_years_label_th: string;
  achievement_years_label_en: string;
  achievement_years_label_zh: string;
  achievement_customers: string;
  achievement_customers_label_th: string;
  achievement_customers_label_en: string;
  achievement_customers_label_zh: string;
  achievement_products: string;
  achievement_products_label_th: string;
  achievement_products_label_en: string;
  achievement_products_label_zh: string;
  achievement_satisfaction: string;
  achievement_satisfaction_label_th: string;
  achievement_satisfaction_label_en: string;
  achievement_satisfaction_label_zh: string;
}

interface MissionItem {
  id: string;
  sort_order: number;
  is_active: boolean;
  title_th: string;
  title_en: string;
  title_zh: string;
  description_th: string;
  description_en: string;
  description_zh: string;
}

interface ValueItem {
  id: string;
  icon: string;
  title_th: string;
  title_en: string;
  title_zh: string;
  description_th: string;
  description_en: string;
  description_zh: string;
  sort_order: number;
  is_active: boolean;
}

interface CertificationItem {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const iconOptions = [
  { value: 'leaf', label: 'ใบไม้ (Leaf)' },
  { value: 'shield', label: 'โล่ (Shield)' },
  { value: 'heart', label: 'หัวใจ (Heart)' },
  { value: 'target', label: 'เป้าหมาย (Target)' },
  { value: 'award', label: 'รางวัล (Award)' },
  { value: 'star', label: 'ดาว (Star)' },
  { value: 'check', label: 'เครื่องหมายถูก (Check)' },
];

const AdminAbout = () => {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [missionItems, setMissionItems] = useState<MissionItem[]>([]);
  const [valueItems, setValueItems] = useState<ValueItem[]>([]);
  const [certItems, setCertItems] = useState<CertificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, missionRes, valuesRes, certsRes] = await Promise.all([
        supabase.from("about_settings").select("*").maybeSingle(),
        supabase.from("about_mission_items").select("*").order("sort_order"),
        supabase.from("about_values").select("*").order("sort_order"),
        supabase.from("about_certifications").select("*").order("sort_order")
      ]);

      if (settingsRes.data) setSettings(settingsRes.data as unknown as AboutSettings);
      if (missionRes.data) setMissionItems(missionRes.data);
      if (valuesRes.data) setValueItems(valuesRes.data);
      if (certsRes.data) setCertItems(certsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("about_settings")
        .update(settings as unknown as Record<string, unknown>)
        .eq("id", settings.id);
      if (error) throw error;
      toast.success("บันทึกสำเร็จ!");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof AboutSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  // Mission Items CRUD
  const addMissionItem = async () => {
    const newItem = {
      title_th: "พันธกิจใหม่",
      title_en: "New Mission",
      title_zh: "新使命",
      description_th: "คำอธิบาย",
      description_en: "Description",
      description_zh: "描述",
      sort_order: missionItems.length + 1,
      is_active: true
    };
    const { data, error } = await supabase.from("about_mission_items").insert(newItem).select().single();
    if (error) {
      toast.error("เกิดข้อผิดพลาด");
      return;
    }
    setMissionItems([...missionItems, data]);
    toast.success("เพิ่มรายการสำเร็จ");
  };

  const updateMissionItem = async (item: MissionItem) => {
    const { error } = await supabase.from("about_mission_items").update(item).eq("id", item.id);
    if (error) {
      toast.error("เกิดข้อผิดพลาด");
      return;
    }
    setMissionItems(missionItems.map(m => m.id === item.id ? item : m));
    toast.success("บันทึกสำเร็จ");
  };

  const deleteMissionItem = async (id: string) => {
    if (!confirm("ต้องการลบรายการนี้?")) return;
    const { error } = await supabase.from("about_mission_items").delete().eq("id", id);
    if (error) {
      toast.error("เกิดข้อผิดพลาด");
      return;
    }
    setMissionItems(missionItems.filter(m => m.id !== id));
    toast.success("ลบสำเร็จ");
  };

  // Value Items CRUD
  const addValueItem = async () => {
    const newItem = {
      icon: "leaf",
      title_th: "ค่านิยมใหม่",
      title_en: "New Value",
      title_zh: "新价值",
      description_th: "คำอธิบาย",
      description_en: "Description",
      description_zh: "描述",
      sort_order: valueItems.length + 1,
      is_active: true
    };
    const { data, error } = await supabase.from("about_values").insert(newItem).select().single();
    if (error) {
      toast.error("เกิดข้อผิดพลาด");
      return;
    }
    setValueItems([...valueItems, data]);
    toast.success("เพิ่มรายการสำเร็จ");
  };

  const updateValueItem = async (item: ValueItem) => {
    const { error } = await supabase.from("about_values").update(item).eq("id", item.id);
    if (error) {
      toast.error("เกิดข้อผิดพลาด");
      return;
    }
    setValueItems(valueItems.map(v => v.id === item.id ? item : v));
    toast.success("บันทึกสำเร็จ");
  };

  const deleteValueItem = async (id: string) => {
    if (!confirm("ต้องการลบรายการนี้?")) return;
    const { error } = await supabase.from("about_values").delete().eq("id", id);
    if (error) {
      toast.error("เกิดข้อผิดพลาด");
      return;
    }
    setValueItems(valueItems.filter(v => v.id !== id));
    toast.success("ลบสำเร็จ");
  };

  // Certification Items CRUD
  const addCertItem = async () => {
    const newItem = {
      name: "ใบรับรองใหม่",
      icon: "award",
      sort_order: certItems.length + 1,
      is_active: true
    };
    const { data, error } = await supabase.from("about_certifications").insert(newItem).select().single();
    if (error) {
      toast.error("เกิดข้อผิดพลาด");
      return;
    }
    setCertItems([...certItems, data]);
    toast.success("เพิ่มรายการสำเร็จ");
  };

  const updateCertItem = async (item: CertificationItem) => {
    const { error } = await supabase.from("about_certifications").update(item).eq("id", item.id);
    if (error) {
      toast.error("เกิดข้อผิดพลาด");
      return;
    }
    setCertItems(certItems.map(c => c.id === item.id ? item : c));
    toast.success("บันทึกสำเร็จ");
  };

  const deleteCertItem = async (id: string) => {
    if (!confirm("ต้องการลบรายการนี้?")) return;
    const { error } = await supabase.from("about_certifications").delete().eq("id", id);
    if (error) {
      toast.error("เกิดข้อผิดพลาด");
      return;
    }
    setCertItems(certItems.filter(c => c.id !== id));
    toast.success("ลบสำเร็จ");
  };

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `about-vision-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from("site-assets")
      .upload(fileName, file, { upsert: true });
    
    if (error) {
      toast.error("อัพโหลดรูปภาพไม่สำเร็จ");
      return;
    }
    
    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(fileName);
    updateSetting("vision_image_url", urlData.publicUrl);
    toast.success("อัพโหลดรูปภาพสำเร็จ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการหน้าเกี่ยวกับเรา</h1>
          <p className="text-muted-foreground">แก้ไขเนื้อหาทุกส่วนของหน้า About Us</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-7 gap-1 h-auto p-1">
          <TabsTrigger value="hero" className="flex items-center gap-2 py-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="vision" className="flex items-center gap-2 py-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">วิสัยทัศน์</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2 py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">ผลงาน</span>
          </TabsTrigger>
          <TabsTrigger value="mission" className="flex items-center gap-2 py-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">พันธกิจ</span>
          </TabsTrigger>
          <TabsTrigger value="story" className="flex items-center gap-2 py-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">เรื่องราว</span>
          </TabsTrigger>
          <TabsTrigger value="values" className="flex items-center gap-2 py-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">ค่านิยม</span>
          </TabsTrigger>
          <TabsTrigger value="certs" className="flex items-center gap-2 py-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">ใบรับรอง</span>
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                ส่วนหัวหน้า (Hero Section)
              </CardTitle>
              <CardDescription>ข้อความแนะนำที่แสดงด้านบนสุดของหน้า</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>หัวข้อหลัก (TH)</Label>
                  <Input
                    value={settings?.hero_title_th || ""}
                    onChange={(e) => updateSetting("hero_title_th", e.target.value)}
                    placeholder="เกี่ยวกับ JWHERBAL"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>หัวข้อหลัก (EN)</Label>
                    <Input
                      value={settings?.hero_title_en || ""}
                      onChange={(e) => updateSetting("hero_title_en", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>หัวข้อหลัก (ZH)</Label>
                    <Input
                      value={settings?.hero_title_zh || ""}
                      onChange={(e) => updateSetting("hero_title_zh", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>คำอธิบาย (TH)</Label>
                  <Textarea
                    value={settings?.hero_subtitle_th || ""}
                    onChange={(e) => updateSetting("hero_subtitle_th", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>คำอธิบาย (EN)</Label>
                    <Textarea
                      value={settings?.hero_subtitle_en || ""}
                      onChange={(e) => updateSetting("hero_subtitle_en", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>คำอธิบาย (ZH)</Label>
                    <Textarea
                      value={settings?.hero_subtitle_zh || ""}
                      onChange={(e) => updateSetting("hero_subtitle_zh", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                บันทึก
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vision Section */}
        <TabsContent value="vision">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                วิสัยทัศน์ (Vision)
              </CardTitle>
              <CardDescription>วิสัยทัศน์และเป้าหมายของบริษัท</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>รูปภาพประกอบ</Label>
                <div className="flex items-start gap-4">
                  {settings?.vision_image_url && (
                    <img src={settings.vision_image_url} alt="Vision" className="w-48 h-32 object-cover rounded-lg" />
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>เลือกรูปภาพ</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>หัวข้อ (TH)</Label>
                  <Input
                    value={settings?.vision_title_th || ""}
                    onChange={(e) => updateSetting("vision_title_th", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>หัวข้อ (EN)</Label>
                    <Input
                      value={settings?.vision_title_en || ""}
                      onChange={(e) => updateSetting("vision_title_en", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>หัวข้อ (ZH)</Label>
                    <Input
                      value={settings?.vision_title_zh || ""}
                      onChange={(e) => updateSetting("vision_title_zh", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>คำกล่าวหลัก / Quote (TH)</Label>
                  <Textarea
                    value={settings?.vision_quote_th || ""}
                    onChange={(e) => updateSetting("vision_quote_th", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quote (EN)</Label>
                    <Textarea
                      value={settings?.vision_quote_en || ""}
                      onChange={(e) => updateSetting("vision_quote_en", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quote (ZH)</Label>
                    <Textarea
                      value={settings?.vision_quote_zh || ""}
                      onChange={(e) => updateSetting("vision_quote_zh", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>คำอธิบายเพิ่มเติม (TH)</Label>
                  <Textarea
                    value={settings?.vision_subtitle_th || ""}
                    onChange={(e) => updateSetting("vision_subtitle_th", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>คำอธิบาย (EN)</Label>
                    <Textarea
                      value={settings?.vision_subtitle_en || ""}
                      onChange={(e) => updateSetting("vision_subtitle_en", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>คำอธิบาย (ZH)</Label>
                    <Textarea
                      value={settings?.vision_subtitle_zh || ""}
                      onChange={(e) => updateSetting("vision_subtitle_zh", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                บันทึก
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Section */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ผลงานและตัวเลข (Achievements)
              </CardTitle>
              <CardDescription>ตัวเลขสถิติที่แสดงความสำเร็จของบริษัท</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Years */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">ปีประสบการณ์</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>ตัวเลข</Label>
                    <Input
                      value={settings?.achievement_years || ""}
                      onChange={(e) => updateSetting("achievement_years", e.target.value)}
                      placeholder="10+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (TH)</Label>
                    <Input
                      value={settings?.achievement_years_label_th || ""}
                      onChange={(e) => updateSetting("achievement_years_label_th", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (EN)</Label>
                    <Input
                      value={settings?.achievement_years_label_en || ""}
                      onChange={(e) => updateSetting("achievement_years_label_en", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (ZH)</Label>
                    <Input
                      value={settings?.achievement_years_label_zh || ""}
                      onChange={(e) => updateSetting("achievement_years_label_zh", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Customers */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">จำนวนลูกค้า</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>ตัวเลข</Label>
                    <Input
                      value={settings?.achievement_customers || ""}
                      onChange={(e) => updateSetting("achievement_customers", e.target.value)}
                      placeholder="50,000+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (TH)</Label>
                    <Input
                      value={settings?.achievement_customers_label_th || ""}
                      onChange={(e) => updateSetting("achievement_customers_label_th", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (EN)</Label>
                    <Input
                      value={settings?.achievement_customers_label_en || ""}
                      onChange={(e) => updateSetting("achievement_customers_label_en", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (ZH)</Label>
                    <Input
                      value={settings?.achievement_customers_label_zh || ""}
                      onChange={(e) => updateSetting("achievement_customers_label_zh", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">จำนวนผลิตภัณฑ์</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>ตัวเลข</Label>
                    <Input
                      value={settings?.achievement_products || ""}
                      onChange={(e) => updateSetting("achievement_products", e.target.value)}
                      placeholder="100+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (TH)</Label>
                    <Input
                      value={settings?.achievement_products_label_th || ""}
                      onChange={(e) => updateSetting("achievement_products_label_th", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (EN)</Label>
                    <Input
                      value={settings?.achievement_products_label_en || ""}
                      onChange={(e) => updateSetting("achievement_products_label_en", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (ZH)</Label>
                    <Input
                      value={settings?.achievement_products_label_zh || ""}
                      onChange={(e) => updateSetting("achievement_products_label_zh", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Satisfaction */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">ความพึงพอใจ</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>ตัวเลข</Label>
                    <Input
                      value={settings?.achievement_satisfaction || ""}
                      onChange={(e) => updateSetting("achievement_satisfaction", e.target.value)}
                      placeholder="98%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (TH)</Label>
                    <Input
                      value={settings?.achievement_satisfaction_label_th || ""}
                      onChange={(e) => updateSetting("achievement_satisfaction_label_th", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (EN)</Label>
                    <Input
                      value={settings?.achievement_satisfaction_label_en || ""}
                      onChange={(e) => updateSetting("achievement_satisfaction_label_en", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (ZH)</Label>
                    <Input
                      value={settings?.achievement_satisfaction_label_zh || ""}
                      onChange={(e) => updateSetting("achievement_satisfaction_label_zh", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                บันทึกทั้งหมด
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mission Section */}
        <TabsContent value="mission">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                พันธกิจ (Mission)
              </CardTitle>
              <CardDescription>รายการพันธกิจของบริษัท (แสดงเป็น Accordion)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>คำอธิบายส่วนพันธกิจ (TH)</Label>
                  <Textarea
                    value={settings?.mission_subtitle_th || ""}
                    onChange={(e) => updateSetting("mission_subtitle_th", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>คำอธิบาย (EN)</Label>
                    <Textarea
                      value={settings?.mission_subtitle_en || ""}
                      onChange={(e) => updateSetting("mission_subtitle_en", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>คำอธิบาย (ZH)</Label>
                    <Textarea
                      value={settings?.mission_subtitle_zh || ""}
                      onChange={(e) => updateSetting("mission_subtitle_zh", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
                <Button onClick={saveSettings} disabled={isSaving} variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" /> บันทึกคำอธิบาย
                </Button>
              </div>

              <hr />

              <div className="flex justify-between items-center">
                <h4 className="font-medium">รายการพันธกิจ</h4>
                <Button onClick={addMissionItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> เพิ่มรายการ
                </Button>
              </div>

              <div className="space-y-4">
                {missionItems.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">รายการที่ {index + 1}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.is_active}
                            onCheckedChange={(checked) => updateMissionItem({ ...item, is_active: checked })}
                          />
                          <Label>เปิดใช้งาน</Label>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteMissionItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Input
                        placeholder="หัวข้อ (TH)"
                        value={item.title_th}
                        onChange={(e) => setMissionItems(missionItems.map(m => m.id === item.id ? { ...m, title_th: e.target.value } : m))}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="หัวข้อ (EN)"
                          value={item.title_en}
                          onChange={(e) => setMissionItems(missionItems.map(m => m.id === item.id ? { ...m, title_en: e.target.value } : m))}
                        />
                        <Input
                          placeholder="หัวข้อ (ZH)"
                          value={item.title_zh}
                          onChange={(e) => setMissionItems(missionItems.map(m => m.id === item.id ? { ...m, title_zh: e.target.value } : m))}
                        />
                      </div>
                      <Textarea
                        placeholder="คำอธิบาย (TH)"
                        value={item.description_th}
                        onChange={(e) => setMissionItems(missionItems.map(m => m.id === item.id ? { ...m, description_th: e.target.value } : m))}
                        rows={2}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Textarea
                          placeholder="คำอธิบาย (EN)"
                          value={item.description_en}
                          onChange={(e) => setMissionItems(missionItems.map(m => m.id === item.id ? { ...m, description_en: e.target.value } : m))}
                          rows={2}
                        />
                        <Textarea
                          placeholder="คำอธิบาย (ZH)"
                          value={item.description_zh}
                          onChange={(e) => setMissionItems(missionItems.map(m => m.id === item.id ? { ...m, description_zh: e.target.value } : m))}
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button size="sm" onClick={() => updateMissionItem(item)}>
                      <Save className="h-4 w-4 mr-2" /> บันทึก
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Story Section */}
        <TabsContent value="story">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                เรื่องราวของเรา (Our Story)
              </CardTitle>
              <CardDescription>เรื่องราวและประวัติความเป็นมาของบริษัท</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>หัวข้อ (TH)</Label>
                  <Input
                    value={settings?.story_title_th || ""}
                    onChange={(e) => updateSetting("story_title_th", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>หัวข้อ (EN)</Label>
                    <Input
                      value={settings?.story_title_en || ""}
                      onChange={(e) => updateSetting("story_title_en", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>หัวข้อ (ZH)</Label>
                    <Input
                      value={settings?.story_title_zh || ""}
                      onChange={(e) => updateSetting("story_title_zh", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {[1, 2, 3].map((num) => (
                <div key={num} className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-medium">ย่อหน้าที่ {num}</h4>
                  <div className="space-y-2">
                    <Label>เนื้อหา (TH)</Label>
                    <Textarea
                      value={(settings as unknown as Record<string, string>)?.[`story_paragraph${num}_th`] || ""}
                      onChange={(e) => updateSetting(`story_paragraph${num}_th` as keyof AboutSettings, e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>เนื้อหา (EN)</Label>
                      <Textarea
                        value={(settings as unknown as Record<string, string>)?.[`story_paragraph${num}_en`] || ""}
                        onChange={(e) => updateSetting(`story_paragraph${num}_en` as keyof AboutSettings, e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>เนื้อหา (ZH)</Label>
                      <Textarea
                        value={(settings as unknown as Record<string, string>)?.[`story_paragraph${num}_zh`] || ""}
                        onChange={(e) => updateSetting(`story_paragraph${num}_zh` as keyof AboutSettings, e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                บันทึกทั้งหมด
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Values Section */}
        <TabsContent value="values">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                ค่านิยม (Values)
              </CardTitle>
              <CardDescription>ค่านิยมหลักของบริษัท</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>หัวข้อส่วนค่านิยม (TH)</Label>
                  <Input
                    value={settings?.values_title_th || ""}
                    onChange={(e) => updateSetting("values_title_th", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>หัวข้อ (EN)</Label>
                    <Input
                      value={settings?.values_title_en || ""}
                      onChange={(e) => updateSetting("values_title_en", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>หัวข้อ (ZH)</Label>
                    <Input
                      value={settings?.values_title_zh || ""}
                      onChange={(e) => updateSetting("values_title_zh", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (TH)</Label>
                  <Textarea
                    value={settings?.values_subtitle_th || ""}
                    onChange={(e) => updateSetting("values_subtitle_th", e.target.value)}
                    rows={2}
                  />
                </div>
                <Button onClick={saveSettings} disabled={isSaving} variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" /> บันทึกหัวข้อ
                </Button>
              </div>

              <hr />

              <div className="flex justify-between items-center">
                <h4 className="font-medium">รายการค่านิยม</h4>
                <Button onClick={addValueItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> เพิ่มรายการ
                </Button>
              </div>

              <div className="grid gap-4">
                {valueItems.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">ค่านิยมที่ {index + 1}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.is_active}
                            onCheckedChange={(checked) => updateValueItem({ ...item, is_active: checked })}
                          />
                          <Label>เปิดใช้งาน</Label>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteValueItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <div className="space-y-2">
                        <Label>ไอคอน</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={item.icon}
                          onChange={(e) => setValueItems(valueItems.map(v => v.id === item.id ? { ...v, icon: e.target.value } : v))}
                        >
                          {iconOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <Input
                        placeholder="หัวข้อ (TH)"
                        value={item.title_th}
                        onChange={(e) => setValueItems(valueItems.map(v => v.id === item.id ? { ...v, title_th: e.target.value } : v))}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="หัวข้อ (EN)"
                          value={item.title_en}
                          onChange={(e) => setValueItems(valueItems.map(v => v.id === item.id ? { ...v, title_en: e.target.value } : v))}
                        />
                        <Input
                          placeholder="หัวข้อ (ZH)"
                          value={item.title_zh}
                          onChange={(e) => setValueItems(valueItems.map(v => v.id === item.id ? { ...v, title_zh: e.target.value } : v))}
                        />
                      </div>
                      <Textarea
                        placeholder="คำอธิบาย (TH)"
                        value={item.description_th}
                        onChange={(e) => setValueItems(valueItems.map(v => v.id === item.id ? { ...v, description_th: e.target.value } : v))}
                        rows={2}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Textarea
                          placeholder="คำอธิบาย (EN)"
                          value={item.description_en}
                          onChange={(e) => setValueItems(valueItems.map(v => v.id === item.id ? { ...v, description_en: e.target.value } : v))}
                          rows={2}
                        />
                        <Textarea
                          placeholder="คำอธิบาย (ZH)"
                          value={item.description_zh}
                          onChange={(e) => setValueItems(valueItems.map(v => v.id === item.id ? { ...v, description_zh: e.target.value } : v))}
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button size="sm" onClick={() => updateValueItem(item)}>
                      <Save className="h-4 w-4 mr-2" /> บันทึก
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Section */}
        <TabsContent value="certs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                ใบรับรอง (Certifications)
              </CardTitle>
              <CardDescription>ใบรับรองคุณภาพต่างๆ ของบริษัท</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>หัวข้อส่วนใบรับรอง (TH)</Label>
                  <Input
                    value={settings?.certifications_title_th || ""}
                    onChange={(e) => updateSetting("certifications_title_th", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>หัวข้อ (EN)</Label>
                    <Input
                      value={settings?.certifications_title_en || ""}
                      onChange={(e) => updateSetting("certifications_title_en", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>หัวข้อ (ZH)</Label>
                    <Input
                      value={settings?.certifications_title_zh || ""}
                      onChange={(e) => updateSetting("certifications_title_zh", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (TH)</Label>
                  <Textarea
                    value={settings?.certifications_subtitle_th || ""}
                    onChange={(e) => updateSetting("certifications_subtitle_th", e.target.value)}
                    rows={2}
                  />
                </div>
                <Button onClick={saveSettings} disabled={isSaving} variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" /> บันทึกหัวข้อ
                </Button>
              </div>

              <hr />

              <div className="flex justify-between items-center">
                <h4 className="font-medium">รายการใบรับรอง</h4>
                <Button onClick={addCertItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> เพิ่มรายการ
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {certItems.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">ใบรับรองที่ {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={(checked) => updateCertItem({ ...item, is_active: checked })}
                        />
                        <Button variant="destructive" size="sm" onClick={() => deleteCertItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      placeholder="ชื่อใบรับรอง"
                      value={item.name}
                      onChange={(e) => setCertItems(certItems.map(c => c.id === item.id ? { ...c, name: e.target.value } : c))}
                    />
                    <Button size="sm" onClick={() => updateCertItem(item)}>
                      <Save className="h-4 w-4 mr-2" /> บันทึก
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAbout;
