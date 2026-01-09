// Tutorial System Types

export interface TutorialStep {
  id: number;
  chapter: 'survival' | 'combat' | 'cultivation' | 'golden_finger' | 'advanced';
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
  waitForUserAction?: boolean; // If true, wait for user to click button/panel
}

export type AutoActionType = 
  | 'add_item'
  | 'remove_effect'
  | 'add_effect'
  | 'stat_change'
  | 'spawn_enemy'
  | 'deal_damage'
  | 'gain_xp'
  | 'open_panel'
  | 'wait'
  | 'add_technique'
  | 'restore_stat'
  | 'add_memory'
  | 'unlock_golden_finger';

export interface AutoAction {
  type: AutoActionType;
  params: any;
  delay?: number; // Delay in ms before executing
}

export interface TutorialStepResult {
  narrative: string;
  daoMasterMessage: string;
  actionText: string;
  updatedCharacter: any;
  panelToOpen?: string;
  highlightButton?: string;
  isComplete: boolean;
  autoActions: AutoAction[];
}

export interface GoldenFingerAwakeningTemplate {
  narrative_id: string;
  narrative_en: string;
  effect: string;
  awakening_bonus: {
    stat_changes: Record<string, number>;
    new_technique: string;
    special_effect: string;
  };
}

export interface TutorialState {
  isActive: boolean;
  currentStep: number;
  completedSteps: number[];
  highlightedButton?: string;
  waitingForUserAction: boolean;
}
