export type CultivationRealm = 
  | 'Mortal'
  | 'Qi Condensation'
  | 'Foundation Establishment'
  | 'Core Formation'
  | 'Nascent Soul'
  | 'Spirit Severing'
  | 'Dao Seeking'
  | 'Immortal Ascension';

export type SpiritRoot = 
  | 'Fire'
  | 'Water'
  | 'Earth'
  | 'Wood'
  | 'Metal'
  | 'Lightning'
  | 'Darkness'
  | 'Light'
  | 'Trash';

export type GoldenFinger = {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: string;
};

export type CharacterStats = {
  strength: number;
  agility: number;
  intelligence: number;
  charisma: number;
  luck: number;
  cultivation: number;
  lifespan: number;
  currentAge: number;
};

export type TechniqueType = 'martial' | 'mystic' | 'passive';
export type TechniqueRank = 'mortal' | 'earth' | 'heaven' | 'divine';

export type Technique = {
  id: string;
  name: string;
  type: TechniqueType;
  element?: SpiritRoot;
  rank: TechniqueRank;
  mastery: number; // 0-100
  description: string;
  effects?: Record<string, any>;
  qiCost: number;
  cooldown?: string;
};

export type ItemType = 'weapon' | 'armor' | 'pill' | 'material' | 'treasure' | 'misc';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'divine';

export type InventoryItem = {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  quantity: number;
  description: string;
  effects?: Record<string, any>;
  equipped?: boolean;
};

export type Character = {
  id: string;
  name: string;
  origin: string;
  spiritRoot: SpiritRoot;
  realm: CultivationRealm;
  goldenFinger: GoldenFinger;
  stats: CharacterStats;
  qi: number;
  maxQi: number;
  health: number;
  maxHealth: number;
  stamina: number; // New: Physical energy
  maxStamina: number; // New: Max stamina based on strength
  karma: number;
  cultivationProgress: number;
  breakthroughReady: boolean;
  techniques: Technique[];
  inventory: InventoryItem[];
  relationships: Relationship[];
  visualTraits: VisualTraits;
  tutorialCompleted?: boolean;
  tutorialStep?: number; // 0-15, current tutorial step
  goldenFingerUnlocked?: boolean;
  activeEffects?: ActiveEffect[]; // New: Active buffs/debuffs
  lastRegeneration?: number; // New: Timestamp for regeneration
};

export type EffectType = 'buff' | 'debuff' | 'poison' | 'curse' | 'blessing' | 'qi_deviation';

export type ActiveEffect = {
  id: string;
  name: string;
  type: EffectType;
  description: string;
  icon?: string;
  duration: number; // in seconds, -1 for permanent
  startTime: number; // timestamp
  statModifiers?: {
    strength?: number;
    agility?: number;
    intelligence?: number;
    charisma?: number;
    luck?: number;
    cultivation?: number;
  };
  regenModifiers?: {
    healthRegen?: number; // per second
    qiRegen?: number; // per second
    staminaRegen?: number; // per second - NEW
  };
  damageOverTime?: {
    healthDamage?: number; // per second
    qiDrain?: number; // per second
    staminaDrain?: number; // per second - NEW
  };
  maxStatModifiers?: {
    maxHealth?: number;
    maxQi?: number;
    maxStamina?: number; // NEW
  };
  isPermanent?: boolean;
  stackable?: boolean;
  stacks?: number;
};

export type Relationship = {
  npcId: string;
  npcName: string;
  favor: number;
  grudge: number;
  status: 'ally' | 'neutral' | 'enemy' | 'master' | 'disciple' | 'lover' | 'rival';
};

export type VisualTraits = {
  hairColor: string;
  eyeColor: string;
  scars: string[];
  aura: string;
  clothing: string;
  gender?: string;
};

export type GameMessage = {
  id: string;
  type: 'narration' | 'dialogue' | 'system' | 'action' | 'combat' | 'tutorial';
  content: string;
  timestamp: Date;
  speaker?: string;
  choices?: GameChoice[];
};

export type GameChoice = {
  id: string;
  text: string;
  type: 'action' | 'dialogue' | 'combat' | 'flee' | 'tutorial';
  checkType?: 'strength' | 'agility' | 'intelligence' | 'charisma' | 'luck';
};

export type GameState = {
  character: Character | null;
  currentChapter: number;
  currentLocation: string;
  timeElapsed: string;
  ambiance: string;
  messages: GameMessage[];
  isLoading: boolean;
  gamePhase: 'title' | 'creation' | 'tutorial' | 'playing' | 'death' | 'ascension';
};

export type NPCPresent = {
  name: string;
  realm: string;
  attitude: 'friendly' | 'neutral' | 'hostile' | 'unknown';
};

export type StoryResponse = {
  chapterTitle: string;
  timePassed: string;
  narrative: string;
  environment: {
    location: string;
    ambiance: string;
  };
  npcsPresent: NPCPresent[];
  playerCondition: {
    currentQi: string;
    status: string;
  };
  suggestedActions: string[];
};

// Tutorial-specific types
export type TutorialStep = {
  id: string;
  narrative: string;
  choices: TutorialChoice[];
  isComplete?: boolean;
};

export type TutorialChoice = {
  id: string;
  text: string;
  outcome: 'progress' | 'fail' | 'branch';
};

export type TutorialState = {
  currentStep: number;
  totalSteps: number;
  steps: TutorialStep[];
  isComplete: boolean;
  goldenFingerAwakened: boolean;
};

// AI-generated origin type
export type GeneratedOrigin = {
  title: string;
  description: string;
  spiritRoot: SpiritRoot;
  backstory: string;
  startingLocation: string;
  bonuses: {
    strength?: number;
    agility?: number;
    intelligence?: number;
    charisma?: number;
    luck?: number;
    cultivation?: number;
  };
  penalties: {
    strength?: number;
    agility?: number;
    intelligence?: number;
    charisma?: number;
    luck?: number;
    cultivation?: number;
  };
};

// Realm progression thresholds
export const REALM_ORDER: CultivationRealm[] = [
  'Mortal',
  'Qi Condensation',
  'Foundation Establishment',
  'Core Formation',
  'Nascent Soul',
  'Spirit Severing',
  'Dao Seeking',
  'Immortal Ascension'
];

export const REALM_MAX_QI: Record<CultivationRealm, number> = {
  'Mortal': 50,
  'Qi Condensation': 100,
  'Foundation Establishment': 200,
  'Core Formation': 500,
  'Nascent Soul': 1000,
  'Spirit Severing': 2500,
  'Dao Seeking': 5000,
  'Immortal Ascension': 10000
};

export const REALM_MAX_HEALTH: Record<CultivationRealm, number> = {
  'Mortal': 100,
  'Qi Condensation': 150,
  'Foundation Establishment': 250,
  'Core Formation': 500,
  'Nascent Soul': 1000,
  'Spirit Severing': 2000,
  'Dao Seeking': 5000,
  'Immortal Ascension': 10000
};

export function getNextRealm(current: CultivationRealm): CultivationRealm | null {
  const idx = REALM_ORDER.indexOf(current);
  if (idx === -1 || idx >= REALM_ORDER.length - 1) return null;
  return REALM_ORDER[idx + 1];
}

export function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'common': return 'text-muted-foreground';
    case 'uncommon': return 'text-jade';
    case 'rare': return 'text-spirit';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-gold';
    case 'divine': return 'text-crimson';
    default: return 'text-foreground';
  }
}

export function getRankColor(rank: TechniqueRank): string {
  switch (rank) {
    case 'mortal': return 'text-muted-foreground';
    case 'earth': return 'text-jade';
    case 'heaven': return 'text-gold';
    case 'divine': return 'text-crimson';
    default: return 'text-foreground';
  }
}

/**
 * Calculate max stamina based on strength stat
 * Base: 100
 * Each point of strength adds 5 stamina
 */
export function calculateMaxStamina(strength: number): number {
  const BASE_STAMINA = 100;
  const STAMINA_PER_STRENGTH = 5;
  return BASE_STAMINA + (strength * STAMINA_PER_STRENGTH);
}
