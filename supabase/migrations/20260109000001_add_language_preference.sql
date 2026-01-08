-- Add language preference column to profiles table
-- This allows users to sync their language preference across devices

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(2) DEFAULT 'en' CHECK (language_preference IN ('en', 'id'));

-- Add comment to explain the column
COMMENT ON COLUMN profiles.language_preference IS 'User preferred language for AI responses and UI (en=English, id=Indonesian)';

-- Create index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_language_preference ON profiles (language_preference);
