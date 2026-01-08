import { supabase } from '@/integrations/supabase/client';
import { Character } from '@/types/game';

// Auto-save debounce time in milliseconds
const SAVE_DEBOUNCE_MS = 1000;

// Track pending saves
let pendingSaveTimeout: NodeJS.Timeout | null = null;
let lastSaveTime = 0;

export type GameState = {
  characterId: string;
  character: Character;
  currentPhase: 'tutorial' | 'playing';
  tutorialStep?: number;
  tutorialHistory?: string;
  currentLocation?: string;
  timeElapsed?: string;
  currentChapter?: number;
  lastChoices?: any[]; // Store last generated choices
};

// Save game state to localStorage as backup
export function saveToLocalStorage(state: GameState): void {
  try {
    const key = `game_state_${state.characterId}`;
    const data = {
      ...state,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(data));
    console.log('Game state saved to localStorage:', key);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Load game state from localStorage
export function loadFromLocalStorage(characterId: string): GameState | null {
  try {
    const key = `game_state_${characterId}`;
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log('Game state loaded from localStorage:', key);
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return null;
}

// Clear localStorage state
export function clearLocalStorage(characterId: string): void {
  try {
    const key = `game_state_${characterId}`;
    localStorage.removeItem(key);
    console.log('Game state cleared from localStorage:', key);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

// Auto-save character to database with debouncing
export async function autoSaveCharacter(
  characterId: string,
  updates: Partial<{
    stats: any;
    health: number;
    max_health: number;
    qi: number;
    max_qi: number;
    karma: number;
    realm: string;
    cultivation_progress: number;
    breakthrough_ready: boolean;
    current_location: string;
    time_elapsed: string;
    current_chapter: number;
    tutorial_completed: boolean;
    golden_finger_unlocked: boolean;
    current_tutorial_step: number;
  }>
): Promise<boolean> {
  // Debounce saves
  const now = Date.now();
  if (now - lastSaveTime < SAVE_DEBOUNCE_MS) {
    // Cancel pending save and schedule new one
    if (pendingSaveTimeout) {
      clearTimeout(pendingSaveTimeout);
    }
    
    return new Promise((resolve) => {
      pendingSaveTimeout = setTimeout(async () => {
        const result = await performSave(characterId, updates);
        resolve(result);
      }, SAVE_DEBOUNCE_MS);
    });
  }
  
  return performSave(characterId, updates);
}

async function performSave(
  characterId: string,
  updates: any
): Promise<boolean> {
  lastSaveTime = Date.now();
  
  try {
    // Filter out undefined values and non-existent columns
    const validUpdates: any = {};
    const validColumns = [
      'stats', 'health', 'max_health', 'qi', 'max_qi', 'karma',
      'realm', 'cultivation_progress', 'breakthrough_ready',
      'current_location', 'time_elapsed', 'current_chapter'
    ];
    
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && validColumns.includes(key)) {
        validUpdates[key] = value;
      }
    }
    
    if (Object.keys(validUpdates).length === 0) {
      console.log('No valid updates to save');
      return true;
    }
    
    // Add updated_at timestamp
    validUpdates.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('characters')
      .update(validUpdates)
      .eq('id', characterId);

    if (error) {
      console.error('Auto-save failed:', error);
      return false;
    }

    console.log('Auto-save successful:', characterId, validUpdates);
    return true;
  } catch (error) {
    console.error('Auto-save error:', error);
    return false;
  }
}

// Save tutorial progress
export async function saveTutorialProgress(
  characterId: string,
  step: number,
  narrative: string,
  choices: any[],
  playerChoice?: string,
  allMessages?: any[],
  tutorialHistory?: string
): Promise<boolean> {
  try {
    // Save to localStorage as backup with full history
    const localKey = `tutorial_progress_${characterId}`;
    localStorage.setItem(localKey, JSON.stringify({
      step,
      narrative,
      choices,
      playerChoice,
      allMessages: allMessages || [],
      tutorialHistory: tutorialHistory || '',
      savedAt: new Date().toISOString()
    }));
    
    // Try to save to database (may fail if table doesn't exist)
    try {
      const { error } = await supabase
        .from('tutorial_steps')
        .upsert({
          character_id: characterId,
          step_number: step,
          narrative,
          choices,
          player_choice: playerChoice,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'character_id,step_number'
        });
      
      if (error) {
        console.log('Tutorial save to DB failed (expected if table missing):', error.message);
      } else {
        console.log('Tutorial progress saved to database');
      }
    } catch (dbError) {
      console.log('Tutorial DB save skipped:', dbError);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save tutorial progress:', error);
    return false;
  }
}

// Load tutorial progress
export async function loadTutorialProgress(characterId: string): Promise<{
  step: number;
  narrative: string;
  choices: any[];
  playerChoice?: string;
  allMessages?: any[];
  tutorialHistory?: string;
} | null> {
  try {
    // Try database first
    try {
      const { data, error } = await supabase
        .from('tutorial_steps')
        .select('*')
        .eq('character_id', characterId)
        .order('step_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!error && data) {
        return {
          step: data.step_number,
          narrative: data.narrative,
          choices: data.choices,
          playerChoice: data.player_choice
        };
      }
    } catch (dbError) {
      console.log('Tutorial DB load skipped:', dbError);
    }
    
    // Fallback to localStorage
    const localKey = `tutorial_progress_${characterId}`;
    const localData = localStorage.getItem(localKey);
    if (localData) {
      const parsed = JSON.parse(localData);
      return {
        step: parsed.step,
        narrative: parsed.narrative,
        choices: parsed.choices,
        playerChoice: parsed.playerChoice,
        allMessages: parsed.allMessages || [],
        tutorialHistory: parsed.tutorialHistory || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load tutorial progress:', error);
    return null;
  }
}

// Save chat messages batch
export async function saveChatMessagesBatch(
  characterId: string,
  messages: Array<{
    role: string;
    content: string;
    messageType: string;
    speaker?: string;
  }>
): Promise<boolean> {
  try {
    const records = messages.map(msg => ({
      character_id: characterId,
      role: msg.role,
      content: msg.content,
      message_type: msg.messageType,
      speaker: msg.speaker || null
    }));
    
    const { error } = await supabase
      .from('chat_messages')
      .insert(records);
    
    if (error) {
      console.error('Failed to save chat messages:', error);
      return false;
    }
    
    console.log('Chat messages saved:', records.length);
    return true;
  } catch (error) {
    console.error('Chat messages save error:', error);
    return false;
  }
}

// Create auto-save hook for components
export function createAutoSaveCallback(
  characterId: string,
  onSaveStart?: () => void,
  onSaveComplete?: (success: boolean) => void
) {
  return async (updates: any) => {
    onSaveStart?.();
    const success = await autoSaveCharacter(characterId, updates);
    onSaveComplete?.(success);
    return success;
  };
}

// Save last choices to localStorage and database
export async function saveLastChoices(
  characterId: string,
  choices: any[]
): Promise<boolean> {
  try {
    // Save to localStorage
    const localKey = `last_choices_${characterId}`;
    localStorage.setItem(localKey, JSON.stringify({
      choices,
      savedAt: new Date().toISOString()
    }));
    console.log('Last choices saved to localStorage:', choices.length, 'choices');
    
    // Also save to database as JSON in a metadata field
    // We'll store it in the characters table as a JSON field
    try {
      const { error } = await supabase
        .from('characters')
        .update({
          last_choices: choices,
          updated_at: new Date().toISOString()
        })
        .eq('id', characterId);
      
      if (error) {
        console.error('Failed to save choices to database:', error);
      } else {
        console.log('Last choices saved to database');
      }
    } catch (dbError) {
      console.log('Choices DB save skipped:', dbError);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save last choices:', error);
    return false;
  }
}

// Load last choices from localStorage or database
export async function loadLastChoices(characterId: string): Promise<any[] | null> {
  try {
    // Try database first
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('last_choices')
        .eq('id', characterId)
        .single();
      
      if (!error && data && data.last_choices) {
        console.log('Last choices loaded from database:', data.last_choices.length, 'choices');
        return data.last_choices;
      }
    } catch (dbError) {
      console.log('Choices DB load skipped:', dbError);
    }
    
    // Fallback to localStorage
    const localKey = `last_choices_${characterId}`;
    const localData = localStorage.getItem(localKey);
    if (localData) {
      const parsed = JSON.parse(localData);
      console.log('Last choices loaded from localStorage:', parsed.choices.length, 'choices');
      return parsed.choices;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load last choices:', error);
    return null;
  }
}
