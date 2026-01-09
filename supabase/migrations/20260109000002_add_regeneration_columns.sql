-- Add active_effects and last_regeneration columns to characters table
-- This enables the regeneration and effects system

-- Add active_effects column to store active buffs/debuffs/poisons/curses
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS active_effects JSONB DEFAULT '[]'::jsonb;

-- Add last_regeneration column to track last regeneration timestamp
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS last_regeneration BIGINT DEFAULT EXTRACT(EPOCH FROM NOW() AT TIME ZONE 'UTC')::BIGINT * 1000;

-- Add comment to explain the columns
COMMENT ON COLUMN characters.active_effects IS 'Array of active effects (buffs, debuffs, poisons, curses, etc.) affecting the character';
COMMENT ON COLUMN characters.last_regeneration IS 'Timestamp (in milliseconds) of last regeneration update';

-- Create index for faster queries on characters with active effects
CREATE INDEX IF NOT EXISTS idx_characters_active_effects ON characters USING GIN (active_effects);
