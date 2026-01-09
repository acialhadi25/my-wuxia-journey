# Regeneration & Effects System Implementation

## Overview

Implementasi sistem realtime regeneration, buffs/debuffs, dan effects yang komprehensif untuk game. Sistem ini mencakup:
- Regenerasi HP dan Qi berdasarkan cultivation realm
- Buff effects (temporary & permanent)
- Debuff effects (poison, curse, qi deviation, injuries)
- Damage over time
- Stat modifiers
- Effect stacking
- Effect duration tracking

## Architecture

### 1. Type Definitions (src/types/game.ts)

#### New Types:
```typescript
export type EffectType = 'buff' | 'debuff' | 'poison' | 'curse' | 'blessing' | 'qi_deviation';

export type ActiveEffect = {
  id: string;
  name: string;
  type: EffectType;
  description: string;
  icon?: string;
  duration: number; // seconds, -1 for permanent
  startTime: number; // timestamp
  statModifiers?: { strength, agility, intelligence, charisma, luck, cultivation };
  regenModifiers?: { healthRegen, qiRegen }; // per second
  damageOverTime?: { healthDamage, qiDrain }; // per second
  maxStatModifiers?: { maxHealth, maxQi };
  isPermanent?: boolean;
  stackable?: boolean;
  stacks?: number;
};
```

#### Updated Character Type:
```typescript
export type Character = {
  // ... existing fields
  activeEffects?: ActiveEffect[];
  lastRegeneration?: number; // timestamp
};
```

### 2. Regeneration Service (src/services/regenerationService.ts)

#### Regeneration Rates by Realm:
| Realm | HP/s | Qi/s |
|-------|------|------|
| Mortal | 0.1 | 0.2 |
| Qi Condensation | 0.2 | 0.5 |
| Foundation Establishment | 0.3 | 1.0 |
| Core Formation | 0.5 | 2.0 |
| Nascent Soul | 1.0 | 4.0 |
| Spirit Severing | 2.0 | 8.0 |
| Dao Seeking | 4.0 | 15.0 |
| Immortal Ascension | 10.0 | 30.0 |

#### Key Methods:
```typescript
// Calculate total regen (base + effects)
calculateRegeneration(character): { health, qi }

// Apply regeneration over deltaTime
applyRegeneration(character, deltaTime): Character

// Update and remove expired effects
updateEffects(character): Character

// Calculate stat modifiers from effects
calculateStatModifiers(character): { strength, agility, ... }

// Get effective stats (base + modifiers)
getEffectiveStats(character): { strength, agility, ... }

// Add/remove effects
addEffect(character, effect): Character
removeEffect(character, effectName): Character

// Check effect status
hasEffect(character, effectName): boolean
getEffectRemainingTime(character, effectName): number
```

### 3. Effects Library (src/data/effects.ts)

#### Buff Effects:

**Temporary Pills:**
- `STRENGTH_PILL`: +5 STR for 5 minutes
- `AGILITY_PILL`: +5 AGI for 5 minutes
- `INTELLIGENCE_PILL`: +5 INT for 5 minutes

**Permanent Pills:**
- `FOUNDATION_PILL`: +10 Cultivation (permanent)
- `BODY_TEMPERING_PILL`: +3 STR, +20 Max HP (permanent)

**Regeneration:**
- `HEALING_SALVE`: +2.0 HP/s for 1 minute
- `QI_RECOVERY_PILL`: +3.0 Qi/s for 2 minutes

**Blessings:**
- `ELDER_BLESSING`: +3 all stats, +5 luck for 10 minutes
- `HEAVENLY_FORTUNE`: +10 luck for 30 minutes

#### Debuff Effects:

**Poisons:**
- `WEAK_POISON`: -0.5 HP/s for 2 minutes (stackable)
- `DEADLY_POISON`: -2.0 HP/s, -1.0 Qi/s, -5 STR/AGI for 1 minute (stackable)
- `PARALYSIS_POISON`: -10 AGI, -3 STR for 3 minutes

**Qi Deviation:**
- `QI_DEVIATION_MINOR`: -5 Cultivation, -0.5 Qi/s for 5 minutes
- `QI_DEVIATION_MAJOR`: -5 all stats, -10 Cultivation, -0.3 HP/s, -1.0 Qi/s for 10 minutes

**Curses:**
- `WEAKNESS_CURSE`: -8 STR, -3 AGI for 15 minutes
- `MISFORTUNE_CURSE`: -10 Luck for 30 minutes
- `ETERNAL_CURSE`: -5 STR/AGI, -20 Max HP (permanent)

**Injuries:**
- `INTERNAL_INJURY`: -0.5 HP/s, -3 STR for 10 minutes (stackable)
- `MERIDIAN_DAMAGE`: -1.0 Qi/s, -5 Cultivation for 15 minutes (stackable)
- `EXHAUSTION`: -5 STR/AGI, -3 INT, -0.3 HP/s, -0.5 Qi/s for 5 minutes

### 4. Regeneration Hook (src/hooks/useRegeneration.ts)

```typescript
useRegeneration(
  character: Character,
  onUpdate: (character: Character) => void,
  enabled: boolean = true
)
```

**Features:**
- Updates every 1 second
- Calculates delta time for accurate regeneration
- Updates effects (removes expired)
- Applies regeneration
- Only triggers onUpdate if there are changes

**Usage:**
```typescript
const { isRegenerating } = useRegeneration(
  character,
  (updated) => onUpdateCharacter(updated),
  true // enabled
);
```

### 5. Active Effects Display Component

#### Features:
- **Compact Mode**: Small badges with icons and timers
- **Full Mode**: Detailed cards with progress bars
- **Real-time Updates**: Countdown timers update every second
- **Color Coding**: Different colors for each effect type
- **Effect Details**: Shows all modifiers and damage
- **Remove Button**: Optional button to remove effects (for testing)

#### Color Scheme:
- **Buff**: Green (jade)
- **Blessing**: Gold
- **Debuff**: Red
- **Poison**: Green (toxic)
- **Curse**: Purple
- **Qi Deviation**: Orange

#### UI Elements:
```
┌─────────────────────────────────────┐
│ 💊 Strength Enhancement Pill        │
│ Temporarily increases strength      │
│                                     │
│ [Progress Bar ████████░░░░] 2m 30s │
│                                     │
│ [strength: +5] [HP Regen: +2.0/s]  │
└─────────────────────────────────────┘
```

### 6. Status Panel Integration

#### New Sections:
1. **Regeneration Info**:
   ```
   Regeneration
   HP/s: +0.5    Qi/s: +1.2
   ```

2. **Active Effects**:
   - Shows all active buffs/debuffs
   - Real-time countdown
   - Effect details

3. **Modified Stats Display**:
   ```
   Strength: 15 (+5)
   Agility: 12 (-3)
   ```

## Usage Examples

### Adding a Buff (Pill Consumption):
```typescript
import { RegenerationService } from '@/services/regenerationService';
import { BUFF_EFFECTS, createEffect } from '@/data/effects';

// Create effect from template
const strengthBuff = createEffect(BUFF_EFFECTS.STRENGTH_PILL);

// Add to character
const updatedCharacter = RegenerationService.addEffect(character, strengthBuff);

// Notify player
gameNotify.itemObtained('Strength Enhancement Pill', 'common');
```

### Adding a Debuff (Poison):
```typescript
import { DEBUFF_EFFECTS, createEffect } from '@/data/effects';

// Create poison effect
const poison = createEffect(DEBUFF_EFFECTS.DEADLY_POISON);

// Add to character
const updatedCharacter = RegenerationService.addEffect(character, poison);

// Notify player
notify.warning('Poisoned!', 'You have been poisoned by a deadly toxin!');
```

### Custom Effect:
```typescript
const customEffect: ActiveEffect = {
  id: crypto.randomUUID(),
  name: 'Dragon Blood Infusion',
  type: 'buff',
  description: 'Infused with dragon blood, greatly enhancing all attributes',
  icon: '🐉',
  duration: 600, // 10 minutes
  startTime: Date.now(),
  statModifiers: {
    strength: 10,
    agility: 10,
    intelligence: 5,
    cultivation: 15,
  },
  regenModifiers: {
    healthRegen: 5.0,
    qiRegen: 5.0,
  },
  maxStatModifiers: {
    maxHealth: 50,
    maxQi: 100,
  },
  isPermanent: false,
  stackable: false,
};

const updatedCharacter = RegenerationService.addEffect(character, customEffect);
```

### Checking Effects:
```typescript
// Check if character has effect
if (RegenerationService.hasEffect(character, 'Deadly Poison')) {
  console.log('Character is poisoned!');
}

// Get remaining time
const remaining = RegenerationService.getEffectRemainingTime(character, 'Deadly Poison');
console.log(`Poison will expire in ${remaining} seconds`);

// Get effective stats
const effectiveStats = RegenerationService.getEffectiveStats(character);
console.log(`Effective strength: ${effectiveStats.strength}`);
```

## Integration with GameScreen

### Step 1: Add Regeneration Hook
```typescript
import { useRegeneration } from '@/hooks/useRegeneration';

// In GameScreen component
useRegeneration(
  character,
  (updatedCharacter) => {
    onUpdateCharacter(updatedCharacter);
    // Optionally save to database
    if (characterId) {
      updateCharacterInDatabase(characterId, {
        health: updatedCharacter.health,
        qi: updatedCharacter.qi,
        active_effects: updatedCharacter.activeEffects,
      });
    }
  },
  true // enabled
);
```

### Step 2: Handle AI Effects
When AI response includes effects:
```typescript
// In processAIResponse
if (response.effects_to_add) {
  for (const effectName of response.effects_to_add) {
    const effectTemplate = getEffectByName(effectName);
    if (effectTemplate) {
      const effect = createEffect(effectTemplate);
      updatedCharacter = RegenerationService.addEffect(updatedCharacter, effect);
    }
  }
}
```

### Step 3: Handle Item Effects
When consuming items:
```typescript
// When using a pill
const handleUsePill = (pillName: string) => {
  // Find effect for this pill
  const effectTemplate = getEffectByName(pillName);
  if (effectTemplate) {
    const effect = createEffect(effectTemplate);
    const updated = RegenerationService.addEffect(character, effect);
    onUpdateCharacter(updated);
    
    // Remove pill from inventory
    // ... inventory logic
  }
};
```

## Database Schema Updates

### Characters Table:
```sql
ALTER TABLE characters
ADD COLUMN active_effects JSONB DEFAULT '[]',
ADD COLUMN last_regeneration BIGINT;
```

### Storing Effects:
```typescript
// Save to database
await updateCharacterInDatabase(characterId, {
  active_effects: character.activeEffects || [],
  last_regeneration: character.lastRegeneration || Date.now(),
});

// Load from database
const character: Character = {
  // ... other fields
  activeEffects: data.active_effects || [],
  lastRegeneration: data.last_regeneration || Date.now(),
};
```

## AI Integration

### Update DeepseekResponse Type:
```typescript
export type DeepseekResponse = {
  // ... existing fields
  effects_to_add?: string[]; // Effect names to add
  effects_to_remove?: string[]; // Effect names to remove
};
```

### Update System Prompt:
```
EFFECTS SYSTEM:
You can add or remove effects on the character:

effects_to_add: ["Weak Poison", "Internal Injury"]
effects_to_remove: ["Strength Enhancement Pill"]

Available Effects:
- Buffs: Strength Pill, Agility Pill, Intelligence Pill, Healing Salve, Qi Recovery Pill
- Debuffs: Weak Poison, Deadly Poison, Paralysis Poison
- Qi Deviation: Minor Qi Deviation, Major Qi Deviation
- Curses: Weakness Curse, Misfortune Curse
- Injuries: Internal Injury, Meridian Damage, Exhaustion

Use effects when:
- Character consumes pills/medicine
- Character is poisoned in combat
- Character suffers qi deviation from failed breakthrough
- Character is cursed by enemies
- Character is injured in battle
```

## Testing Checklist

- [ ] Regeneration works correctly for each realm
- [ ] Effects are added successfully
- [ ] Effects expire after duration
- [ ] Permanent effects don't expire
- [ ] Stackable effects stack correctly
- [ ] Non-stackable effects refresh duration
- [ ] Stat modifiers apply correctly
- [ ] Damage over time works
- [ ] Regeneration modifiers work
- [ ] Effects display shows correct info
- [ ] Timers count down correctly
- [ ] Effects can be removed
- [ ] Database saves/loads effects
- [ ] Performance is acceptable (1s interval)

## Performance Considerations

- **Update Interval**: 1 second (configurable)
- **Delta Time**: Accurate regeneration based on actual time passed
- **Conditional Updates**: Only update if values changed
- **Effect Cleanup**: Expired effects removed automatically
- **Optimized Calculations**: Cached where possible

## Future Enhancements

1. **Effect Resistance**: Characters can resist certain effects based on stats
2. **Effect Immunity**: Some effects make you immune to others
3. **Effect Synergy**: Certain effects combo for bonus effects
4. **Effect Cleansing**: Items/techniques that remove debuffs
5. **Effect Amplification**: Some effects amplify others
6. **Visual Effects**: Particle effects for active buffs/debuffs
7. **Sound Effects**: Audio cues for effect application/expiration
8. **Effect History**: Track effect history for analytics
9. **Effect Achievements**: Achievements for surviving certain effects
10. **Effect Crafting**: Combine effects to create new ones

## Notes

- Regeneration runs client-side for smooth UX
- Effects are saved to database periodically
- On reconnect, effects are recalculated based on elapsed time
- Permanent effects persist across sessions
- Effect stacking is controlled per-effect
- Damage over time can kill the character
- Effects can modify max stats (requires recalculation)
