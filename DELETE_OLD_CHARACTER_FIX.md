# Delete Old Character on New Game

## Problem
Saat membuat karakter baru:
- ❌ Record character lama di database tidak terhapus
- ❌ Data menumpuk di database
- ❌ Bisa menyebabkan konflik atau confusion

## Solution

Tambahkan logic untuk delete character lama saat user klik "New Game".

### Implementation

**Update `handleNewGame()` di `src/pages/Index.tsx`:**

```typescript
const handleNewGame = async () => {
  if (!user) {
    navigate('/auth');
    return;
  }
  
  // Delete old character if exists
  if (character && character.id) {
    try {
      console.log('Deleting old character:', character.id);
      
      // Delete related data first (foreign key constraints)
      await Promise.all([
        supabase.from('chat_messages').delete().eq('character_id', character.id),
        supabase.from('story_events').delete().eq('character_id', character.id),
        supabase.from('npc_relationships').delete().eq('character_id', character.id),
        supabase.from('character_techniques').delete().eq('character_id', character.id),
        supabase.from('character_items').delete().eq('character_id', character.id),
      ]);
      
      // Delete character
      await supabase.from('characters').delete().eq('id', character.id);
      
      // Clear localStorage
      localStorage.removeItem(`game_state_${character.id}`);
      localStorage.removeItem(`tutorial_progress_${character.id}`);
      localStorage.removeItem(`tutorial_completed_${character.id}`);
      localStorage.removeItem(`golden_finger_unlocked_${character.id}`);
      
      console.log('Old character deleted successfully');
      
      toast({
        title: "Previous Character Deleted",
        description: "Starting fresh with a new character.",
      });
    } catch (error) {
      console.error('Error deleting old character:', error);
      toast({
        title: "Warning",
        description: "Could not delete old character data. Continuing anyway.",
        variant: "destructive",
      });
    }
  }
  
  setCharacter(null);
  setSavedCharacterId(null);
  setGamePhase('creation');
};
```

## Deletion Order

**Important**: Delete related data FIRST before deleting character (foreign key constraints):

1. ✅ `chat_messages` - All chat history
2. ✅ `story_events` - All story events
3. ✅ `npc_relationships` - All NPC relationships
4. ✅ `character_techniques` - All learned techniques
5. ✅ `character_items` - All inventory items
6. ✅ `characters` - The character record itself
7. ✅ localStorage - All local storage keys

## Error Handling

- If deletion fails, show warning toast
- Continue to character creation anyway
- Log error to console for debugging

## Testing

### Test 1: Delete and Create New
1. ✅ Have an existing character
2. ✅ Click "New Game" from title screen
3. ✅ **VERIFY**: 
   - Toast shows "Previous Character Deleted" ✅
   - Old character removed from database ✅
   - Can create new character ✅

### Test 2: First Time User
1. ✅ No existing character
2. ✅ Click "New Game"
3. ✅ **VERIFY**:
   - No deletion happens (no character to delete) ✅
   - Goes directly to character creation ✅

### Test 3: Database Check
1. ✅ Create character A
2. ✅ Click "New Game"
3. ✅ Create character B
4. ✅ **VERIFY in Supabase**:
   - Character A record deleted ✅
   - Character B record exists ✅
   - No orphaned data ✅

## Console Logs

Look for these logs:
```
Deleting old character: [character-id]
Old character deleted successfully
```

Or if error:
```
Error deleting old character: [error]
```

## Benefits

1. ✅ **Clean Database**: No accumulation of old character data
2. ✅ **No Conflicts**: Each user has only one active character
3. ✅ **Better UX**: Clear separation between old and new games
4. ✅ **Storage Efficiency**: Don't waste database space

## Files Modified

1. ✅ `src/pages/Index.tsx`
   - Updated `handleNewGame()` to async
   - Added deletion logic for all related tables
   - Added localStorage cleanup
   - Added toast notifications

## Notes

- Deletion is permanent (no undo)
- User is notified via toast
- If user wants to keep old character, they should use "Continue" instead of "New Game"
- Consider adding confirmation dialog in future if needed

## Summary

**Problem**: Old character data tidak terhapus saat buat character baru.

**Solution**: Delete all related data dan character record saat user klik "New Game".

**Result**: Database tetap clean, hanya ada satu active character per user! ✅
