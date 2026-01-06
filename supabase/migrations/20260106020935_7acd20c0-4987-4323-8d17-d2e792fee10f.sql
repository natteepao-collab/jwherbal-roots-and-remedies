-- Add likes column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN likes_count INTEGER DEFAULT 0;

-- Create review_likes table for tracking who liked what
CREATE TABLE public.review_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view review likes" 
ON public.review_likes 
FOR SELECT 
USING (true);

-- Authenticated users can like
CREATE POLICY "Authenticated users can like reviews" 
ON public.review_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can unlike their own likes
CREATE POLICY "Users can remove their own likes" 
ON public.review_likes 
FOR DELETE 
USING (auth.uid() = user_id);