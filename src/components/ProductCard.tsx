import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useTranslation();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success(t("product.added"));
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-card-hover">
      <div className="aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-2 text-xs text-muted-foreground">{product.category}</div>
        <h3 className="mb-2 font-semibold text-foreground line-clamp-2">{product.name}</h3>
        <div className="mb-3 flex items-center">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="ml-1 text-sm font-medium">{product.rating}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">฿{product.price}</span>
          <Button size="sm" onClick={handleAddToCart} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">{t("product.addToCart")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
