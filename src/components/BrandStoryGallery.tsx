import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { 
  awardCeremony, 
  farmTour, 
  qualityControl,
  expoBooth,
  csrEvent,
  rdLab,
  healthSeminar,
  isoCertification
} from "@/assets/gallery";

interface GalleryItem {
  id: string;
  image_url: string;
  title_th: string;
  title_en: string;
  title_zh: string;
  description_th: string;
  description_en: string;
  description_zh: string;
  sort_order: number;
}

interface BrandStory {
  id: string;
  title_th: string;
  title_en: string;
  title_zh: string;
  description_th: string;
  description_en: string;
  description_zh: string;
  image_url: string | null;
}

// Fallback images map for sample data
const fallbackImages: Record<string, string> = {
  "award-ceremony": awardCeremony,
  "farm-tour": farmTour,
  "quality-control": qualityControl,
  "expo-booth": expoBooth,
  "csr-event": csrEvent,
  "rd-lab": rdLab,
  "health-seminar": healthSeminar,
  "iso-certification": isoCertification,
};

const getImageUrl = (url: string): string => {
  // Check if URL contains known fallback patterns
  for (const [key, fallback] of Object.entries(fallbackImages)) {
    if (url.includes(key)) {
      return fallback;
    }
  }
  return url;
};

export const BrandStoryGallery = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as "th" | "en" | "zh";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { data: galleryItems = [] } = useQuery({
    queryKey: ["brand-story-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_story_gallery")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  const { data: brandStory } = useQuery({
    queryKey: ["brand-story-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_story")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as BrandStory | null;
    },
  });

  const getLocalizedText = (item: GalleryItem | BrandStory, field: "title" | "description") => {
    const key = `${field}_${currentLanguage}` as keyof typeof item;
    return (item[key] as string) || "";
  };

  const getBrandStoryTitle = () => {
    if (!brandStory) {
      return currentLanguage === "th" 
        ? "จากแปลงปลูกอินทรีย์ สู่มือคุณ" 
        : currentLanguage === "en" 
        ? "From Organic Farms to Your Hands" 
        : "从有机农场到您手中";
    }
    return getLocalizedText(brandStory, "title");
  };

  const getBrandStoryDescription = () => {
    if (!brandStory) {
      return currentLanguage === "th"
        ? "เราคัดสรรเฉพาะสมุนไพรเกรดพรีเมียมจากแหล่งปลูกที่ดีที่สุดในประเทศไทย"
        : currentLanguage === "en"
        ? "We carefully select only premium-grade herbs from the finest farms in Thailand"
        : "我们精心挑选来自泰国最好农场的优质草药";
    }
    return getLocalizedText(brandStory, "description");
  };

  const nextSlide = useCallback(() => {
    if (galleryItems.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  }, [galleryItems.length]);

  const prevSlide = useCallback(() => {
    if (galleryItems.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  }, [galleryItems.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying || galleryItems.length <= 1) return;
    
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, galleryItems.length]);

  // If no gallery items, show fallback with brand story image
  if (galleryItems.length === 0) {
    return (
      <section className="py-20 bg-secondary overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={brandStory?.image_url || "/placeholder.svg"}
                  alt="Brand story"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            </div>
            <div className="space-y-6">
              <div className="inline-block px-4 py-1 bg-primary/10 rounded-full">
                <span className="text-primary font-medium text-sm">
                  {currentLanguage === "th" ? "เรื่องราวของเรา" : currentLanguage === "en" ? "Our Story" : "我们的故事"}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {getBrandStoryTitle()}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {getBrandStoryDescription()}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentItem = galleryItems[currentIndex];

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium text-sm">
              {currentLanguage === "th" ? "เรื่องราวของเรา" : currentLanguage === "en" ? "Our Story" : "我们的故事"}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {getBrandStoryTitle()}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {getBrandStoryDescription()}
          </p>
        </div>

        {/* Gallery Carousel */}
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Unified card: image viewport on top, caption below — no overlap */}
          <div className="rounded-3xl overflow-hidden bg-white border border-border/50 shadow-[0_20px_50px_-20px_hsl(var(--foreground)/0.15)]">
            {/* Image viewport */}
            <div
              className="relative group min-h-[320px] md:min-h-[480px] lg:min-h-[560px]"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {galleryItems.map((item, index) => {
                const focalX = (item as any).focal_x ?? 0.5;
                const focalY = (item as any).focal_y ?? 0.5;
                const isActive = index === currentIndex;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "absolute inset-0 transform-gpu transition-all duration-1000 ease-in-out",
                      isActive ? "opacity-100 z-20 scale-100" : "opacity-0 z-0 pointer-events-none scale-95"
                    )}
                    style={{
                      backgroundImage: `url(${getImageUrl(item.image_url)})`,
                      backgroundPosition: `${focalX * 100}% ${focalY * 100}%`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundColor: "#fafaf9",
                    }}
                  >
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={getLocalizedText(item, "title")}
                      className="sr-only"
                    />
                  </div>
                );
              })}

              {/* Ghost navigation arrows */}
              {galleryItems.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/80 hover:bg-white border border-border/60 text-foreground opacity-70 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-sm shadow-md transition-all duration-300 z-40"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/80 hover:bg-white border border-border/60 text-foreground opacity-70 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-sm shadow-md transition-all duration-300 z-40"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Caption panel — sits below the image, never covers it */}
            <div className="border-t border-border/40 bg-background/60 backdrop-blur-sm px-5 py-5 md:px-8 md:py-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-primary" />
                <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-primary inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  {currentLanguage === "th" ? "กิจกรรม & รางวัล" : currentLanguage === "en" ? "Activities & Awards" : "活动和奖项"}
                </span>
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground leading-snug mb-1.5">
                {getLocalizedText(currentItem, "title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light line-clamp-2 md:line-clamp-none">
                {getLocalizedText(currentItem, "description")}
              </p>
            </div>
          </div>


          {/* Minimal thumbnail strip */}
          {galleryItems.length > 1 && (
            <div className="flex justify-center items-center gap-3 md:gap-4 mt-8 px-4 flex-wrap">
              {galleryItems.map((item, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "rounded-xl overflow-hidden transition-all duration-300",
                      isActive
                        ? "ring-2 ring-primary ring-offset-4 ring-offset-background scale-105"
                        : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0 border border-border/40"
                    )}
                  >
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={getLocalizedText(item, "title")}
                      className="w-20 h-14 md:w-24 md:h-16 object-cover"
                      style={{ objectPosition: `${((item as any).focal_x ?? 0.5) * 100}% ${((item as any).focal_y ?? 0.5) * 100}%` }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Mobile progress dots */}
          {galleryItems.length > 1 && (
            <div className="flex justify-center gap-2 mt-5 md:hidden">
              {galleryItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BrandStoryGallery;
