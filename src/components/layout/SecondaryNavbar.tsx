import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { SidebarToggle } from "./SidebarToggle";
import { ClipboardList, Users, Shield, LogOut } from "lucide-react";
import jwGroupLogo from "@/assets/jwgroup-logo.png";
import { SearchCommand } from "./SearchCommand";

export function SecondaryNavbar() {
  const { items } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          checkAdminRole(session.user.id);
        }, 0);
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

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "ผู้ใช้";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="flex h-12 sm:h-14 items-center px-2 sm:px-3 lg:px-6">
        {/* Left Section: Sidebar Toggle */}
        <div className="shrink-0">
          <SidebarToggle />
        </div>
        
        {/* Center Section: Logo (mobile/tablet only) */}
        <div className="flex-1 flex justify-center lg:justify-start lg:ml-4 min-w-0">
          {/* Logo - Center on mobile/tablet */}
          <Link to="/" className="flex items-center shrink-0 lg:hidden">
            <img 
              src={customLogoUrl || jwGroupLogo} 
              alt="JW Group Logo" 
              className="h-7 sm:h-8 md:h-9 w-auto max-w-[80px] sm:max-w-[100px] md:max-w-[120px] object-contain"
            />
          </Link>
          
          {/* Search Bar - Desktop only */}
          <div className="hidden lg:flex flex-1 max-w-lg">
            <SearchCommand />
          </div>
        </div>

        {/* Right Section: Actions - More compact */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Language Switcher - Compact on all */}
          <div className="scale-90 sm:scale-100">
            <LanguageSwitcher />
          </div>
          
          {/* Cart - All screens */}
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center p-0 text-[8px] sm:text-[10px]"
                >
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>
          
          {/* Notifications - Desktop only */}
          <Button variant="ghost" size="icon" className="hidden lg:flex h-9 w-9 relative hover:bg-muted">
            <Bell className="h-[18px] w-[18px]" />
          </Button>
          
          {/* Divider - Desktop only */}
          <div className="hidden lg:block h-5 w-px bg-border mx-1" />

          {/* User Menu / Login Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-auto lg:px-2 hover:bg-muted shrink-0">
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-[10px] sm:text-xs shrink-0">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden xl:inline text-sm font-medium max-w-[80px] truncate ml-1.5">{getUserDisplayName()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-prompt">
                  <div className="flex flex-col">
                    <span className="font-medium">{getUserDisplayName()}</span>
                    <span className="text-xs text-muted-foreground font-normal truncate">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/orders")} className="font-prompt cursor-pointer">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  ประวัติคำสั่งซื้อ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/community")} className="font-prompt cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  คอมมูนิตี้
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin/dashboard")} className="font-prompt cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    จัดการระบบ
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="font-prompt cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* Desktop: Full button */}
              <Button variant="default" size="sm" asChild className="font-prompt hidden lg:inline-flex h-8 px-3 rounded-full text-sm shrink-0">
                <Link to="/auth">
                  <User className="h-4 w-4 mr-1.5" />
                  เข้าสู่ระบบ
                </Link>
              </Button>
              {/* Tablet & Mobile: Icon button */}
              <Button variant="default" size="icon" asChild className="lg:hidden h-7 w-7 sm:h-8 sm:w-8 rounded-full shrink-0">
                <Link to="/auth">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
