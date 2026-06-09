ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_article_views(article_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.articles
  SET views = COALESCE(views, 0) + 1
  WHERE slug = article_slug;
$$;

GRANT EXECUTE ON FUNCTION public.increment_article_views(text) TO anon, authenticated;