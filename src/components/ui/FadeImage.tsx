import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FadeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Wrapper className — should set sizing/aspect-ratio to prevent layout shift. */
  wrapperClassName?: string;
  /** Skeleton className override. */
  skeletonClassName?: string;
}

/**
 * Image with skeleton + smooth fade-in after load.
 * Reserves space via the wrapper to avoid CLS on mobile.
 * Handles browser-cached images (onLoad doesn't always fire) via the `complete` check.
 */
export function FadeImage({
  wrapperClassName,
  skeletonClassName,
  className,
  onLoad,
  ...props
}: FadeImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [props.src]);

  return (
    <div className={cn("relative overflow-hidden bg-muted", wrapperClassName)}>
      {!loaded && (
        <div
          aria-hidden="true"
          className={cn("absolute inset-0 bg-muted animate-pulse", skeletonClassName)}
        />
      )}
      <img
        ref={ref}
        {...props}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={cn(
          "h-full w-full transition-opacity duration-500 ease-out will-change-[opacity]",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
}

export default FadeImage;
