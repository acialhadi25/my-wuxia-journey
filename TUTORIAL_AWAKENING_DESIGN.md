# Tutorial Awakening System Design

## Concept

Awakening scenario berfungsi sebagai **interactive tutorial** yang memperkenalkan semua fitur game secara natural melalui narasi. Setiap step memiliki **1 action saja** untuk guided experience.

## Tutorial Flow (6 Steps)

### Step 1: Introduction + Hunger Effect
**Narrative**: Character terbangun dalam kondisi lemah dan lapar
**Tutorial Focus**: Status Effects & Active Effects Display
**Dao Master Message**: 
```
"Welcome, young cultivator. I am the Dao Master, your guide in this journey. 
Notice the red icon showing 'Kelaparan Parah' - this is a status effect draining your health. 
Let's learn how to survive first."
```
**Single Action**: "Rasakan tubuh yang lemah dan lapar" (Feel your weak and hungry body)
**Result**: 
- Show Active Effects Display with hunger debuff
- Health continues draining
- Introduce the concept of status effects

---

### Step 2: Inventory Tutorial
**Narrative**: Character remembers having some food
**Tutorial Focus**: Inventory Panel
**Dao Master Message**:
```
"You have items in your possession. Click the 📦 Inventory button at the top to see what you carry. 
Look for food to restore your strength."
```
**Single Action**: "Cari makanan di dalam tas" (Search for food in your bag)
**Result**:
- Highlight Inventory button (visual cue)
- Character finds basic food item
- Inventory panel opens automatically (optional)

---

### Step 3: Using Items
**Narrative**: Character finds food
**Tutorial Focus**: Item Usage
**Dao Master Message**:
```
"Good! You found food. Open your Inventory and click on the food item to consume it. 
Watch how it restores your health and removes the hunger effect."
```
**Single Action**: "Makan makanan yang ditemukan" (Eat the food you found)
**Result**:
- Consume food item
- Health restored
- Hunger effect removed
- Show before/after comparison

---

### Step 4: Status Panel
**Narrative**: Character feels stronger
**Tutorial Focus**: Status Panel & Stats
**Dao Master Message**:
```
"Feel the difference? Click the 👤 Status button to see your complete character information.
Check your stats, cultivation level, and current condition."
```
**Single Action**: "Periksa kondisi tubuh" (Check your body condition)
**Result**:
- Status panel opens automatically
- Highlight key stats (Health, Qi, Stamina)
- Show cultivation realm
- Explain stat meanings

---

### Step 5: Golden Finger Awakening
**Narrative**: Strange power awakens within
**Tutorial Focus**: Golden Finger Panel
**Dao Master Message**:
```
"Something ancient stirs within you... This is your Golden Finger - a unique power that will define your path.
Click the ✨ Golden Finger button to learn about your special ability."
```
**Single Action**: "Rasakan kekuatan yang terbangun" (Feel the awakening power)
**Result**:
- Golden Finger awakens (goldenFingerUnlocked = true)
- Golden Finger panel opens automatically
- Show ability description
- Achievement notification

---

### Step 6: Memory & Final Briefing
**Narrative**: Character understands their situation
**Tutorial Focus**: Memory Panel & Other Features
**Dao Master Message**:
```
"Your journey begins now. Use the 🧠 Memory button to review important events.
The ⚔️ Techniques and 🌟 Cultivation panels will unlock as you progress.
Now, step into the world and forge your destiny!"
```
**Single Action**: "Melangkah ke dunia kultivasi" (Step into the cultivation world)
**Result**:
- Memory panel briefly opens
- Show all UI buttons
- Tutorial complete
- Free exploration begins (multiple choices available)

---

## Implementation Requirements

### 1. Tutorial State Management
```typescript
interface TutorialState {
  isActive: boolean;
  currentStep: number; // 1-6
  completedSteps: number[];
  highlightedButton?: 'status' | 'inventory' | 'techniques' | 'cultivation' | 'goldenFinger' | 'memory';
}
```

### 2. Dao Master Messages
- Special message type: `type: 'dao_master'`
- Distinct styling (golden border, special icon)
- Cannot be dismissed until action taken
- Appears before narrative

### 3. Single Action Mode
```typescript
// During tutorial, AI must return exactly 1 action
if (tutorialState.isActive && tutorialState.currentStep < 6) {
  // Force single action in AI prompt
  // Validate AI response has exactly 1 suggested_action
}
```

### 4. Auto-Panel Opening
```typescript
// Open relevant panel automatically at each step
switch (tutorialStep) {
  case 2: setIsInventoryOpen(true); break;
  case 4: setIsStatusOpen(true); break;
  case 5: setIsGoldenFingerOpen(true); break;
  case 6: setIsMemoryOpen(true); break;
}
```

### 5. Visual Highlights
```typescript
// Highlight button with pulsing animation
<Button 
  className={cn(
    tutorialState.highlightedButton === 'inventory' && 'animate-pulse ring-2 ring-yellow-400'
  )}
>
```

---

## AI Prompt Modifications

### Tutorial Mode Prompt Addition
```
TUTORIAL MODE ACTIVE - STEP {currentStep}/6

CRITICAL RULES FOR TUTORIAL:
1. Generate EXACTLY ONE suggested_action (not multiple)
2. The action must guide player to complete this tutorial step
3. Keep narrative SHORT (2-3 sentences max)
4. Focus on the tutorial objective for this step
5. Do NOT advance story too fast - this is learning phase

CURRENT TUTORIAL OBJECTIVE:
{tutorialObjectives[currentStep]}

EXAMPLE SINGLE ACTION FORMAT:
"suggested_actions": [
  {
    "text": "Cari makanan di dalam tas",
    "type": "action",
    "check_type": null
  }
]

DO NOT include multiple actions. ONE action only.
```

### Tutorial Objectives Map
```typescript
const tutorialObjectives = {
  1: "Introduce hunger status effect. Make player aware of Active Effects.",
  2: "Guide player to check Inventory. Mention the Inventory button.",
  3: "Guide player to consume food item. Show item usage mechanics.",
  4: "Guide player to check Status panel. Explain character stats.",
  5: "Trigger Golden Finger awakening. Show Golden Finger panel.",
  6: "Introduce Memory panel. Complete tutorial and unlock free play."
};
```

---

## Database Schema Addition

### Tutorial Progress Tracking
```sql
ALTER TABLE characters 
ADD COLUMN tutorial_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN tutorial_step INTEGER DEFAULT 0;
```

This allows:
- Resume tutorial if player leaves mid-way
- Skip tutorial for returning players
- Track tutorial completion rate

---

## UI Components Needed

### 1. DaoMasterMessage Component
```typescript
interface DaoMasterMessageProps {
  content: string;
  step: number;
  totalSteps: number;
}

// Special styling with:
// - Golden border
// - Dao Master avatar/icon
// - Step indicator (1/6, 2/6, etc.)
// - Cannot be dismissed
```

### 2. TutorialHighlight Component
```typescript
// Wrapper that adds pulsing highlight to buttons
<TutorialHighlight active={isHighlighted}>
  <Button>Inventory</Button>
</TutorialHighlight>
```

### 3. TutorialProgress Indicator
```typescript
// Small progress bar at top showing 1/6, 2/6, etc.
<TutorialProgress current={step} total={6} />
```

---

## Benefits

### For New Players
✅ **Guided learning** - No confusion about what to do
✅ **Feature discovery** - Learn all UI elements naturally
✅ **Engaging** - Tutorial through story, not boring text
✅ **Paced** - One concept at a time

### For Game Design
✅ **Reduced support** - Players understand mechanics
✅ **Better retention** - Players know how to play
✅ **Natural flow** - Tutorial = story opening
✅ **Replayable** - Can skip on subsequent characters

---

## Implementation Phases

### Phase 1: Core Tutorial System (Priority)
- [ ] Add tutorial state management
- [ ] Modify AI prompt for single-action mode
- [ ] Add Dao Master message type
- [ ] Implement step progression logic

### Phase 2: UI Enhancements
- [ ] Create DaoMasterMessage component
- [ ] Add button highlighting
- [ ] Add tutorial progress indicator
- [ ] Auto-open panels at correct steps

### Phase 3: Polish
- [ ] Add skip tutorial option (for experienced players)
- [ ] Add tutorial completion tracking
- [ ] Add visual transitions between steps
- [ ] Add sound effects for Dao Master messages

---

## Example Tutorial Flow (Indonesian)

**Step 1:**
```
Dao Master: "Selamat datang, kultivator muda. Perhatikan ikon merah 'Kelaparan Parah' - ini adalah status effect yang menguras HP-mu."

Narasi: Lihazel terbangun di gua dingin, tubuhnya gemetar kelaparan. Perutnya keroncongan keras.

Action: [Rasakan tubuh yang lemah dan lapar]
```

**Step 2:**
```
Dao Master: "Kamu pasti membawa sesuatu. Klik tombol 📦 Inventory di atas untuk melihat barang bawaanmu."

Narasi: Lihazel teringat membawa bekal dari desa.

Action: [Cari makanan di dalam tas]
```

**Step 3:**
```
Dao Master: "Bagus! Buka Inventory-mu dan klik makanan untuk mengkonsumsinya. Perhatikan bagaimana status kelaparan hilang."

Narasi: Lihazel menemukan roti kering dan air.

Action: [Makan roti dan minum air]
```

And so on...

---

## Success Metrics

- Tutorial completion rate > 90%
- Average time to complete: 3-5 minutes
- Player retention after tutorial > 80%
- Support tickets about "how to use X" reduced by 70%

---

**Status**: DESIGN COMPLETE
**Next Step**: Implementation Phase 1
**Priority**: HIGH (improves new player experience significantly)
