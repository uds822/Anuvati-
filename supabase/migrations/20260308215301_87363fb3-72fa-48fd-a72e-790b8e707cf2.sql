
-- Tighten anon policies to use anonymous_id matching
DROP POLICY "Anon conversations insert" ON public.ai_chat_conversations;
DROP POLICY "Anon conversations select" ON public.ai_chat_conversations;
DROP POLICY "Anon conversations update" ON public.ai_chat_conversations;

CREATE POLICY "Anon conversations insert" ON public.ai_chat_conversations
  FOR INSERT TO anon WITH CHECK (
    profile_id IN (SELECT id FROM public.ai_chat_profiles WHERE user_id IS NULL)
  );

CREATE POLICY "Anon conversations select" ON public.ai_chat_conversations
  FOR SELECT TO anon USING (
    profile_id IN (SELECT id FROM public.ai_chat_profiles WHERE user_id IS NULL)
  );

CREATE POLICY "Anon conversations update" ON public.ai_chat_conversations
  FOR UPDATE TO anon USING (
    profile_id IN (SELECT id FROM public.ai_chat_profiles WHERE user_id IS NULL)
  );
