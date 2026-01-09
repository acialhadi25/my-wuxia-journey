# Bug Fix: Notification Function Calls

## Issue
Error in production: `xe.success is not a function`

## Root Cause
Incorrect import and usage of notification functions in `CharacterCreation.tsx`:
- Used `gameNotify.success()` which doesn't exist
- Used `gameNotify.error()` which doesn't exist
- Used `gameNotify.warning()` which doesn't exist

## Solution
Changed imports and function calls:

### Before
```typescript
import { gameNotify } from '@/lib/notifications';

gameNotify.success('Title', 'Description');
gameNotify.error('Title', 'Description');
gameNotify.warning('Title', 'Description');
```

### After
```typescript
import { notify } from '@/lib/notifications';

notify.success('Title', 'Description');
notify.error('Title', 'Description');
notify.warning('Title', 'Description');
```

## Notification API Reference

### Generic Notifications (notify)
Use for general UI feedback:
```typescript
import { notify } from '@/lib/notifications';

notify.success(message, description?);
notify.error(message, description?);
notify.info(message, description?);
notify.warning(message, description?);
notify.loading(message);
```

### Game-Specific Notifications (gameNotify)
Use for game events:
```typescript
import { gameNotify } from '@/lib/notifications';

gameNotify.characterCreated(name);
gameNotify.statIncrease(stat, amount);
gameNotify.techniqueLearn(technique);
gameNotify.itemObtained(item, rarity);
gameNotify.cultivationBreakthrough(realm);
gameNotify.death(cause);
gameNotify.saveSuccess();
gameNotify.saveError();
gameNotify.networkError();
gameNotify.aiError();
```

## Files Fixed
- `src/components/CharacterCreation.tsx`

## Testing
- [x] Character name validation shows correct error
- [x] Gender selection warning shows correctly
- [x] Fate generation success notification works
- [x] Character creation success notification works
- [x] Save error notification works

## Prevention
Always check the notification API before using:
1. Use `notify.*` for generic UI feedback
2. Use `gameNotify.*` for game-specific events
3. Check `src/lib/notifications.ts` for available functions
