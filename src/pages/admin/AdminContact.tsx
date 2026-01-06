import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Facebook, Instagram, Clock, Save, MessageCircle } from "lucide-react";

interface ContactSettings {
  id: string;
  phone: string;
  phone_hours: string;
  email: string;
  address: string;
  line_id: string;
  line_url: string;
  facebook_url: string;
  instagram_url: string;
  weekday_hours: string;
  weekend_hours: string;
}

const AdminContact = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ContactSettings | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["contact-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data as ContactSettings;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ContactSettings>) => {
      if (!formData?.id) throw new Error("No settings found");
      const { error } = await supabase
        .from("contact_settings")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", formData.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-settings"] });
      toast.success("บันทึกข้อมูลสำเร็จ");
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    },
  });

  const handleSave = () => {
    if (!formData) return;
    updateMutation.mutate(formData);
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการข้อมูลติดต่อ</h1>
          <p className="text-muted-foreground">แก้ไขข้อมูลติดต่อและลิงก์ Social Media</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              ข้อมูลการติดต่อ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08x-xxx-xxxx"
              />
            </div>
            <div>
              <Label htmlFor="phone_hours">เวลาให้บริการทางโทรศัพท์</Label>
              <Input
                id="phone_hours"
                value={formData.phone_hours}
                onChange={(e) => setFormData({ ...formData, phone_hours: e.target.value })}
                placeholder="จันทร์-ศุกร์ 9:00-18:00 น."
              />
            </div>
            <div>
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@example.com"
              />
            </div>
            <div>
              <Label htmlFor="address">ที่อยู่</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="กรอกที่อยู่"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              เวลาทำการ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="weekday_hours">วันจันทร์ - ศุกร์</Label>
              <Input
                id="weekday_hours"
                value={formData.weekday_hours}
                onChange={(e) => setFormData({ ...formData, weekday_hours: e.target.value })}
                placeholder="9:00 - 18:00 น."
              />
            </div>
            <div>
              <Label htmlFor="weekend_hours">วันเสาร์ - อาทิตย์</Label>
              <Input
                id="weekend_hours"
                value={formData.weekend_hours}
                onChange={(e) => setFormData({ ...formData, weekend_hours: e.target.value })}
                placeholder="10:00 - 16:00 น."
              />
            </div>
          </CardContent>
        </Card>

        {/* LINE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              LINE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="line_id">LINE ID</Label>
              <Input
                id="line_id"
                value={formData.line_id}
                onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
                placeholder="@yourlineid"
              />
            </div>
            <div>
              <Label htmlFor="line_url">LINE URL (สำหรับเปิดแชท)</Label>
              <Input
                id="line_url"
                value={formData.line_url}
                onChange={(e) => setFormData({ ...formData, line_url: e.target.value })}
                placeholder="https://line.me/R/ti/p/@yourlineid"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5" />
              Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContact;