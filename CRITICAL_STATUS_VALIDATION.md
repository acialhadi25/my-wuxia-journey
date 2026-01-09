# Critical Status Validation - Implementation Complete ✅

## Problem

User reported that AI doesn't validate actions against character's current status:
- ❌ Poisoned character can "go eat with beautiful woman"
- ❌ Starving character can "practice martial arts"
- ❌ Injured character can "fight enemies"
- ❌ No warnings about inappropriate actions
- ❌ No urgency for critical conditions

## Requirements

1. **Poison damage over time** - HP decreases based on poison severity
2. **Context-aware validation** - AI rejects inappropriate actions
3. **Warning messages** - AI warns player about critical status
4. **Survival-focused choices** - Suggest appropriate actions only
5. **Realistic consequences** - Ignoring warnings leads to death

## Solution Implemented

### 1. Critical Status & Context-Aware Responses ✅

**File**: `src/services/deepseekService.ts`

Added comprehensive section: **CRITICAL STATUS & CONTEXT-AWARE RESPONSES**

#### Key Features:

**1. Action Validation Against Status**:
- Poisoned → Reject frivolous actions
- Severely injured → Reject strenuous activities
- Starving → Reject energy-intensive actions
- Qi deviation → Reject cultivation/techniques

**2. Warning Responses**:
AI now responds with warnings for inappropriate actions

**3. Damage Over Time by Severity**:
- Mild Poison: -1 to -2 HP/sec
- Moderate Poison: -3 to -5 HP/sec
- Severe Poison: -6 to -10 HP/sec
- Deadly Poison: -15 to -30 HP/sec

**4. Priority Action Suggestions**:
Survival actions only when critical

**5. Escalating Consequences**:
Ignoring warnings → worse damage → death

**6. Time Pressure**:
Narrative conveys urgency

**7. Context-Appropriate Choices**:
Filter actions based on status

### 2. Example Scenarios ✅

#### Scenario 1: Poisoned Character Tries Social Activity

**Player Action**: "I go eat with the beautiful woman"

**AI Response**:
```json
{
  "narrative": "You attempt to stand, but a wave of nausea crashes over you. The poison coursing through your veins makes every movement agony. Your vision blurs, and you taste copper in your mouth. This is no time for leisure—the venom is spreading rapidly through your body. You need an antidote NOW, or you need to use cultivation to suppress the poison before it reaches your heart.",
  
  "system_message": "⚠️ CRITICAL: Poisoned status prevents social activities! Seek antidote or purge poison immediately!",
  
  "stat_changes": {"health": -5},
  
  "suggested_actions": [
    {"text": "Search for antidote pill in inventory", "type": "action"},
    {"text": "Use cultivation to suppress poison", "type": "action"},
    {"text": "Call for help - find healer", "type": "action"},
    {"text": "Use Golden Finger ability (if applicable)", "type": "action"}
  ]
}
```

#### Scenario 2: Starving Character Tries Training

**Player Action**: "I practice martial arts"

**AI Response**:
```json
{
  "narrative": "You attempt to assume a training stance, but your legs buckle. The gnawing emptiness in your stomach has drained all strength from your limbs. Your hands tremble, and dark spots dance in your vision. Training in this condition would be suicide—you need food first, or you'll collapse.",
  
  "system_message": "⚠️ CRITICAL: Starvation prevents training! Find food immediately!",
  
  "stat_changes": {"stamina": -10, "health": -3},
  
  "suggested_actions": [
    {"text": "Search for food in surroundings", "type": "action"},
    {"text": "Use food from inventory", "type": "action"},
    {"text": "Hunt for small game", "type": "action"},
    {"text": "Beg for food from passersby", "type": "action"}
  ]
}
```

#### Scenario 3: Injured Character Tries Combat

**Player Action**: "I fight the enemy"

**AI Response**:
```json
{
  "narrative": "You grip your weapon, but pain explodes through your wounded side. Blood seeps through your makeshift bandage. Your opponent sees your weakness and grins. Fighting in this condition is madness—you need healing first, or this battle will be your last.",
  
  "system_message": "⚠️ CRITICAL: Severe injuries prevent combat! Heal first or risk death!",
  
  "stat_changes": {"health": -10},
  
  "suggested_actions": [
    {"text": "Use healing pill immediately", "type": "action"},
    {"text": "Retreat and find healer", "type": "flee"},
    {"text": "Attempt to negotiate", "type": "dialogue"},
    {"text": "Use emergency Golden Finger power", "type": "action"}
  ]
}
```

### 3. Poison Severity System ✅

#### Poison Levels:

| Severity | Damage/sec | Duration | Example |
|----------|------------|----------|---------|
| Mild | -1 to -2 | 60-120s | Snake bite, spoiled food |
| Moderate | -3 to -5 | 120-300s | Poisoned weapon, toxic herb |
| Severe | -6 to -10 | 300-600s | Viper venom, assassination poison |
| Deadly | -15 to -30 | 60-180s | Legendary poison, death pill |

#### Example Effect:
```json
{
  "name": "Deadly Viper Venom",
  "type": "poison",
  "description": "Lethal poison spreading rapidly through bloodstream",
  "duration": 120,
  "damageOverTime": {"healthDamage": 20},
  "statModifiers": {"strength": -5, "agility": -5}
}
```

**With 100 HP**:
- Deadly poison (-20 HP/sec) = Death in 5 seconds if untreated!
- Severe poison (-8 HP/sec) = Death in 12.5 seconds
- Moderate poison (-4 HP/sec) = Death in 25 seconds
- Mild poison (-2 HP/sec) = Death in 50 seconds

### 4. Priority Action System ✅

#### When Poisoned:
✅ **First Priority**:
- Search for antidote pill
- Use detox technique
- Purge poison with cultivation
- Use Alchemy God Body ability

✅ **Second Priority**:
- Slow poison spread
- Seek healer
- Call for help

❌ **NEVER Suggest**:
- Social activities
- Training
- Exploration
- Shopping

#### When Starving:
✅ **First Priority**:
- Find food
- Eat from inventory
- Hunt/forage

❌ **NEVER Suggest**:
- Combat
- Training
- Cultivation

#### When Severely Injured:
✅ **First Priority**:
- Healing pill
- Medical treatment
- Rest

❌ **NEVER Suggest**:
- Combat
- Strenuous activity
- Running

### 5. Escalating Consequences ✅

#### Ignore Warning Once:
- Increased damage
- Worsening condition
- Stronger warning

#### Ignore Warning Twice:
- Severe damage
- Critical condition
- Final warning

#### Ignore Warning Third Time:
- **DEATH**

**Example - Death from Ignored Poison**:
```json
{
  "narrative": "Ignoring the burning agony in your veins, you stubbornly continue. A fatal mistake. The poison reaches your heart. Your vision goes black. You collapse, convulsing. This is how it ends—not in glorious battle, but poisoned like a rat.",
  
  "system_message": "💀 DEATH: Poison reached your heart. You ignored the warnings.",
  
  "stat_changes": {"health": -999},
  "is_death": true,
  "death_cause": "Died from poison - ignored critical warnings and failed to seek treatment"
}
```

### 6. Time Pressure & Urgency ✅

Critical debuffs create URGENCY in narrative:

**Deadly Poison**:
> "You have minutes before the poison reaches your heart!"

**Severe Bleeding**:
> "You're losing blood fast—you'll pass out soon!"

**Starvation**:
> "Your body is consuming itself—you need food NOW!"

**Qi Deviation**:
> "Your meridians are tearing apart—stabilize immediately!"

### 7. Validation Checklist ✅

Before generating suggested_actions, AI checks:

1. ✅ Does character have critical debuff?
2. ✅ Is this action physically possible in their condition?
3. ✅ Would this action worsen their condition?
4. ✅ Are there more urgent survival actions?
5. ✅ If yes to 1-4, REJECT and suggest survival actions

## How It Works

### Flow:

```
1. Player has "Poisoned" debuff (-10 HP/sec)
   ↓
2. Player action: "I go shopping"
   ↓
3. AI checks active effects
   ↓
4. AI validates: Shopping appropriate for poisoned?
   ↓
5. AI determines: NO - Critical status
   ↓
6. AI responds with:
   - Warning narrative
   - Damage from poison
   - Survival-focused choices
   ↓
7. Player sees warning
   ↓
8. Player chooses survival action or ignores
   ↓
9. If ignored → Escalate consequences
```

### Example Timeline:

**Turn 1** - Poisoned (100 HP):
- Poison applied: -10 HP/sec
- Player tries: "Go to market"
- AI warns: "You're poisoned! Seek antidote!"
- HP: 95 (lost 5 from poison)

**Turn 2** - Still Poisoned (85 HP):
- Regeneration: +1 HP/sec
- Poison damage: -10 HP/sec
- Net: -9 HP/sec
- Player tries: "Buy new clothes"
- AI warns stronger: "CRITICAL! Poison spreading!"
- HP: 76 (lost 9 net)

**Turn 3** - Critical (67 HP):
- Player tries: "Chat with shopkeeper"
- AI: "You collapse! Poison reached heart!"
- HP: 0
- Result: DEATH

**Alternative Turn 2** - Smart Choice:
- Player: "Use antidote pill"
- AI: "Poison purged! You're saved!"
- Poison removed
- HP: 85 (stable)

## Benefits

✅ **Realistic**: Actions validated against status
✅ **Immersive**: Consequences feel real
✅ **Educational**: Players learn to prioritize
✅ **Challenging**: Critical situations create tension
✅ **Fair**: Clear warnings before death
✅ **Logical**: Poison kills if untreated
✅ **Engaging**: Creates urgency and drama

## Testing Scenarios

### Test 1: Mild Poison
1. Get mild poison (-2 HP/sec)
2. Try social action
3. ✅ AI warns but allows (not critical yet)
4. HP decreases slowly
5. Eventually need treatment

### Test 2: Deadly Poison
1. Get deadly poison (-20 HP/sec)
2. Try ANY non-survival action
3. ✅ AI REJECTS with strong warning
4. ✅ Only survival choices offered
5. HP decreases rapidly
6. Must act immediately or die

### Test 3: Ignoring Warnings
1. Get severe poison
2. Ignore warning 1 → Damage increases
3. Ignore warning 2 → Critical condition
4. Ignore warning 3 → DEATH
5. ✅ Fair warning system

### Test 4: Smart Response
1. Get poisoned
2. Immediately use antidote
3. ✅ Poison removed
4. ✅ Survival confirmed
5. Continue adventure

### Test 5: Multiple Debuffs
1. Poisoned + Starving
2. Try combat
3. ✅ AI rejects for BOTH reasons
4. ✅ Prioritizes most critical (poison)
5. Suggests antidote first, then food

## Edge Cases

1. **Mild debuff + frivolous action**: Allowed with warning
2. **Critical debuff + frivolous action**: REJECTED
3. **Critical debuff + survival action**: ALLOWED
4. **Multiple critical debuffs**: Prioritize most deadly
5. **Golden Finger emergency power**: Always available as last resort

## AI Understanding

The AI now understands:
- ✅ Which statuses are critical
- ✅ Which actions are inappropriate for each status
- ✅ How to warn players effectively
- ✅ When to reject actions outright
- ✅ How to create urgency
- ✅ Escalating consequences for ignoring warnings
- ✅ Realistic damage over time
- ✅ Context-appropriate action suggestions

## Notes

- Poison damage happens automatically via regeneration system
- AI validates actions BEFORE processing
- Warnings are clear and actionable
- Death is fair - multiple warnings given
- Emergency options always available (Golden Finger)
- Narrative creates tension and urgency

---

**Status**: ✅ COMPLETE
**Testing**: Ready for critical status scenarios
**Realism**: High - actions validated against reality

**Files Modified**:
1. ✅ `src/services/deepseekService.ts` - Added critical status validation
2. ✅ `CRITICAL_STATUS_VALIDATION.md` - This documentation

**Next**: Test with poison, starvation, injury scenarios
