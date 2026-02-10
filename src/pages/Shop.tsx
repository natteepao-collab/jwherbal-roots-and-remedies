import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { productImages } from "@/assets/products";
import { promotions } from "@/data/promotions";

interface Product {
  id: string;
  name_th: string;
  name_en: string;
  name_zh: string;
  description_th: string;
  description_en: string;
  description_zh: string;
  price: number;
  image_url: string;
  category: string;
  rating: number;
  stock: number;
  is_active: boolean | null;
}

const Shop = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "th" | "en" | "zh";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  // Mock admin state — replace with real auth check later
  const [isAdmin] = useState<boolean>(true);
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["products", isAdmin],
    queryFn: async () => {
      const query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      // RLS only allows is_active=true for non-admin users
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });

  const toggleVisibility = async (id: string) => {
    const product = products?.find((p) => p.id === id);
    if (!product) return;
    await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", id);
    refetch();
  };

  const categories = products
    ? Array.from(new Set(products.filter(p => p.is_active).map((p) => p.category)))
    : [];

  const filteredProducts = products?.filter((product) => {
    const categoryMatch = selectedCategory === "all" || product.category === selectedCategory;
    // Non-admins won't see inactive products (RLS handles this)
    return categoryMatch;
  }) || [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const getProductName = (product: Product) => {
    switch (currentLang) {
      case "en":
        return product.name_en;
      case "zh":
        return product.name_zh;
      default:
        return product.name_th;
    }
  };

  const getProductDescription = (product: Product) => {
    switch (currentLang) {
      case "en":
        return product.description_en;
      case "zh":
        return product.description_zh;
      default:
        return product.description_th;
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8">{t("shop.title")}</h1>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Sidebar - Collapsible on mobile */}
          <aside className="lg:w-56 xl:w-64 flex-shrink-0">
            <Card className="sticky top-20">
              <CardContent className="p-4 md:p-6">
                <h2 className="font-semibold text-sm md:text-base mb-3 md:mb-4">{t("shop.categories")}</h2>
                <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                  <div className="flex items-center space-x-2 mb-2 md:mb-3">
                    <RadioGroupItem value="all" id="all" className="h-4 w-4" />
                    <Label htmlFor="all" className="cursor-pointer text-sm">
                      {t("shop.all")}
                    </Label>
                  </div>
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2 mb-2 md:mb-3">
                      <RadioGroupItem value={category} id={category} className="h-4 w-4" />
                      <Label htmlFor={category} className="cursor-pointer text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("shop.showing")} {sortedProducts.length} {t("shop.products")}
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="text-xs sm:text-sm whitespace-nowrap">
                  {t("shop.sortBy")}
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort" className="w-[140px] sm:w-[180px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">{t("shop.popular")}</SelectItem>
                    <SelectItem value="rating">{t("shop.rating")}</SelectItem>
                    <SelectItem value="price-low">{t("shop.priceLow")}</SelectItem>
                    <SelectItem value="price-high">{t("shop.priceHigh")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square" />
                    <CardContent className="p-3 sm:p-4">
                      <Skeleton className="h-3 w-16 mb-2" />
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-3 w-12 mb-3" />
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {sortedProducts.map((product) => {
                  const name = getProductName(product);
                  // Use product UUID directly as promo key
                  const hasPromo = !!promotions[product.id];
                  return (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: parseInt(product.id.replace(/-/g, "").slice(0, 8), 16),
                        name,
                        price: product.price,
                        image: productImages[product.id] || product.image_url,
                        category: product.category,
                        description: getProductDescription(product),
                        rating: product.rating || 0,
                      }}
                      productUuid={product.id}
                      promoKey={hasPromo ? product.id : undefined}
                      isAdmin={isAdmin}
                      isHidden={!product.is_active}
                      onToggleVisibility={() => toggleVisibility(product.id)}
                    />
                  );
                })}
              </div>
            )}

            <div className="mt-6 md:mt-8 text-center text-xs sm:text-sm text-muted-foreground px-2">
              <p>{t("shop.disclaimer")}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
};

export default Shop;
