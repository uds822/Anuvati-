
-- Table to store AI chatbot user profiles
CREATE TABLE public.ai_chat_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id text,
  display_name text,
  location text,
  age_group text,
  interests text[],
  concerns text[],
  ai_summary text,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_or_anonymous UNIQUE (user_id, anonymous_id)
);

-- Table to store conversation history
CREATE TABLE public.ai_chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.ai_chat_profiles(id) ON DELETE CASCADE NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  topic text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_chat_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_conversations ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can manage their own profiles
CREATE POLICY "Users can view own profile" ON public.ai_chat_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.ai_chat_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.ai_chat_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.ai_chat_profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Conversation policies
CREATE POLICY "Users can manage own conversations" ON public.ai_chat_conversations
  FOR ALL TO authenticated USING (
    profile_id IN (SELECT id FROM public.ai_chat_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all conversations" ON public.ai_chat_conversations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow anonymous access for the edge function (service role will handle this)
CREATE POLICY "Anon can insert profiles" ON public.ai_chat_profiles
  FOR INSERT TO anon WITH CHECK (user_id IS NULL AND anonymous_id IS NOT NULL);

CREATE POLICY "Anon can select own profile" ON public.ai_chat_profiles
  FOR SELECT TO anon USING (user_id IS NULL AND anonymous_id IS NOT NULL);

CREATE POLICY "Anon can update own profile" ON public.ai_chat_profiles
  FOR UPDATE TO anon USING (user_id IS NULL AND anonymous_id IS NOT NULL);

CREATE POLICY "Anon conversations insert" ON public.ai_chat_conversations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon conversations select" ON public.ai_chat_conversations
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anon conversations update" ON public.ai_chat_conversations
  FOR UPDATE TO anon USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_ai_chat_profiles_updated_at
  BEFORE UPDATE ON public.ai_chat_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_chat_conversations_updated_at
  BEFORE UPDATE ON public.ai_chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
