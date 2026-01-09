-- ============================================
-- REGENERATION SYSTEM DATABASE MIGRATION
-- ============================================
-- Run this SQL in Supabase SQL Editor to enable
-- the regeneration and effects system
-- ============================================

-- Add active_effects column to store active buffs/debuffs/poisons/curses
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS active_effects JSONB DEFAULT '[]'::jsonb;

-- Add last_regeneration column to track last regeneration timestamp
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS last_regeneration BIGINT DEFAULT EXTRACT(EPOCH FROM NOW() AT TIME ZONE 'UTC')::BIGINT * 1000;

-- Add comments to explain the columns
COMMENT ON COLUMN characters.active_effects IS 'Array of active effects (buffs, debuffs, poisons, curses, etc.) affecting the character';
COMMENT ON COLUMN characters.last_regeneration IS 'Timestamp (in milliseconds) of last regeneration update';

-- Create index for faster queries on characters with active effects
CREATE INDEX IF NOT EXISTS idx_characters_active_effects ON characters USING GIN (active_effects);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the columns were added:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'characters' 
-- AND column_name IN ('active_effects', 'last_regeneration');
-- ============================================
