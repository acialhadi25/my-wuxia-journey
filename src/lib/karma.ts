/**
 * Karma System Utilities
 * Provides karma-based calculations, visual indicators, and NPC reactions
 */

export type KarmaAlignment = 'saint' | 'righteous' | 'neutral' | 'evil' | 'demonic';
export type KarmaPath = 'righteous' | 'neutral' | 'demonic';

/**
 * Get karma alignment based on karma value
 * @param karma - Current karma value
 * @returns Alignment category
 */
export function getKarmaAlignment(karma: number): KarmaAlignment {
  if (karma >= 100) return 'saint';
  if (karma >= 30) return 'righteous';
  if (karma >= -30) return 'neutral';
  if (karma >= -100) return 'evil';
  return 'demonic';
}

/**
 * Get karma path (simplified for cultivation)
 * @param karma - Current karma value
 * @returns Path category
 */
export function getKarmaPath(karma: number): KarmaPath {
  if (karma >= 30) return 'righteous';
  if (karma <= -30) return 'demonic';
  return 'neutral';
}

/**
 * Get aura color based on karma
 * @param karma - Current karma value
 * @returns CSS color class
 */
export function getKarmaAuraColor(karma: number): string {
  const alignment = getKarmaAlignment(karma);
  
  switch (alignment) {
    case 'saint':
      return 'from-yellow-200 via-white to-yellow-200'; // Golden white aura
    case 'righteous':
      return 'from-jade via-jade-glow to-jade'; // Jade green aura
    case 'neutral':
      return 'from-gray-400 via-white to-gray-400'; // Gray aura
    case 'evil':
      return 'from-red-600 via-red-500 to-red-600'; // Red aura
    case 'demonic':
      return 'from-purple-900 via-black to-purple-900'; // Dark purple aura
  }
}

/**
 * Get karma badge color
 * @param karma - Current karma value
 * @returns CSS color classes
 */
export function getKarmaBadgeColor(karma: number): { bg: string; text: string; border: string } {
  const alignment = getKarmaAlignment(karma);
  
  switch (alignment) {
    case 'saint':
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' };
    case 'righteous':
      return { bg: 'bg-jade/20', text: 'text-jade-glow', border: 'border-jade/30' };
    case 'neutral':
      return { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' };
    case 'evil':
      return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
    case 'demonic':
      return { bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-900/30' };
  }
}

/**
 * Get karma alignment label
 * @param karma - Current karma value
 * @returns Human-readable label
 */
export function getKarmaLabel(karma: number): string {
  const alignment = getKarmaAlignment(karma);
  
  switch (alignment) {
    case 'saint':
      return '☀️ Saint';
    case 'righteous':
      return '✨ Righteous';
    case 'neutral':
      return '⚖️ Neutral';
    case 'evil':
      return '🔥 Evil';
    case 'demonic':
      return '😈 Demonic';
  }
}

/**
 * Get karma description
 * @param karma - Current karma value
 * @returns Description text
 */
export function getKarmaDescription(karma: number): string {
  const alignment = getKarmaAlignment(karma);
  
  switch (alignment) {
    case 'saint':
      return 'Your aura radiates pure light. Even demons hesitate before you.';
    case 'righteous':
      return 'You walk the path of righteousness. Sects welcome you.';
    case 'neutral':
      return 'You walk between light and shadow. Your path is your own.';
    case 'evil':
      return 'Your aura carries a crimson tint. Righteous cultivators eye you warily.';
    case 'demonic':
      return 'Dark energy surrounds you. Righteous sects hunt you on sight.';
  }
}

/**
 * Get NPC reaction modifier based on karma and NPC type
 * @param karma - Player karma
 * @param npcType - Type of NPC ('righteous', 'neutral', 'demonic')
 * @returns Reaction modifier (-100 to +100)
 */
export function getNPCReactionModifier(karma: number, npcType: 'righteous' | 'neutral' | 'demonic'): number {
  const playerPath = getKarmaPath(karma);
  
  // Same path = positive reaction
  if (playerPath === npcType) {
    return Math.abs(karma) / 2; // 0 to +50
  }
  
  // Opposite paths = negative reaction
  if (
    (playerPath === 'righteous' && npcType === 'demonic') ||
    (playerPath === 'demonic' && npcType === 'righteous')
  ) {
    return -Math.abs(karma) / 2; // 0 to -50
  }
  
  // Neutral interactions
  return 0;
}

/**
 * Get karma change description
 * @param change - Karma change amount
 * @returns Description of the change
 */
export function getKarmaChangeDescription(change: number): string {
  if (change > 0) {
    if (change >= 20) return '✨ Your righteous deed resonates through the heavens!';
    if (change >= 10) return '✨ You feel the approval of the heavens.';
    return '✨ A small good deed.';
  } else if (change < 0) {
    if (change <= -20) return '🔥 The heavens mark you as a villain!';
    if (change <= -10) return '🔥 You feel the weight of your sins.';
    return '🔥 A small evil deed.';
  }
  return '';
}

/**
 * Calculate karma impact on cultivation
 * Extreme karma (positive or negative) can affect cultivation speed
 * @param karma - Current karma value
 * @returns Cultivation speed modifier (0.5 to 1.5)
 */
export function getKarmaCultivationModifier(karma: number): number {
  const absKarma = Math.abs(karma);
  
  // Extreme karma (saint or demonic) gives cultivation bonus
  if (absKarma >= 100) {
    return 1.5; // 50% faster cultivation
  }
  
  // Strong alignment gives small bonus
  if (absKarma >= 50) {
    return 1.2; // 20% faster cultivation
  }
  
  // Neutral or weak alignment = normal speed
  return 1.0;
}

/**
 * Get karma-based technique affinity
 * Some techniques require specific karma alignment
 * @param karma - Current karma value
 * @param techniqueType - Type of technique ('righteous', 'neutral', 'demonic')
 * @returns Affinity multiplier (0.5 to 1.5)
 */
export function getKarmaTechniqueAffinity(
  karma: number,
  techniqueType: 'righteous' | 'neutral' | 'demonic'
): number {
  const playerPath = getKarmaPath(karma);
  
  // Matching path = bonus
  if (playerPath === techniqueType) {
    return 1.3; // 30% bonus
  }
  
  // Opposite path = penalty
  if (
    (playerPath === 'righteous' && techniqueType === 'demonic') ||
    (playerPath === 'demonic' && techniqueType === 'righteous')
  ) {
    return 0.7; // 30% penalty
  }
  
  // Neutral = normal
  return 1.0;
}

/**
 * Get karma icon based on value
 * @param karma - Current karma value
 * @returns Emoji icon
 */
export function getKarmaIcon(karma: number): string {
  const alignment = getKarmaAlignment(karma);
  
  switch (alignment) {
    case 'saint':
      return '☀️';
    case 'righteous':
      return '✨';
    case 'neutral':
      return '⚖️';
    case 'evil':
      return '🔥';
    case 'demonic':
      return '😈';
  }
}
