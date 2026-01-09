-- ============================================
-- Tutorial System Migration
-- ============================================
-- Adds tutorial tracking columns to characters table

-- Add tutorial columns
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tutorial_step INTEGER DEFAULT 0;

-- Add index for querying tutorial progress
CREATE INDEX IF NOT EXISTS idx_characters_tutorial 
ON public.characters(tutorial_completed, tutorial_step);

-- Add comments for documentation
COMMENT ON COLUMN public.characters.tutorial_completed IS 'Whether the player has completed the tutorial';
COMMENT ON COLUMN public.characters.tutorial_step IS 'Current tutorial step (0-15). 0 = not started, 15 = completed';

-- Verification
DO $$
BEGIN
  -- Check if columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'characters' 
    AND column_name = 'tutorial_completed'
  ) THEN
    RAISE NOTICE '✅ tutorial_completed column added successfully';
  ELSE
    RAISE WARNING '⚠️ tutorial_completed column not found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'characters' 
    AND column_name = 'tutorial_step'
  ) THEN
    RAISE NOTICE '✅ tutorial_step column added successfully';
  ELSE
    RAISE WARNING '⚠️ tutorial_step column not found';
  END IF;

  -- Check if index exists
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'characters' 
    AND indexname = 'idx_characters_tutorial'
  ) THEN
    RAISE NOTICE '✅ Tutorial index created successfully';
  ELSE
    RAISE WARNING '⚠️ Tutorial index not found';
  END IF;
END $$;

-- ============================================
-- Migration Complete!
-- ============================================
-- Tutorial tracking is now enabled.
-- New characters will start with tutorial_step = 0 and tutorial_completed = false.
