# Product Requirement Document (PRD)
# My Wuxia Journey: AI Jianghu

**Version:** 3.0  
**Document Date:** January 5, 2026  
**Product Type:** AI-Native Text-Based RPG (Mobile-First PWA)

---

## 1. Executive Summary

My Wuxia Journey: AI Jianghu is an AI-powered text-based RPG that simulates a complete life journey in the Wuxia/Xianxia universe. Unlike traditional RPGs with fixed storylines, this game uses Large Language Models (LLM) to create an infinite, reactive world where every player decision has long-term consequences.

**Core Philosophy:** "Infinite Freedom, Ruthless World, Zero to Hero"

**Unique Value Proposition:**
- Complete narrative freedom through free-text input (not just menu choices)
- Long-term memory system where actions from Chapter 1 can affect Chapter 50
- Roguelite reincarnation - death is not the end, but a new beginning
- Asynchronous multiplayer - encounter ghosts of other players' characters
- AI-generated visuals that evolve with character progression

---

## 2. Core Concept: "Zero to Hero"

### 2.1 The Journey Arc

**The Zero (Beginning)**
- Players start as crippled, enslaved, or "trash talent" disciples
- Bullied, poor, and powerless
- Classic opening: "Your meridians are damaged. Your fiancée wants to break the engagement."

**The Struggle (Mid-Game)**
- Survive through cunning: steal pills, find ancient spirits, betray allies
- Make morally complex choices with real consequences
- Every action builds karma (positive or negative)

**The Hero (End-Game)**
- Become an Immortal who defies heaven
- Found your own sect
- Or destroy the world entirely

### 2.2 AI as World Simulator

The AI doesn't just narrate—it remembers and reacts:
- Kill a merchant's son in Chapter 1 → His father hires assassins 50 chapters later when you're famous
- Humiliate a junior disciple → His grandfather (a hidden master) seeks revenge years later
- Save a beggar → He turns out to be a disguised Sect Master who becomes your mentor

---

## 3. Gameplay Loop

### 3.1 Phase 1: Origin (Character Creation)

**Fate Roll System**
- Players "roll" their starting conditions (family, talent, location)
- Outcomes are randomized but meaningful
- Examples:
  - "Born to the Xiao Family, but your meridians are broken"
  - "Orphan found in river, mysterious jade pendant around neck"
  - "Son of a bandit chief, hunted by righteous sects"

**Golden Finger Selection**
Players choose ONE "cheat ability" (classic Xianxia trope):
1. The System - Robot voice gives daily quests with instant rewards
2. Grandpa in the Ring - Ancient soul advises and lends power in crisis
3. Copycat Eye - See enemy stats and copy one technique perfectly
4. Alchemy God - 100% success rate in pill creation
5. Rebirth Memory - Remember events from "previous life" (meta-knowledge)

### 3.2 Phase 2: Survival (Main Gameplay)

**Event-Based Progression**
- Not open-world wandering, but time-based decisions
- Each action consumes months/years
- AI generates situational challenges, not static skill menus

**Example Situation:**
```
AI: "You find an ancient manual at a black market stall. Price: 5 gold coins. You have: 2 gold coins.
What do you do?"

Player Options:
- Quick Action: [Persuade Seller] [Attempt Theft] [Walk Away]
- Free Text Input: "I threaten to report him to authorities while grabbing the manual"
```

**AI Response Logic:**
- Checks player's Charisma stat
- Considers seller's personality (generated at runtime)
- Determines outcome with consequences
- Updates relationship status with black market faction

### 3.3 Phase 3: Breakthrough (Cultivation)

**Non-Automatic Progression**
- Cultivation doesn't level up automatically
- Players must find "Insights" through meditation, debate, or rare pills
- Breakthrough Attempts can fail → permanent injury or death (Roguelike element)

**Breakthrough Mechanics:**
```
Player: "I meditate under the waterfall for enlightenment"

AI Processing:
- Check Spirit Root compatibility (Water = bonus, Fire = penalty)
- Roll success rate based on accumulated insights
- Generate narrative outcome

Success: "The water's flow reveals the Dao of Persistence. You breakthrough to Foundation Establishment!"
Failure: "Your Qi clashes with the water element. You suffer Qi Deviation. -50% Max Health (Permanent)"
```

---

## 4. Revolutionary Features

### 4.1 Karma & Memory System (Core Innovation)

**Long-Term AI Memory**
- Uses Vector Database (Pinecone/ChromaDB) to store event summaries
- RAG (Retrieval Augmented Generation) pulls relevant past events during new situations

**NPC Relationship Tracking**
Every NPC has hidden attributes:
- Favor (0-100): How much they like you
- Grudge (0-100): How much they want revenge
- Memory Tags: Specific events tied to this NPC

**Example Flow:**
```
Chapter 10: Player kills "Zhao Wei" (a minor cultivator)
Stored in memory: {
  event: "Player killed Zhao Wei",
  location: "Misty Forest",
  witnesses: ["Old Beggar"],
  victim_relations: ["Zhao Wei's grandfather: Elder Zhao of Sky Sect"]
}

Chapter 45: Player visits Sky Sect
AI retrieves memory → Generates event:
"As you enter, an elder with blazing eyes blocks your path.
'You DARE show your face here, murderer of my grandson?!'"
```

### 4.2 Dynamic Cultivation System

**Stats are Descriptive, Not Numeric (to player)**
Frontend shows:
- "Your body is as hard as refined iron" (Body Tempering Realm)
- "You can fly for short distances" (Foundation Establishment)

Backend tracks:
- Numerical values for combat calculations
- Elemental affinities (Fire, Water, Earth, Metal, Wood)
- Hidden potential caps

**Qi Deviation Mechanic**
- Forced cultivation progression can backfire
- AI generates unique negative effects based on context
  - "Your eyes turn blood red. NPCs now fear you on sight."
  - "Your left arm withers. -50% attack speed with that arm."

### 4.3 Combat System: "Narrative Wuxia Duels"

**Not Turn-Based Stat Comparison, but Strategic Description**

Traditional RPG:
```
[Attack] [Defend] [Skill]
You deal 50 damage.
```

This Game:
```
Player Input: "I use Shadow Step to dodge behind him, then thrust with Flame Finger!"

AI Processing:
- Compare Speed: Player (75) vs Enemy (60) → Player is faster
- Check Enemy Defense: Has "Iron Skin" (weak to fire) → Success!
- Generate Narrative:

"Your shadow splits in three! The enemy strikes at illusions while you circle behind. 
Your finger glows crimson—THRUST! The smell of burning flesh fills the air as he coughs blood. 
But he's not done yet..."
```

**Combat Advantage System:**
- Element counters (Fire > Metal > Wood > Earth > Water > Fire)
- Technique compatibility (Heavy vs Agile, Yin vs Yang)
- Environmental factors (Fighting in water boosts water techniques)

### 4.4 Dao Debate System (Philosophy Combat)

High-level cultivators don't just fight physically—they debate the nature of reality

**Mechanic:**
```
Scenario: You encounter a Grandmaster meditating on "The Dao of Fire"
Grandmaster: "What is the true nature of fire?"
Player Input (Free Text): "Fire is not destruction, but transformation. Ashes give birth to new forests."

AI Evaluation:
- Analyzes semantic depth
- Compares to Wuxia philosophy standards
- Determines if answer shows "enlightenment"

Deep Answer: "The Grandmaster's eyes light up! 'You understand! I shall teach you the Phoenix Rebirth Technique!'"
Shallow Answer: "The Grandmaster laughs mockingly. 'A child's understanding!' You cough blood from mental backlash."
```

### 4.5 Auction House Events

**Dynamic Bidding Wars (Classic Wuxia Trope)**

Event Structure:
1. AI announces rare item (e.g., "Dragon Blood Grass")
2. NPCs (simulated) start bidding
3. Player can:
   - Outbid with spirit stones
   - Threaten competitors (Intimidation check)
   - Let it go and ambush the winner outside

**Example:**
```
Auctioneer: "100 spirit stones! Do I hear 150?"
NPC (Young Master Liu): "200!"
Player: [Intimidate] "I whisper a death threat to Young Master Liu"

AI Processing:
- Check Player Cultivation vs Liu's Cultivation
- Check Liu's Courage stat
- Determine outcome

Success: "Young Master Liu's face pales. He stops bidding."
Consequence: "Young Master Liu's guards wait for you outside..."
```

### 4.6 Sect Management (Late Game)

**From Solo Wanderer to Sect Founder**

Unlocks after: Reaching Core Formation realm + Accumulating 10,000 Fame

**Mechanics:**
- Recruit disciples - AI generates disciples with random potential
- Assign missions - Send disciples on tasks (risk of death/betrayal)
- Sect wars - Strategic battles against rival sects
- Betrayal system - Treat disciples poorly → they might poison you

**Example:**
```
Disciple "Feng Yu":
- Talent: High
- Loyalty: 30/100 (You often scold him)
- Hidden Trait: "Ambitious"

Year 50 Event:
"During your closed-door cultivation, Disciple Feng Yu poisons your tea and seizes control of the sect!"
```

---

## 5. Roguelite Reincarnation System

### 5.1 Samsara (Reincarnation Cycle)

**Death is NOT Game Over**

When the player dies:
1. Life Summary Screen appears
   - Total cultivation reached
   - Major achievements
   - NPCs killed/saved
   - Legacy score (0-100)

2. Inheritance Selection (Based on legacy score)
   - High score (70+): Choose 2 items to carry over
   - Medium score (40-69): Choose 1 item
   - Low score (<40): Random minor bonus

**Inheritance Options:**
- Memory Retention - Start with higher Intelligence/Wisdom
- Ancestral Treasure - Carry one equipment/artifact
- Noble Birth - Reincarnate into wealthy family
- Hidden Bloodline - Gain rare elemental affinity
- Karmic Debt - Start with an ally who owes you from "past life"

### 5.2 New Game+ Mechanics

Each reincarnation cycle:
- World state evolves (sects rise and fall based on previous playthrough)
- Previous character becomes an NPC ghost/legend
- Players can encounter their own "past life" memories in ruins

---

## 6. Asynchronous Multiplayer

### 6.1 "Karma Across Dimensions"

**Other Players' Dead Characters Become NPCs in Your World**

Implementation:
1. When Player A completes/dies, their character data uploads to global pool
2. Player B's game randomly pulls from this pool to generate encounters

**Example Encounters:**
```
"You enter an ancient cave and find a skeleton in meditation pose.
Engraved on the wall:
'Here fell [PlayerA's Character Name], who reached Nascent Soul realm but succumbed to Heart Demons.
His legacy technique, Void Fist, is carved below.'"
```

**Types of Encounters:**
- Graveyard Insights - Learn from others' mistakes
- Ghost Boss Fights - Corrupted spirit of a dead player's character
- Inherited Techniques - Discover martial arts created by other players
- Rival Legends - Your character competes with others' fame posthumously

### 6.2 Global Leaderboards

**Not Just Power Rankings, but Story Rankings**
- Most Tragic Death
- Most Betrayals Committed
- Most Disciples Trained
- Most Poetic Enlightenment (voted by community on shared quotes)

---

## 7. Martial Arts Creator System

### 7.1 User-Generated Techniques

High-level players can create custom martial arts

**Creation Process:**

Step 1 - Name Your Technique:
```
Player: "Meteor Shattering Palm"
```

Step 2 - Describe Philosophy:
```
Player: "Channels the weight of falling stars into a single strike. Requires extreme physical cultivation and Metal affinity."
```

Step 3 - AI Balancing:
```
AI analyzes description and assigns:
- Element: Metal
- Power Grade: High-tier Earth Rank
- Requirements: Body Tempering (Peak) + Metal Spirit Root
- Side Effect: Damages user's arm after 3 uses per day
```

Step 4 - Enter Global Database:
Technique is saved with creator's name.
Other players can discover it in the world.

### 7.2 Legacy System

Your created techniques live on after your character dies

**Future Player finds ancient manual:**
```
"Meteor Shattering Palm
Created by [Your Character Name] in Year 347 of the Jade Dynasty.
Master this, and you shall inherit their will."
```

---

## 8. Living World System

### 8.1 Jianghu Daily (In-Game Newspaper)

**World Events Happen Even When Player is Offline**

Every real-world day (or in-game month), players receive news:

```
📜 JIANGHU DAILY - Year 15, Month 3

🔥 BREAKING: Sunset Sect Destroyed by Mysterious Black-Robed Figure!
Investigators suspect demonic cultivation...

💍 RUMOR: The Emperor's daughter announces a martial arts tournament to choose her husband! 
Prize: 10,000 spirit stones + Royal backing.

⚔️ REGIONAL NEWS: Bandits spotted near Misty Forest trade route.
Merchants offering 500 spirit stones for protection services.

🌟 LEGEND UPDATE: "Sword Saint Chen Wei" has broken through to Soul Transformation realm! 
Now ranked #3 in Jianghu power list.
```

**Functions:**
- Provides mission hooks organically
- Makes world feel alive
- Hints at major faction movements

### 8.2 Dynamic World Simulation

AI simulates background events:
- Sects gain/lose power based on resource management
- NPCs age, die, have children
- Economies fluctuate (pill prices change based on supply/demand simulation)
- Natural disasters occur randomly (floods destroy sects, create new ruins)

---

## 9. Visual Design & UI/UX

### 9.1 Art Direction

**Aesthetic: Dark Ink Wash with Gold/Crimson Accents**

**Color Palette:**
- Base: Deep blacks and dark grays (#0a0a0a, #1a1a1a)
- Accents: Gold (#d4af37), Crimson (#8b0000), Jade Green (#00a86b)
- Text: Aged parchment white (#f5e6d3)

**Typography:**
- Headers: Chinese brush-stroke calligraphy fonts
- Body: High-contrast serif for readability (Cinzel, Crimson Text)
- Effects: Ink drip animations on transitions

**Visual Effects:**
- Floating fog/mist particles
- Brush-stroke transitions between scenes
- Glowing aura effects for cultivation breakthroughs
- Ink splash for combat impacts

### 9.2 Screen Layouts

**Title Screen**
```
┌─────────────────────────────┐
│   [Animated Floating Sword] │
│                             │
│   武侠之旅: 江湖天下         │
│   MY WUXIA JOURNEY          │
│                             │
│   [New Life] (Glowing)      │
│   [Continue Legacy]         │
│   [Hall of Legends]         │
│   [Settings]                │
└─────────────────────────────┘
```

**Character Creation (4-Step Wizard)**
1. Name Input - Calligraphy-style text field
2. Fate Roll - Slot machine animation showing randomized stats
3. Golden Finger Selection - Card-flip interface showing 5 options
4. Confirmation - Character portrait (AI-generated) + summary

**Main Game Screen**
```
┌─────────────────────────────┐
│ [≡ Menu]    Chapter 12    [👤]│
├─────────────────────────────┤
│                             │
│ Story Stream (Scrollable)   │
│ ┌─────────────────────────┐ │
│ │ The fog thickens as you │ │
│ │ enter the Misty Forest. │ │
│ │ Three masked figures    │ │
│ │ emerge from shadows...  │ │
│ │                         │ │
│ │ [Character Portrait]    │ │
│ │ Masked Leader speaks:   │ │
│ │ "You've walked into     │ │
│ │ your grave, traitor!"   │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ Quick Actions:              │
│ [⚔️ Fight] [🏃 Flee] [💬 Talk]│
│                             │
│ ┌─────────────────────────┐ │
│ │ Or type your action...  │ │
│ └─────────────────────────┘ │
│               [Send 📤]     │
└─────────────────────────────┘
```

**Swipe from right to reveal →**
```
┌──────────────┐
│ STATUS PANEL │
├──────────────┤
│ Health: 80%  │
│ Qi: 60%      │
│ ━━━━━━━━━━━  │
│              │
│ Cultivation: │
│ Foundation   │
│ Establishment│
│ (Mid Stage)  │
│              │
│ Golden Finger│
│ 🔮 Grandpa   │
│    Ring      │
│              │
│ Karma:       │
│ Good: +15    │
│ Evil: -40    │
└──────────────┘
```

### 9.3 Mobile-First Design Considerations

**Optimizations:**
- Thumb-friendly zones - Quick action buttons in lower third
- Swipe gestures - Status panel, inventory, quest log
- Progressive text rendering - Text appears word-by-word (typewriter effect)
- Offline mode - Cache last 10 chapters for offline reading
- Low bandwidth mode - Text-only option (disable AI image generation)

**PWA Features:**
- Install as standalone app
- Push notifications for:
  - "Your cultivation meditation is complete!"
  - "Jianghu Daily has arrived"
  - "A rival player discovered your legacy technique!"
- Background sync for saving progress

---

## 10. Technical Architecture

### 10.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (PWA)                   │
│  Flutter Web/Mobile - Responsive Text-Based UI      │
└────────────────┬────────────────────────────────────┘
                 │ HTTPS/REST API
┌────────────────┴────────────────────────────────────┐
│               BACKEND (Python/FastAPI)              │
│  - Request Router                                   │
│  - Game State Manager                               │
│  - Prompt Engineering Layer                         │
└────┬──────────┬──────────┬──────────┬───────────────┘
     │          │          │          │
     ▼          ▼          ▼          ▼
┌─────────┐ ┌────────┐ ┌────────┐ ┌───────────┐
│   LLM   │ │ Vector │ │Postgres│ │Image Gen  │
│   API   │ │   DB   │ │   DB   │ │   API     │
│(Claude/ │ │(Pinecone│ │        │ │(Stable    │
│ GPT-4)  │ │/Chroma) │ │        │ │Diffusion) │
└─────────┘ └────────┘ └────────┘ └───────────┘
```

### 10.2 Tech Stack Recommendations

**Frontend**
- Framework: Flutter (single codebase for iOS, Android, Web)
- State Management: Provider or Riverpod
- Animations: Lottie (for ink wash effects)
- Storage: Hive (local NoSQL for offline caching)

**Why Flutter?**
- Fast rendering for text-heavy UI
- Excellent PWA support
- Beautiful custom animations
- Hot reload for rapid iteration

**Backend**
- Framework: Python FastAPI
- LLM Orchestration: LangChain
- Rate Limiting: Redis
- Task Queue: Celery (for async AI generation)

**Key Libraries:**
```python
# Core
fastapi==0.104.0
langchain==0.1.0
pydantic==2.5.0

# LLM Integration
openai==1.0.0
anthropic==0.7.0

# Vector Database
pinecone-client==2.2.4
# OR chromadb==0.4.15

# Image Generation
stability-sdk==0.8.3
```

**Database Layer**

**PostgreSQL (Primary Data)**
- User accounts
- Character stats & inventory
- Sect management data
- Transaction logs

**Pinecone/ChromaDB (Vector Storage)**
- Long-term memory embeddings
- NPC relationship history
- Past event summaries for RAG

**Redis (Caching)**
- Session management
- API rate limiting
- Temporary combat state

### 10.3 Data Models

**User Profile**
```json
{
  "user_id": "uuid",
  "username": "string",
  "created_at": "timestamp",
  "current_character_id": "uuid",
  "past_lives": ["character_uuid_1", "character_uuid_2"],
  "achievements": ["achievement_id_1", "achievement_id_2"],
  "premium_status": "boolean"
}
```

**Character State**
```json
{
  "character_id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "age": "integer",
  "is_alive": "boolean",
  "stats": {
    "health": {"current": 80, "max": 100},
    "qi": {"current": 60, "max": 100},
    "cultivation_realm": "Foundation Establishment",
    "cultivation_progress": 0.65,
    "strength": 45,
    "agility": 60,
    "intelligence": 70,
    "charisma": 30
  },
  "golden_finger": {
    "type": "Grandpa Ring",
    "uses_remaining": 3,
    "cooldown_expires": "timestamp"
  },
  "inventory": [
    {"item_id": "rusty_sword", "quantity": 1},
    {"item_id": "healing_pill", "quantity": 5}
  ],
  "techniques": [
    {"name": "Shadow Step", "mastery": 0.8, "element": "Wind"}
  ],
  "karma": {
    "good_deeds": 15,
    "evil_deeds": 40,
    "reputation": -25
  },
  "relationships": [
    {
      "npc_id": "elder_zhao",
      "favor": 10,
      "grudge": 90,
      "last_interaction": "timestamp",
      "memory_tags": ["killed_grandson", "threatened_in_auction"]
    }
  ],
  "current_location": "Misty Forest",
  "chapter": 12,
  "in_game_date": {"year": 347, "month": 3, "day": 15}
}
```

**Memory Event (Vector DB)**
```json
{
  "event_id": "uuid",
  "character_id": "uuid",
  "timestamp": "timestamp",
  "chapter": 12,
  "summary": "Player killed Zhao Wei in Misty Forest",
  "embedding": [0.234, -0.123, ...], // 1536-dim vector
  "importance_score": 8.5, // 0-10 scale
  "involved_npcs": ["zhao_wei", "old_beggar"],
  "tags": ["murder", "witnessed", "grudge_trigger"],
  "consequences": ["elder_zhao_revenge_triggered"]
}
```

**Global Legacy Pool (Multiplayer)**
```json
{
  "legacy_id": "uuid",
  "original_user": "username",
  "character_name": "Chen Wei the Sword Saint",
  "final_cultivation": "Nascent Soul",
  "cause_of_death": "Heart Demon",
  "famous_techniques": [
    {
      "name": "Void Shattering Fist",
      "description": "...",
      "power_grade": "Heaven Rank"
    }
  ],
  "total_kills": 47,
  "legendary_items": ["Azure Dragon Sword"],
  "story_summary": "Rose from slave to sect founder...",
  "upload_date": "timestamp",
  "encounter_count": 234 // How many players have encountered this
}
```

### 10.4 API Endpoints

**Core Game Flow**
```
POST /api/auth/register
POST /api/auth/login
GET  /api/user/profile
POST /api/character/create    # Start new life
GET  /api/character/current
POST /api/character/action    # Main gameplay endpoint
GET  /api/character/status
POST /api/reincarnate         # Trigger Samsara
GET  /api/inheritance-options
```

**Advanced Features**
```
GET  /api/jianghu-daily       # Daily newspaper
POST /api/auction/bid
GET  /api/auction/current
POST /api/technique/create    # User-generated content
GET  /api/technique/discover  # Find others' techniques
GET  /api/sect/status         # Late game
POST /api/sect/manage
GET  /api/legacy/random       # Pull dead player's character
POST /api/legacy/upload       # Upload your completed character
```

### 10.5 Prompt Engineering Strategy

**System Prompt Structure (4000+ tokens)**
```
# SYSTEM IDENTITY
You are the World Simulator for "My Wuxia Journey: AI Jianghu",
a text-based Wuxia RPG. You are NOT a helpful assistant—you are
a ruthless, dramatic narrator of a cultivation world.

# CORE RULES
1. The world is amoral. NPCs act in self-interest.
2. Player actions have consequences (track in memory).
3. Death is permanent (until reincarnation).
4. No hand-holding. If player makes stupid decisions, they suffer.

# NARRATIVE STYLE
- Cinematic descriptions (but concise, max 150 words per response)
- Use Wuxia tropes: "coughing blood", "face slapping", "jade beauty"
- Dramatic irony and foreshadowing
- Vary sentence length for tension

# OUTPUT FORMAT (CRITICAL - ALWAYS JSON)
{
  "narrative": "The main story text...",
  "time_passed": "2 months",
  "location": "Misty Forest",
  "npcs_present": [...],
  "player_condition": {...},
  "suggested_actions": [...]
}

# MEMORY RETRIEVAL
Before generating narrative, you will receive:
<relevant_memories>
[Retrieved from vector DB]
</relevant_memories>
Use these to create callbacks and consequences.

# COMBAT RESOLUTION
When player describes combat action:
1. Extract technique used
2. Check element compatibility
3. Compare stats (hidden from player, but you have them)
4. Roll RNG for critical/failure
5. Generate dramatic outcome

# FORBIDDEN BEHAVIORS
- Never make player invincible
- Never reveal hidden stats directly
- Never break the fourth wall (except Golden Finger: The System)
- Never let player succeed without proper cultivation level
```

**Dynamic Context Injection**
```python
def build_prompt(character_state, user_action, retrieved_memories):
    return f"""
<character_state>
{json.dumps(character_state)}
</character_state>

<relevant_memories>
{format_memories(retrieved_memories)}
</relevant_memories>

<user_action>
{user_action}
</user_action>

Generate the next story beat following SYSTEM RULES.
"""
```

### 10.6 AI Image Generation Pipeline

**When to Generate Images:**
- Character creation (initial portrait)
- Major breakthroughs (cultivation realm up)
- Legendary equipment obtained
- Sect founding ceremony

**Pipeline:**
```python
async def generate_character_portrait(character_state):
    # Extract visual traits
    description = f"""
    Wuxia character portrait, ink wash painting style,
    {character_state['age']} year old,
    Cultivation: {character_state['cultivation_realm']},
    Wearing: {get_outfit_description(character_state)},
    Notable features: {extract_scars_and_features(character_state)},
    Aura: {determine_aura_color(character_state)},
    Style: Chinese ink painting, dramatic lighting,
    dark background with gold accents, cinematic
    """
    
    # Call Stable Diffusion API
    image_url = await stability_api.generate(
        prompt=description,
        style_preset="cinematic",
        width=512,
        height=768
    )
    
    return image_url
```

---

## 11. Monetization Strategy

### 11.1 Freemium Model

**Free Tier:**
- Complete game access
- 1 character slot
- Basic AI responses
- Standard reincarnation options

**Premium Tier ($4.99/month):**
- 3 character slots (parallel lives)
- Enhanced AI responses (GPT-4 vs GPT-3.5)
- Exclusive Golden Fingers
- Priority customer support
- Early access to new features

### 11.2 Cosmetic Purchases

**Character Customization ($0.99-$2.99):**
- Premium character portraits
- Unique visual effects for techniques
- Custom sect banners and emblems
- Animated breakthrough sequences

### 11.3 Convenience Features

**Time Savers ($0.99-$1.99):**
- Instant meditation completion
- Skip cooldowns for Golden Finger abilities
- Extra daily actions
- Faster cultivation progress (not pay-to-win, just faster)

---

## 12. Content Roadmap

### 12.1 Launch Features (MVP)
- Core gameplay loop (Origin → Survival → Breakthrough)
- 5 Golden Fingers
- Basic memory system
- Character creation and reincarnation
- Mobile-responsive web app

### 12.2 Post-Launch (Month 2-3)
- Sect management system
- User-generated techniques
- Auction house events
- AI image generation
- iOS/Android native apps

### 12.3 Long-term (Month 4-12)
- Asynchronous multiplayer
- Jianghu Daily newspaper
- Dao debate system
- Advanced cultivation realms
- Voice narration

**Continuous Content:**
- New Golden Finger options (quarterly)
- Seasonal events (e.g., "Demonic Invasion Month")
- Community voting on new realms/locations
- Voice narration DLC
- Multiplayer sects (guilds)

---

## 13. Success Metrics & KPIs

### 13.1 User Acquisition
- Target: 10,000 users in first 3 months
- CAC (Customer Acquisition Cost): <$2 via organic + Reddit/Discord
- Viral Coefficient: 0.3 (each user brings 0.3 new users via sharing)

### 13.2 Engagement
- Session Length: 20+ minutes average
- D1 Retention: 50%
- D7 Retention: 30%
- D30 Retention: 15%
- Reincarnation Rate: 60% start second life

### 13.3 Monetization
- ARPPU (Avg Revenue Per Paying User): $8/month
- Conversion Rate: 3% (F2P → Premium)
- LTV (Lifetime Value): $25 per user

### 13.4 Community Health
- User-Generated Techniques: 1000+ in first year
- Legacy Encounters: 50,000+ total interactions
- Social Shares: 500+ Reddit/Twitter posts with #MyWuxiaJourney tag
- Discord Members: 2,000+ active players discussing strategies

---

## 14. Risk Analysis & Mitigation

### 14.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM API Costs Too High | High | Implement aggressive caching, use smaller models (GPT-3.5) for simple narration, reserve GPT-4 for complex decisions |
| AI Generates Inappropriate Content | Medium | Content filtering layer, user reporting system, regular prompt audits |
| Vector DB Query Latency | Medium | Index optimization, limit memory retrieval to top 5 relevant events, cache frequently accessed memories |
| Image Generation Bottleneck | Low | Queue system, generate portraits async in background, allow text-only mode |

### 14.2 Product Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Players Find AI Repetitive | High | Diverse prompt templates, randomization layers, community-submitted plot hooks |
| Too Hardcore (High Death Rate) | Medium | Difficulty settings, "Casual Mode" with reduced permadeath |
| Lack of Visual Appeal | Medium | Invest in top-tier ink wash art assets, gif animations for key moments |
| Multiplayer Features Feel Empty | Low | Seed database with developer-created legacy characters initially |

### 14.3 Market Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Niche Genre (Wuxia) | Medium | Market to broader "text RPG" and "AI game" audiences, not just Wuxia fans |
| Competition from AI Dungeon | Low | Differentiate with structured progression, memory system, and mobile-first design |
| Negative Press on AI Content | Low | Transparent about AI usage, emphasize human-curated world rules and prompts |

---

## 15. Appendix

### 15.1 Glossary of Wuxia Terms

- **Jianghu (江湖)**: The "rivers and lakes" - martial arts underworld
- **Cultivation (修炼)**: Process of training to transcend mortality
- **Qi (气)**: Life energy used for techniques
- **Dao (道)**: The Way / universal truth
- **Face Slapping (打脸)**: Humiliating someone who underestimated you
- **Golden Finger (金手指)**: Protagonist's unique cheat ability
- **Arrogant Young Master (嚣张少爷)**: Classic antagonist archetype
- **Jade Beauty (玉女)**: Incredibly beautiful female character

### 15.2 Cultivation Realms (Progression)

1. **Mortal (凡人)** - No cultivation
2. **Body Tempering (炼体)** - Strengthen physical form
3. **Qi Condensation (凝气)** - Gather Qi in body
4. **Foundation Establishment (筑基)** - Build cultivation foundation
5. **Core Formation (结丹)** - Form golden core
6. **Nascent Soul (元婴)** - Birth of spirit body
7. **Soul Transformation (化神)** - Transform soul
8. **Tribulation Crossing (渡劫)** - Survive heavenly tribulation
9. **Immortal Ascension (飞升)** - Become true immortal

Each realm has 3 stages: Early, Mid, Late (or Initial, Middle, Peak)

### 15.3 Example Full Playthrough Story Arc

**Life 1: The Trash Disciple**
- Start: Outer disciple with broken meridians
- Golden Finger: Grandpa in the Ring
- Key Event: Find inheritance cave, learn forbidden technique
- Climax: Win sect tournament, humiliate tormentors
- Death: Killed by jealous rival at age 40
- Legacy Score: 65 (Medium)
- Inheritance: Kept the Ring for next life

**Life 2: The Demon Cultivator**
- Start: Reborn in bandit family (chose "troubled birth")
- Golden Finger: Ring from previous life
- Key Event: Accidentally absorb demonic Qi, turn evil
- Mid-Game: Build terror cult, hunted by righteous sects
- Climax: Betray own cult for power, become Demon Lord
- Death: Slain by hero coalition at age 60
- Legacy Score: 85 (High)
- Inheritance: Keep 2 items - Ring + Demon Emperor Armor

**Life 3: The Redemption Path**
- Start: Born to noble family (high legacy reward)
- Golden Finger: Ring + Memory of past 2 lives
- Key Event: Meet reincarnation of person you killed in Life 1
- Late Game: Found "Balanced Path Sect" merging light and dark
- Ending: Achieve Immortal Ascension, complete story
- Final Scene: Cinematic ending with all past lives' memories

---

## 16. Conclusion & Vision Statement

My Wuxia Journey: AI Jianghu is not just a game—it's a living story simulator where your choices echo across lifetimes. We're building the first AI-native RPG that truly respects player agency while maintaining narrative coherence through advanced memory systems.

**What Makes This Different:**
- Other AI games are sandboxes without consequences
- Other RPGs have fixed stories with illusion of choice
- We offer infinite freedom with real consequences powered by AI memory

**Our Promise:** Every player will have a unique journey that no walkthrough can spoil, because their story literally doesn't exist until they create it through their choices.

**The Future:** If successful, this architecture can expand to:
- Other genres (Cyberpunk, Fantasy, Sci-Fi)
- Multiplayer "shared universe" modes
- VR/AR narrative experiences
- Educational "historical simulation" tools

But first, we master Wuxia. Because in the words of the Dao:

*"A journey of a thousand miles begins with a single step."*

---

**Document Version:** 3.0  
**Last Updated:** January 5, 2026  
**Next Review:** After Phase 1 MVP completion  
**Maintained By:** Product Team

---

May your cultivation journey be legendary. ⚔️🐉