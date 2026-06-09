import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  /** Subtotal before any promotion discount */
  subtotal: number;
  /** Hardsell promotion discount applied to the bill */
  promoDiscount: number;
  /** Minimum subtotal required to qualify for the promotion */
  promoThreshold: number;
  /** Whether the Hardsell promotion is currently active */
  promoEnabled: boolean;
  /** Final payable total after promotion discount */
  totalPrice: number;
}

const POPUP_ID = "00000000-0000-0000-0000-000000000001";

// Fallback Hardsell promotion config (used until admin settings load)
export const PROMO_THRESHOLD = 2000;
export const PROMO_DISCOUNT = 50;

interface PromoConfig {
  enabled: boolean;
  threshold: number;
  discount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoConfig, setPromoConfig] = useState<PromoConfig>({
    enabled: true,
    threshold: PROMO_THRESHOLD,
    discount: PROMO_DISCOUNT,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("popup_settings")
        .select("promo_enabled, promo_threshold, promo_discount")
        .eq("id", POPUP_ID)
        .maybeSingle();
      if (!active || !data) return;
      setPromoConfig({
        enabled: (data as any).promo_enabled ?? true,
        threshold: Number((data as any).promo_threshold ?? PROMO_THRESHOLD),
        discount: Number((data as any).promo_discount ?? PROMO_DISCOUNT),
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        toast.success("เพิ่มจำนวนสินค้าในตะกร้าแล้ว");
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success("เพิ่มสินค้าในตะกร้าแล้ว");
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast.success("ลบสินค้าออกจากตะกร้าแล้ว");
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const promoDiscount =
    promoConfig.enabled && promoConfig.discount > 0 && subtotal >= promoConfig.threshold
      ? promoConfig.discount
      : 0;
  const totalPrice = Math.max(0, subtotal - promoDiscount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        promoDiscount,
        promoThreshold: promoConfig.threshold,
        promoEnabled: promoConfig.enabled,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
