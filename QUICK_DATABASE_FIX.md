# Quick Database Fix 🚀

## Problem
❌ 6 kolom database belum ada
❌ Error 400 saat save data
❌ Language preference tidak tersimpan
❌ Effects tidak persist

## Solution (2 menit)

### Step 1: Buka Supabase
https://supabase.com/dashboard → Your Project → **SQL Editor**

### Step 2: Copy-Paste & Run
```sql
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS golden_finger_unlocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_tutorial_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_effects JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_regeneration BIGINT DEFAULT EXTRACT(EPOCH FROM NOW() AT TIME ZONE 'UTC')::BIGINT * 1000;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(2) DEFAULT 'en';

CREATE INDEX IF NOT EXISTS idx_characters_active_effects ON characters USING GIN (active_effects);
```

### Step 3: Refresh Game
Clear cache → Refresh browser → Test!

## Done! ✅
Semua error akan hilang.

---

**Detailed docs**: `COMPLETE_DATABASE_FIX.md`
**Full SQL**: `COMPLETE_DATABASE_MIGRATION.sql`
