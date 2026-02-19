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
        <div className="relative w-full">
          {/* Main Slide */}
          <div 
            className="relative rounded-2xl overflow-hidden group min-h-[500px] md:min-h-[650px] lg:min-h-[70vh] flex items-center justify-center"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Main Image: absolutely stack slides with backgrounds */}
            {galleryItems.map((item, index) => {
              const focalX = (item as any).focal_x ?? 0.5;
              const focalY = (item as any).focal_y ?? 0.5;
              const isActive = index === currentIndex;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "absolute inset-0 rounded-2xl transform-gpu transition-all duration-1000 ease-in-out",
                    isActive ? "opacity-100 z-20 scale-105" : "opacity-0 z-0 pointer-events-none scale-95"
                  )}
                  style={{
                    backgroundImage: `url(${getImageUrl(item.image_url)})`,
                    backgroundPosition: `${focalX * 100}% ${focalY * 100}%`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  {/* Premium gradient overlay for sophisticated text legibility - lightened */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/25 via-black/10 via-20% to-transparent pointer-events-none z-10" />
                  {/* Subtle vignette effect */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none z-5" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.1)' }} />

                  {/* Accessible image for screen readers */}
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={getLocalizedText(item, "title")}
                    className="sr-only"
                  />
                </div>
              );
            })}

            {/* Content Overlay (text) - Very bottom only, semi-transparent with better text contrast */}
            <div className="absolute bottom-0 left-0 right-0 px-6 md:px-8 py-2 md:py-3 z-40 bg-gradient-to-r from-black/50 to-black/40 md:from-black/60 md:to-black/50 backdrop-blur-md border-t border-white/10\">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="h-3 w-3 text-primary drop-shadow-2xl" />
                <span className="text-2xs font-semibold text-primary tracking-wide uppercase drop-shadow-2xl">
                  {currentLanguage === "th" ? "กิจกรรม & รางวัล" : currentLanguage === "en" ? "Activities & Awards" : "活动和奖项"}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold mb-0 drop-shadow-2xl leading-none text-white">
                {getLocalizedText(currentItem, "title")}
              </h3>
              <p className="text-white drop-shadow-2xl text-2xs max-w-4xl leading-tight font-light hidden md:block">
                {getLocalizedText(currentItem, "description")}
              </p>
            </div>

            {/* Navigation Arrows - Premium Styling */}
            {galleryItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/15 backdrop-blur-md text-white hover:bg-white/30 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300 z-40 shadow-lg hover:shadow-2xl border border-white/20"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-7 w-7" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/15 backdrop-blur-md text-white hover:bg-white/30 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300 z-40 shadow-lg hover:shadow-2xl border border-white/20"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-7 w-7" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Navigation - Premium Styling */}
          {galleryItems.length > 1 && (
            <div className="flex justify-center gap-4 mt-8 px-4">
              {galleryItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "relative h-20 w-28 rounded-xl overflow-hidden transition-all duration-300 border backdrop-blur-sm",
                    index === currentIndex 
                      ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-lg border-primary/50" 
                      : "opacity-60 hover:opacity-100 hover:scale-110 border-white/20 shadow-md"
                  )}
                >
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={getLocalizedText(item, "title")}
                    className="w-full h-full object-contain"
                    style={{ objectPosition: `${((item as any).focal_x ?? 0.5) * 100}% ${((item as any).focal_y ?? 0.5) * 100}%` }}
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300" />
                </button>
              ))}
            </div>
          )}

          {/* Progress Dots (for mobile) - Premium Styling */}
          {galleryItems.length > 1 && (
            <div className="flex justify-center gap-3 mt-6 md:hidden">
              {galleryItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "h-3 rounded-full transition-all duration-300 backdrop-blur-sm",
                    index === currentIndex 
                      ? "w-8 bg-primary shadow-lg" 
                      : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:scale-110"
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
