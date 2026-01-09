export type SpiritualRoot = {
  id: string;
  name: string;
  element: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'trash';
  bonuses: {
    strength?: number;
    agility?: number;
    intelligence?: number;
    charisma?: number;
    luck?: number;
    cultivation?: number;
  };
  color: string;
};

export const spiritualRoots: SpiritualRoot[] = [
  {
    id: 'fire',
    name: 'Fire Spirit Root',
    element: 'Fire',
    description: 'Born with flames in your soul. Aggressive and powerful, but difficult to control.',
    rarity: 'uncommon',
    bonuses: { strength: 2, cultivation: 1 },
    color: 'text-red-500',
  },
  {
    id: 'water',
    name: 'Water Spirit Root',
    element: 'Water',
    description: 'Flowing like water, adaptable and persistent. Excellent for healing and defense.',
    rarity: 'uncommon',
    bonuses: { intelligence: 2, cultivation: 1 },
    color: 'text-blue-500',
  },
  {
    id: 'earth',
    name: 'Earth Spirit Root',
    element: 'Earth',
    description: 'Solid as a mountain. Unmatched defense and endurance.',
    rarity: 'uncommon',
    bonuses: { strength: 1, cultivation: 2 },
    color: 'text-yellow-700',
  },
  {
    id: 'wood',
    name: 'Wood Spirit Root',
    element: 'Wood',
    description: 'Life force flows through you. Natural healing and growth abilities.',
    rarity: 'uncommon',
    bonuses: { intelligence: 1, cultivation: 2 },
    color: 'text-green-600',
  },
  {
    id: 'metal',
    name: 'Metal Spirit Root',
    element: 'Metal',
    description: 'Sharp as a blade. Excellent for weapon techniques and precision.',
    rarity: 'uncommon',
    bonuses: { agility: 2, cultivation: 1 },
    color: 'text-gray-400',
  },
  {
    id: 'lightning',
    name: 'Lightning Spirit Root',
    element: 'Lightning',
    description: 'Fast as lightning, devastating as thunder. Rare and powerful.',
    rarity: 'rare',
    bonuses: { agility: 3, cultivation: 2 },
    color: 'text-purple-400',
  },
  {
    id: 'darkness',
    name: 'Darkness Spirit Root',
    element: 'Darkness',
    description: 'Shadow and void. Mysterious and feared by many.',
    rarity: 'rare',
    bonuses: { intelligence: 3, cultivation: 2 },
    color: 'text-purple-900',
  },
  {
    id: 'light',
    name: 'Light Spirit Root',
    element: 'Light',
    description: 'Radiant and pure. Blessed by the heavens.',
    rarity: 'rare',
    bonuses: { charisma: 3, cultivation: 2 },
    color: 'text-yellow-300',
  },
  {
    id: 'trash',
    name: 'Trash Spirit Root',
    element: 'Trash',
    description: 'Blocked meridians, no elemental affinity. The path of the underdog.',
    rarity: 'trash',
    bonuses: { luck: 5 },
    color: 'text-gray-500',
  },
  {
    id: 'heavenly',
    name: 'Heavenly Spirit Root',
    element: 'All Elements',
    description: 'One in a million. Perfect affinity with all elements. Destined for greatness.',
    rarity: 'legendary',
    bonuses: { cultivation: 5, intelligence: 2, charisma: 2 },
    color: 'text-gold',
  },
];
