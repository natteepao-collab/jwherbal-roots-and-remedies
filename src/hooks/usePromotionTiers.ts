import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PromotionTier {
  id: string;
  product_id: string;
  quantity: number;
  unit: string;
  price: number;
  normal_price: number;
  is_best_seller: boolean;
  sort_order: number;
  is_active: boolean;
}

export const usePromotionTiers = () => {
  return useQuery({
    queryKey: ["promotion-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotion_tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as PromotionTier[];
    },
    staleTime: 60_000,
  });
};

export const getTiersByProduct = (tiers: PromotionTier[], productId: string) =>
  tiers.filter((t) => t.product_id === productId);

export const getLowestTierPrice = (tiers: PromotionTier[], productId: string) => {
  const productTiers = getTiersByProduct(tiers, productId);
  if (productTiers.length === 0) return null;
  return Math.min(...productTiers.map((t) => t.price));
};
