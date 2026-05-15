import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Move, ZoomIn } from "lucide-react";

interface AvatarEditorProps {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  onSave: (blob: Blob) => Promise<void> | void;
  saving?: boolean;
}

const BOX = 280; // editor preview size (px)
const OUTPUT = 512; // exported size (px)

const AvatarEditor = ({ open, file, onCancel, onSave, saving }: AvatarEditorProps) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (!file) {
      setImgUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      // fit to cover the box
      const fit = Math.max(BOX / img.naturalWidth, BOX / img.naturalHeight);
      setMinScale(fit);
      setScale(fit);
      setPos({ x: 0, y: 0 });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const clamp = (val: number, currentScale: number, dim: number) => {
    const drawn = dim * currentScale;
    const max = Math.max(0, (drawn - BOX) / 2);
    return Math.min(max, Math.max(-max, val));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !imgSize) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({
      x: clamp(dragRef.current.ox + dx, scale, imgSize.w),
      y: clamp(dragRef.current.oy + dy, scale, imgSize.h),
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const handleScale = (vals: number[]) => {
    const newScale = vals[0];
    if (!imgSize) return;
    setScale(newScale);
    setPos((p) => ({
      x: clamp(p.x, newScale, imgSize.w),
      y: clamp(p.y, newScale, imgSize.h),
    }));
  };

  const handleSave = async () => {
    if (!imgUrl || !imgSize) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("load fail"));
      img.src = imgUrl;
    });

    // Map editor box (BOX px) → canvas (OUTPUT px)
    const ratio = OUTPUT / BOX;
    const drawnW = imgSize.w * scale * ratio;
    const drawnH = imgSize.h * scale * ratio;
    const cx = OUTPUT / 2 + pos.x * ratio;
    const cy = OUTPUT / 2 + pos.y * ratio;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT, OUTPUT);
    ctx.drawImage(img, cx - drawnW / 2, cy - drawnH / 2, drawnW, drawnH);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
    );
    if (blob) await onSave(blob);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-4 w-4 text-primary" />
            ปรับตำแหน่งรูปโปรไฟล์
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div
            className="relative bg-muted rounded-full overflow-hidden border-4 border-primary/30 shadow-inner touch-none select-none cursor-grab active:cursor-grabbing"
            style={{ width: BOX, height: BOX }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {imgUrl && imgSize && (
              <img
                src={imgUrl}
                alt="edit"
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: imgSize.w * scale,
                  height: imgSize.h * scale,
                  transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                  maxWidth: "none",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center -mt-1">
            ลากรูปเพื่อปรับตำแหน่ง · ใช้แถบเลื่อนเพื่อซูม
          </p>

          <div className="w-full flex items-center gap-3 px-2">
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider
              value={[scale]}
              min={minScale}
              max={minScale * 4}
              step={0.01}
              onValueChange={handleScale}
              className="flex-1"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="rounded-full">
            ยกเลิก
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || !imgUrl} className="rounded-full">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "บันทึกรูป"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarEditor;
