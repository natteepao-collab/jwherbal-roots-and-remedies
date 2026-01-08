import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, User, Home, Info, ShoppingBag, BookOpen, Users, Star, Phone, LogOut, Shield, ClipboardList, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import jwGroupLogo from "@/assets/jwgroup-logo.png";
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

const Navbar = () => {
  const { items } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    // Listen for auth changes
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

  const navLinks = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/about", label: t("nav.about"), icon: Info },
    { to: "/shop", label: t("nav.shop"), icon: ShoppingBag },
    { to: "/articles", label: t("nav.articles"), icon: BookOpen },
    { to: "/community", label: t("nav.community"), icon: Users },
    { to: "/reviews", label: t("nav.reviews"), icon: Star },
    { to: "/faq", label: t("nav.faq"), icon: HelpCircle },
    { to: "/contact", label: t("nav.contact"), icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src={jwGroupLogo} 
            alt="JW Group Logo" 
            className="h-10 w-auto object-contain"
          />
          <span className="font-prompt font-semibold text-lg text-foreground hidden sm:inline-block tracking-wide">
            JWHERBAL BY JWGROUP
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 2xl:space-x-6">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="font-prompt text-xs xl:text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300 relative group flex items-center gap-1 xl:gap-1.5 whitespace-nowrap px-1 xl:px-2"
              >
                <IconComponent className="h-3.5 w-3.5 xl:h-4 xl:w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="whitespace-nowrap">{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-1 lg:space-x-2">
          <LanguageSwitcher />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline-block font-prompt text-sm">
                    {getUserDisplayName()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-prompt">
                  {getUserDisplayName()}
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
                <DropdownMenuItem onClick={handleLogout} className="font-prompt cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="font-prompt text-lg font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-3"
                    >
                      <IconComponent className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
