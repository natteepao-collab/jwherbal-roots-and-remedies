import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical, Image as ImageIcon, Upload } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface AboutSettings {
  id: string;
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

const AdminAbout = () => {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [missionItems, setMissionItems] = useState<MissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, missionRes] = await Promise.all([
        supabase.from("about_settings").select("*").maybeSingle(),
        supabase.from("about_mission_items").select("*").order("sort_order", { ascending: true })
      ]);

      if (settingsRes.error) throw settingsRes.error;
      if (missionRes.error) throw missionRes.error;

      setSettings(settingsRes.data);
      setMissionItems(missionRes.data || []);
    } catch (error) {
      console.error("Error fetching about data:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("about_settings")
        .update(settings)
        .eq("id", settings.id);

      if (error) throw error;
      toast.success("บันทึกข้อมูลสำเร็จ");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `vision-${Date.now()}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(fileName);

      setSettings({ ...settings, vision_image_url: publicUrl });
      toast.success("อัพโหลดรูปภาพสำเร็จ");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveMissionItem = async (item: MissionItem) => {
    try {
      const { error } = await supabase
        .from("about_mission_items")
        .update(item)
        .eq("id", item.id);

      if (error) throw error;
      toast.success("บันทึกสำเร็จ");
    } catch (error) {
      console.error("Error saving mission item:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleAddMissionItem = async () => {
    try {
      const newItem = {
        sort_order: missionItems.length + 1,
        title_th: "พันธกิจใหม่",
        title_en: "New Mission",
        title_zh: "新使命",
        description_th: "รายละเอียดพันธกิจ",
        description_en: "Mission description",
        description_zh: "使命描述",
        is_active: true
      };

      const { data, error } = await supabase
        .from("about_mission_items")
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      setMissionItems([...missionItems, data]);
      toast.success("เพิ่มพันธกิจสำเร็จ");
    } catch (error) {
      console.error("Error adding mission item:", error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDeleteMissionItem = async (id: string) => {
    if (!confirm("ต้องการลบพันธกิจนี้?")) return;

    try {
      const { error } = await supabase
        .from("about_mission_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setMissionItems(missionItems.filter(item => item.id !== id));
      toast.success("ลบสำเร็จ");
    } catch (error) {
      console.error("Error deleting mission item:", error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const updateMissionItem = (id: string, field: keyof MissionItem, value: string | number | boolean) => {
    setMissionItems(missionItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-muted-foreground">ไม่พบข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการหน้าเกี่ยวกับเรา</h1>
          <p className="text-muted-foreground mt-1">แก้ไขข้อมูลวิสัยทัศน์ พันธกิจ และเรื่องราวของบริษัท</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
        </Button>
      </div>

      <Tabs defaultValue="vision" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vision">วิสัยทัศน์</TabsTrigger>
          <TabsTrigger value="mission">พันธกิจ</TabsTrigger>
          <TabsTrigger value="story">เรื่องราว</TabsTrigger>
          <TabsTrigger value="achievements">ผลงาน</TabsTrigger>
        </TabsList>

        {/* Vision Tab */}
        <TabsContent value="vision" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>วิสัยทัศน์ (Vision)</CardTitle>
              <CardDescription>ข้อความแสดงวิสัยทัศน์ของบริษัท</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vision Image */}
              <div className="space-y-2">
                <Label>รูปภาพประกอบ</Label>
                <div className="flex items-center gap-4">
                  {settings.vision_image_url ? (
                    <img
                      src={settings.vision_image_url}
                      alt="Vision"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="max-w-xs"
                    />
                    {isUploading && <p className="text-sm text-muted-foreground">กำลังอัพโหลด...</p>}
                  </div>
                </div>
              </div>

              {/* Vision Titles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>หัวข้อ (ไทย)</Label>
                  <Input
                    value={settings.vision_title_th}
                    onChange={(e) => setSettings({ ...settings, vision_title_th: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>หัวข้อ (English)</Label>
                  <Input
                    value={settings.vision_title_en}
                    onChange={(e) => setSettings({ ...settings, vision_title_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>หัวข้อ (中文)</Label>
                  <Input
                    value={settings.vision_title_zh}
                    onChange={(e) => setSettings({ ...settings, vision_title_zh: e.target.value })}
                  />
                </div>
              </div>

              {/* Vision Quote */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>คำกล่าววิสัยทัศน์ (ไทย)</Label>
                  <Textarea
                    value={settings.vision_quote_th}
                    onChange={(e) => setSettings({ ...settings, vision_quote_th: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำกล่าววิสัยทัศน์ (English)</Label>
                  <Textarea
                    value={settings.vision_quote_en}
                    onChange={(e) => setSettings({ ...settings, vision_quote_en: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำกล่าววิสัยทัศน์ (中文)</Label>
                  <Textarea
                    value={settings.vision_quote_zh}
                    onChange={(e) => setSettings({ ...settings, vision_quote_zh: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              {/* Vision Subtitle */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>คำอธิบายเพิ่มเติม (ไทย)</Label>
                  <Textarea
                    value={settings.vision_subtitle_th}
                    onChange={(e) => setSettings({ ...settings, vision_subtitle_th: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบายเพิ่มเติม (English)</Label>
                  <Textarea
                    value={settings.vision_subtitle_en}
                    onChange={(e) => setSettings({ ...settings, vision_subtitle_en: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบายเพิ่มเติม (中文)</Label>
                  <Textarea
                    value={settings.vision_subtitle_zh}
                    onChange={(e) => setSettings({ ...settings, vision_subtitle_zh: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mission Tab */}
        <TabsContent value="mission" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>พันธกิจ (Mission)</CardTitle>
                <CardDescription>รายการพันธกิจของบริษัท</CardDescription>
              </div>
              <Button onClick={handleAddMissionItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มพันธกิจ
              </Button>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-4">
                {missionItems.map((item, index) => (
                  <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-left">{item.title_th}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <Switch
                            checked={item.is_active}
                            onCheckedChange={(checked) => {
                              updateMissionItem(item.id, "is_active", checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs text-muted-foreground">
                            {item.is_active ? "แสดง" : "ซ่อน"}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {/* Titles */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>หัวข้อ (ไทย)</Label>
                          <Input
                            value={item.title_th}
                            onChange={(e) => updateMissionItem(item.id, "title_th", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>หัวข้อ (English)</Label>
                          <Input
                            value={item.title_en}
                            onChange={(e) => updateMissionItem(item.id, "title_en", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>หัวข้อ (中文)</Label>
                          <Input
                            value={item.title_zh}
                            onChange={(e) => updateMissionItem(item.id, "title_zh", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Descriptions */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>รายละเอียด (ไทย)</Label>
                          <Textarea
                            value={item.description_th}
                            onChange={(e) => updateMissionItem(item.id, "description_th", e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>รายละเอียด (English)</Label>
                          <Textarea
                            value={item.description_en}
                            onChange={(e) => updateMissionItem(item.id, "description_en", e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>รายละเอียด (中文)</Label>
                          <Textarea
                            value={item.description_zh}
                            onChange={(e) => updateMissionItem(item.id, "description_zh", e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={() => handleSaveMissionItem(item)}>
                          <Save className="h-4 w-4 mr-2" />
                          บันทึก
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMissionItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          ลบ
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Story Tab */}
        <TabsContent value="story" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>เรื่องราวของเรา (Our Story)</CardTitle>
              <CardDescription>ข้อมูลเกี่ยวกับประวัติและความเป็นมาของบริษัท</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Story Titles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>หัวข้อ (ไทย)</Label>
                  <Input
                    value={settings.story_title_th}
                    onChange={(e) => setSettings({ ...settings, story_title_th: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>หัวข้อ (English)</Label>
                  <Input
                    value={settings.story_title_en}
                    onChange={(e) => setSettings({ ...settings, story_title_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>หัวข้อ (中文)</Label>
                  <Input
                    value={settings.story_title_zh}
                    onChange={(e) => setSettings({ ...settings, story_title_zh: e.target.value })}
                  />
                </div>
              </div>

              {/* Paragraph 1 */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">ย่อหน้าที่ 1</h4>
                <div className="space-y-2">
                  <Label>ไทย</Label>
                  <Textarea
                    value={settings.story_paragraph1_th}
                    onChange={(e) => setSettings({ ...settings, story_paragraph1_th: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>English</Label>
                  <Textarea
                    value={settings.story_paragraph1_en}
                    onChange={(e) => setSettings({ ...settings, story_paragraph1_en: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>中文</Label>
                  <Textarea
                    value={settings.story_paragraph1_zh}
                    onChange={(e) => setSettings({ ...settings, story_paragraph1_zh: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              {/* Paragraph 2 */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">ย่อหน้าที่ 2</h4>
                <div className="space-y-2">
                  <Label>ไทย</Label>
                  <Textarea
                    value={settings.story_paragraph2_th}
                    onChange={(e) => setSettings({ ...settings, story_paragraph2_th: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>English</Label>
                  <Textarea
                    value={settings.story_paragraph2_en}
                    onChange={(e) => setSettings({ ...settings, story_paragraph2_en: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>中文</Label>
                  <Textarea
                    value={settings.story_paragraph2_zh}
                    onChange={(e) => setSettings({ ...settings, story_paragraph2_zh: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              {/* Paragraph 3 */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">ย่อหน้าที่ 3</h4>
                <div className="space-y-2">
                  <Label>ไทย</Label>
                  <Textarea
                    value={settings.story_paragraph3_th}
                    onChange={(e) => setSettings({ ...settings, story_paragraph3_th: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>English</Label>
                  <Textarea
                    value={settings.story_paragraph3_en}
                    onChange={(e) => setSettings({ ...settings, story_paragraph3_en: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>中文</Label>
                  <Textarea
                    value={settings.story_paragraph3_zh}
                    onChange={(e) => setSettings({ ...settings, story_paragraph3_zh: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ผลงานและความสำเร็จ</CardTitle>
              <CardDescription>ตัวเลขแสดงผลงานและความสำเร็จของบริษัท</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Years */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                <div className="space-y-2">
                  <Label>ตัวเลข</Label>
                  <Input
                    value={settings.achievement_years}
                    onChange={(e) => setSettings({ ...settings, achievement_years: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (ไทย)</Label>
                  <Input
                    value={settings.achievement_years_label_th}
                    onChange={(e) => setSettings({ ...settings, achievement_years_label_th: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (English)</Label>
                  <Input
                    value={settings.achievement_years_label_en}
                    onChange={(e) => setSettings({ ...settings, achievement_years_label_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (中文)</Label>
                  <Input
                    value={settings.achievement_years_label_zh}
                    onChange={(e) => setSettings({ ...settings, achievement_years_label_zh: e.target.value })}
                  />
                </div>
              </div>

              {/* Customers */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                <div className="space-y-2">
                  <Label>ตัวเลข</Label>
                  <Input
                    value={settings.achievement_customers}
                    onChange={(e) => setSettings({ ...settings, achievement_customers: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (ไทย)</Label>
                  <Input
                    value={settings.achievement_customers_label_th}
                    onChange={(e) => setSettings({ ...settings, achievement_customers_label_th: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (English)</Label>
                  <Input
                    value={settings.achievement_customers_label_en}
                    onChange={(e) => setSettings({ ...settings, achievement_customers_label_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (中文)</Label>
                  <Input
                    value={settings.achievement_customers_label_zh}
                    onChange={(e) => setSettings({ ...settings, achievement_customers_label_zh: e.target.value })}
                  />
                </div>
              </div>

              {/* Products */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                <div className="space-y-2">
                  <Label>ตัวเลข</Label>
                  <Input
                    value={settings.achievement_products}
                    onChange={(e) => setSettings({ ...settings, achievement_products: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (ไทย)</Label>
                  <Input
                    value={settings.achievement_products_label_th}
                    onChange={(e) => setSettings({ ...settings, achievement_products_label_th: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (English)</Label>
                  <Input
                    value={settings.achievement_products_label_en}
                    onChange={(e) => setSettings({ ...settings, achievement_products_label_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (中文)</Label>
                  <Input
                    value={settings.achievement_products_label_zh}
                    onChange={(e) => setSettings({ ...settings, achievement_products_label_zh: e.target.value })}
                  />
                </div>
              </div>

              {/* Satisfaction */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>ตัวเลข</Label>
                  <Input
                    value={settings.achievement_satisfaction}
                    onChange={(e) => setSettings({ ...settings, achievement_satisfaction: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (ไทย)</Label>
                  <Input
                    value={settings.achievement_satisfaction_label_th}
                    onChange={(e) => setSettings({ ...settings, achievement_satisfaction_label_th: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (English)</Label>
                  <Input
                    value={settings.achievement_satisfaction_label_en}
                    onChange={(e) => setSettings({ ...settings, achievement_satisfaction_label_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>คำอธิบาย (中文)</Label>
                  <Input
                    value={settings.achievement_satisfaction_label_zh}
                    onChange={(e) => setSettings({ ...settings, achievement_satisfaction_label_zh: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAbout;
