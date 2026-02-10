import { Link, useLocation } from "react-router-dom";
import { Home, Info, ShoppingBag, FileText, Users, Star, HelpCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const navItems = [
  { icon: Home, labelKey: "nav.home", path: "/" },
  { icon: Info, labelKey: "nav.about", path: "/about" },
  { icon: ShoppingBag, labelKey: "nav.shop", path: "/shop" },
  { icon: FileText, labelKey: "nav.articles", path: "/articles" },
  { icon: Users, labelKey: "nav.community", path: "/community" },
  { icon: Star, labelKey: "nav.reviews", path: "/reviews" },
  { icon: HelpCircle, labelKey: "nav.faq", path: "/faq" },
  { icon: MessageCircle, labelKey: "nav.contact", path: "/contact" },
];

export function DesktopQuickAccess() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="sticky top-12 sm:top-14 z-40 w-full border-b border-border/20 bg-background/80 backdrop-blur-md hidden lg:block">
      <nav className="flex items-center justify-center gap-1 px-6 py-1.5">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
