-- Ensure language_preference column exists in profiles table
-- This migration is idempotent and safe to run multiple times

-- Add language_preference column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'language_preference'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN language_preference TEXT DEFAULT 'en';
    
    -- Add check constraint
    ALTER TABLE public.profiles
    ADD CONSTRAINT language_preference_check 
    CHECK (language_preference IN ('en', 'id'));
    
    -- Add comment
    COMMENT ON COLUMN public.profiles.language_preference IS 'User preferred language: en (English) or id (Indonesian)';
    
    -- Create index for faster queries
    CREATE INDEX idx_profiles_language_preference ON public.profiles (language_preference);
    
    RAISE NOTICE 'Added language_preference column to profiles table';
  ELSE
    RAISE NOTICE 'language_preference column already exists in profiles table';
  END IF;
END $$;

-- Update existing rows to have default language if NULL
UPDATE public.profiles 
SET language_preference = 'en' 
WHERE language_preference IS NULL;

-- Verify the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'language_preference'
  ) THEN
    RAISE NOTICE '✅ language_preference column verified in profiles table';
  ELSE
    RAISE EXCEPTION '❌ language_preference column not found in profiles table';
  END IF;
END $$;
