import { useMutation } from '@tanstack/react-query';
import { Character } from '@/types/game';
import { generateNarrative } from '@/services/gameService';

interface GenerateNarrativeParams {
  character: Character;
  action: string;
  characterId?: string;
  language?: 'en' | 'id';
}

export const useGenerateNarrative = () => {
  return useMutation({
    mutationFn: async ({ character, action, characterId, language }: GenerateNarrativeParams) => {
      return await generateNarrative(character, action, characterId, language);
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onError: (error) => {
      console.error('Failed to generate narrative:', error);
    },
  });
};
