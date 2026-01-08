import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import jwGroupLogo from "@/assets/jwgroup-logo.png";

const AdminLogo = () => {
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching site settings:", error);
    } else if (data) {
      setLogoUrl(data.logo_url);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(fileName);

      const newLogoUrl = urlData.publicUrl;

      // Update site_settings
      const { error: updateError } = await supabase
        .from("site_settings")
        .update({ logo_url: newLogoUrl })
        .eq("id", "00000000-0000-0000-0000-000000000001");

      if (updateError) throw updateError;

      setLogoUrl(newLogoUrl);
      toast({
        title: "อัพโหลดสำเร็จ",
        description: "อัพเดท Logo เรียบร้อยแล้ว",
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพโหลด Logo ได้",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ logo_url: null })
        .eq("id", "00000000-0000-0000-0000-000000000001");

      if (error) throw error;

      setLogoUrl(null);
      toast({
        title: "ลบ Logo สำเร็จ",
        description: "กลับไปใช้ Logo เริ่มต้นแล้ว",
      });
    } catch (error: any) {
      console.error("Error removing logo:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบ Logo ได้",
        variant: "destructive",
      });
    }
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

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">จัดการ Logo</h1>
        <p className="text-muted-foreground mt-1">อัพโหลดและจัดการ Logo ของเว็บไซต์</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Logo Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo ปัจจุบัน
            </CardTitle>
            <CardDescription>
              Logo ที่แสดงบน Navbar ของเว็บไซต์
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-muted/50 flex items-center justify-center min-h-[150px]">
              <img
                src={logoUrl || jwGroupLogo}
                alt="Current Logo"
                className="max-h-24 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              {logoUrl ? "Logo ที่กำหนดเอง" : "Logo เริ่มต้น (JW Group)"}
            </p>
          </CardContent>
        </Card>

        {/* Upload New Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              อัพโหลด Logo ใหม่
            </CardTitle>
            <CardDescription>
              รองรับไฟล์ PNG, JPG, SVG (ขนาดไม่เกิน 2MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo-upload">เลือกไฟล์ Logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="mt-2"
              />
            </div>

            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                กำลังอัพโหลด...
              </div>
            )}

            {logoUrl && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRemoveLogo}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                ลบ Logo และใช้ค่าเริ่มต้น
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>คำแนะนำ</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>แนะนำให้ใช้ไฟล์ PNG หรือ SVG ที่มีพื้นหลังโปร่งใส</li>
            <li>ขนาดที่เหมาะสม: ความสูง 40-80 พิกเซล</li>
            <li>Logo จะแสดงใน Navbar ของเว็บไซต์</li>
            <li>หากลบ Logo จะกลับไปใช้ Logo เริ่มต้นของ JW Group</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogo;
