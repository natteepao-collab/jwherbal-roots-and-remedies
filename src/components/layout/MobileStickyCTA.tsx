import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, MessageCircle, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function MobileStickyCTA() {
  const { pathname } = useLocation();

  const { data: settings } = useQuery({
    queryKey: ["contact-settings-cta"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_settings")
        .select("line_url")
        .single();
      return data;
    },
  });

  const lineUrl = settings?.line_url || "https://line.me/R/ti/p/@jwherbal";

  // Hide on cart/checkout/auth/admin to avoid duplicate actions
  const hideOn = ["/cart", "/checkout", "/auth", "/reset-password"];
  if (hideOn.some((p) => pathname.startsWith(p)) || pathname.startsWith("/admin")) {
    return null;
  }

  // Context-aware primary CTA
  const isProductPage =
    pathname.startsWith("/products/") || pathname.startsWith("/shop/");

  const primary = isProductPage
    ? { to: "/cart", label: "สั่งซื้อ", Icon: ShoppingCart }
    : { to: "/shop", label: "ดูสินค้า", Icon: ShoppingBag };

  return (
    <div
      className="fixed left-0 right-0 z-40 lg:hidden border-t border-border/30 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 shadow-[0_-4px_12px_-2px_hsl(var(--foreground)/0.08)] bottom-14 sm:bottom-16"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch gap-2 px-3 py-2">
        <Link
          to={primary.to}
          className="flex-1 flex items-center justify-center gap-1.5 min-h-11 h-11 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-sm active:scale-[0.98] transition-transform"
        >
          <primary.Icon className="h-4 w-4" />
          <span>{primary.label}</span>
        </Link>
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="แชทผ่าน LINE"
          className="flex-1 flex items-center justify-center gap-1.5 min-h-11 h-11 rounded-full bg-[#06C755] text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-transform"
        >
          <MessageCircle className="h-4 w-4" />
          <span>แชท LINE</span>
        </a>
      </div>
    </div>
  );
}
