import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, GameMessage, GameChoice } from '@/types/game';

interface GameState {
  // Character state
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  updateCharacter: (updates: Partial<Character>) => void;

  // Messages state
  messages: GameMessage[];
  addMessage: (message: GameMessage) => void;
  clearMessages: () => void;
  setMessages: (messages: GameMessage[]) => void;

  // Choices state
  currentChoices: GameChoice[];
  setCurrentChoices: (choices: GameChoice[]) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Reset all state
  reset: () => void;
}

const initialState = {
  character: null,
  messages: [],
  currentChoices: [],
  isLoading: false,
  error: null,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCharacter: (character) => set({ character }),

      updateCharacter: (updates) => {
        const current = get().character;
        if (!current) return;
        set({ character: { ...current, ...updates } });
      },

      addMessage: (message) => 
        set((state) => ({ 
          messages: [...state.messages, message] 
        })),

      clearMessages: () => set({ messages: [] }),

      setMessages: (messages) => set({ messages }),

      setCurrentChoices: (currentChoices) => set({ currentChoices }),

      setIsLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        character: state.character,
        messages: state.messages,
      }),
    }
  )
);
