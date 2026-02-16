import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Users, Pill, Coffee } from "lucide-react";
import { productImages } from "@/assets/products";
import { usePromotionTiers, getTiersByProduct } from "@/hooks/usePromotionTiers";
import PromotionModal from "@/components/PromotionModal";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language as "th" | "en" | "zh";
  const [promoOpen, setPromoOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string } | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: galleryMedia } = useQuery({
    queryKey: ["product-images", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      // Sort: videos first, then images
      return (data || []).sort((a, b) => {
        const aIsVideo = (a as any).media_type === "video" ? 0 : 1;
        const bIsVideo = (b as any).media_type === "video" ? 0 : 1;
        if (aIsVideo !== bIsVideo) return aIsVideo - bIsVideo;
        return a.sort_order - b.sort_order;
      });
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1 container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="aspect-square rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!product) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-lg text-muted-foreground mb-4">ไม่พบสินค้า</p>
          <Button onClick={() => navigate("/shop")}>กลับหน้าร้าน</Button>
        </div>
      </PageTransition>
    );
  }

  const getText = (th: string, en: string, zh: string) => {
    switch (lang) {
      case "en": return en || th;
      case "zh": return zh || th;
      default: return th;
    }
  };

  const name = getText(product.name_th, product.name_en, product.name_zh);
  const description = getText(product.description_th, product.description_en, product.description_zh);
  const detailContent = getText(product.detail_content_th || "", product.detail_content_en || "", product.detail_content_zh || "");
  const suitableFor = getText(product.suitable_for_th || "", product.suitable_for_en || "", product.suitable_for_zh || "");
  const usage = getText(product.usage_instructions_th || "", product.usage_instructions_en || "", product.usage_instructions_zh || "");
  const mainImage = productImages[product.id] || product.image_url;
  const { data: allTiers } = usePromotionTiers();
  const productTiers = allTiers ? getTiersByProduct(allTiers, product.id) : [];
  const hasTiers = productTiers.length > 0;
  const lowestPrice = hasTiers ? Math.min(...productTiers.map((t) => t.price)) : null;

  // Determine what to show as the main media
  const firstVideo = galleryMedia?.find((m) => (m as any).media_type === "video");
  const currentMedia = selectedMedia || (firstVideo ? { url: firstVideo.image_url, type: "video" } : { url: mainImage, type: "image" });

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 md:py-8">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/shop")}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าร้าน
          </Button>

          {/* Product Hero */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-10">
            {/* Media Section */}
            <div className="space-y-3">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border">
                {currentMedia.type === "video" ? (
                  <video
                    src={currentMedia.url}
                    controls
                    autoPlay
                    muted
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={currentMedia.url}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              {/* Gallery thumbnails */}
              {galleryMedia && galleryMedia.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {/* Main product image thumbnail */}
                  <button
                    onClick={() => setSelectedMedia({ url: mainImage, type: "image" })}
                    className={`h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 flex-shrink-0 bg-secondary transition-all ${
                      currentMedia.url === mainImage ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img src={mainImage} alt={name} className="h-full w-full object-cover" />
                  </button>
                  {galleryMedia.map((media) => (
                    <button
                      key={media.id}
                      onClick={() => setSelectedMedia({ url: media.image_url, type: (media as any).media_type || "image" })}
                      className={`h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 flex-shrink-0 bg-secondary transition-all relative ${
                        currentMedia.url === media.image_url ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      {(media as any).media_type === "video" ? (
                        <div className="h-full w-full flex items-center justify-center bg-black/80">
                          <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-0.5" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={media.image_url}
                          alt={media.title || ""}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="space-y-5">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {name}
                </h1>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold">{product.rating || 0}</span>
                </div>
              </div>

              {/* Price */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                {lowestPrice ? (
                  <div>
                    <span className="text-sm text-muted-foreground">เริ่มต้น</span>
                    <p className="text-3xl font-bold text-primary">
                      ฿{lowestPrice.toLocaleString("th-TH")}.-
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ราคาปกติ ฿{product.price.toLocaleString("th-TH")}
                    </p>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-primary">
                    ฿{product.price.toLocaleString("th-TH")}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {description}
              </p>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full h-12 text-base gap-2"
                onClick={() => hasTiers ? setPromoOpen(true) : null}
              >
                {hasTiers ? "เลือกแพ็กเกจ" : "เพิ่มลงตะกร้า"}
              </Button>
            </div>
          </div>

          {/* Detail Sections */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {detailContent && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Pill className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold">รายละเอียดสินค้า</h2>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {detailContent}
                  </div>
                </CardContent>
              </Card>
            )}
            {suitableFor && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold">เหมาะกับ</h2>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {suitableFor}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {usage && (
            <Card className="mb-10">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Coffee className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">วิธีใช้</h2>
                </div>
                <p className="text-base font-medium text-foreground">
                  {usage}
                </p>
              </CardContent>
            </Card>
          )}
        </main>

        <Footer />

        {hasTiers && (
          <PromotionModal
            open={promoOpen}
            onOpenChange={setPromoOpen}
            productName={name}
            productImage={mainImage}
            productId={parseInt(product.id.replace(/-/g, "").slice(0, 8), 16)}
            tiers={productTiers}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default ProductDetail;
