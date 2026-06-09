import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, ChevronDown, ArrowRight, Sparkles } from "lucide-react";
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
  const [showTerms, setShowTerms] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[hsl(140_60%_12%)] via-[hsl(145_55%_9%)] to-[hsl(150_50%_6%)] shadow-[0_0_60px_-10px_hsl(140_80%_40%/0.6)] ring-1 ring-primary/40"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              aria-label="ปิด"
              className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white shadow-lg ring-1 ring-white/20 backdrop-blur transition-transform hover:scale-110 hover:bg-black/60"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Urgency banner */}
            <motion.div
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-2 text-center"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 100%" }}
            >
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Flame className="h-4 w-4 text-yellow-300" />
              </motion.span>
              <span className="text-sm font-extrabold uppercase tracking-wider text-white drop-shadow">
                ด่วน! โปรแรงสุดในรอบเดือน
              </span>
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
              >
                <Flame className="h-4 w-4 text-yellow-300" />
              </motion.span>
            </motion.div>

            {/* Promo image */}
            <button
              onClick={handleShopNow}
              className="block w-full overflow-hidden bg-black/20"
            >
              <motion.img
                src={imageSrc}
                alt={settings.image_alt || "โปรโมชั่นพิเศษ"}
                className="w-full h-auto object-cover"
                loading="eager"
                decoding="async"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              />
            </button>

            <div className="p-5">
              {/* Hardsell headline */}
              <motion.div
                className="text-center"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-300">
                  เฉพาะลูกค้าเว็บไซต์เท่านั้น
                </p>
                <h3 className="mt-1 text-2xl font-black leading-tight text-white">
                  รับส่วนลดเพิ่ม{" "}
                  <span className="text-yellow-300">ทันที!</span>
                </h3>
                <p className="mt-1 text-sm font-semibold text-green-200">
                  ยิ่งช้า ยิ่งหมด • สินค้ามีจำนวนจำกัด
                </p>
              </motion.div>

              {/* CTA */}
              {settings.button_text && (
                <motion.button
                  onClick={handleShopNow}
                  className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-4 text-base font-black text-green-950 shadow-[0_8px_30px_-6px_rgba(250,204,21,0.7)]"
                  initial={{ y: 8, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    y: { delay: 0.3 },
                    opacity: { delay: 0.3 },
                    scale: { duration: 1.4, repeat: Infinity },
                  }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Sparkles className="h-5 w-5" />
                  {settings.button_text}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </motion.button>
              )}

              {settings.note_text && (
                <p className="mt-3 text-center text-xs font-medium text-green-200/90">
                  {settings.note_text}
                </p>
              )}

              {/* Collapsible terms */}
              {settings.terms_text && (
                <div className="mt-4 rounded-xl bg-black/20 ring-1 ring-white/10">
                  <button
                    onClick={() => setShowTerms((s) => !s)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/90">
                      เงื่อนไขโปรโมชั่น
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-white/70 transition-transform ${
                        showTerms ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {showTerms && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="whitespace-pre-wrap px-4 pb-3 text-[11px] leading-relaxed text-white/75">
                          {settings.terms_text}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoPopup;
