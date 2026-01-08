-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  total_karma INTEGER NOT NULL DEFAULT 0,
  total_deaths INTEGER NOT NULL DEFAULT 0,
  highest_realm TEXT NOT NULL DEFAULT 'Mortal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Update trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update characters table to require user_id and add proper RLS
ALTER TABLE public.characters 
  ADD CONSTRAINT characters_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old public policies on characters
DROP POLICY IF EXISTS "Allow public read characters" ON public.characters;
DROP POLICY IF EXISTS "Allow public insert characters" ON public.characters;
DROP POLICY IF EXISTS "Allow public update characters" ON public.characters;
DROP POLICY IF EXISTS "Allow public delete characters" ON public.characters;

-- Create user-scoped policies for characters
CREATE POLICY "Users can view own characters"
  ON public.characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own characters"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters"
  ON public.characters FOR DELETE
  USING (auth.uid() = user_id);

-- Update story_events, chat_messages, npc_relationships policies to check through character ownership
DROP POLICY IF EXISTS "Allow public read story_events" ON public.story_events;
DROP POLICY IF EXISTS "Allow public insert story_events" ON public.story_events;

CREATE POLICY "Users can view own story events"
  ON public.story_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = story_events.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own story events"
  ON public.story_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = story_events.character_id 
    AND characters.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow public read npc_relationships" ON public.npc_relationships;
DROP POLICY IF EXISTS "Allow public insert npc_relationships" ON public.npc_relationships;
DROP POLICY IF EXISTS "Allow public update npc_relationships" ON public.npc_relationships;

CREATE POLICY "Users can view own npc relationships"
  ON public.npc_relationships FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = npc_relationships.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own npc relationships"
  ON public.npc_relationships FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = npc_relationships.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own npc relationships"
  ON public.npc_relationships FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = npc_relationships.character_id 
    AND characters.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow public read chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow public insert chat_messages" ON public.chat_messages;

CREATE POLICY "Users can view own chat messages"
  ON public.chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = chat_messages.character_id 
    AND characters.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.characters 
    WHERE characters.id = chat_messages.character_id 
    AND characters.user_id = auth.uid()
  ));

-- Update graveyard policies
DROP POLICY IF EXISTS "Allow public read graveyard" ON public.graveyard;
DROP POLICY IF EXISTS "Allow public insert graveyard" ON public.graveyard;

-- Add user_id to graveyard for ownership
ALTER TABLE public.graveyard ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "Users can view all graveyard"
  ON public.graveyard FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own graveyard"
  ON public.graveyard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for characters table
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;

-- Set replica identity for realtime updates
ALTER TABLE public.characters REPLICA IDENTITY FULL;