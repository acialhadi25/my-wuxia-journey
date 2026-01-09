import { Character } from '@/types/game';
import { TutorialStep, TutorialStepResult, AutoAction } from '@/types/tutorial';
import { tutorialSteps } from '@/data/tutorialSteps';
import { getGoldenFingerAwakeningNarrative, goldenFingerTemplates } from '@/data/goldenFingerTemplates';
import { RegenerationService } from './regenerationService';

export class TutorialService {
  /**
   * Get current tutorial step number
   */
  static getCurrentStep(character: Character): number {
    return character.tutorialStep || 0;
  }

  /**
   * Check if tutorial is active
   */
  static isTutorialActive(character: Character): boolean {
    return !character.tutorialCompleted && (character.tutorialStep || 0) < 15;
  }

  /**
   * Get step data for current step
   */
  static getStepData(stepNumber: number): TutorialStep | null {
    if (stepNumber < 1 || stepNumber > 15) return null;
    return tutorialSteps[stepNumber - 1];
  }

  /**
   * Execute a tutorial step and return results
   */
  static async executeStep(
    stepNumber: number,
    character: Character,
    language: 'en' | 'id'
  ): Promise<TutorialStepResult> {
    const step = this.getStepData(stepNumber);
    if (!step) {
      throw new Error(`Invalid tutorial step: ${stepNumber}`);
    }

    // Get localized text
    const narrative = step.narrative[language];
    const daoMasterMessage = step.daoMasterMessage[language];
    const actionText = step.actionText[language];

    // Special handling for Golden Finger awakening (step 13)
    let finalNarrative = narrative;
    if (stepNumber === 13) {
      finalNarrative = getGoldenFingerAwakeningNarrative(
        character.goldenFinger.name,
        character.name,
        character.visualTraits?.gender || 'Male',
        language
      );
    }

    // Execute auto-actions
    let updatedCharacter = { ...character };
    for (const action of step.autoActions) {
      updatedCharacter = await this.executeAutoAction(action, updatedCharacter);
    }

    return {
      narrative: finalNarrative,
      daoMasterMessage,
      actionText,
      updatedCharacter,
      panelToOpen: step.panelToOpen,
      highlightButton: step.highlightButton,
      isComplete: stepNumber >= 15,
      autoActions: step.autoActions
    };
  }

  /**
   * Execute a single auto-action
   */
  static async executeAutoAction(
    action: AutoAction,
    character: Character
  ): Promise<Character> {
    const updated = { ...character };

    switch (action.type) {
      case 'add_item':
        return this.addItem(updated, action.params);

      case 'remove_effect':
        return RegenerationService.removeEffect(updated, action.params.name);

      case 'add_effect':
        return this.addEffect(updated, action.params);

      case 'stat_change':
        return this.changeStats(updated, action.params);

      case 'restore_stat':
        return this.restoreStats(updated, action.params);

      case 'add_technique':
        return this.addTechnique(updated, action.params);

      case 'gain_xp':
        return this.gainXP(updated, action.params);

      case 'unlock_golden_finger':
        return this.unlockGoldenFinger(updated);

      case 'add_memory':
        // Memory will be handled by GameScreen
        return updated;

      case 'wait':
        // Wait is handled by UI
        return updated;

      case 'spawn_enemy':
      case 'deal_damage':
      case 'open_panel':
        // These are handled by GameScreen
        return updated;

      default:
        console.warn(`Unknown auto-action type: ${action.type}`);
        return updated;
    }
  }

  /**
   * Add item to inventory
   */
  private static addItem(character: Character, itemData: any): Character {
    const newItem = {
      id: itemData.id || crypto.randomUUID(),
      name: itemData.name,
      type: itemData.type,
      description: itemData.description,
      quantity: itemData.quantity || 1,
      effects: itemData.effects || {},
      rarity: itemData.rarity || 'common'
    };

    // Check if item already exists
    const existingIndex = character.inventory.findIndex(i => i.id === newItem.id);
    if (existingIndex >= 0) {
      character.inventory[existingIndex].quantity += newItem.quantity;
    } else {
      character.inventory.push(newItem);
    }

    return character;
  }

  /**
   * Add effect to character
   */
  private static addEffect(character: Character, effectData: any): Character {
    if (!character.activeEffects) {
      character.activeEffects = [];
    }

    const newEffect = {
      id: crypto.randomUUID(),
      name: effectData.name,
      type: effectData.type,
      description: effectData.description,
      duration: effectData.duration,
      startTime: Date.now(),
      statModifiers: effectData.statModifiers || {},
      regenModifiers: effectData.regenModifiers || {},
      damageOverTime: effectData.damageOverTime || {},
      maxStatModifiers: effectData.maxStatModifiers || {},
      isPermanent: effectData.duration === -1,
      stackable: effectData.stackable || false
    };

    character.activeEffects.push(newEffect);
    return character;
  }

  /**
   * Change character stats
   */
  private static changeStats(character: Character, changes: any): Character {
    if (changes.health !== undefined) {
      character.health = Math.max(0, Math.min(
        character.health + changes.health,
        character.maxHealth
      ));
    }

    if (changes.qi !== undefined) {
      character.qi = Math.max(0, Math.min(
        character.qi + changes.qi,
        character.maxQi
      ));
    }

    if (changes.stamina !== undefined) {
      character.stamina = Math.max(0, Math.min(
        character.stamina + changes.stamina,
        character.maxStamina
      ));
    }

    if (changes.cultivationProgress !== undefined) {
      character.cultivationProgress = Math.max(0, Math.min(
        character.cultivationProgress + changes.cultivationProgress,
        100
      ));
    }

    // Stat changes
    if (changes.strength) character.stats.strength += changes.strength;
    if (changes.agility) character.stats.agility += changes.agility;
    if (changes.intelligence) character.stats.intelligence += changes.intelligence;
    if (changes.charisma) character.stats.charisma += changes.charisma;
    if (changes.luck) character.stats.luck += changes.luck;

    return character;
  }

  /**
   * Restore stats (set to specific value or max)
   */
  private static restoreStats(character: Character, restores: any): Character {
    if (restores.health !== undefined) {
      character.health = Math.min(
        character.health + restores.health,
        character.maxHealth
      );
    }

    if (restores.qi !== undefined) {
      character.qi = Math.min(
        character.qi + restores.qi,
        character.maxQi
      );
    }

    if (restores.stamina !== undefined) {
      character.stamina = Math.min(
        character.stamina + restores.stamina,
        character.maxStamina
      );
    }

    return character;
  }

  /**
   * Add technique to character
   */
  private static addTechnique(character: Character, techniqueData: any): Character {
    if (!character.techniques) {
      character.techniques = [];
    }

    const newTechnique = {
      id: techniqueData.id || crypto.randomUUID(),
      name: techniqueData.name,
      description: techniqueData.description,
      qiCost: techniqueData.qiCost,
      staminaCost: techniqueData.staminaCost || 0,
      damage: techniqueData.damage || 0,
      element: techniqueData.element || 'neutral',
      mastery: techniqueData.mastery || 0,
      maxMastery: techniqueData.maxMastery || 100,
      effects: techniqueData.effects || []
    };

    // Check if technique already exists
    const exists = character.techniques.some(t => t.id === newTechnique.id);
    if (!exists) {
      character.techniques.push(newTechnique);
    }

    return character;
  }

  /**
   * Gain XP and update cultivation progress
   */
  private static gainXP(character: Character, params: any): Character {
    const amount = params.amount || 0;
    character.cultivationProgress = Math.min(
      character.cultivationProgress + amount,
      100
    );
    return character;
  }

  /**
   * Unlock Golden Finger
   */
  private static unlockGoldenFinger(character: Character): Character {
    character.goldenFingerUnlocked = true;

    // Apply awakening bonuses
    const template = goldenFingerTemplates[character.goldenFinger.name];
    if (template) {
      const bonus = template.awakening_bonus;

      // Apply stat changes
      if (bonus.stat_changes) {
        Object.entries(bonus.stat_changes).forEach(([stat, value]) => {
          if (character.stats[stat as keyof typeof character.stats] !== undefined) {
            (character.stats[stat as keyof typeof character.stats] as number) += value;
          }
        });
      }

      // Add new technique
      if (bonus.new_technique) {
        this.addTechnique(character, {
          id: bonus.new_technique.toLowerCase().replace(/\s+/g, '_'),
          name: bonus.new_technique,
          description: `Special technique from ${character.goldenFinger.name}`,
          qiCost: 15,
          staminaCost: 5,
          damage: 20,
          element: 'special'
        });
      }
    }

    return character;
  }

  /**
   * Complete current step and advance to next
   */
  static completeStep(character: Character): Character {
    const currentStep = character.tutorialStep || 0;
    return {
      ...character,
      tutorialStep: currentStep + 1
    };
  }

  /**
   * Complete entire tutorial
   */
  static completeTutorial(character: Character): Character {
    return {
      ...character,
      tutorialCompleted: true,
      tutorialStep: 15,
      goldenFingerUnlocked: true
    };
  }

  /**
   * Skip tutorial (for returning players)
   */
  static skipTutorial(character: Character): Character {
    return this.completeTutorial(character);
  }
}
