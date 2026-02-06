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
  ChevronRight,
  ChevronDown,
  X,
  LogOut,
  Shield,
  ClipboardList,
  Building2,
  Eye
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import jwHerbalLogo from "@/assets/jwherbal-logo-new.png";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Menu items with optional sub-items
const menuItems = [
  { 
    to: "/", 
    labelKey: "nav.home", 
    labelTh: "หน้าแรก",
    icon: Home 
  },
  { 
    to: "/about", 
    labelKey: "nav.about", 
    labelTh: "เกี่ยวกับเรา",
    icon: Info,
    subItems: [
      { to: "/about#story", label: "เรื่องราวของเรา" },
      { to: "/about#vision", label: "วิสัยทัศน์และพันธกิจ" },
    ]
  },
  { 
    to: "/shop", 
    labelKey: "nav.shop", 
    labelTh: "ธุรกิจของเรา",
    icon: Building2 
  },
  { 
    to: "/vflow", 
    labelKey: "nav.vflow", 
    labelTh: "วิสัยทัศน์และพันธกิจ",
    icon: Eye 
  },
  { 
    to: "/articles", 
    labelKey: "nav.articles", 
    labelTh: "ข่าวสาร",
    icon: BookOpen 
  },
  { 
    to: "/community", 
    labelKey: "nav.community", 
    labelTh: "ร่วมงานกับเรา",
    icon: Users 
  },
  { 
    to: "/contact", 
    labelKey: "nav.contact", 
    labelTh: "ติดต่อเรา",
    icon: Phone 
  },
];

export function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

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
    onClose();
    navigate("/");
  };

  const handleNavigation = (to: string) => {
    navigate(to);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleExpanded = (itemTo: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      setExpandedItem(expandedItem === itemTo ? null : itemTo);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-[380px] bg-background z-[101] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <Link to="/" onClick={onClose} className="flex items-center">
                <img 
                  src={customLogoUrl || jwHerbalLogo} 
                  alt="JW Herbal Logo" 
                  className="h-10 w-auto object-contain"
                />
              </Link>
              
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Menu Title */}
            <div className="px-4 pt-6 pb-3">
              <h2 className="font-prompt text-lg font-semibold text-foreground">เมนู</h2>
              <p className="font-prompt text-sm text-muted-foreground">JW Herbal Navigation</p>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto px-3">
              <nav className="space-y-1">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isExpanded = expandedItem === item.to;

                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <button
                        onClick={() => {
                          if (hasSubItems) {
                            toggleExpanded(item.to, true);
                          } else {
                            handleNavigation(item.to);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 font-prompt",
                          active 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                          active 
                            ? "bg-primary-foreground/20" 
                            : "bg-muted"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="flex-1 text-left text-base font-medium">
                          {item.labelTh}
                        </span>
                        {hasSubItems ? (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-5 w-5 opacity-60" />
                          </motion.div>
                        ) : (
                          <ChevronRight className="h-5 w-5 opacity-60" />
                        )}
                      </button>

                      {/* Sub Items */}
                      <AnimatePresence>
                        {hasSubItems && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-14 py-2 space-y-1">
                              {item.subItems?.map((subItem) => (
                                <button
                                  key={subItem.to}
                                  onClick={() => handleNavigation(subItem.to)}
                                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-prompt text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                  {subItem.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </nav>

              {/* User Actions */}
              {user && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 pt-4 border-t border-border/50 space-y-1"
                >
                  <button
                    onClick={() => handleNavigation("/orders")}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors font-prompt"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <span className="text-base font-medium">ประวัติคำสั่งซื้อ</span>
                    <ChevronRight className="h-5 w-5 opacity-60 ml-auto" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleNavigation("/admin/dashboard")}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors font-prompt"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                        <Shield className="h-5 w-5" />
                      </div>
                      <span className="text-base font-medium">จัดการระบบ</span>
                      <ChevronRight className="h-5 w-5 opacity-60 ml-auto" />
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-destructive/10 transition-colors font-prompt text-destructive"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <span className="text-base font-medium">ออกจากระบบ</span>
                  </button>
                </motion.div>
              )}

              {!user && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 pt-4 border-t border-border/50"
                >
                  <button
                    onClick={() => handleNavigation("/auth")}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary text-primary-foreground shadow-lg font-prompt"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-foreground/20">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="text-base font-medium">เข้าสู่ระบบ / สมัครสมาชิก</span>
                    <ChevronRight className="h-5 w-5 opacity-60 ml-auto" />
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/30">
              <p className="font-prompt text-xs text-center text-muted-foreground">
                © 2024 JW Herbal. All rights reserved.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
