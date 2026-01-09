# Combat System Design - Narrative Combat

## Overview

Narrative Combat System integrates seamlessly with the existing text-based gameplay. Combat happens within the narrative flow without breaking immersion.

## Core Concept

**NO separate combat interface** - Everything happens through enhanced narrative and smart action choices.

## How It Works

### 1. Combat Detection

AI detects combat situations automatically:
- Enemy encounters
- Ambushes
- Duels
- Sect battles
- Beast attacks

### 2. Combat Choices

When combat is detected, action choices automatically become combat-focused:

#### Choice Types:
1. **Technique Choices** 🗡️
   - Format: `[Technique Name] (Qi Cost) - Element`
   - Shows mastery level
   - Displays cooldown if active
   - Example: `Shadow Step (15 Qi) - Darkness [Mastery: 45%]`

2. **Item Choices** 💊
   - Format: `Use [Item Name] - Effect`
   - Shows quantity
   - Example: `Use Healing Pill (x3) - Restore 50 HP`

3. **Golden Finger Abilities** ⭐
   - Format: `[Ability Name] (Cost) - Golden Finger`
   - Only if awakened
   - Example: `Scan Enemy (Free) - System`

4. **Tactical Choices** 🛡️
   - Defend/Block
   - Dodge/Evade
   - Observe/Analyze
   - Flee/Retreat

### 3. Combat Flow

```
[Narrative]: Enemy appears → Describes situation
     ↓
[Choices]: Combat-focused actions appear
     ↓
[Player]: Selects action
     ↓
[AI]: Processes action, calculates results
     ↓
[Narrative]: Describes outcome in detail
     ↓
[Loop]: Until victory, defeat, or flee
```

### 4. Combat Mechanics

#### Damage Calculation:
```
Base Damage = Technique Power + Stat Bonus
Final Damage = Base × Mastery Multiplier × Element Bonus × Crit
```

#### Stat Influences:
- **Strength**: Physical technique damage
- **Agility**: Dodge chance, attack speed
- **Intelligence**: Mystic technique damage, Qi efficiency
- **Luck**: Critical hit chance, loot quality

#### Resource Usage:
- **Qi**: For techniques (spiritual)
- **Stamina**: For physical actions (dodging, blocking)
- **Health**: Damage taken

#### Status Effects:
- Poison, Bleeding, Burning (DoT)
- Stun, Freeze, Paralysis (disable)
- Buffs, Debuffs (stat modifiers)

### 5. Victory/Defeat

**Victory**:
- Gain experience (cultivation progress)
- Loot items
- Increase technique mastery
- Karma changes
- Reputation changes

**Defeat**:
- Health reaches 0
- Option to use emergency items
- Golden Finger emergency power
- Death or severe injury

**Flee**:
- Stamina cost
- Agility check
- Karma penalty if dishonorable
- Possible pursuit

## AI Combat Prompt Structure

The AI will be instructed to:

1. **Detect Combat Context**
   - Recognize hostile situations
   - Identify enemy type and strength
   - Set combat flag

2. **Generate Combat Choices**
   - List available techniques with costs
   - Suggest usable items
   - Include Golden Finger abilities
   - Provide tactical options

3. **Calculate Combat Results**
   - Apply technique effects
   - Calculate damage
   - Apply status effects
   - Update resources (Qi, Stamina, Health)

4. **Narrate Combat**
   - Describe attacks vividly
   - Show technique effects
   - Describe enemy reactions
   - Build tension

5. **Track Combat State**
   - Enemy health (estimated)
   - Player resources
   - Active effects
   - Turn count

## Example Combat Sequence

### Turn 1: Enemy Appears
```
[Narrative]:
"A masked cultivator blocks your path, his hand resting on a jade sword. 
Killing intent radiates from him like a physical force. His cultivation 
seems to be at Foundation Establishment, 3rd layer—stronger than you.

'Hand over the Azure Dragon Pill,' he demands, 'or die here.'"

[Choices]:
🗡️ Thunder Palm (30 Qi) - Your strongest technique
⚡ Shadow Step (15 Qi) - Dodge and counter [Mastery: 45%]
💊 Use Qi Recovery Pill (x2) - Restore 50 Qi
🌟 Scan Enemy (Free) - System ability
🛡️ Defensive Stance - Reduce incoming damage
💬 Attempt Negotiation - Charisma check
🏃 Flee - Agility check (dishonorable)
```

### Turn 2: Player Uses Technique
```
[Player Action]: Thunder Palm

[Narrative]:
"You channel Qi into your palm, electricity crackling between your fingers. 
With a roar, you thrust forward. The masked cultivator's eyes widen—he 
didn't expect such power from a Qi Condensation cultivator!

Your Thunder Palm strikes his hastily raised guard. Lightning explodes 
on impact, sending him skidding back three meters. His sleeve is charred, 
and you see blood trickling from his mouth.

'Impossible!' he gasps. 'How can a mere Qi Condensation—'

But he's already moving, his jade sword unsheathed and glowing with 
deadly sword Qi."

[System Message]: Thunder Palm Mastery +5%, Enemy HP -120, Your Qi -30

[Choices]:
🗡️ Thunder Palm (30 Qi) - Strike again while he's off-balance
⚡ Shadow Step (15 Qi) - Evade his sword strike
💊 Use Healing Pill (x3) - Restore 50 HP
🌟 Copycat Eye (10 Qi) - Observe his sword technique
🛡️ Block with Qi Shield - Stamina cost
```

### Turn 3: Enemy Defeated
```
[Narrative]:
"Your Shadow Step activates just as his sword descends. You blur into 
darkness, reappearing behind him. Before he can turn, your palm strikes 
his back with devastating force.

He coughs blood, his jade sword clattering to the ground. 'The Azure 
Dragon Sect... will avenge me...' he gasps before collapsing.

You stand victating, breathing heavily. Your first real life-or-death 
battle—and you survived."

[System Message]: 
Victory! Cultivation +15%, Thunder Palm Mastery +10%, Shadow Step Mastery +8%
Loot: Jade Sword (Rare), 50 Spirit Stones, Azure Sect Token
Karma -5 (killed a human)

[Choices]:
🔍 Search the body thoroughly
💰 Take valuables and leave quickly
🏃 Flee before reinforcements arrive
🙏 Bury the body (restore some karma)
```

## Implementation Files

### 1. Combat AI Prompt
**File**: `src/services/deepseekService.ts`
- Add COMBAT SYSTEM section
- Combat detection rules
- Damage calculation formulas
- Choice generation logic

### 2. Combat Choice Generator
**File**: `src/services/combatService.ts` (NEW)
- `generateCombatChoices()` - Create technique/item choices
- `formatTechniqueChoice()` - Format technique as choice
- `formatItemChoice()` - Format item as choice
- `formatGoldenFingerChoice()` - Format ability as choice

### 3. Combat State Tracking
**File**: `src/types/game.ts`
- Add `CombatState` type
- Track enemy info
- Track combat turn
- Track used techniques (cooldowns)

### 4. Enhanced Action Input
**File**: `src/components/ActionInput.tsx`
- Visual indicators for combat choices
- Show Qi/Stamina costs
- Show cooldowns
- Disable unavailable choices

## Benefits of Narrative Combat

✅ **Immersive** - Never breaks story flow
✅ **Simple** - No complex UI needed
✅ **Mobile-Friendly** - Works perfectly on small screens
✅ **AI-Powered** - Leverages Deepseek's narrative strength
✅ **Flexible** - Can handle any combat scenario
✅ **Fast** - Quick to implement
✅ **Scalable** - Easy to add new techniques/items

## Next Steps

1. ✅ Create Golden Finger Panel
2. ⚠️ Update AI prompt with combat system
3. ⚠️ Create combat service for choice generation
4. ⚠️ Add combat state tracking
5. ⚠️ Enhance ActionInput with combat indicators
6. ⚠️ Test combat scenarios

---

**Status**: Phase 1 Complete (Golden Finger Panel)
**Next**: Implement Combat AI Prompt
