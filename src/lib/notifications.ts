import { toast } from 'sonner';

// Success notifications
export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

// Game-specific notifications
export const gameNotify = {
  characterCreated: (name: string) => {
    notify.success('Character Created', `${name} has entered the Jianghu!`);
  },

  statIncrease: (stat: string, amount: number) => {
    notify.success(`${stat} +${amount}`, 'Your cultivation deepens...');
  },

  techniqueLearn: (technique: string) => {
    notify.success('New Technique!', `You have learned: ${technique}`);
  },

  itemObtained: (item: string, rarity: string) => {
    const rarityColors: Record<string, string> = {
      common: '⚪',
      uncommon: '🟢',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟠',
      divine: '🔴',
    };
    const icon = rarityColors[rarity.toLowerCase()] || '⚪';
    notify.success('Item Obtained', `${icon} ${item}`);
  },

  cultivationBreakthrough: (realm: string) => {
    notify.success('Breakthrough!', `You have reached ${realm}!`);
  },

  death: (cause: string) => {
    notify.error('You have fallen', cause);
  },

  saveSuccess: () => {
    notify.success('Progress Saved', 'Your journey has been recorded');
  },

  saveError: () => {
    notify.error('Save Failed', 'Unable to save your progress');
  },

  networkError: () => {
    notify.error('Connection Lost', 'Please check your internet connection');
  },

  aiError: () => {
    notify.error('AI Unavailable', 'The heavens are silent. Please try again.');
  },

  tutorialComplete: () => {
    notify.success('Tutorial Complete', 'Your journey truly begins now!');
  },

  questComplete: (questName: string) => {
    notify.success('Quest Complete', questName);
  },

  achievementUnlocked: (achievement: string) => {
    notify.success('Achievement Unlocked!', achievement);
  },
};
