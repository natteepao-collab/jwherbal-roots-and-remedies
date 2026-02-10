export interface PromotionTier {
  id: string;
  quantity: number;
  unit: string;
  price: number;
  normalPrice: number;
  isBestSeller?: boolean;
}

export interface ProductPromotion {
  productId: string; // matches supabase product id
  tiers: PromotionTier[];
}

export const promotions: Record<string, ProductPromotion> = {
  // V Flow 60capsule — use a known product id or a placeholder
  "vflow-capsule": {
    productId: "vflow-capsule",
    tiers: [
      { id: "cap-1", quantity: 1, unit: "กระปุก", price: 1125, normalPrice: 1800 },
      { id: "cap-2", quantity: 2, unit: "กระปุก", price: 2120, normalPrice: 3600, isBestSeller: true },
      { id: "cap-3", quantity: 3, unit: "กระปุก", price: 3000, normalPrice: 5400 },
      { id: "cap-6", quantity: 6, unit: "กระปุก", price: 5700, normalPrice: 10800 },
    ],
  },
  // V Flow Herbal Drink
  "vflow-drink": {
    productId: "vflow-drink",
    tiers: [
      { id: "drink-1", quantity: 1, unit: "กล่อง", price: 1250, normalPrice: 2400 },
      { id: "drink-2", quantity: 2, unit: "กล่อง", price: 2250, normalPrice: 4800, isBestSeller: true },
      { id: "drink-3", quantity: 3, unit: "กล่อง", price: 3240, normalPrice: 7200 },
      { id: "drink-5", quantity: 5, unit: "กล่อง", price: 5250, normalPrice: 12000 },
    ],
  },
};

// Map supabase product IDs to promotion keys
export const productPromotionMap: Record<string, string> = {
  // Map your actual supabase product UUIDs here
  // For now we map by name matching in the component
};

export const getLowestPrice = (promoKey: string): number | null => {
  const promo = promotions[promoKey];
  if (!promo) return null;
  return Math.min(...promo.tiers.map((t) => t.price));
};
