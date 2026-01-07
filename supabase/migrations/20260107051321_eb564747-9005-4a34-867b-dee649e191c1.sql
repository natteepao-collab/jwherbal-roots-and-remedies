-- Create table for user submitted questions
CREATE TABLE public.user_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  replied_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit questions
CREATE POLICY "Anyone can submit questions"
ON public.user_questions
FOR INSERT
WITH CHECK (true);

-- Users can view their own questions
CREATE POLICY "Users can view their own questions"
ON public.user_questions
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can manage all questions
CREATE POLICY "Admins can manage all questions"
ON public.user_questions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_user_questions_updated_at
BEFORE UPDATE ON public.user_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();