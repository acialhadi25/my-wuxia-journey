-- ============================================
-- COMPREHENSIVE DATABASE MIGRATION
-- Add all missing columns to characters table
-- ============================================

-- 1. Add tutorial_completed column
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT false;

COMMENT ON COLUMN characters.tutorial_completed IS 'Whether the character has completed the tutorial phase';

-- 2. Add golden_finger_unlocked column
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS golden_finger_unlocked BOOLEAN DEFAULT false;

COMMENT ON COLUMN characters.golden_finger_unlocked IS 'Whether the Golden Finger (cheat ability) has been fully awakened';

-- 3. Add current_tutorial_step column
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS current_tutorial_step INTEGER DEFAULT 0;

COMMENT ON COLUMN characters.current_tutorial_step IS 'Current step in the tutorial sequence (0 = not started)';

-- 4. Add active_effects column for regeneration system
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS active_effects JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN characters.active_effects IS 'Array of active effects (buffs, debuffs, poisons, curses, etc.) affecting the character';

-- 5. Add last_regeneration column for regeneration system
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS last_regeneration BIGINT DEFAULT EXTRACT(EPOCH FROM NOW() AT TIME ZONE 'UTC')::BIGINT * 1000;

COMMENT ON COLUMN characters.last_regeneration IS 'Timestamp (in milliseconds) of last regeneration update';

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index for active effects (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_characters_active_effects 
ON characters USING GIN (active_effects);

-- Index for tutorial status queries
CREATE INDEX IF NOT EXISTS idx_characters_tutorial_completed 
ON characters (tutorial_completed);

-- Index for golden finger status queries
CREATE INDEX IF NOT EXISTS idx_characters_golden_finger_unlocked 
ON characters (golden_finger_unlocked);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all columns were added:
-- 
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'characters' 
-- AND column_name IN (
--   'tutorial_completed', 
--   'golden_finger_unlocked', 
--   'current_tutorial_step',
--   'active_effects', 
--   'last_regeneration'
-- )
-- ORDER BY column_name;
-- ============================================
