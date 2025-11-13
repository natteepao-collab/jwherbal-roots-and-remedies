import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
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

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  const filteredProducts = products.filter(
    (product) => selectedCategory === "all" || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">สินค้าทั้งหมด</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">หมวดหมู่</h2>
                <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">
                      ทั้งหมด
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
                แสดง {sortedProducts.length} สินค้า
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="text-sm">
                  เรียงตาม:
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">ยอดนิยม</SelectItem>
                    <SelectItem value="rating">คะแนนสูงสุด</SelectItem>
                    <SelectItem value="price-low">ราคา: ต่ำ - สูง</SelectItem>
                    <SelectItem value="price-high">ราคา: สูง - ต่ำ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>* ภาพสินค้าใช้เพื่อการจำลองเท่านั้น ผลิตภัณฑ์จริงกำลังอยู่ในขั้นตอนการพัฒนา</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
