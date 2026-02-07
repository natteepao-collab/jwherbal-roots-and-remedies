import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, FileText, Users, MessageCircle, Star, HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const navItems = [
  { icon: Home, label: "หน้าแรก", path: "/" },
  { icon: Info, label: "เกี่ยวกับเรา", path: "/about" },
  { icon: ShoppingBag, label: "สินค้า", path: "/shop" },
  { icon: FileText, label: "บทความ", path: "/articles" },
  { icon: Users, label: "คอมมูนิตี้", path: "/community" },
  { icon: Star, label: "รีวิว", path: "/reviews" },
  { icon: HelpCircle, label: "FAQ", path: "/faq" },
  { icon: MessageCircle, label: "ติดต่อ", path: "/contact" },
];

export function SubNavbar() {
  const location = useLocation();

  return (
    <div className="sticky top-12 sm:top-14 z-40 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 lg:hidden">
      <ScrollArea className="w-full">
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  );
}
