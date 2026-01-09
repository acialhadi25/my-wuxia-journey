import { useEffect, useRef } from 'react';
import { Character } from '@/types/game';
import { RegenerationService } from '@/services/regenerationService';

const REGEN_INTERVAL = 1000; // Update every 1 second

export function useRegeneration(
  character: Character,
  onUpdate: (character: Character) => void,
  enabled: boolean = true
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initialize last regeneration time if not set
    if (!character.lastRegeneration) {
      character.lastRegeneration = Date.now();
    }

    // Start regeneration interval
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
      lastUpdateRef.current = now;

      // Update effects (remove expired ones)
      let updatedCharacter = RegenerationService.updateEffects(character);

      // Apply regeneration
      updatedCharacter = RegenerationService.applyRegeneration(updatedCharacter, deltaTime);

      // Only update if there are changes
      if (
        updatedCharacter.health !== character.health ||
        updatedCharacter.qi !== character.qi ||
        updatedCharacter.activeEffects?.length !== character.activeEffects?.length
      ) {
        onUpdate(updatedCharacter);
      }
    }, REGEN_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [character, onUpdate, enabled]);

  return {
    isRegenerating: enabled && intervalRef.current !== null,
  };
}
