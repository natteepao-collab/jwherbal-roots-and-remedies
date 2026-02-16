import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { PromotionTier } from "@/hooks/usePromotionTiers";
import { cn } from "@/lib/utils";

interface PromotionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productImage: string;
  productId: number;
  tiers: PromotionTier[];
}

const PromotionModal = ({
  open,
  onOpenChange,
  productName,
  productImage,
  productId,
  tiers,
}: PromotionModalProps) => {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const bestSellerTier = tiers.find((t) => t.is_best_seller);
  const [selectedTier, setSelectedTier] = useState<string>(
    bestSellerTier?.id || tiers[0]?.id || ""
  );

  const selected = tiers.find((t) => t.id === selectedTier);

  const handleAddToCart = () => {
    if (!selected) return;
    addItem({
      id: productId,
      name: `${productName} x${selected.quantity}`,
      price: selected.price,
      image: productImage,
    });
    toast.success(t("product.added"));
    onOpenChange(false);
  };

  const formatPrice = (n: number) =>
    n.toLocaleString("th-TH");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
          <div className="flex items-center gap-3">
            <img
              src={productImage}
              alt={productName}
              className="h-14 w-14 rounded-lg object-cover border"
            />
            <DialogTitle className="text-base sm:text-lg leading-tight">
              {productName}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Tier Selection */}
        <div className="px-4 sm:px-6 pb-2 space-y-2.5">
          <p className="text-sm font-medium text-muted-foreground">เลือกแพ็กเกจ</p>
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            const savings = tier.normal_price - tier.price;
            const discountPct = Math.round((savings / tier.normal_price) * 100);

            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={cn(
                  "w-full text-left rounded-xl border-2 p-3 sm:p-4 transition-all relative",
                  isSelected
                    ? tier.is_best_seller
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-primary bg-primary/5"
                    : tier.is_best_seller
                      ? "border-primary/40 hover:border-primary/60"
                      : "border-border hover:border-primary/30"
                )}
              >
                {/* Best Seller badge */}
                {tier.is_best_seller && (
                  <Badge className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Best Seller
                  </Badge>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* Radio indicator */}
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>

                    <div>
                      <p className="font-semibold text-sm sm:text-base">
                        {tier.quantity} {tier.unit}
                      </p>
                      <p className="text-xs text-muted-foreground line-through">
                        ฿{formatPrice(tier.normal_price)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-base sm:text-lg text-primary">
                      ฿{formatPrice(tier.price)}
                    </p>
                    {savings > 0 && (
                      <p className="text-[10px] sm:text-xs text-destructive font-medium">
                        ประหยัด {formatPrice(savings)}.– ({discountPct}%)
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:p-6 pt-3 border-t bg-muted/30">
          <Button
            size="lg"
            className="w-full gap-2 text-sm sm:text-base h-12"
            onClick={handleAddToCart}
            disabled={!selected}
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            เพิ่มลงตะกร้า – ฿{selected ? formatPrice(selected.price) : "0"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionModal;
