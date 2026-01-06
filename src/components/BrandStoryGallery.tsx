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
    <section className="py-20 bg-secondary overflow-hidden">
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
        <div className="relative max-w-5xl mx-auto">
          {/* Main Slide */}
          <div 
            className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl group"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Background blur effect */}
            <div 
              className="absolute inset-0 scale-110 blur-3xl opacity-30"
              style={{ backgroundImage: `url(${getImageUrl(currentItem.image_url)})`, backgroundSize: 'cover' }}
            />
            
            {/* Main Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-out",
                    index === currentIndex 
                      ? "opacity-100 scale-100" 
                      : index === (currentIndex - 1 + galleryItems.length) % galleryItems.length
                      ? "opacity-0 -translate-x-full scale-95"
                      : index === (currentIndex + 1) % galleryItems.length
                      ? "opacity-0 translate-x-full scale-95"
                      : "opacity-0 scale-90"
                  )}
                >
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={getLocalizedText(item, "title")}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {currentLanguage === "th" ? "กิจกรรม & รางวัล" : currentLanguage === "en" ? "Activities & Awards" : "活动和奖项"}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2 transition-all duration-500">
                {getLocalizedText(currentItem, "title")}
              </h3>
              <p className="text-white/80 text-base md:text-lg max-w-2xl transition-all duration-500">
                {getLocalizedText(currentItem, "description")}
              </p>
            </div>

            {/* Navigation Arrows */}
            {galleryItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {galleryItems.length > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              {galleryItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "relative h-16 w-24 rounded-lg overflow-hidden transition-all duration-300",
                    index === currentIndex 
                      ? "ring-2 ring-primary ring-offset-2 scale-110" 
                      : "opacity-60 hover:opacity-100 hover:scale-105"
                  )}
                >
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={getLocalizedText(item, "title")}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Progress Dots (for mobile) */}
          {galleryItems.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 md:hidden">
              {galleryItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentIndex 
                      ? "w-8 bg-primary" 
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
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
