import { Character, CultivationRealm, ActiveEffect } from '@/types/game';

// Regeneration rates based on cultivation realm (per second)
const REALM_REGEN_RATES: Record<CultivationRealm, { health: number; qi: number }> = {
  'Mortal': { health: 0.1, qi: 0.2 },
  'Qi Condensation': { health: 0.2, qi: 0.5 },
  'Foundation Establishment': { health: 0.3, qi: 1.0 },
  'Core Formation': { health: 0.5, qi: 2.0 },
  'Nascent Soul': { health: 1.0, qi: 4.0 },
  'Spirit Severing': { health: 2.0, qi: 8.0 },
  'Dao Seeking': { health: 4.0, qi: 15.0 },
  'Immortal Ascension': { health: 10.0, qi: 30.0 },
};

export class RegenerationService {
  /**
   * Calculate total regeneration including base + effects
   */
  static calculateRegeneration(character: Character): { health: number; qi: number } {
    const baseRegen = REALM_REGEN_RATES[character.realm] || REALM_REGEN_RATES['Mortal'];
    
    let healthRegen = baseRegen.health;
    let qiRegen = baseRegen.qi;

    // Apply effect modifiers
    if (character.activeEffects) {
      for (const effect of character.activeEffects) {
        if (effect.regenModifiers) {
          healthRegen += effect.regenModifiers.healthRegen || 0;
          qiRegen += effect.regenModifiers.qiRegen || 0;
        }
        
        // Apply damage over time (negative regen)
        if (effect.damageOverTime) {
          healthRegen -= effect.damageOverTime.healthDamage || 0;
          qiRegen -= effect.damageOverTime.qiDrain || 0;
        }
      }
    }

    return {
      health: Math.max(0, healthRegen), // Can't be negative (handled separately)
      qi: Math.max(0, qiRegen),
    };
  }

  /**
   * Apply regeneration to character
   */
  static applyRegeneration(character: Character, deltaTime: number): Character {
    const regen = this.calculateRegeneration(character);
    
    // Calculate regeneration amount based on time passed
    const healthGain = regen.health * deltaTime;
    const qiGain = regen.qi * deltaTime;

    // Apply damage over time separately (can kill)
    let healthLoss = 0;
    let qiLoss = 0;
    
    if (character.activeEffects) {
      for (const effect of character.activeEffects) {
        if (effect.damageOverTime) {
          healthLoss += (effect.damageOverTime.healthDamage || 0) * deltaTime;
          qiLoss += (effect.damageOverTime.qiDrain || 0) * deltaTime;
        }
      }
    }

    const newHealth = Math.min(
      character.maxHealth,
      Math.max(0, character.health + healthGain - healthLoss)
    );
    
    const newQi = Math.min(
      character.maxQi,
      Math.max(0, character.qi + qiGain - qiLoss)
    );

    return {
      ...character,
      health: Math.round(newHealth * 10) / 10, // Round to 1 decimal
      qi: Math.round(newQi * 10) / 10,
      lastRegeneration: Date.now(),
    };
  }

  /**
   * Update active effects and remove expired ones
   */
  static updateEffects(character: Character): Character {
    if (!character.activeEffects || character.activeEffects.length === 0) {
      return character;
    }

    const now = Date.now();
    const activeEffects = character.activeEffects.filter(effect => {
      // Keep permanent effects
      if (effect.isPermanent || effect.duration === -1) {
        return true;
      }
      
      // Check if effect has expired
      const elapsed = (now - effect.startTime) / 1000; // Convert to seconds
      return elapsed < effect.duration;
    });

    return {
      ...character,
      activeEffects,
    };
  }

  /**
   * Calculate total stat modifiers from all active effects
   */
  static calculateStatModifiers(character: Character): {
    strength: number;
    agility: number;
    intelligence: number;
    charisma: number;
    luck: number;
    cultivation: number;
  } {
    const modifiers = {
      strength: 0,
      agility: 0,
      intelligence: 0,
      charisma: 0,
      luck: 0,
      cultivation: 0,
    };

    if (!character.activeEffects) {
      return modifiers;
    }

    for (const effect of character.activeEffects) {
      if (effect.statModifiers) {
        const multiplier = effect.stacks || 1;
        modifiers.strength += (effect.statModifiers.strength || 0) * multiplier;
        modifiers.agility += (effect.statModifiers.agility || 0) * multiplier;
        modifiers.intelligence += (effect.statModifiers.intelligence || 0) * multiplier;
        modifiers.charisma += (effect.statModifiers.charisma || 0) * multiplier;
        modifiers.luck += (effect.statModifiers.luck || 0) * multiplier;
        modifiers.cultivation += (effect.statModifiers.cultivation || 0) * multiplier;
      }
    }

    return modifiers;
  }

  /**
   * Calculate total max stat modifiers from all active effects
   */
  static calculateMaxStatModifiers(character: Character): {
    maxHealth: number;
    maxQi: number;
  } {
    const modifiers = {
      maxHealth: 0,
      maxQi: 0,
    };

    if (!character.activeEffects) {
      return modifiers;
    }

    for (const effect of character.activeEffects) {
      if (effect.maxStatModifiers) {
        modifiers.maxHealth += effect.maxStatModifiers.maxHealth || 0;
        modifiers.maxQi += effect.maxStatModifiers.maxQi || 0;
      }
    }

    return modifiers;
  }

  /**
   * Get effective stats (base + modifiers)
   */
  static getEffectiveStats(character: Character) {
    const modifiers = this.calculateStatModifiers(character);
    
    return {
      strength: character.stats.strength + modifiers.strength,
      agility: character.stats.agility + modifiers.agility,
      intelligence: character.stats.intelligence + modifiers.intelligence,
      charisma: character.stats.charisma + modifiers.charisma,
      luck: character.stats.luck + modifiers.luck,
      cultivation: character.stats.cultivation + modifiers.cultivation,
    };
  }

  /**
   * Add or update an effect on character
   */
  static addEffect(character: Character, effect: ActiveEffect): Character {
    const activeEffects = character.activeEffects || [];
    
    // Check if effect is stackable
    const existingIndex = activeEffects.findIndex(e => e.name === effect.name);
    
    if (existingIndex >= 0) {
      const existing = activeEffects[existingIndex];
      
      if (effect.stackable) {
        // Increase stack count
        activeEffects[existingIndex] = {
          ...existing,
          stacks: (existing.stacks || 1) + 1,
          startTime: Date.now(), // Refresh duration
        };
      } else {
        // Replace with new effect (refresh duration)
        activeEffects[existingIndex] = {
          ...effect,
          startTime: Date.now(),
        };
      }
    } else {
      // Add new effect
      activeEffects.push({
        ...effect,
        startTime: Date.now(),
        stacks: 1,
      });
    }

    return {
      ...character,
      activeEffects,
    };
  }

  /**
   * Remove an effect from character
   */
  static removeEffect(character: Character, effectName: string): Character {
    if (!character.activeEffects) {
      return character;
    }

    const activeEffects = character.activeEffects.filter(e => e.name !== effectName);

    return {
      ...character,
      activeEffects,
    };
  }

  /**
   * Check if character has a specific effect
   */
  static hasEffect(character: Character, effectName: string): boolean {
    return character.activeEffects?.some(e => e.name === effectName) || false;
  }

  /**
   * Get remaining time for an effect (in seconds)
   */
  static getEffectRemainingTime(character: Character, effectName: string): number {
    const effect = character.activeEffects?.find(e => e.name === effectName);
    
    if (!effect) return 0;
    if (effect.isPermanent || effect.duration === -1) return -1;
    
    const elapsed = (Date.now() - effect.startTime) / 1000;
    return Math.max(0, effect.duration - elapsed);
  }
}
