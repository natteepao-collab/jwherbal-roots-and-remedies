import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Upload, X, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface ReviewImage {
  id: string;
  image_url: string;
  title: string | null;
  sort_order: number;
}

interface ReviewImageCarouselProps {
  isAdmin?: boolean;
}

const ReviewImageCarousel = ({ isAdmin = false }: ReviewImageCarouselProps) => {
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
    queryKey: ["review-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_images")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ReviewImage[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const uploadedImages: string[] = [];
      
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `review-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `review-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("article-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("article-images")
          .getPublicUrl(filePath);

        uploadedImages.push(publicUrl);
      }

      // Insert all images to database
      const maxSortOrder = images.length > 0 
        ? Math.max(...images.map(img => img.sort_order)) 
        : -1;

      for (let i = 0; i < uploadedImages.length; i++) {
        const { error } = await supabase.from("review_images").insert({
          image_url: uploadedImages[i],
          sort_order: maxSortOrder + 1 + i,
        });
        if (error) throw error;
      }

      return uploadedImages;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-images"] });
      toast.success("อัพโหลดรูปภาพสำเร็จ");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("review_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-images"] });
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
      {/* Admin Upload Area */}
      {isAdmin && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
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
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground mb-2">
            ลากและวางรูปภาพรีวิว หรือคลิกเพื่อเลือก
          </p>
          <p className="text-sm text-muted-foreground">
            รองรับการอัพโหลดหลายไฟล์พร้อมกัน (JPG, PNG, WebP)
          </p>
          {uploadMutation.isPending && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-primary">กำลังอัพโหลด...</span>
            </div>
          )}
        </div>
      )}

      {/* Image Carousel */}
      {images.length > 0 && (
        <div className="relative">
          {/* Main Carousel */}
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="flex-[0_0_100%] min-w-0 relative group"
                >
                  <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-muted">
                    <img
                      src={image.image_url}
                      alt={image.title || `รีวิวลูกค้า ${index + 1}`}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Admin Delete Button */}
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteMutation.mutate(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                    {index + 1} / {images.length}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
                onClick={scrollNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Dot Indicators */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    selectedIndex === index
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  onClick={() => scrollTo(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State for Admin */}
      {images.length === 0 && isAdmin && (
        <div className="text-center py-8 text-muted-foreground">
          <p>ยังไม่มีรูปภาพรีวิว กรุณาอัพโหลดรูปภาพ</p>
        </div>
      )}
    </div>
  );
};

export default ReviewImageCarousel;
