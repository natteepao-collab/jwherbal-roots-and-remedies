import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Upload, Trash2, HelpCircle, MessageCircle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useTranslation } from "react-i18next";

interface FAQImage {
  id: string;
  image_url: string;
  title: string | null;
  sort_order: number;
}

interface FAQImageCarouselProps {
  isAdmin?: boolean;
}

const FAQImageCarousel = ({ isAdmin = false }: FAQImageCarouselProps) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as "th" | "en" | "zh";
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const autoplayPlugin = useRef(
    Autoplay({ 
      delay: 4500, 
      stopOnInteraction: false,
      stopOnMouseEnter: true
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [autoplayPlugin.current]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["faq-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_images")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as FAQImage[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const uploadedImages: string[] = [];
      
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `faq-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `faq-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("faq-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("faq-images")
          .getPublicUrl(filePath);

        uploadedImages.push(publicUrl);
      }

      // Insert all images to database
      const maxSortOrder = images.length > 0 
        ? Math.max(...images.map(img => img.sort_order)) 
        : -1;

      for (let i = 0; i < uploadedImages.length; i++) {
        const { error } = await supabase.from("faq_images").insert({
          image_url: uploadedImages[i],
          sort_order: maxSortOrder + 1 + i,
        });
        if (error) throw error;
      }

      return uploadedImages;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-images"] });
      toast.success("อัพโหลดรูปภาพสำเร็จ");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-images"] });
      toast.success("ลบรูปภาพสำเร็จ");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect, images]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadMutation.mutate(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadMutation.mutate(files);
    }
  };

  if (images.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Section Header */}
      {!isAdmin && images.length > 0 && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            {/* Q&A Icon Badge */}
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-primary-foreground">Q</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-primary/80 flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-primary-foreground">A</span>
              </div>
            </div>
            
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {currentLanguage === "th" ? "ถาม-ตอบ" : currentLanguage === "en" ? "Q&A" : "问答"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentLanguage === "th" ? "ผลิตภัณฑ์ V Flow" : currentLanguage === "en" ? "V Flow Products" : "V Flow产品"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Upload Area */}
      {isAdmin && (
        <Card
          className={cn(
            "border-2 border-dashed p-8 mb-6 text-center transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/10 shadow-lg"
              : "border-border hover:border-primary/50 hover:bg-muted/30 hover:shadow-md"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">
            ลากและวางรูปภาพถามตอบ หรือคลิกเพื่อเลือก
          </p>
          <p className="text-sm text-muted-foreground mb-1">
            รองรับการอัพโหลดหลายไฟล์พร้อมกัน
          </p>
          <p className="text-xs text-muted-foreground">
            (JPG, PNG, WebP)
          </p>
          {uploadMutation.isPending && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-primary font-medium">กำลังอัพโหลด...</span>
            </div>
          )}
        </Card>
      )}

      {/* Image Carousel */}
      {images.length > 0 && (
        <div className="relative">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 rounded-3xl -z-10" />
          
          {/* Main Carousel Container */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/95 rounded-2xl md:rounded-3xl">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex-[0_0_100%] min-w-0 relative group"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square md:aspect-[4/3] lg:aspect-[16/10] overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/30">
                      <img
                        src={image.image_url}
                        alt={image.title || `รูปถามตอบ ${index + 1}`}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                    </div>
                    
                    {/* Admin Delete Button */}
                    {isAdmin && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(image.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Image Counter Badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge 
                        variant="secondary" 
                        className="bg-background/90 backdrop-blur-sm text-foreground shadow-md px-3 py-1.5 text-sm font-medium"
                      >
                        <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                        {index + 1} / {images.length}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            {images.length > 1 && (
              <>
                {/* Previous Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border border-border/50 h-10 w-10 md:h-12 md:w-12 transition-all hover:scale-105"
                  onClick={scrollPrev}
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
                
                {/* Next Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border border-border/50 h-10 w-10 md:h-12 md:w-12 transition-all hover:scale-105"
                  onClick={scrollNext}
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </>
            )}
          </Card>

          {/* Progress Indicators */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 md:mt-6">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50",
                    selectedIndex === index
                      ? "w-10 bg-primary shadow-md"
                      : "w-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                  )}
                  onClick={() => scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail Strip (for many images) */}
          {images.length > 3 && (
            <div className="mt-4 flex justify-center gap-2 px-4 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                    selectedIndex === index
                      ? "border-primary shadow-md scale-105"
                      : "border-transparent opacity-60 hover:opacity-100 hover:border-border"
                  )}
                >
                  <img
                    src={image.image_url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State for Admin */}
      {images.length === 0 && isAdmin && (
        <Card className="border-dashed border-2 bg-muted/20">
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">ยังไม่มีรูปภาพถามตอบ</p>
            <p className="text-sm text-muted-foreground mt-1">กรุณาอัพโหลดรูปภาพด้านบน</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FAQImageCarousel;