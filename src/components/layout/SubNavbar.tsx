import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, FileText, Users, MessageCircle, Star, HelpCircle, Info, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

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

const AUTO_SPEED = 30; // px/sec
const RESUME_DELAY = 800; // ms after release

export function SubNavbar() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);

  // Refs (no state) so we never re-render during scroll/drag
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const velocityRef = useRef(0); // px/sec — for inertia after release

  // Drag state
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastXRef = useRef(0);
  const lastMoveTsRef = useRef(0);
  const movedRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const first = firstSetRef.current;
    const container = containerRef.current;
    if (!track || !first || !container) return;

    let rafId = 0;
    let lastTs: number | null = null;

    const apply = () => {
      const width = first.offsetWidth;
      if (width <= 0) return;
      let n = offsetRef.current % width;
      if (n < 0) n += width;
      offsetRef.current = n;
      track.style.transform = `translate3d(${-n}px, 0, 0)`;
    };

    const step = (ts: number) => {
      if (lastTs == null) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.05); // clamp big gaps
      lastTs = ts;

      if (draggingRef.current) {
        // Position handled by pointermove; nothing to do
      } else if (Math.abs(velocityRef.current) > 1) {
        // Inertia after release
        offsetRef.current += velocityRef.current * dt;
        velocityRef.current *= Math.pow(0.0015, dt); // strong friction
        apply();
      } else if (!pausedRef.current) {
        offsetRef.current += AUTO_SPEED * dt;
        apply();
      }

      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);

    // Pointer / touch handlers (native so we can preventDefault on touchmove)
    const scheduleResume = () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => {
        pausedRef.current = false;
      }, RESUME_DELAY);
    };

    const onPointerDown = (e: PointerEvent) => {
      // Only primary button / touch / pen
      if (e.pointerType === "mouse" && e.button !== 0) return;
      draggingRef.current = true;
      pointerIdRef.current = e.pointerId;
      lastXRef.current = e.clientX;
      lastMoveTsRef.current = performance.now();
      movedRef.current = false;
      velocityRef.current = 0;
      pausedRef.current = true;
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      try { container.setPointerCapture(e.pointerId); } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return;
      const now = performance.now();
      const dx = e.clientX - lastXRef.current;
      const dt = Math.max(now - lastMoveTsRef.current, 1) / 1000;
      if (Math.abs(dx) > 3) movedRef.current = true;
      // Drag right => content moves right => offset decreases
      offsetRef.current -= dx;
      // Velocity for inertia (px/sec, sign matches offset delta direction)
      velocityRef.current = -dx / dt;
      lastXRef.current = e.clientX;
      lastMoveTsRef.current = now;
      apply();
    };

    const endDrag = (e: PointerEvent) => {
      if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return;
      draggingRef.current = false;
      pointerIdRef.current = null;
      try { container.releasePointerCapture(e.pointerId); } catch {}
      // Clamp velocity so inertia stays pleasant
      const v = velocityRef.current;
      velocityRef.current = Math.max(-2500, Math.min(2500, v));
      scheduleResume();
    };

    // Prevent default on horizontal touch drags so the page doesn't scroll sideways
    const onTouchMove = (e: TouchEvent) => {
      if (draggingRef.current && movedRef.current) {
        // We're horizontally dragging — block default
        e.preventDefault();
      }
    };

    const onMouseEnter = () => {
      pausedRef.current = true;
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
    const onMouseLeave = () => {
      if (!draggingRef.current) scheduleResume();
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", endDrag);
    container.addEventListener("pointercancel", endDrag);
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", endDrag);
      container.removeEventListener("pointercancel", endDrag);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // Suppress click-through after a real drag
  const onClickCapture = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
    }
  };

  const renderItem = (item: typeof navItems[number], key: string) => {
    const isActive = location.pathname === item.path ||
      (item.path !== "/" && location.pathname.startsWith(item.path));
    const Icon = item.icon;
    return (
      <Link
        key={key}
        to={item.path}
        draggable={false}
        className={cn(
          "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 select-none",
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
        ref={containerRef}
        className="relative overflow-hidden py-2 select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
        onClickCapture={onClickCapture}
      >
        <div
          ref={trackRef}
          className="flex items-center w-max will-change-transform"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          <div ref={firstSetRef} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4">
            {navItems.map((item) => renderItem(item, `a-${item.path}`))}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4" aria-hidden="true">
            {navItems.map((item) => renderItem(item, `b-${item.path}`))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
}
