-- Public buckets serve objects via the public CDN endpoint without RLS.
-- Dropping these SELECT policies removes the ability to list/enumerate
-- objects via the storage API while leaving public URL access intact.
DROP POLICY IF EXISTS "Anyone can view article images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view faq images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view site assets" ON storage.objects;