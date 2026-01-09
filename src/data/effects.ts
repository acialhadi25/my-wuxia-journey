import { ActiveEffect } from '@/types/game';

// ============================================
// BUFFS - Positive Effects
// ============================================

export const BUFF_EFFECTS: Record<string, Omit<ActiveEffect, 'id' | 'startTime'>> = {
  // Pill Effects - Temporary
  STRENGTH_PILL: {
    name: 'Strength Enhancement Pill',
    type: 'buff',
    description: 'Temporarily increases strength',
    icon: '💊',
    duration: 300, // 5 minutes
    statModifiers: { strength: 5 },
    isPermanent: false,
    stackable: false,
  },

  AGILITY_PILL: {
    name: 'Swift Wind Pill',
    type: 'buff',
    description: 'Temporarily increases agility',
    icon: '💊',
    duration: 300,
    statModifiers: { agility: 5 },
    isPermanent: false,
    stackable: false,
  },

  INTELLIGENCE_PILL: {
    name: 'Clarity Mind Pill',
    type: 'buff',
    description: 'Temporarily increases intelligence',
    icon: '💊',
    duration: 300,
    statModifiers: { intelligence: 5 },
    isPermanent: false,
    stackable: false,
  },

  // Pill Effects - Permanent
  FOUNDATION_PILL: {
    name: 'Foundation Building Pill',
    type: 'buff',
    description: 'Permanently increases cultivation base',
    icon: '💎',
    duration: -1,
    statModifiers: { cultivation: 10 },
    isPermanent: true,
    stackable: false,
  },

  BODY_TEMPERING_PILL: {
    name: 'Body Tempering Pill',
    type: 'buff',
    description: 'Permanently increases strength and health',
    icon: '💎',
    duration: -1,
    statModifiers: { strength: 3 },
    maxStatModifiers: { maxHealth: 20 },
    isPermanent: true,
    stackable: false,
  },

  // Regeneration Buffs
  HEALING_SALVE: {
    name: 'Healing Salve',
    type: 'buff',
    description: 'Rapidly regenerates health',
    icon: '🌿',
    duration: 60, // 1 minute
    regenModifiers: { healthRegen: 2.0 },
    isPermanent: false,
    stackable: false,
  },

  QI_RECOVERY_PILL: {
    name: 'Qi Recovery Pill',
    type: 'buff',
    description: 'Rapidly regenerates qi',
    icon: '💊',
    duration: 120, // 2 minutes
    regenModifiers: { qiRegen: 3.0 },
    isPermanent: false,
    stackable: false,
  },

  // Blessings
  ELDER_BLESSING: {
    name: "Elder's Blessing",
    type: 'blessing',
    description: 'Blessed by a powerful elder, all stats increased',
    icon: '✨',
    duration: 600, // 10 minutes
    statModifiers: {
      strength: 3,
      agility: 3,
      intelligence: 3,
      charisma: 3,
      luck: 5,
    },
    isPermanent: false,
    stackable: false,
  },

  HEAVENLY_FORTUNE: {
    name: 'Heavenly Fortune',
    type: 'blessing',
    description: 'Blessed by the heavens, luck greatly increased',
    icon: '🌟',
    duration: 1800, // 30 minutes
    statModifiers: { luck: 10 },
    isPermanent: false,
    stackable: false,
  },
};

// ============================================
// DEBUFFS - Negative Effects
// ============================================

export const DEBUFF_EFFECTS: Record<string, Omit<ActiveEffect, 'id' | 'startTime'>> = {
  // Poisons
  WEAK_POISON: {
    name: 'Weak Poison',
    type: 'poison',
    description: 'Slowly drains health',
    icon: '☠️',
    duration: 120, // 2 minutes
    damageOverTime: { healthDamage: 0.5 },
    isPermanent: false,
    stackable: true,
  },

  DEADLY_POISON: {
    name: 'Deadly Poison',
    type: 'poison',
    description: 'Rapidly drains health and qi',
    icon: '💀',
    duration: 60, // 1 minute
    damageOverTime: {
      healthDamage: 2.0,
      qiDrain: 1.0,
    },
    statModifiers: {
      strength: -5,
      agility: -5,
    },
    isPermanent: false,
    stackable: true,
  },

  PARALYSIS_POISON: {
    name: 'Paralysis Poison',
    type: 'poison',
    description: 'Severely reduces agility',
    icon: '🕷️',
    duration: 180, // 3 minutes
    statModifiers: {
      agility: -10,
      strength: -3,
    },
    isPermanent: false,
    stackable: false,
  },

  // Qi Deviation
  QI_DEVIATION_MINOR: {
    name: 'Minor Qi Deviation',
    type: 'qi_deviation',
    description: 'Qi flows chaotically, reducing cultivation efficiency',
    icon: '⚡',
    duration: 300, // 5 minutes
    statModifiers: { cultivation: -5 },
    regenModifiers: { qiRegen: -0.5 },
    isPermanent: false,
    stackable: false,
  },

  QI_DEVIATION_MAJOR: {
    name: 'Major Qi Deviation',
    type: 'qi_deviation',
    description: 'Severe qi deviation, all stats reduced',
    icon: '💥',
    duration: 600, // 10 minutes
    statModifiers: {
      strength: -5,
      agility: -5,
      intelligence: -5,
      cultivation: -10,
    },
    damageOverTime: { healthDamage: 0.3 },
    regenModifiers: { qiRegen: -1.0 },
    isPermanent: false,
    stackable: false,
  },

  // Curses
  WEAKNESS_CURSE: {
    name: 'Curse of Weakness',
    type: 'curse',
    description: 'Cursed to be weak, strength greatly reduced',
    icon: '🌑',
    duration: 900, // 15 minutes
    statModifiers: {
      strength: -8,
      agility: -3,
    },
    isPermanent: false,
    stackable: false,
  },

  MISFORTUNE_CURSE: {
    name: 'Curse of Misfortune',
    type: 'curse',
    description: 'Cursed with bad luck',
    icon: '🌑',
    duration: 1800, // 30 minutes
    statModifiers: { luck: -10 },
    isPermanent: false,
    stackable: false,
  },

  ETERNAL_CURSE: {
    name: 'Eternal Curse',
    type: 'curse',
    description: 'A permanent curse that weakens the body',
    icon: '💀',
    duration: -1,
    statModifiers: {
      strength: -5,
      agility: -5,
    },
    maxStatModifiers: {
      maxHealth: -20,
    },
    isPermanent: true,
    stackable: false,
  },

  // Injuries
  INTERNAL_INJURY: {
    name: 'Internal Injury',
    type: 'debuff',
    description: 'Internal organs damaged, health regeneration reduced',
    icon: '🩸',
    duration: 600, // 10 minutes
    regenModifiers: { healthRegen: -0.5 },
    statModifiers: { strength: -3 },
    isPermanent: false,
    stackable: true,
  },

  MERIDIAN_DAMAGE: {
    name: 'Meridian Damage',
    type: 'debuff',
    description: 'Meridians damaged, qi regeneration reduced',
    icon: '⚡',
    duration: 900, // 15 minutes
    regenModifiers: { qiRegen: -1.0 },
    statModifiers: { cultivation: -5 },
    isPermanent: false,
    stackable: true,
  },

  EXHAUSTION: {
    name: 'Exhaustion',
    type: 'debuff',
    description: 'Completely exhausted, all stats reduced',
    icon: '😴',
    duration: 300, // 5 minutes
    statModifiers: {
      strength: -5,
      agility: -5,
      intelligence: -3,
    },
    regenModifiers: {
      healthRegen: -0.3,
      qiRegen: -0.5,
    },
    isPermanent: false,
    stackable: false,
  },
};

// ============================================
// Helper Functions
// ============================================

export function createEffect(
  effectTemplate: Omit<ActiveEffect, 'id' | 'startTime'>,
  customizations?: Partial<ActiveEffect>
): ActiveEffect {
  return {
    ...effectTemplate,
    ...customizations,
    id: crypto.randomUUID(),
    startTime: Date.now(),
  };
}

export function getEffectByName(name: string): Omit<ActiveEffect, 'id' | 'startTime'> | null {
  // Search in buffs
  const buff = Object.values(BUFF_EFFECTS).find(e => e.name === name);
  if (buff) return buff;

  // Search in debuffs
  const debuff = Object.values(DEBUFF_EFFECTS).find(e => e.name === name);
  if (debuff) return debuff;

  return null;
}

export function getAllEffects(): Record<string, Omit<ActiveEffect, 'id' | 'startTime'>> {
  return {
    ...BUFF_EFFECTS,
    ...DEBUFF_EFFECTS,
  };
}

// Effect categories for UI
export const EFFECT_CATEGORIES = {
  buffs: Object.values(BUFF_EFFECTS),
  debuffs: Object.values(DEBUFF_EFFECTS),
  poisons: Object.values(DEBUFF_EFFECTS).filter(e => e.type === 'poison'),
  curses: Object.values(DEBUFF_EFFECTS).filter(e => e.type === 'curse'),
  qiDeviation: Object.values(DEBUFF_EFFECTS).filter(e => e.type === 'qi_deviation'),
  blessings: Object.values(BUFF_EFFECTS).filter(e => e.type === 'blessing'),
};
