-- Add admin reply columns to reviews table
ALTER TABLE public.reviews 
ADD COLUMN admin_reply TEXT,
ADD COLUMN admin_reply_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN admin_reply_by TEXT;