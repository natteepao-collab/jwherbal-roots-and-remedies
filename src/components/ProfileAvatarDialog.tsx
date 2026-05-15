import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCog, Loader2 } from "lucide-react";
import AvatarPicker from "@/components/AvatarPicker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileAvatarDialogProps {
  userId: string;
  currentAvatar: string | null;
  onSaved: (avatar: string) => void;
}

const ProfileAvatarDialog = ({ userId, currentAvatar, onSaved }: ProfileAvatarDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(currentAvatar || "cartoon:01");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setSelected(currentAvatar || "cartoon:01");
  }, [open, currentAvatar]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ preferred_avatar: selected })
      .eq("id", userId);

    if (error) {
      toast.error("ไม่สามารถบันทึกรูปโปรไฟล์ได้");
    } else {
      toast.success("บันทึกรูปโปรไฟล์เรียบร้อย");
      onSaved(selected);
      setOpen(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <UserCog className="h-4 w-4 mr-2" />
          ตั้งค่ารูปโปรไฟล์
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            จัดการรูปโปรไฟล์
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <AvatarPicker value={selected} onChange={setSelected} />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "บันทึก"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileAvatarDialog;
