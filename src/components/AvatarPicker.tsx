import { avatarOptions } from "@/lib/avatarUtils";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  value: string | null;
  onChange: (key: string) => void;
  label?: string;
}

const AvatarPicker = ({ value, onChange, label = "เลือกรูปโปรไฟล์" }: AvatarPickerProps) => {
  return (
    <div>
      <Label className="text-muted-foreground">{label}</Label>
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
