-- Add language_preference column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';

-- Add check constraint for valid language values
ALTER TABLE profiles
ADD CONSTRAINT language_preference_check 
CHECK (language_preference IN ('en', 'id'));

-- Add comment
COMMENT ON COLUMN profiles.language_preference IS 'User preferred language: en (English) or id (Indonesian)';

-- Update existing rows to have default language
UPDATE profiles 
SET language_preference = 'en' 
WHERE language_preference IS NULL;
