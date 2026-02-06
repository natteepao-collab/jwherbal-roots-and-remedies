import { PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarToggleProps {
  className?: string;
}

export function SidebarToggle({ className }: SidebarToggleProps) {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-9 w-9 shrink-0 transition-all duration-200 hover:bg-muted",
            className
          )}
          aria-label={isExpanded ? "ปิด Sidebar" : "เปิด Sidebar"}
        >
          <span className="transition-transform duration-200">
            {isExpanded ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" hidden={isMobile}>
        {isExpanded ? "ปิด Sidebar (Ctrl+B)" : "เปิด Sidebar (Ctrl+B)"}
      </TooltipContent>
    </Tooltip>
  );
}
