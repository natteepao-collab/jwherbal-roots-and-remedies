import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, FileText, Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: Home, label: "หน้าแรก", path: "/" },
  { icon: ShoppingBag, label: "สินค้า", path: "/shop" },
  { icon: FileText, label: "บทความ", path: "/articles" },
  { icon: Users, label: "คอมมูนิตี้", path: "/community" },
  { icon: MessageCircle, label: "ติดต่อ", path: "/contact" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { items } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border/30 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-14 sm:h-16 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors relative",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6 transition-transform",
                  isActive && "scale-110"
                )} />
                {item.path === "/shop" && cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1.5 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[9px]"
                  >
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-[10px] sm:text-xs font-medium",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
