
-- Add image URL columns for Story and Values sections
ALTER TABLE public.about_settings 
ADD COLUMN IF NOT EXISTS story_image_url text,
ADD COLUMN IF NOT EXISTS values_image_url text;
