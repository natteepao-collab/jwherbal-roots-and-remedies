-- Add user_id column to community_posts to track post owners
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add user_id column to community_replies to track reply owners
ALTER TABLE public.community_replies 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can insert community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Admins can update community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Admins can delete community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Admins can manage replies" ON public.community_replies;

-- Create new policies for community_posts
CREATE POLICY "Authenticated users can create posts" 
ON public.community_posts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.community_posts 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts" 
ON public.community_posts 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create new policies for community_replies
CREATE POLICY "Authenticated users can create replies" 
ON public.community_replies 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" 
ON public.community_replies 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" 
ON public.community_replies 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all replies" 
ON public.community_replies 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to update comments_count
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = COALESCE(comments_count, 0) + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = COALESCE(comments_count, 0) - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-update comments count
DROP TRIGGER IF EXISTS update_post_comments_count ON public.community_replies;
CREATE TRIGGER update_post_comments_count
AFTER INSERT OR DELETE ON public.community_replies
FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();