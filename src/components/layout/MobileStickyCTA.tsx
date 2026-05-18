import { Link } from "react-router-dom";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function MobileStickyCTA() {
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

  const lineUrl = settings?.line_url || "https://line.me/";

  return (
    <div className="fixed bottom-14 sm:bottom-16 left-0 right-0 z-40 lg:hidden border-t border-border/30 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-[0_-4px_12px_-2px_hsl(var(--foreground)/0.08)]">
      <div className="flex items-stretch gap-2 px-3 py-2">
        <Link
          to="/shop"
          className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-sm active:scale-[0.98] transition-transform"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>สั่งซื้อ</span>
        </Link>
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-full bg-[#06C755] text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-transform"
        >
          <MessageCircle className="h-4 w-4" />
          <span>แชท LINE</span>
        </a>
      </div>
    </div>
  );
}
