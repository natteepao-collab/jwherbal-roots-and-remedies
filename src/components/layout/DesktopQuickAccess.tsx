import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Flame, FileText, Star, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: ShoppingBag, label: "สินค้าแนะนำ", sectionId: "featured-products", path: "/" },
  { icon: Flame, label: "โปรโมชั่นประจำเดือน", sectionId: "monthly-promotion", path: "/" },
  { icon: FileText, label: "บทความล่าสุด", sectionId: "latest-articles", path: "/" },
  { icon: Star, label: "รีวิวจากผู้ใช้จริง", sectionId: "reviews", path: "/" },
  { icon: Droplets, label: "V FLOW HERBAL DRINK", path: "/products/vflow" },
];

export function DesktopQuickAccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.path === "/products/vflow") return; // normal link navigation

    e.preventDefault();

    const scrollToSection = () => {
      const el = document.getElementById(item.sectionId!);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    if (location.pathname === "/") {
      scrollToSection();
    } else {
      navigate("/");
      setTimeout(scrollToSection, 500);
    }
  };

  return (
    <div className="sticky top-12 sm:top-14 z-40 w-full border-b border-border/20 bg-background/80 backdrop-blur-md hidden lg:block">
      <nav className="flex items-center justify-center gap-1 px-6 py-1.5">
        {navItems.map((item) => {
          const isActive =
            item.path === "/products/vflow"
              ? location.pathname === "/products/vflow"
              : location.pathname === "/" && false; // no persistent active for scroll items
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={(e) => handleClick(item, e)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
