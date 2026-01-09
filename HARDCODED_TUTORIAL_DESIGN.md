# Hardcoded Tutorial System - Complete Design

## Philosophy

**Tutorial = Hardcoded Story Template**
- No AI generation during tutorial (steps 1-15)
- Pre-written narrative for each Golden Finger
- Consistent, polished experience
- AI takes over AFTER tutorial completes

## Tutorial Flow (15 Steps)

### 📖 CHAPTER 1: SURVIVAL (Steps 1-5)
**Theme**: Basic survival mechanics

#### Step 1: Awakening - Status Effects Introduction
**Dao Master**: "Welcome, young cultivator. I am the Dao Master. Notice the red debuff 'Kelaparan Parah' - status effects can help or harm you."
**Narrative**: {Character} wakes up in {location based on origin}, weak and starving.
**Action**: [Rasakan kondisi tubuh yang lemah]
**Mechanics Taught**: 
- Active Effects Display
- Debuff concept
- Health drain over time

---

#### Step 2: Inventory Discovery
**Dao Master**: "You carry items with you. Click the 📦 Inventory button to see what you have."
**Narrative**: {Character} remembers having emergency supplies.
**Action**: [Cari barang bawaan]
**Mechanics Taught**:
- Inventory button location
- Inventory panel UI
- Item categories

**Auto-Action**: Inventory panel opens, highlight food item

---

#### Step 3: Item Usage
**Dao Master**: "Click on the food item to consume it. Watch your health restore and the hunger effect disappear."
**Narrative**: {Character} finds dried bread and water.
**Action**: [Makan roti kering]
**Mechanics Taught**:
- How to use items
- Item effects (health/stamina restore)
- Effect removal
- Item consumption

**Auto-Action**: 
- Consume "Roti Kering" (+20 HP, +10 Stamina)
- Remove "Kelaparan Parah" effect
- Show before/after comparison

---

#### Step 4: Status Panel
**Dao Master**: "Good! Now click 👤 Status to see your complete character information."
**Narrative**: {Character} feels strength returning.
**Action**: [Periksa kondisi diri]
**Mechanics Taught**:
- Status panel location
- Character stats (STR, AGI, INT, CHA, LUCK)
- Health/Qi/Stamina bars
- Cultivation realm

**Auto-Action**: Status panel opens, highlight key stats

---

#### Step 5: Regeneration System
**Dao Master**: "Notice your stamina slowly regenerating? Rest and meditation restore your energy over time."
**Narrative**: {Character} sits down to catch their breath.
**Action**: [Beristirahat sejenak]
**Mechanics Taught**:
- Passive regeneration
- Stamina regen rate
- Health regen (when not in combat)
- Time passage

**Auto-Action**: 
- Wait 5 seconds
- Show stamina regenerating
- Add "Resting" buff (+5 stamina regen/s for 30s)

---

### ⚔️ CHAPTER 2: COMBAT BASICS (Steps 6-9)

#### Step 6: Enemy Encounter
**Dao Master**: "Danger approaches! A wild beast senses your weakness. Prepare for combat."
**Narrative**: A hungry wolf emerges from the shadows, growling.
**Action**: [Bersiap menghadapi serigala]
**Mechanics Taught**:
- Combat initiation
- Enemy stats display
- Threat assessment

**Auto-Action**: 
- Spawn "Hungry Wolf" (HP: 30, ATK: 5)
- Show enemy info
- Enter combat mode

---

#### Step 7: Basic Attack
**Dao Master**: "Attack with your basic strike. Combat uses stamina - watch your green bar!"
**Narrative**: The wolf lunges forward!
**Action**: [Serang dengan tangan kosong]
**Mechanics Taught**:
- Basic attack mechanics
- Stamina cost
- Damage calculation
- Combat log

**Auto-Action**:
- Deal 8 damage to wolf
- Consume 5 stamina
- Wolf counterattacks (3 damage)
- Show combat calculations

---

#### Step 8: Techniques Introduction
**Dao Master**: "You know a basic technique! Click ⚔️ Techniques to see your skills."
**Narrative**: {Character} remembers training from childhood.
**Action**: [Ingat teknik dasar]
**Mechanics Taught**:
- Techniques panel
- Technique list
- Qi cost
- Technique effects

**Auto-Action**: 
- Techniques panel opens
- Highlight "Basic Palm Strike" (10 Qi, 15 damage)
- Show technique description

---

#### Step 9: Using Techniques
**Dao Master**: "Use your technique to finish the wolf! Techniques are powerful but cost Qi."
**Narrative**: {Character} channels Qi into their palm.
**Action**: [Gunakan Basic Palm Strike]
**Mechanics Taught**:
- How to use techniques
- Qi consumption
- Technique damage
- Combat victory

**Auto-Action**:
- Use "Basic Palm Strike"
- Deal 15 damage to wolf (wolf defeated)
- Consume 10 Qi
- Show victory message
- Gain 10 XP, 5 copper coins

---

### ✨ CHAPTER 3: CULTIVATION (Steps 10-12)

#### Step 10: Cultivation Panel
**Dao Master**: "You've gained experience! Click 🌟 Cultivation to see your progress on the path of immortality."
**Narrative**: {Character} feels Qi flowing stronger.
**Action**: [Rasakan aliran Qi]
**Mechanics Taught**:
- Cultivation panel
- Cultivation progress bar
- Realm system
- Breakthrough concept

**Auto-Action**:
- Cultivation panel opens
- Show progress: 15/100 to next realm
- Explain realm benefits

---

#### Step 11: Meditation
**Dao Master**: "Meditate to cultivate Qi. This is how you grow stronger and advance through realms."
**Narrative**: {Character} sits in lotus position.
**Action**: [Bermeditasi untuk kultivasi]
**Mechanics Taught**:
- Meditation mechanics
- Qi cultivation
- Cultivation progress gain
- Time investment

**Auto-Action**:
- Add "Meditating" buff
- Gain +20 cultivation progress (35/100)
- Restore 20 Qi
- Time passes: 1 hour

---

#### Step 12: Breakthrough Preview
**Dao Master**: "When you reach 100%, you can breakthrough to the next realm. Each realm grants permanent stat increases!"
**Narrative**: {Character} understands the path ahead.
**Action**: [Pahami jalan kultivasi]
**Mechanics Taught**:
- Breakthrough requirements
- Realm benefits
- Stat increases per realm
- Long-term progression

**Auto-Action**:
- Show realm chart
- Highlight next realm benefits
- Show stat preview

---

### 🌟 CHAPTER 4: GOLDEN FINGER (Steps 13-14)

#### Step 13: Golden Finger Awakening
**Dao Master**: "Something ancient awakens within you... This is your Golden Finger - a unique power that defies heaven's will!"
**Narrative**: {Unique narrative per Golden Finger - see templates below}
**Action**: [Rasakan kekuatan yang terbangun]
**Mechanics Taught**:
- Golden Finger concept
- Unique ability
- Special mechanics
- Power activation

**Auto-Action**:
- Golden Finger awakens (goldenFingerUnlocked = true)
- Show awakening animation
- Achievement: "Golden Finger Awakened"
- Add Golden Finger passive effects

---

#### Step 14: Golden Finger Panel
**Dao Master**: "Click ✨ Golden Finger to learn about your unique power and how to use it."
**Narrative**: {Character} feels the power coursing through them.
**Action**: [Pelajari kekuatan unik]
**Mechanics Taught**:
- Golden Finger panel
- Ability description
- Usage conditions
- Cooldowns/costs

**Auto-Action**:
- Golden Finger panel opens
- Highlight ability details
- Show usage examples
- Explain limitations

---

### 🧠 CHAPTER 5: ADVANCED FEATURES (Step 15)

#### Step 15: Memory System & Tutorial Complete
**Dao Master**: "Finally, the 🧠 Memory system records important events. Your journey is now truly beginning. Go forth and forge your legend!"
**Narrative**: {Character} stands ready, understanding their path.
**Action**: [Melangkah ke dunia kultivasi]
**Mechanics Taught**:
- Memory panel
- Event recording
- Memory importance
- Long-term tracking

**Auto-Action**:
- Memory panel opens briefly
- Show tutorial completion memory
- Achievement: "Tutorial Complete"
- Unlock free exploration
- **SWITCH TO AI GENERATION**

---

## Golden Finger Awakening Templates (Step 13)

### Template 1: System/Grandpa Type
```typescript
{
  "Heavenly Demon Body": {
    narrative_id: "Darah hitam mengalir dari luka {name}, tapi alih-alih melemah, {pronoun} merasakan kekuatan yang mengerikan membanjiri tubuh. Setiap tetes darah yang tumpah membuat {pronoun} lebih kuat. Ini adalah Tubuh Iblis Surgawi - kekuatan yang tumbuh dari pembunuhan.",
    narrative_en: "Black blood flows from {name}'s wound, but instead of weakening, {pronoun} feels terrifying power flooding through. Each drop of spilled blood makes {pronoun} stronger. This is the Heavenly Demon Body - power that grows from slaughter.",
    effect: "Gain cultivation from killing. Dark techniques cost less Qi.",
    awakening_bonus: {
      stat_changes: { strength: 2, intelligence: 1 },
      new_technique: "Dark Palm Strike",
      special_effect: "Blood Thirst"
    }
  },
  
  "Copycat Eye": {
    narrative_id: "Mata {name} tiba-tiba berubah - iris berputar dengan pola aneh. {pronoun} dapat MELIHAT aliran Qi, memahami teknik hanya dengan mengamati. Ini adalah Mata Peniru - kekuatan untuk mencuri teknik apapun.",
    narrative_en: "{name}'s eyes suddenly change - irises spinning with strange patterns. {pronoun} can SEE Qi flow, understand techniques just by observing. This is the Copycat Eye - power to steal any technique.",
    effect: "Copy techniques by observing them in combat.",
    awakening_bonus: {
      stat_changes: { intelligence: 3, agility: 1 },
      new_technique: "Qi Sense",
      special_effect: "Technique Analysis"
    }
  },
  
  "Grandpa Ring": {
    narrative_id: "Cincin tua di jari {name} bersinar. Suara tua dan bijaksana bergema di pikiran: 'Akhirnya kau bangun, murid. Aku adalah Guru Abadi yang terjebak dalam cincin ini. Biarkan aku membimbingmu ke puncak kultivasi.'",
    narrative_en: "The old ring on {name}'s finger glows. An ancient, wise voice echoes in {pronoun} mind: 'Finally you awaken, disciple. I am the Eternal Master trapped in this ring. Let me guide you to the peak of cultivation.'",
    effect: "Ancient master provides guidance and emergency power.",
    awakening_bonus: {
      stat_changes: { intelligence: 2, luck: 2 },
      new_technique: "Master's Guidance",
      special_effect: "Emergency Protection"
    }
  },
  
  "Trash to Treasure": {
    narrative_id: "{name} menatap sampah di sekitar - tapi sekarang {pronoun} MELIHAT potensi tersembunyi. Batu biasa bisa jadi jimat, ranting bisa jadi pedang spiritual. Ini adalah Mata Harta Karun - mengubah sampah menjadi harta.",
    narrative_en: "{name} looks at trash around - but now {pronoun} SEES hidden potential. Common stones become talismans, twigs become spirit swords. This is the Treasure Eye - turning trash into treasure.",
    effect: "Transform common items into cultivation resources.",
    awakening_bonus: {
      stat_changes: { luck: 3, intelligence: 1 },
      new_technique: "Appraisal",
      special_effect: "Item Transmutation"
    }
  },
  
  "Fate Defier": {
    narrative_id: "Benang merah takdir muncul di penglihatan {name} - garis-garis yang menghubungkan masa lalu, sekarang, dan masa depan. {pronoun} dapat MELIHAT takdir dan MENGUBAHNYA. Ini adalah Mata Takdir - kekuatan melawan kehendak langit.",
    narrative_en: "Red threads of fate appear in {name}'s vision - lines connecting past, present, and future. {pronoun} can SEE destiny and CHANGE it. This is the Fate Eye - power to defy heaven's will.",
    effect: "Reroll critical moments and change outcomes.",
    awakening_bonus: {
      stat_changes: { luck: 4 },
      new_technique: "Fate Glimpse",
      special_effect: "Destiny Rewrite"
    }
  }
}
```

---

## Implementation Structure

### 1. Tutorial Data File
```typescript
// src/data/tutorialSteps.ts

export interface TutorialStep {
  id: number;
  chapter: string;
  daoMasterMessage: {
    en: string;
    id: string;
  };
  narrative: {
    en: string;
    id: string;
  };
  actionText: {
    en: string;
    id: string;
  };
  mechanicsTeaching: string[];
  autoActions: AutoAction[];
  panelToOpen?: 'status' | 'inventory' | 'techniques' | 'cultivation' | 'goldenFinger' | 'memory';
  highlightButton?: string;
}

export interface AutoAction {
  type: 'add_item' | 'remove_effect' | 'add_effect' | 'stat_change' | 'spawn_enemy' | 'deal_damage' | 'gain_xp' | 'open_panel' | 'wait';
  params: any;
}

export const tutorialSteps: TutorialStep[] = [
  // All 15 steps defined here
];
```

### 2. Tutorial Service
```typescript
// src/services/tutorialService.ts

export class TutorialService {
  static getCurrentStep(character: Character): number {
    return character.tutorialStep || 0;
  }
  
  static getStepData(stepNumber: number, language: string): TutorialStep {
    return tutorialSteps[stepNumber - 1];
  }
  
  static async executeStep(
    stepNumber: number,
    character: Character,
    language: string
  ): Promise<TutorialStepResult> {
    const step = this.getStepData(stepNumber, language);
    
    // Execute all auto-actions
    let updatedCharacter = { ...character };
    for (const action of step.autoActions) {
      updatedCharacter = await this.executeAutoAction(action, updatedCharacter);
    }
    
    return {
      narrative: step.narrative[language],
      daoMasterMessage: step.daoMasterMessage[language],
      actionText: step.actionText[language],
      updatedCharacter,
      panelToOpen: step.panelToOpen,
      highlightButton: step.highlightButton,
      isComplete: stepNumber >= 15
    };
  }
  
  static async executeAutoAction(
    action: AutoAction,
    character: Character
  ): Promise<Character> {
    switch (action.type) {
      case 'add_item':
        return this.addItem(character, action.params);
      case 'remove_effect':
        return RegenerationService.removeEffect(character, action.params.name);
      case 'add_effect':
        return this.addEffect(character, action.params);
      // ... other actions
    }
  }
  
  static completeStep(character: Character): Character {
    return {
      ...character,
      tutorialStep: (character.tutorialStep || 0) + 1
    };
  }
  
  static completeTutorial(character: Character): Character {
    return {
      ...character,
      tutorialCompleted: true,
      tutorialStep: 15,
      goldenFingerUnlocked: true
    };
  }
}
```

### 3. Tutorial UI Component
```typescript
// src/components/TutorialOverlay.tsx

export function TutorialOverlay({ 
  step, 
  onContinue 
}: TutorialOverlayProps) {
  return (
    <div className="tutorial-overlay">
      <DaoMasterMessage 
        message={step.daoMasterMessage}
        stepNumber={step.id}
        totalSteps={15}
      />
      
      <TutorialProgress current={step.id} total={15} />
      
      <Button 
        onClick={onContinue}
        className="tutorial-continue-btn"
      >
        {step.actionText}
      </Button>
    </div>
  );
}
```

---

## Benefits of Hardcoded Approach

### Development
✅ **Faster to implement** - No complex AI prompt engineering
✅ **Easier to test** - Predictable outcomes
✅ **Easier to debug** - No AI randomness
✅ **Easier to localize** - Pre-written text

### Player Experience
✅ **Consistent** - Every player gets same quality
✅ **Polished** - Can craft perfect narrative
✅ **Fast** - No API delays
✅ **Reliable** - No AI failures

### Cost & Performance
✅ **Free** - No API costs for tutorial
✅ **Instant** - No network latency
✅ **Offline-capable** - Could work without internet

---

## Transition to AI

After Step 15 completes:
```typescript
if (character.tutorialCompleted) {
  // Switch to AI generation
  const response = await generateNarrative(
    character,
    `TUTORIAL COMPLETE - Continue the story naturally from where tutorial ended.
    
    Character just completed awakening and understands their Golden Finger.
    They are ready to explore the world.
    
    Generate the FIRST real adventure scene...`,
    characterId,
    language
  );
}
```

---

## Database Schema

```sql
ALTER TABLE characters 
ADD COLUMN tutorial_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN tutorial_step INTEGER DEFAULT 0;

-- Index for querying tutorial progress
CREATE INDEX idx_characters_tutorial ON characters(tutorial_completed, tutorial_step);
```

---

## Next Steps

1. Create `tutorialSteps.ts` with all 15 steps fully defined
2. Create `tutorialService.ts` with execution logic
3. Create `DaoMasterMessage.tsx` component
4. Create `TutorialProgress.tsx` component
5. Modify `GameScreen.tsx` to use tutorial system
6. Add database migration
7. Test each step thoroughly
8. Add skip tutorial option for returning players

---

**Status**: DESIGN COMPLETE - READY FOR IMPLEMENTATION
**Estimated Time**: 6-8 hours for full implementation
**Priority**: HIGH - Significantly improves new player experience
