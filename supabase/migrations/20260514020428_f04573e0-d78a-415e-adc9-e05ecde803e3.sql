-- Restrict payment_settings: remove public read access. Admins manage; checkout reads via edge function (service role).
DROP POLICY IF EXISTS "Anyone can view payment settings" ON public.payment_settings;

-- Restrict user_questions: remove anonymous-readable clause; only owners and admins can view.
DROP POLICY IF EXISTS "Users can view their own questions" ON public.user_questions;
CREATE POLICY "Users can view their own questions"
  ON public.user_questions FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);