-- Characters table for saving player progress
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  spirit_root TEXT NOT NULL,
  realm TEXT NOT NULL DEFAULT 'Mortal',
  golden_finger JSONB NOT NULL,
  stats JSONB NOT NULL,
  qi INTEGER NOT NULL DEFAULT 0,
  max_qi INTEGER NOT NULL DEFAULT 100,
  health INTEGER NOT NULL DEFAULT 100,
  max_health INTEGER NOT NULL DEFAULT 100,
  karma INTEGER NOT NULL DEFAULT 0,
  inventory JSONB NOT NULL DEFAULT '[]'::jsonb,
  visual_traits JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_location TEXT NOT NULL DEFAULT 'Starting Village',
  current_chapter INTEGER NOT NULL DEFAULT 1,
  time_elapsed TEXT NOT NULL DEFAULT 'Day 1',
  is_alive BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Story events for long-term memory (Karma & Memory system)
CREATE TABLE public.story_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  details JSONB,
  importance INTEGER NOT NULL DEFAULT 1,
  chapter INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- NPC relationships for tracking grudges and favor
CREATE TABLE public.npc_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  npc_name TEXT NOT NULL,
  npc_description TEXT,
  favor INTEGER NOT NULL DEFAULT 0,
  grudge INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'neutral',
  last_interaction TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(character_id, npc_name)
);

-- Chat messages for conversation history
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'narration',
  speaker TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Graveyard for dead characters (Samsara system)
CREATE TABLE public.graveyard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_character_id UUID,
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  final_realm TEXT NOT NULL,
  cause_of_death TEXT,
  legacy_item TEXT,
  total_karma INTEGER NOT NULL DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.npc_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graveyard ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required for this game)
CREATE POLICY "Allow public read characters" ON public.characters FOR SELECT USING (true);
CREATE POLICY "Allow public insert characters" ON public.characters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update characters" ON public.characters FOR UPDATE USING (true);
CREATE POLICY "Allow public delete characters" ON public.characters FOR DELETE USING (true);

CREATE POLICY "Allow public read story_events" ON public.story_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert story_events" ON public.story_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read npc_relationships" ON public.npc_relationships FOR SELECT USING (true);
CREATE POLICY "Allow public insert npc_relationships" ON public.npc_relationships FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update npc_relationships" ON public.npc_relationships FOR UPDATE USING (true);

CREATE POLICY "Allow public read chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read graveyard" ON public.graveyard FOR SELECT USING (true);
CREATE POLICY "Allow public insert graveyard" ON public.graveyard FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_npc_relationships_updated_at
  BEFORE UPDATE ON public.npc_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_story_events_character ON public.story_events(character_id);
CREATE INDEX idx_story_events_importance ON public.story_events(importance DESC);
CREATE INDEX idx_npc_relationships_character ON public.npc_relationships(character_id);
CREATE INDEX idx_chat_messages_character ON public.chat_messages(character_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);