# Tutorial Resume After Reload - Fixed ✅

## Problem
Ketika user reload browser di tengah tutorial, mereka tidak kembali ke fase tutorial melainkan masuk ke gameplay normal.

## Root Cause
Di `initializeGame()`, ketika `initialSavedId` exists (reload scenario), code langsung load messages dan return **tanpa check tutorial status** dari character.

## Solution

### 1. Check Tutorial Status on Reload ✅
**File**: `src/components/GameScreen.tsx`

**Before**:
```typescript
if (initialSavedId) {
  // Load messages
  // Load choices
  setIsLoading(false);
  return; // ❌ Return immediately, no tutorial check
}
```

**After**:
```typescript
if (initialSavedId) {
  // ✅ Check tutorial status from character prop
  if (!character.tutorialCompleted && (character.tutorialStep || 0) < 15) {
    const currentStep = character.tutorialStep || 0;
    
    // Load messages
    
    // ✅ Check if step 0 (new) or > 0 (resume)
    if (currentStep === 0) {
      await tutorialHandlers.startTutorial(); // Start from beginning
    } else {
      await tutorialHandlers.resumeTutorial(currentStep); // Resume at step
    }
    return;
  }
  
  // Tutorial completed - load normal game
  // ...
}
```

### 2. Database Migration Required ⚠️
**File**: `supabase/migrations/20260109000008_add_tutorial_columns.sql`

**Columns Added**:
- `tutorial_completed` (BOOLEAN, default FALSE)
- `tutorial_step` (INTEGER, default 0)

**Status**: Migration file ready, needs to be applied to database.

## How It Works Now

### Scenario 1: New Character
1. User creates character
2. `tutorial_completed = false`, `tutorial_step = 0`
3. Code detects step 0
4. Calls `startTutorial()` (not resumeTutorial!)
5. ✅ Tutorial starts from step 1

### Scenario 2: Tutorial In Progress + Reload
1. User at tutorial step 5
2. User reloads browser
3. Character loaded with `tutorial_step = 5`, `tutorial_completed = false`
4. `initializeGame()` detects tutorial in progress
5. Calls `tutorialHandlers.resumeTutorial(5)`
6. ✅ Tutorial resumes at step 5

### Scenario 3: Tutorial Completed + Reload
1. User completed tutorial
2. User reloads browser
3. Character loaded with `tutorial_completed = true`
4. `initializeGame()` skips tutorial logic
5. Loads normal game state
6. ✅ Normal gameplay continues

## Testing Checklist

- [x] Code updated to check tutorial status on reload
- [x] Migration file created
- [ ] **TODO**: Run migration in Supabase
- [ ] **TODO**: Test new character starts tutorial
- [ ] **TODO**: Test reload during tutorial (step 1-14)
- [ ] **TODO**: Test reload after tutorial complete
- [ ] **TODO**: Verify tutorial_step persists in database

## Migration Instructions

### Step 1: Apply Migration
```bash
# In Supabase Dashboard or CLI
supabase db push

# Or manually run the SQL file:
# supabase/migrations/20260109000008_add_tutorial_columns.sql
```

### Step 2: Verify Migration
Check in Supabase Dashboard:
1. Go to Table Editor → characters
2. Verify columns exist:
   - `tutorial_completed` (boolean)
   - `tutorial_step` (int4)
3. Check default values are set

### Step 3: Test Tutorial Resume
1. Create new character
2. Progress to tutorial step 3-5
3. Reload browser (F5)
4. Verify tutorial resumes at correct step
5. Complete tutorial
6. Reload browser
7. Verify normal gameplay continues

## Console Logs to Watch

When reload happens, you should see:
```
📊 Character tutorial status: { completed: false, step: 5 }
🎓 Resuming tutorial at step 5 after reload...
Loaded X messages from database
✅ Tutorial resumed at step 5
```

## Important Notes

1. **Character prop already has tutorial data** - No need to query database again
2. **Tutorial handlers must be initialized** - Check `tutorialHandlers` exists before calling
3. **Messages are loaded** - Tutorial resume loads existing messages first
4. **Choices are set by tutorial** - `resumeTutorial()` sets the correct choice

## Related Files

- `src/components/GameScreen.tsx` - Main game logic with reload handling
- `src/components/GameScreen.tutorial.tsx` - Tutorial handlers (resumeTutorial)
- `src/services/tutorialService.ts` - Tutorial execution logic
- `supabase/migrations/20260109000008_add_tutorial_columns.sql` - Database migration

---

**Implementation Date**: January 9, 2026
**Status**: ✅ Code Fixed - Migration Pending
**Next Step**: Run database migration
