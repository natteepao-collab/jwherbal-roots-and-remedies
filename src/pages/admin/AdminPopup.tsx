import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Megaphone } from "lucide-react";

const POPUP_ID = "00000000-0000-0000-0000-000000000001";

interface PopupSettings {
  enabled: boolean;
  image_url: string | null;
  image_alt: string | null;
  button_text: string;
  note_text: string | null;
  link_url: string;
}

const AdminPopup = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PopupSettings>({
    enabled: true,
    image_url: null,
    image_alt: "",
    button_text: "ช้อปเลย รับส่วนลด →",
    note_text: "*ส่วนลดนี้มีเฉพาะที่เว็บไซต์นี้เท่านั้น",
    link_url: "/shop",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("popup_settings")
      .select("*")
      .eq("id", POPUP_ID)
      .maybeSingle();

    if (error) {
      console.error("Error fetching popup settings:", error);
    } else if (data) {
      setSettings({
        enabled: data.enabled,
        image_url: data.image_url,
        image_alt: data.image_alt ?? "",
        button_text: data.button_text,
        note_text: data.note_text ?? "",
        link_url: data.link_url,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("popup_settings")
        .update({
          enabled: settings.enabled,
          image_url: settings.image_url,
          image_alt: settings.image_alt,
          button_text: settings.button_text,
          note_text: settings.note_text,
          link_url: settings.link_url,
        })
        .eq("id", POPUP_ID);

      if (error) throw error;

      toast({
        title: "บันทึกสำเร็จ",
        description: "อัพเดท Popup โปรโมชั่นเรียบร้อยแล้ว",
      });
    } catch (error: any) {
      console.error("Error saving popup settings:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกได้",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Popup โปรโมชั่น
          </h1>
          <p className="text-muted-foreground mt-1">
            จัดการรูปภาพและข้อความที่แสดงเมื่อลูกค้าเข้าเว็บไซต์
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>รูปภาพ Popup</CardTitle>
            <CardDescription>
              อัพโหลดรูปโปรโมชั่น (แนะนำสัดส่วนสี่เหลี่ยมจัตุรัส)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              value={settings.image_url ?? ""}
              onChange={(url) => setSettings((s) => ({ ...s, image_url: url || null }))}
              bucket="site-assets"
              folder="popup"
            />
            <div>
              <Label htmlFor="image_alt">คำอธิบายรูป (Alt)</Label>
              <Input
                id="image_alt"
                value={settings.image_alt ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, image_alt: e.target.value }))}
                placeholder="โปรโมชั่นพิเศษ V FLOW"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ข้อความและการตั้งค่า</CardTitle>
            <CardDescription>ปรับแต่งข้อความปุ่มและหมายเหตุ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="enabled" className="font-medium">เปิดใช้งาน Popup</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  เปิด/ปิดการแสดง Popup บนเว็บไซต์
                </p>
              </div>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(v) => setSettings((s) => ({ ...s, enabled: v }))}
              />
            </div>

            <div>
              <Label htmlFor="button_text">ข้อความปุ่ม</Label>
              <Input
                id="button_text"
                value={settings.button_text}
                onChange={(e) => setSettings((s) => ({ ...s, button_text: e.target.value }))}
                placeholder="ช้อปเลย รับส่วนลด →"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="link_url">ลิงก์ปลายทางเมื่อกดปุ่ม</Label>
              <Input
                id="link_url"
                value={settings.link_url}
                onChange={(e) => setSettings((s) => ({ ...s, link_url: e.target.value }))}
                placeholder="/shop"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="note_text">ข้อความหมายเหตุ (ใต้ปุ่ม)</Label>
              <Input
                id="note_text"
                value={settings.note_text ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, note_text: e.target.value }))}
                placeholder="*ส่วนลดนี้มีเฉพาะที่เว็บไซต์นี้เท่านั้น"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPopup;
