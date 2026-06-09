import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import promoImage from "@/assets/promo-popup.png.asset.json";

const PromoPopup = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Show only on public pages, not in admin dashboard
    if (location.pathname.startsWith("/admin")) return;

    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => setOpen(false);

  const handleShopNow = () => {
    setOpen(false);
    navigate("/shop");
  };

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
              className="block w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-primary/20"
            >
              <img
                src={promoImage.url}
                alt="โปรโมชั่นพิเศษ V FLOW ลดแรงมาก ส่วนลดเพิ่ม 50 บาท"
                className="w-full h-auto"
              />
            </button>

            <motion.button
              onClick={handleShopNow}
              className="mt-4 mx-auto block rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ช้อปเลย รับส่วนลด →
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoPopup;
