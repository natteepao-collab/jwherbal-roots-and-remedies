import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import fallbackImage from "@/assets/promo-popup.jpg.asset.json";

const POPUP_ID = "00000000-0000-0000-0000-000000000001";

interface PopupSettings {
  enabled: boolean;
  image_url: string | null;
  image_alt: string | null;
  button_text: string;
  note_text: string | null;
  terms_text: string | null;
  link_url: string;
}

const PromoPopup = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Show only on public pages, not in admin dashboard
    if (location.pathname.startsWith("/admin")) return;

    let active = true;
    (async () => {
      const { data } = await supabase
        .from("popup_settings")
        .select("*")
        .eq("id", POPUP_ID)
        .maybeSingle();

      if (!active) return;

      if (data && data.enabled) {
        setSettings(data);
        setTimeout(() => active && setOpen(true), 600);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => setOpen(false);

  const handleShopNow = () => {
    setOpen(false);
    const url = settings?.link_url || "/shop";
    if (url.startsWith("http")) {
      window.open(url, "_blank");
    } else {
      navigate(url);
    }
  };

  if (!settings) return null;

  const imageSrc = settings.image_url || fallbackImage.url;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-md"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              aria-label="ปิด"
              className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-lg ring-2 ring-primary/30 transition-transform hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              onClick={handleShopNow}
              className="block w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-primary/20 bg-muted aspect-square"
            >
              <img
                src={imageSrc}
                alt={settings.image_alt || "โปรโมชั่นพิเศษ"}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </button>

            <motion.div
              className="mt-3 rounded-xl bg-card/95 p-4 shadow-xl ring-1 ring-border backdrop-blur-sm"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {settings.button_text && (
                <motion.button
                  onClick={handleShopNow}
                  className="mx-auto block rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {settings.button_text}
                </motion.button>
              )}

              {settings.note_text && (
                <p className="mt-3 text-center text-xs font-medium text-foreground">
                  {settings.note_text}
                </p>
              )}

              {settings.terms_text && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground mb-2">
                    เงื่อนไขโปรโมชั่น
                  </p>
                  <div className="text-[11px] leading-relaxed text-foreground whitespace-pre-wrap">
                    {settings.terms_text}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoPopup;
