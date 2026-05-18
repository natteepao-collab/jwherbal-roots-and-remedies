import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, FileText, Users, MessageCircle, Star, HelpCircle, Info, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { icon: Home, label: "หน้าแรก", path: "/" },
  { icon: Info, label: "เกี่ยวกับเรา", path: "/about" },
  { icon: ShoppingBag, label: "สินค้า", path: "/shop" },
  { icon: FileText, label: "บทความ", path: "/articles" },
  { icon: Users, label: "คอมมูนิตี้", path: "/community" },
  { icon: Star, label: "รีวิว", path: "/reviews" },
  { icon: Award, label: "ใบรับรอง", path: "/certifications" },
  { icon: HelpCircle, label: "FAQ", path: "/faq" },
  { icon: MessageCircle, label: "ติดต่อ", path: "/contact" },
];

export function SubNavbar() {
  const location = useLocation();
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // Auto-scroll loop (~30 px/sec). Pauses on hover/touch/focus.
  useEffect(() => {
    const track = trackRef.current;
    const first = firstSetRef.current;
    if (!track || !first) return;

    const SPEED = 30; // px per second

    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (!paused) {
        const width = first.offsetWidth;
        if (width > 0) {
          offsetRef.current = (offsetRef.current + SPEED * dt) % width;
          track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [paused]);

  const renderItem = (item: typeof navItems[number], key: string) => {
    const isActive = location.pathname === item.path ||
      (item.path !== "/" && location.pathname.startsWith(item.path));
    const Icon = item.icon;
    return (
      <Link
        key={key}
        to={item.path}
        className={cn(
          "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="sticky top-12 sm:top-14 z-40 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 lg:hidden">
      <div
        className="relative overflow-hidden py-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex items-center w-max will-change-transform"
        >
          {/* First set (measured for loop width) */}
          <div ref={firstSetRef} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4">
            {navItems.map((item) => renderItem(item, `a-${item.path}`))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4" aria-hidden="true">
            {navItems.map((item) => renderItem(item, `b-${item.path}`))}
          </div>
        </div>
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
}
