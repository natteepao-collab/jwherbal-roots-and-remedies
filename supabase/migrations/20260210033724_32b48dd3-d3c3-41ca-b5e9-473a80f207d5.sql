
-- Add is_featured column for admin-recommended articles
ALTER TABLE public.articles ADD COLUMN is_featured boolean NOT NULL DEFAULT false;

-- Create index for featured articles
CREATE INDEX idx_articles_is_featured ON public.articles (is_featured) WHERE is_featured = true;
