import { useRef, useState } from "react";
import { avatarOptions, resolveAvatar } from "@/lib/avatarUtils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Maximize2, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AvatarEditor from "./AvatarEditor";

interface AvatarPickerProps {
  value: string | null;
  onChange: (key: string) => void;
  label?: string;
  showPreview?: boolean;
  /** When provided, enables uploading a custom avatar to storage */
  userId?: string;
}

const AvatarPicker = ({
  value,
  onChange,
  label = "เลือกรูปโปรไฟล์",
  showPreview = true,
  userId,
}: AvatarPickerProps) => {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedPreset = avatarOptions.find((a) => a.key === value);
  const previewSrc = resolveAvatar(value);

  const pickFile = (file: File) => {
    if (!userId) {
      toast.error("กรุณาเข้าสู่ระบบเพื่ออัปโหลดรูป");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }
    setEditorFile(file);
  };

  const handleUploadBlob = async (blob: Blob) => {
    if (!userId) return;
    setUploading(true);
    const path = `${userId}/avatar-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("user-avatars")
      .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

    if (error) {
      toast.error("อัปโหลดรูปไม่สำเร็จ");
    } else {
      const { data } = supabase.storage.from("user-avatars").getPublicUrl(path);
      onChange(`${data.publicUrl}?t=${Date.now()}`);
      toast.success("อัปโหลดรูปเรียบร้อย");
      setEditorFile(null);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <Label className="text-muted-foreground">{label}</Label>

      {showPreview && (
        <div className="mt-3 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <button
            type="button"
            onClick={() => previewSrc && setZoomOpen(true)}
            className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary/40 bg-white shadow-sm shrink-0 relative group"
            aria-label="ดูตัวอย่างรูปแบบขยาย"
          >
            {previewSrc ? (
              <>
                <img
                  src={previewSrc}
                  alt="Selected avatar preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-5 w-5 text-white" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                —
              </div>
            )}
          </button>
          <div className="flex-1 text-sm">
            <div className="font-medium text-foreground">ตัวอย่างรูปโปรไฟล์</div>
            <div className="text-muted-foreground mb-2">
              คลิกที่รูปเพื่อดูแบบขยาย
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full h-7 px-3 text-xs"
              disabled={!previewSrc}
              onClick={() => setZoomOpen(true)}
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              ดูแบบขยาย
            </Button>
          </div>
        </div>
      )}

      {userId && (
        <div className="mt-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-full w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังอัปโหลด...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                อัปโหลดรูปของคุณเอง
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground mt-1 text-center">
            รองรับ JPG/PNG ขนาดไม่เกิน 5MB
          </p>
        </div>
      )}

      <div className="mt-3">
        <Label className="text-xs text-muted-foreground">หรือเลือกจากชุด Avatar</Label>
        <div className="mt-2 grid grid-cols-5 gap-2 max-h-[180px] overflow-y-auto pr-1">
          {avatarOptions.map((av) => (
            <button
              key={av.key}
              type="button"
              onClick={() => onChange(av.key)}
              className={cn(
                "rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-105",
                value === av.key
                  ? "border-primary ring-2 ring-primary/30 scale-105"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={av.src} alt={av.key} className="w-full h-full object-cover aspect-square" />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>ตัวอย่างรูปโปรไฟล์</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {previewSrc && (
              <img
                src={previewSrc}
                alt="Avatar full preview"
                className="w-64 h-64 rounded-full object-cover border-4 border-primary/40 shadow-xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AvatarEditor
        open={!!editorFile}
        file={editorFile}
        onCancel={() => setEditorFile(null)}
        onSave={handleUploadBlob}
        saving={uploading}
      />
    </div>
  );
};

export default AvatarPicker;
