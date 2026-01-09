-- ============================================
-- COMPLETE DATABASE MIGRATION
-- Run this SQL in Supabase SQL Editor
-- ============================================
-- This adds ALL missing columns needed for the game
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- ============================================
-- CHARACTERS TABLE - Missing Columns
-- ============================================

-- Tutorial system columns
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT false;

ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS golden_finger_unlocked BOOLEAN DEFAULT false;

ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS current_tutorial_step INTEGER DEFAULT 0;

-- Regeneration system columns
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS active_effects JSONB DEFAULT '[]'::jsonb;

ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS last_regeneration BIGINT DEFAULT EXTRACT(EPOCH FROM NOW() AT TIME ZONE 'UTC')::BIGINT * 1000;

-- Game state columns
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS last_choices JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- PROFILES TABLE - Missing Columns
-- ============================================

-- Language preference column (if not already added)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(2) DEFAULT 'en' CHECK (language_preference IN ('en', 'id'));

-- ============================================
-- ADD COMMENTS
-- ============================================

COMMENT ON COLUMN characters.tutorial_completed IS 'Whether the character has completed the tutorial phase';
COMMENT ON COLUMN characters.golden_finger_unlocked IS 'Whether the Golden Finger (cheat ability) has been fully awakened';
COMMENT ON COLUMN characters.current_tutorial_step IS 'Current step in the tutorial sequence (0 = not started)';
COMMENT ON COLUMN characters.active_effects IS 'Array of active effects (buffs, debuffs, poisons, curses, etc.) affecting the character';
COMMENT ON COLUMN characters.last_regeneration IS 'Timestamp (in milliseconds) of last regeneration update';
COMMENT ON COLUMN characters.last_choices IS 'Stores the last generated action choices as JSON array for game state restoration';
COMMENT ON COLUMN profiles.language_preference IS 'User preferred language for AI responses and UI (en=English, id=Indonesian)';

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Characters table indexes
CREATE INDEX IF NOT EXISTS idx_characters_active_effects 
ON characters USING GIN (active_effects);

CREATE INDEX IF NOT EXISTS idx_characters_tutorial_completed 
ON characters (tutorial_completed);

CREATE INDEX IF NOT EXISTS idx_characters_golden_finger_unlocked 
ON characters (golden_finger_unlocked);

CREATE INDEX IF NOT EXISTS idx_characters_last_choices 
ON characters USING GIN (last_choices);

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_language_preference 
ON profiles (language_preference);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify all columns were added:

-- Check characters table columns
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'characters' 
AND column_name IN (
  'tutorial_completed', 
  'golden_finger_unlocked', 
  'current_tutorial_step',
  'active_effects', 
  'last_regeneration',
  'last_choices'
)
ORDER BY column_name;

-- Check profiles table columns
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'language_preference';

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- Characters table should have:
-- - tutorial_completed (boolean, default: false)
-- - golden_finger_unlocked (boolean, default: false)
-- - current_tutorial_step (integer, default: 0)
-- - active_effects (jsonb, default: '[]')
-- - last_regeneration (bigint, default: current timestamp)
-- - last_choices (jsonb, default: '[]')
--
-- Profiles table should have:
-- - language_preference (varchar(2), default: 'en')
-- ============================================
