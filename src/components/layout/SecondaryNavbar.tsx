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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-2 md:gap-4">
        {/* Sidebar Toggle */}
        <SidebarToggle />
        
        {/* Logo for mobile only */}
        <Link to="/" className="flex items-center md:hidden shrink-0">
          <img 
            src={customLogoUrl || jwGroupLogo} 
            alt="JW Group Logo" 
            className="h-10 w-auto max-w-[120px] object-contain"
          />
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-lg ml-2">
          <SearchCommand />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Actions - Well organized */}
        <div className="flex items-center">
          {/* Desktop: Full icons with separators */}
          <div className="hidden md:flex items-center gap-1">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Divider */}
            <div className="h-6 w-px bg-border mx-2" />
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-9 w-9 relative hover:bg-muted">
              <Bell className="h-[18px] w-[18px]" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="h-9 w-9 relative hover:bg-muted" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-[18px] w-[18px]" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px] animate-scale-in"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>
            
            {/* Divider */}
            <div className="h-6 w-px bg-border mx-2" />
          </div>

          {/* Mobile: Compact icons */}
          <div className="flex md:hidden items-center gap-0.5">
            <LanguageSwitcher />
            
            <Button variant="ghost" size="icon" className="h-8 w-8 relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative gap-2 h-9 px-2 md:px-3 hover:bg-muted">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">{getUserDisplayName()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-prompt">
                  <div className="flex flex-col">
                    <span className="font-medium">{getUserDisplayName()}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
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
              <Button variant="default" size="sm" asChild className="font-prompt hidden md:flex h-9 px-4 rounded-full">
                <Link to="/auth">
                  <User className="h-4 w-4 mr-2" />
                  เข้าสู่ระบบ
                </Link>
              </Button>
              {/* Mobile: Icon only */}
              <Button variant="ghost" size="icon" asChild className="md:hidden h-8 w-8">
                <Link to="/auth">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
