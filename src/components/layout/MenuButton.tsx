import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuButtonProps {
  onClick: () => void;
  className?: string;
}

export function MenuButton({ onClick, className }: MenuButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "font-prompt font-semibold rounded-full px-5 h-10 gap-2 shadow-lg",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "transition-all duration-200 hover:scale-105 active:scale-95",
        className
      )}
    >
      <Menu className="h-4 w-4" />
      <span className="uppercase tracking-wider text-sm">Menu</span>
    </Button>
  );
}
