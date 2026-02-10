import { useState } from "react";
import { Star, ShoppingCart, Eye, EyeOff, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { promotions, type PromotionTier } from "@/data/promotions";
import PromotionModal from "@/components/PromotionModal";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  promoKey?: string; // key into promotions map
  isAdmin?: boolean;
  isHidden?: boolean;
  onToggleVisibility?: () => void;
}

const ProductCard = ({
  product,
  promoKey,
  isAdmin = false,
  isHidden = false,
  onToggleVisibility,
}: ProductCardProps) => {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [modalOpen, setModalOpen] = useState(false);

  const promo = promoKey ? promotions[promoKey] : undefined;
  const lowestPrice = promo
    ? Math.min(...promo.tiers.map((t) => t.price))
    : null;

  const handleClick = () => {
    if (promo) {
      setModalOpen(true);
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      toast.success(t("product.added"));
    }
  };

  return (
    <>
      <Card
        className={cn(
          "group overflow-hidden transition-all hover:shadow-card-hover",
          isHidden && "opacity-50"
        )}
      >
        <div className="aspect-square overflow-hidden bg-secondary relative">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {/* Admin visibility toggle */}
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility?.();
              }}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background transition-colors"
            >
              {isHidden ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-foreground" />
              )}
            </button>
          )}
          {/* Hidden badge */}
          {isHidden && isAdmin && (
            <Badge variant="secondary" className="absolute top-2 left-2 text-[10px]">
              ซ่อนอยู่
            </Badge>
          )}
        </div>
        <CardContent className="p-3 sm:p-4">
          <div className="mb-1 sm:mb-2 text-[10px] sm:text-xs text-muted-foreground">
            {product.category}
          </div>
          <h3 className="mb-1.5 sm:mb-2 font-semibold text-xs sm:text-sm md:text-base text-foreground line-clamp-2">
            {product.name}
          </h3>
          <div className="mb-2 sm:mb-3 flex items-center">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-primary text-primary" />
            <span className="ml-1 text-xs sm:text-sm font-medium">{product.rating}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            {lowestPrice ? (
              <div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">เริ่มต้น</span>
                <span className="block text-sm sm:text-lg md:text-xl font-bold text-primary">
                  ฿{lowestPrice.toLocaleString("th-TH")}.-
                </span>
              </div>
            ) : (
              <span className="text-sm sm:text-lg md:text-xl font-bold text-primary">
                ฿{product.price}
              </span>
            )}
            <Button
              size="sm"
              onClick={handleClick}
              className="gap-1 sm:gap-2 h-8 px-2 sm:px-3 text-xs"
            >
              {promo ? (
                <>
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden md:inline">เลือกแพ็กเกจ</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden md:inline">{t("product.addToCart")}</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Modal */}
      {promo && (
        <PromotionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          productName={product.name}
          productImage={product.image}
          productId={product.id}
          tiers={promo.tiers}
        />
      )}
    </>
  );
};

export default ProductCard;
