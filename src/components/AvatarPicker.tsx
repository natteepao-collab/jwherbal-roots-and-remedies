import { avatarOptions } from "@/lib/avatarUtils";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  value: string | null;
  onChange: (key: string) => void;
  label?: string;
  showPreview?: boolean;
}

const AvatarPicker = ({
  value,
  onChange,
  label = "เลือกรูปโปรไฟล์",
  showPreview = true,
}: AvatarPickerProps) => {
  const selected = avatarOptions.find((a) => a.key === value);

  return (
    <div>
      <Label className="text-muted-foreground">{label}</Label>

      {showPreview && (
        <div className="mt-3 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary/40 bg-white shadow-sm shrink-0">
            {selected ? (
              <img
                src={selected.src}
                alt="Selected avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                —
              </div>
            )}
          </div>
          <div className="text-sm">
            <div className="font-medium text-foreground">ตัวอย่างรูปโปรไฟล์</div>
            <div className="text-muted-foreground">
              ระบบจะแสดงรูปนี้กับโพสต์/ความคิดเห็นของคุณ
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-5 gap-2 max-h-[180px] overflow-y-auto pr-1">
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
  );
};

export default AvatarPicker;
