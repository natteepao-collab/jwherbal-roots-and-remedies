import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Info, 
  ShoppingBag, 
  BookOpen, 
  Users, 
  Star, 
  Phone, 
  HelpCircle, 
  ShoppingCart, 
  LogOut, 
  Shield, 
  ClipboardList 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import jwHerbalLogo from "@/assets/jwherbal-logo-new.png";

// Navigation items configuration
const mainNavItems = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/about", labelKey: "nav.about", icon: Info },
  { to: "/shop", labelKey: "nav.shop", icon: ShoppingBag },
  { to: "/articles", labelKey: "nav.articles", icon: BookOpen },
  { to: "/community", labelKey: "nav.community", icon: Users },
  { to: "/reviews", labelKey: "nav.reviews", icon: Star },
  { to: "/faq", labelKey: "nav.faq", icon: HelpCircle },
  { to: "/contact", labelKey: "nav.contact", icon: Phone },
];

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useSidebar();
  const { items } = useCart();
  
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isCollapsed = state === "collapsed";

  // Fetch site settings and auth state
  useEffect(() => {
    const fetchSiteSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("logo_url")
        .single();
      
      if (data?.logo_url) {
        setCustomLogoUrl(data.logo_url);
      }
    };
    
    fetchSiteSettings();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkAdminRole(session.user.id), 0);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();
    
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    toast({
      title: "ออกจากระบบสำเร็จ",
      description: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
    });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      {/* Logo Header */}
      <SidebarHeader className={cn(
        "border-b border-border/50 transition-all duration-200",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <Link to="/" className="flex items-center justify-center group">
          <img 
            src={customLogoUrl || jwHerbalLogo} 
            alt="JW Herbal Logo" 
            className={cn(
              "object-contain transition-all duration-300 group-hover:scale-105",
              isCollapsed ? "h-8 w-8 rounded-md" : "h-12 w-auto max-w-[140px]"
            )}
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-prompt text-xs uppercase tracking-wider text-muted-foreground/70">
            {!isCollapsed && "เมนูหลัก"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={t(item.labelKey)}
                      className={cn(
                        "font-prompt transition-all duration-200",
                        active && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      <Link to={item.to}>
                        <Icon className="h-4 w-4" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Shopping */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-prompt text-xs uppercase tracking-wider text-muted-foreground/70">
            {!isCollapsed && "ช้อปปิ้ง"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/cart")}
                  tooltip="ตะกร้าสินค้า"
                  className={cn(
                    "font-prompt transition-all duration-200",
                    isActive("/cart") && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <Link to="/cart" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    <span>ตะกร้าสินค้า</span>
                    {cartItemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Menu */}
        {user && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="font-prompt text-xs uppercase tracking-wider text-muted-foreground/70">
                {!isCollapsed && "บัญชีของฉัน"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/orders")}
                      tooltip="ประวัติคำสั่งซื้อ"
                      className="font-prompt"
                    >
                      <Link to="/orders">
                        <ClipboardList className="h-4 w-4" />
                        <span>ประวัติคำสั่งซื้อ</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        tooltip="จัดการระบบ"
                        className="font-prompt"
                      >
                        <Link to="/admin/dashboard">
                          <Shield className="h-4 w-4" />
                          <span>จัดการระบบ</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border/50 p-4">
        {user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="ออกจากระบบ"
                className="font-prompt text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span>ออกจากระบบ</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/auth")}
                tooltip="เข้าสู่ระบบ"
                className={cn(
                  "font-prompt transition-all duration-200",
                  isActive("/auth") && "bg-primary text-primary-foreground"
                )}
              >
                <Link to="/auth">
                  <Users className="h-4 w-4" />
                  <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
