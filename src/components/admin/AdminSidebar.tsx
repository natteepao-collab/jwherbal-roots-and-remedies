import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings,
  LogOut,
  ChevronLeft,
  Shield,
  Home,
  Package,
  Star,
  ShoppingCart,
  ImageIcon,
  BadgeCheck,
  CreditCard,
  Phone,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const menuItems = [
  { 
    title: "ภาพรวม", 
    icon: LayoutDashboard, 
    path: "/admin/dashboard" 
  },
  { 
    title: "สินค้า", 
    icon: Package, 
    path: "/admin/dashboard/products" 
  },
  { 
    title: "คำสั่งซื้อ", 
    icon: ShoppingCart, 
    path: "/admin/dashboard/orders" 
  },
  { 
    title: "รีวิว", 
    icon: Star, 
    path: "/admin/dashboard/reviews" 
  },
  { 
    title: "บทความ", 
    icon: FileText, 
    path: "/admin/dashboard/articles" 
  },
  { 
    title: "คอมมูนิตี้", 
    icon: MessageSquare, 
    path: "/admin/dashboard/community" 
  },
  { 
    title: "ผู้ใช้", 
    icon: Users, 
    path: "/admin/dashboard/users" 
  },
  { 
    title: "เรื่องราวแบรนด์", 
    icon: ImageIcon, 
    path: "/admin/dashboard/brand-story" 
  },
  { 
    title: "แกลเลอรี่กิจกรรม", 
    icon: ImageIcon, 
    path: "/admin/dashboard/brand-story-gallery" 
  },
  { 
    title: "ความน่าเชื่อถือ", 
    icon: BadgeCheck, 
    path: "/admin/dashboard/trust-elements" 
  },
  { 
    title: "การชำระเงิน", 
    icon: CreditCard, 
    path: "/admin/dashboard/payment-settings" 
  },
  { 
    title: "ติดต่อเรา", 
    icon: Phone, 
    path: "/admin/dashboard/contact" 
  },
  { 
    title: "ถาม-ตอบ (FAQ)", 
    icon: HelpCircle, 
    path: "/admin/dashboard/faq" 
  },
  { 
    title: "รูปภาพถามตอบ", 
    icon: ImageIcon, 
    path: "/admin/dashboard/faq-images" 
  },
  { 
    title: "ตั้งค่า", 
    icon: Settings, 
    path: "/admin/dashboard/settings" 
  },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "ออกจากระบบสำเร็จ",
      description: "ขอบคุณที่ใช้บริการ",
    });
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 border-r border-border bg-card transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("h-8 w-8", collapsed && "mx-auto")}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>
        
        {/* Back to Home Button */}
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 mt-3 rounded-lg transition-all duration-200",
            "bg-accent/50 text-foreground hover:bg-accent",
            collapsed && "justify-center px-2"
          )}
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">กลับหน้าหลัก</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-accent/50",
                active 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>ออกจากระบบ</span>}
        </Button>
      </div>
    </aside>
  );
};
