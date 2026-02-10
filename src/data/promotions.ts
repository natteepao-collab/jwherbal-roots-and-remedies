export interface PromotionTier {
  id: string;
  quantity: number;
  unit: string;
  price: number;
  normalPrice: number;
  isBestSeller?: boolean;
}

export interface ProductPromotion {
  productId: string;
  tiers: PromotionTier[];
}

// Keyed by actual Supabase product UUID
export const promotions: Record<string, ProductPromotion> = {
  "a1f1c1d1-1111-4111-8111-111111111111": {
    productId: "a1f1c1d1-1111-4111-8111-111111111111",
    tiers: [
      { id: "cap-1", quantity: 1, unit: "กระปุก", price: 1125, normalPrice: 1800 },
      { id: "cap-2", quantity: 2, unit: "กระปุก", price: 2120, normalPrice: 3600, isBestSeller: true },
      { id: "cap-3", quantity: 3, unit: "กระปุก", price: 3000, normalPrice: 5400 },
      { id: "cap-6", quantity: 6, unit: "กระปุก", price: 5700, normalPrice: 10800 },
    ],
  },
  "b2f2c2d2-2222-4222-8222-222222222222": {
    productId: "b2f2c2d2-2222-4222-8222-222222222222",
    tiers: [
      { id: "drink-1", quantity: 1, unit: "กล่อง", price: 1250, normalPrice: 2400 },
      { id: "drink-2", quantity: 2, unit: "กล่อง", price: 2250, normalPrice: 4800, isBestSeller: true },
      { id: "drink-3", quantity: 3, unit: "กล่อง", price: 3240, normalPrice: 7200 },
      { id: "drink-5", quantity: 5, unit: "กล่อง", price: 5250, normalPrice: 12000 },
    ],
  },
};

export const getLowestPrice = (productId: string): number | null => {
  const promo = promotions[productId];
  if (!promo) return null;
  return Math.min(...promo.tiers.map((t) => t.price));
};
