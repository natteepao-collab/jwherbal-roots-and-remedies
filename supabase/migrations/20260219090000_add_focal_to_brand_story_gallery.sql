-- Add focal point columns to brand_story_gallery for image repositioning
ALTER TABLE IF EXISTS public.brand_story_gallery
ADD COLUMN IF NOT EXISTS focal_x double precision DEFAULT 0.5 NOT NULL,
ADD COLUMN IF NOT EXISTS focal_y double precision DEFAULT 0.5 NOT NULL;

-- Optional: add index for quick queries
CREATE INDEX IF NOT EXISTS idx_brand_story_gallery_focal ON public.brand_story_gallery (focal_x, focal_y);
