-- Add last_choices column to characters table to store the last generated action choices
-- This allows the game to restore the exact choices when reloading

ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS last_choices JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN characters.last_choices IS 'Stores the last generated action choices as JSON array for game state restoration';

-- Create index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_characters_last_choices ON characters USING GIN (last_choices);
