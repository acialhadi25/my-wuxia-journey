-- Create tutorial steps table to store AI-generated tutorial content
CREATE TABLE public.tutorial_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL, -- 1-5 for tutorial progression
  narrative TEXT NOT NULL, -- AI-generated story content
  choices JSONB NOT NULL DEFAULT '[]', -- AI-generated choices array
  player_choice TEXT, -- What the player chose (if any)
  stat_changes JSONB DEFAULT '{}', -- Any stat changes from this step
  is_awakening BOOLEAN DEFAULT false, -- Whether this is the final awakening step
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique step numbers per character
  UNIQUE(character_id, step_number)
);

-- Add tutorial completion fields to characters table
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS golden_finger_unlocked BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS current_tutorial_step INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.tutorial_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tutorial steps
CREATE POLICY "Users can view own tutorial steps" 
ON public.tutorial_steps 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = tutorial_steps.character_id 
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can insert own tutorial steps" 
ON public.tutorial_steps 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = tutorial_steps.character_id 
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can update own tutorial steps" 
ON public.tutorial_steps 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = tutorial_steps.character_id 
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can delete own tutorial steps" 
ON public.tutorial_steps 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM characters 
  WHERE characters.id = tutorial_steps.character_id 
  AND characters.user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_tutorial_steps_updated_at
BEFORE UPDATE ON public.tutorial_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_tutorial_steps_character_id ON public.tutorial_steps(character_id);
CREATE INDEX idx_tutorial_steps_step_number ON public.tutorial_steps(character_id, step_number);