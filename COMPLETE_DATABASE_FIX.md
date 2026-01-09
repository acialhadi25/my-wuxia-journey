# Complete Database Fix - All Missing Columns

## Masalah yang Ditemukan

Setelah audit menyeluruh, ditemukan **7 kolom database yang belum ada**:

### Characters Table (5 kolom)
1. ❌ `tutorial_completed` - Status tutorial selesai
2. ❌ `golden_finger_unlocked` - Status Golden Finger awakened
3. ❌ `current_tutorial_step` - Step tutorial saat ini
4. ❌ `active_effects` - Effects aktif (buffs/debuffs/poisons)
5. ❌ `last_regeneration` - Timestamp regenerasi terakhir

### Profiles Table (1 kolom)
6. ❌ `language_preference` - Preferensi bahasa user

### Note
- `last_choices` sudah ada migration filenya (20260109000000)

## Error yang Muncul

```
Failed to load resource: the server responded with a status of 400 ()
Error updating character: column "active_effects" does not exist
Error updating character: column "last_regeneration" does not exist
Error updating character: column "tutorial_completed" does not exist
Error updating character: column "golden_finger_unlocked" does not exist
Failed to save language to database: column "language_preference" does not exist
```

## Solusi Lengkap

### Cara 1: Copy-Paste SQL (RECOMMENDED)

1. **Buka Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Pilih project kamu
   - Klik **SQL Editor** di sidebar

2. **Jalankan SQL Lengkap**
   - Klik **New Query**
   - Copy-paste SQL dari file `COMPLETE_DATABASE_MIGRATION.sql`
   - Atau copy dari bawah ini:

```sql
-- CHARACTERS TABLE
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS golden_finger_unlocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_tutorial_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_effects JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_regeneration BIGINT DEFAULT EXTRACT(EPOCH FROM NOW() AT TIME ZONE 'UTC')::BIGINT * 1000;

-- PROFILES TABLE
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(2) DEFAULT 'en' CHECK (language_preference IN ('en', 'id'));

-- CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_characters_active_effects ON characters USING GIN (active_effects);
CREATE INDEX IF NOT EXISTS idx_characters_tutorial_completed ON characters (tutorial_completed);
CREATE INDEX IF NOT EXISTS idx_characters_golden_finger_unlocked ON characters (golden_finger_unlocked);
CREATE INDEX IF NOT EXISTS idx_profiles_language_preference ON profiles (language_preference);
```

3. **Klik Run** atau tekan `Ctrl+Enter`

4. **Verifikasi** - Jalankan query ini:

```sql
-- Check characters table
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'characters' 
AND column_name IN ('tutorial_completed', 'golden_finger_unlocked', 'current_tutorial_step', 'active_effects', 'last_regeneration')
ORDER BY column_name;

-- Check profiles table
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'language_preference';
```

Harusnya muncul 6 rows total (5 dari characters, 1 dari profiles).

### Cara 2: Menggunakan Migration Files

Jika kamu menggunakan Supabase CLI:

```bash
# Link project (jika belum)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Migration files yang sudah dibuat:
- `supabase/migrations/20260109000000_add_last_choices_column.sql`
- `supabase/migrations/20260109000001_add_language_preference.sql`
- `supabase/migrations/20260109000002_add_regeneration_columns.sql`
- `supabase/migrations/20260109000003_add_missing_columns.sql`

## Detail Kolom yang Ditambahkan

### 1. tutorial_completed (BOOLEAN)
- **Default**: false
- **Purpose**: Track apakah character sudah selesai tutorial
- **Used in**: Tutorial system, game flow

### 2. golden_finger_unlocked (BOOLEAN)
- **Default**: false
- **Purpose**: Track apakah Golden Finger sudah fully awakened
- **Used in**: Awakening scenario, custom action unlock

### 3. current_tutorial_step (INTEGER)
- **Default**: 0
- **Purpose**: Track step tutorial saat ini
- **Used in**: Tutorial progression system

### 4. active_effects (JSONB)
- **Default**: []
- **Purpose**: Store active buffs/debuffs/poisons/curses
- **Used in**: Regeneration system, effects system
- **Example**:
```json
[
  {
    "id": "uuid",
    "name": "Healing Pill Effect",
    "type": "buff",
    "duration": 60,
    "regenModifiers": {"healthRegen": 5}
  }
]
```

### 5. last_regeneration (BIGINT)
- **Default**: Current timestamp in milliseconds
- **Purpose**: Track last regeneration update for delta time calculation
- **Used in**: Regeneration system

### 6. language_preference (VARCHAR(2))
- **Default**: 'en'
- **Constraint**: Must be 'en' or 'id'
- **Purpose**: Store user's preferred language
- **Used in**: Language sync across devices, AI response language

## Setelah Migration

### 1. Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### 2. Clear Browser Data
- Clear cache
- Clear localStorage (F12 → Application → Local Storage → Clear)
- Refresh page

### 3. Test Game
1. Create new character
2. Check console - seharusnya tidak ada error 400
3. Test language switching - seharusnya tersimpan
4. Test regeneration - health/qi seharusnya regenerate
5. Test effects - AI bisa apply buffs/debuffs

## Troubleshooting

### Error: "column already exists"
✅ **Ini normal!** Migration menggunakan `IF NOT EXISTS`, jadi aman dijalankan berkali-kali.

### Error: "permission denied"
❌ Pastikan kamu login sebagai owner/admin project di Supabase.

### Error masih muncul setelah migration
1. Verify kolom benar-benar ada dengan query verifikasi
2. Clear browser cache dan localStorage
3. Restart dev server
4. Buat character baru untuk test

### Language preference tidak tersimpan
- Check apakah kolom `language_preference` ada di table `profiles`
- Check apakah user sudah login (language hanya disimpan untuk logged-in users)
- Check console untuk error messages

## Files yang Dibuat

1. ✅ `COMPLETE_DATABASE_MIGRATION.sql` - SQL lengkap siap copy-paste
2. ✅ `supabase/migrations/20260109000003_add_missing_columns.sql` - Migration file
3. ✅ `COMPLETE_DATABASE_FIX.md` - Dokumentasi ini

## Summary

**Total kolom yang perlu ditambahkan: 6**
- 5 kolom di `characters` table
- 1 kolom di `profiles` table

**Estimated time: 2 menit**
1. Copy SQL (30 detik)
2. Paste & Run di Supabase (30 detik)
3. Verify (30 detik)
4. Refresh game (30 detik)

**Setelah ini, semua error database akan hilang!** ✅
