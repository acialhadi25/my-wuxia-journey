# Stamina System Implementation

## Overview

Implemented a stamina system separate from Qi to represent physical energy vs spiritual energy.

## Concept

**Stamina (Physical Energy)**:
- Used for physical activities: running, fighting, digging, climbing
- Regenerates faster than Qi
- Affected by **Strength** stat
- Formula: Max Stamina = 100 + (Strength × 5)
- Regen Rate = Base + (Strength × 0.1/sec)

**Qi (Spiritual Energy)**:
- Used for cultivation techniques and mystical skills
- Regenerates slower, requires meditation
- Affected by **Cultivation Realm**
- Not affected by physical stats

## Implementation Details

### 1. Type Definitions ✅
**File**: `src/types/game.ts`

Added to Character type:
```typescript
stamina: number;
maxStamina: number;
```

Added helper function:
```typescript
calculateMaxStamina(strength: number): number
// Returns: 100 + (strength × 5)
```

Updated ActiveEffect type:
```typescript
regenModifiers?: {
  staminaRegen?: number; // NEW
}
damageOverTime?: {
  staminaDrain?: number; // NEW
}
maxStatModifiers?: {
  maxStamina?: number; // NEW
}
```

### 2. Regeneration Service ✅
**File**: `src/services/regenerationService.ts`

Updated regeneration rates (per second):
| Realm | Health | Qi | Stamina |
|-------|--------|-----|---------|
| Mortal | 0.1 | 0.2 | 1.0 |
| Qi Condensation | 0.2 | 0.5 | 1.5 |
| Foundation Establishment | 0.3 | 1.0 | 2.0 |
| Core Formation | 0.5 | 2.0 | 2.5 |
| Nascent Soul | 1.0 | 4.0 | 3.0 |
| Spirit Severing | 2.0 | 8.0 | 4.0 |
| Dao Seeking | 4.0 | 15.0 | 5.0 |
| Immortal Ascension | 10.0 | 30.0 | 10.0 |

**Strength Bonus**:
- Each point of Strength adds 0.1 stamina/sec to regen rate
- Example: 15 Strength = +1.5 stamina/sec bonus

### 3. Character Creation ✅
**File**: `src/components/CharacterCreation.tsx`

Initial stamina calculation:
```typescript
stamina: 100 + (baseStats.strength * 5),
maxStamina: 100 + (baseStats.strength * 5),
```

Example:
- Strength 10 → 150 stamina
- Strength 15 → 175 stamina
- Strength 20 → 200 stamina

### 4. Database Integration ✅
**Files**: `src/services/gameService.ts`, `src/components/GameScreen.tsx`

Added stamina fields to:
- `saveCharacterToDatabase()` - Initial save
- `updateCharacterInDatabase()` - Updates
- GameScreen processAIResponse - Save after actions

### 5. UI Display ✅
**File**: `src/components/StatusPanel.tsx`

Completed:
- Stamina bar with yellow/orange gradient color
- Current/Max stamina display
- Regeneration rate display with strength bonus
- Shows "+X.X/s (Strength bonus)" below stamina bar

### 6. AI System Prompt ✅
**File**: `src/services/deepseekService.ts`

Added comprehensive stamina documentation to AI prompt:
- Stamina vs Qi distinction (physical vs spiritual)
- Stamina costs for different activity levels
- Exhaustion mechanics when stamina is low
- Examples of stamina usage in stat_changes
- Updated CHARACTER CONTEXT to show current stamina
- Updated RESPONSE FORMAT to include stamina field
- Updated effects system to include stamina modifiers

### 7. Stat Changes Processing ✅
**File**: `src/services/gameService.ts`

Updated `applyStatChanges` function:
- Calculates new strength first
- Recalculates max stamina based on new strength (100 + strength × 5)
- Applies stamina changes with proper clamping (0 to max)
- Returns updated character with stamina values

Run this SQL in Supabase:

```sql
-- Add stamina columns to characters table
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS stamina INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_stamina INTEGER DEFAULT 100;

COMMENT ON COLUMN characters.stamina IS 'Current physical energy (stamina)';
COMMENT ON COLUMN characters.max_stamina IS 'Maximum stamina capacity (affected by strength)';
```

## Usage Examples

### For AI to Consume Stamina

**Physical Action**:
```json
{
  "stat_changes": {
    "stamina": -20
  },
  "narrative": "You sprint across the courtyard, your muscles burning..."
}
```

**Stamina Drain Effect**:
```json
{
  "effects_to_add": [{
    "name": "Exhaustion",
    "type": "debuff",
    "description": "Physically exhausted from overexertion",
    "duration": 300,
    "damageOverTime": {"staminaDrain": 2},
    "statModifiers": {"strength": -2, "agility": -3}
  }]
}
```

**Stamina Boost**:
```json
{
  "effects_to_add": [{
    "name": "Warrior's Vigor",
    "type": "buff",
    "description": "Enhanced physical endurance",
    "duration": 600,
    "regenModifiers": {"staminaRegen": 3},
    "maxStatModifiers": {"maxStamina": 50}
  }]
}
```

## Next Steps

1. ✅ Add stamina to Character type
2. ✅ Update regeneration service
3. ✅ Update character creation
4. ✅ Update database save/load
5. ✅ Add stamina bar to StatusPanel UI
6. ✅ Run database migration
7. ✅ Update AI prompt to use stamina for physical actions
8. ✅ Update applyStatChanges to handle stamina
9. ⚠️ Test stamina regeneration in-game
10. ⚠️ Test strength bonus to stamina

## Testing Checklist

- [ ] Stamina initializes correctly based on strength
- [ ] Stamina regenerates automatically
- [ ] Strength increases max stamina
- [ ] Strength increases regen rate
- [ ] Stamina bar displays correctly
- [ ] Effects can modify stamina regen
- [ ] Effects can drain stamina over time
- [ ] Stamina persists across sessions
- [ ] AI uses stamina for physical actions
- [ ] Stamina changes are saved to database

## Design Notes

**Why Separate Stamina from Qi?**
1. **Realism**: Physical and spiritual energy are different
2. **Gameplay**: More resource management depth
3. **Balance**: Physical actions don't drain cultivation energy
4. **Immersion**: Makes sense in wuxia/xianxia context

**Stamina vs Qi Usage**:
- **Stamina**: Running, fighting, climbing, swimming, digging
- **Qi**: Techniques, flying, healing, cultivation breakthroughs
- **Both**: Some advanced techniques might use both

**Regeneration Philosophy**:
- Stamina: Fast regen (physical rest)
- Qi: Slow regen (requires meditation/cultivation)
- Health: Slowest regen (requires time/medicine)
