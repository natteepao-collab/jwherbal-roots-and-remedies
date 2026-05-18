import { useEffect, useState } from "react";

/**
 * Returns true when the bottom/floating UI should be hidden
 * (user is scrolling down past a threshold).
 * Shows again immediately when scrolling up.
 */
export function useHideOnScroll(threshold = 10) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const diff = y - lastY;

      // Always show near the top
      if (y < 80) {
        setHidden(false);
      } else if (diff > threshold) {
        setHidden(true);
        lastY = y;
      } else if (diff < -threshold) {
        setHidden(false);
        lastY = y;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hidden;
}
