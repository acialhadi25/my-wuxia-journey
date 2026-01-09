# Database Migration Required - Regeneration System

## Status: ⚠️ ACTION REQUIRED

The regeneration and effects system code is complete, but the database schema needs to be updated.

## Problem

The following errors occur because database columns don't exist yet:
```
Failed to load resource: the server responded with a status of 400 ()
Error updating character: column "active_effects" does not exist
Error updating character: column "last_regeneration" does not exist
```

## Solution

Run the migration file that has been created:
**File**: `supabase/migrations/20260109000002_add_regeneration_columns.sql`

## How to Apply Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste this SQL:

```sql
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
```

5. Click **Run** or press `Ctrl+Enter`
6. Verify success message appears

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### Option 3: Manual SQL Execution

Connect to your database using any PostgreSQL client and run the SQL above.

## What These Columns Do

### `active_effects` (JSONB)
Stores an array of active effects on the character:
- Buffs (stat increases, regen boosts)
- Debuffs (stat decreases, regen penalties)
- Poisons (damage over time)
- Curses (long-term penalties)
- Blessings (long-term bonuses)
- Qi Deviation (cultivation accidents)

Example data:
```json
[
  {
    "id": "uuid",
    "name": "Healing Pill Effect",
    "type": "buff",
    "description": "Medicinal energy accelerates recovery",
    "duration": 60,
    "startTime": 1704844800000,
    "regenModifiers": {
      "healthRegen": 5
    }
  }
]
```

### `last_regeneration` (BIGINT)
Timestamp in milliseconds of the last regeneration update. Used to calculate delta time for accurate regeneration.

## Verification

After running the migration, verify it worked:

1. Go to **Table Editor** in Supabase Dashboard
2. Select the `characters` table
3. Check that these columns exist:
   - `active_effects` (type: jsonb)
   - `last_regeneration` (type: int8/bigint)

## After Migration

Once the migration is complete:
1. Refresh your game
2. Create a new character or load existing one
3. The regeneration system will start working automatically
4. Effects from AI will be saved and persist across sessions

## Troubleshooting

### If migration fails with "column already exists"
This is fine - it means the columns were already added. The migration uses `IF NOT EXISTS` to be safe.

### If you see permission errors
Make sure you're running the SQL as a database admin or the service role.

### If the game still shows errors after migration
1. Clear browser cache and localStorage
2. Refresh the page
3. Create a new character to test

## Current Workaround

The code has been updated to gracefully handle missing columns:
- If columns don't exist, it saves without them
- The game will work, but effects won't persist across sessions
- Regeneration will still work in-memory during the session

However, **running the migration is strongly recommended** for full functionality.
