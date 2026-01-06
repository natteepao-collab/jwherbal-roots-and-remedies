import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
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
}

const Shop = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "th" | "en" | "zh";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const categories = products
    ? Array.from(new Set(products.map((p) => p.category)))
    : [];

  const filteredProducts = products?.filter(
    (product) => selectedCategory === "all" || product.category === selectedCategory
  ) || [];

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{t("shop.title")}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">{t("shop.categories")}</h2>
                <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">
                      {t("shop.all")}
                    </Label>
                  </div>
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value={category} id={category} />
                      <Label htmlFor={category} className="cursor-pointer">
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
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {t("shop.showing")} {sortedProducts.length} {t("shop.products")}
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="text-sm">
                  {t("shop.sortBy")}
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort" className="w-[180px]">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-16 mb-3" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: parseInt(product.id.replace(/-/g, "").slice(0, 8), 16),
                      name: getProductName(product),
                      price: product.price,
                      image: product.image_url,
                      category: product.category,
                      description: getProductDescription(product),
                      rating: product.rating || 0,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>{t("shop.disclaimer")}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
