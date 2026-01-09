-- Add stamina system to characters table
-- Stamina represents physical energy (separate from Qi spiritual energy)

-- Add stamina columns
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS stamina INTEGER DEFAULT 100;

ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS max_stamina INTEGER DEFAULT 100;

-- Add comments
COMMENT ON COLUMN characters.stamina IS 'Current physical energy (stamina) - used for physical activities';
COMMENT ON COLUMN characters.max_stamina IS 'Maximum stamina capacity - affected by strength stat (100 + strength × 5)';

-- Create index for queries
CREATE INDEX IF NOT EXISTS idx_characters_stamina ON characters (stamina);
