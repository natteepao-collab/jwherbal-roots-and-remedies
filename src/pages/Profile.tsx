import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import AvatarPicker from "@/components/AvatarPicker";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  preferred_avatar: string | null;
}

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState<string>("cartoon:01");
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthChecked(true);
      if (!user) {
        setIsAuthed(false);
        setLoading(false);
        return;
      }
      setIsAuthed(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, preferred_avatar")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        if (data.preferred_avatar) setAvatar(data.preferred_avatar);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), preferred_avatar: avatar })
      .eq("id", profile.id);

    if (error) {
      toast.error("ไม่สามารถบันทึกข้อมูลได้");
    } else {
      toast.success("บันทึกข้อมูลเรียบร้อย");
      setProfile({ ...profile, full_name: fullName.trim(), preferred_avatar: avatar });
    }
    setSaving(false);
  };

  if (authChecked && !isAuthed) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button variant="ghost" asChild className="mb-6 hover:bg-primary/10 rounded-full">
              <Link to="/community">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับ
              </Link>
            </Button>

            <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                      จัดการโปรไฟล์
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      ปรับแต่งชื่อและรูปโปรไฟล์ที่ใช้ทั่วทั้งเว็บไซต์
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-muted-foreground">อีเมล</Label>
                      <Input
                        value={profile?.email || ""}
                        disabled
                        className="mt-1.5 rounded-xl bg-muted/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fullName" className="text-muted-foreground">
                        ชื่อที่แสดง
                      </Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="กรอกชื่อของคุณ"
                        className="mt-1.5 rounded-xl"
                        maxLength={100}
                      />
                    </div>

                    <AvatarPicker
                      value={avatar}
                      onChange={setAvatar}
                      userId={profile?.id}
                      label="รูปโปรไฟล์"
                    />

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            กำลังบันทึก...
                          </>
                        ) : (
                          "บันทึกการเปลี่ยนแปลง"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Profile;
