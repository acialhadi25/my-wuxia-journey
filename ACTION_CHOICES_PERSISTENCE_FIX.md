# Action Choices Persistence Fix

## Masalah
Ketika game di-reload, daftar action choices yang di-generate AI terakhir tidak tersimpan. User selalu melihat default choices:
- Continue exploring
- Rest and meditate
- Look for opportunities

Padahal seharusnya melihat choices yang di-generate AI terakhir kali.

## Solusi yang Diimplementasikan

### 1. Enhanced GameState Type
**File: `src/services/autoSaveService.ts`**

Menambahkan field `lastChoices` ke GameState:
```typescript
export type GameState = {
  characterId: string;
  character: Character;
  currentPhase: 'tutorial' | 'playing';
  tutorialStep?: number;
  tutorialHistory?: string;
  currentLocation?: string;
  timeElapsed?: string;
  currentChapter?: number;
  lastChoices?: any[]; // NEW: Store last generated choices
};
```

### 2. Save & Load Choices Functions
**File: `src/services/autoSaveService.ts`**

Menambahkan 2 fungsi baru:

#### `saveLastChoices(characterId, choices)`
```typescript
// Save to localStorage
localStorage.setItem(`last_choices_${characterId}`, JSON.stringify({
  choices,
  savedAt: new Date().toISOString()
}));

// Save to database (characters.last_choices column)
await supabase
  .from('characters')
  .update({
    last_choices: choices,
    updated_at: new Date().toISOString()
  })
  .eq('id', characterId);
```

#### `loadLastChoices(characterId)`
```typescript
// Try database first
const { data } = await supabase
  .from('characters')
  .select('last_choices')
  .eq('id', characterId)
  .single();

if (data && data.last_choices) {
  return data.last_choices;
}

// Fallback to localStorage
const localData = localStorage.getItem(`last_choices_${characterId}`);
if (localData) {
  return JSON.parse(localData).choices;
}

return null;
```

### 3. Save Choices After AI Response
**File: `src/components/GameScreen.tsx` - `processAIResponse()`**

```typescript
const processAIResponse = async (response: AIResponse, charId: string) => {
  const { messages: newMessages, choices: newChoices } = convertAIResponseToMessages(response, character);
  
  setMessages(prev => [...prev, ...newMessages]);
  setChoices(newChoices);
  
  // ✨ NEW: Save choices immediately
  if (newChoices && newChoices.length > 0) {
    await saveLastChoices(charId, newChoices);
  }
  
  // ... rest of the function
  
  // Also save in localStorage game state
  saveToLocalStorage({
    characterId: charId,
    character: updatedCharacter,
    currentPhase: 'playing',
    currentLocation: response.new_location || currentLocation,
    timeElapsed: response.time_passed || timeElapsed,
    currentChapter,
    lastChoices: newChoices // ✨ NEW: Include in game state
  });
};
```

### 4. Load Choices on Game Init
**File: `src/components/GameScreen.tsx` - `useEffect()`**

```typescript
// Load existing messages if continuing
if (initialSavedId) {
  const { data: existingMessages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('character_id', charId)
    .order('created_at', { ascending: true });
  
  if (existingMessages && existingMessages.length > 0) {
    const loadedMessages = existingMessages.map(msg => ({...}));
    setMessages(loadedMessages);
    
    // ✨ NEW: Try to load last choices
    const lastChoices = await loadLastChoices(charId);
    if (lastChoices && lastChoices.length > 0) {
      console.log('Loaded last choices:', lastChoices);
      setChoices(lastChoices);
    } else {
      // Show generic choices if no saved choices found
      console.log('No saved choices found, using default choices');
      setChoices([
        { id: '1', text: 'Continue exploring', type: 'action' },
        { id: '2', text: 'Rest and meditate', type: 'action' },
        { id: '3', text: 'Look for opportunities', type: 'action' }
      ]);
    }
    
    setIsLoading(false);
    return;
  }
}
```

### 5. Database Migration
**File: `supabase/migrations/20260109000000_add_last_choices_column.sql`**

```sql
-- Add last_choices column to characters table
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS last_choices JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN characters.last_choices IS 'Stores the last generated action choices as JSON array for game state restoration';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_characters_last_choices ON characters USING GIN (last_choices);
```

## Flow Diagram

### Save Flow:
```
AI generates response with choices
    ↓
processAIResponse() called
    ↓
setChoices(newChoices) → Update UI
    ↓
saveLastChoices(charId, newChoices)
    ├─→ Save to localStorage (`last_choices_${characterId}`)
    └─→ Save to database (characters.last_choices)
    ↓
saveToLocalStorage() → Include lastChoices in game state
```

### Load Flow:
```
Game initializes with existing character
    ↓
Load messages from database
    ↓
loadLastChoices(charId)
    ├─→ Try database first (characters.last_choices)
    └─→ Fallback to localStorage (`last_choices_${characterId}`)
    ↓
If found: setChoices(lastChoices) → Show AI-generated choices
If not found: setChoices(defaultChoices) → Show generic choices
```

## Data Structure

### Choice Object:
```typescript
{
  id: string;           // Unique identifier
  text: string;         // Display text for the button
  type: string;         // 'action', 'combat', 'flee', etc.
  checkType?: string;   // 'strength', 'agility', 'intelligence', etc.
}
```

### Example Saved Choices:
```json
[
  {
    "id": "1",
    "text": "Practice the Mountain-Shattering Fist in secret",
    "type": "action",
    "checkType": "strength"
  },
  {
    "id": "2",
    "text": "Confront Senior Brother Zhang about his technique",
    "type": "action",
    "checkType": "charisma"
  },
  {
    "id": "3",
    "text": "Meditate to consolidate your insights",
    "type": "action",
    "checkType": "intelligence"
  }
]
```

## PENTING: Setup Database

Sebelum menggunakan fitur ini, jalankan migration di Supabase:

### Option 1: Via Supabase Dashboard
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Pergi ke SQL Editor
4. Copy-paste isi file `supabase/migrations/20260109000000_add_last_choices_column.sql`
5. Run query

### Option 2: Via Supabase CLI
```bash
supabase db push
```

### Verify Migration:
```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'characters' 
AND column_name = 'last_choices';

-- Should return:
-- column_name  | data_type
-- last_choices | jsonb
```

## Testing

### Test Save:
1. Buat karakter baru atau lanjutkan game
2. Pilih action apapun
3. Tunggu AI response dengan choices baru
4. Buka Console → Cari log: "Last choices saved to localStorage: X choices"
5. Buka Console → Cari log: "Last choices saved to database"

### Test Load:
1. Setelah mendapat choices dari AI, reload browser (F5)
2. Game akan load messages dari database
3. Buka Console → Cari log: "Loaded last choices: [...]"
4. Verify bahwa choices yang muncul adalah choices dari AI, bukan default choices

### Test Fallback:
1. Hapus data dari localStorage: `localStorage.removeItem('last_choices_...')`
2. Reload browser
3. Seharusnya tetap load dari database
4. Jika database juga kosong, akan show default choices

## Console Logs untuk Debugging

Saat save:
```
Last choices saved to localStorage: 3 choices
Last choices saved to database
✅ Game state auto-saved to localStorage
```

Saat load (success):
```
Loaded 15 messages from database
Loaded last choices: [{id: '1', text: '...', ...}, ...]
```

Saat load (fallback):
```
Loaded 15 messages from database
No saved choices found, using default choices
```

## Catatan TypeScript Errors

Anda mungkin melihat TypeScript errors di `autoSaveService.ts` terkait `last_choices` column. Ini karena Supabase types belum di-regenerate. Error ini tidak mempengaruhi runtime - kode akan tetap berfungsi.

Untuk fix TypeScript errors (optional):
```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id eiqjhkzgvtcqjlrviruk > src/integrations/supabase/types.ts
```

## Files Modified

1. `src/services/autoSaveService.ts`
   - Added `lastChoices` to GameState type
   - Added `saveLastChoices()` function
   - Added `loadLastChoices()` function

2. `src/components/GameScreen.tsx`
   - Import `saveLastChoices` and `loadLastChoices`
   - Save choices in `processAIResponse()`
   - Load choices in initialization `useEffect()`
   - Include `lastChoices` in `saveToLocalStorage()`

3. `supabase/migrations/20260109000000_add_last_choices_column.sql`
   - New migration file to add `last_choices` column

## Benefits

✅ **Persistent Choices**: Choices survive browser reload
✅ **Dual Storage**: Saved to both localStorage (fast) and database (persistent)
✅ **Fallback System**: If database fails, use localStorage
✅ **Better UX**: User sees contextual choices, not generic ones
✅ **Debugging**: Clear console logs for troubleshooting

## Potential Issues & Solutions

### Issue: Choices not loading after reload
**Solution**: 
- Check console for "Loaded last choices" log
- Verify database migration ran successfully
- Check localStorage: `localStorage.getItem('last_choices_...')`

### Issue: TypeScript errors
**Solution**: 
- Errors are cosmetic, code works at runtime
- Regenerate Supabase types to fix (optional)

### Issue: Old choices showing instead of new ones
**Solution**:
- Verify `saveLastChoices()` is called in `processAIResponse()`
- Check console for "Last choices saved" logs
- Clear localStorage and database, then test again
