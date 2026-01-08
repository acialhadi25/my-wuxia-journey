-- Create martial arts/techniques table
CREATE TABLE public.character_techniques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'martial', -- 'martial', 'mystic', 'passive'
  element TEXT, -- Fire, Water, etc.
  rank TEXT NOT NULL DEFAULT 'mortal', -- mortal, earth, heaven, divine
  mastery INTEGER NOT NULL DEFAULT 0, -- 0-100
  description TEXT,
  effects JSONB DEFAULT '{}',
  qi_cost INTEGER DEFAULT 0,
  cooldown TEXT, -- e.g., '1 battle', 'daily', 'none'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory items table
CREATE TABLE public.character_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'misc', -- weapon, armor, pill, material, treasure, misc
  rarity TEXT NOT NULL DEFAULT 'common', -- common, uncommon, rare, epic, legendary, divine
  quantity INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  effects JSONB DEFAULT '{}',
  equipped BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add max_qi scaling and realm progression columns to characters
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS cultivation_progress INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS breakthrough_ready BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS
ALTER TABLE public.character_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for techniques
CREATE POLICY "Users can view own techniques" 
ON public.character_techniques 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = character_techniques.character_id 
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can insert own techniques" 
ON public.character_techniques 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = character_techniques.character_id 
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can update own techniques" 
ON public.character_techniques 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = character_techniques.character_id 
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can delete own techniques" 
ON public.character_techniques 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = character_techniques.character_id 
  AND characters.user_id = auth.uid()
));

-- RLS Policies for items
CREATE POLICY "Users can view own items" 
ON public.character_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = character_items.character_id 
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can insert own items" 
ON public.character_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = character_items.character_id 
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can update own items" 
ON public.character_items 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = character_items.character_id 
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can delete own items" 
ON public.character_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = character_items.character_id 
  AND characters.user_id = auth.uid()
));

-- Add trigger for updated_at on techniques
CREATE TRIGGER update_character_techniques_updated_at
BEFORE UPDATE ON public.character_techniques
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();