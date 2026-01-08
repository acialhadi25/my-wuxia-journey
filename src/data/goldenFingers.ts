import { GoldenFinger } from '@/types/game';

type OriginBonuses = {
  strength?: number;
  agility?: number;
  intelligence?: number;
  charisma?: number;
  luck?: number;
  cultivation?: number;
};

export type Origin = {
  id: string;
  title: string;
  description: string;
  spiritRoot: 'Fire' | 'Water' | 'Earth' | 'Wood' | 'Metal' | 'Lightning' | 'Darkness' | 'Light' | 'Trash';
  bonuses: OriginBonuses;
  penalties: OriginBonuses;
};

export type GoldenFingerScenario = {
  goldenFingerId: string;
  introMessage: string;
  scenarioPrompt: string;
};

// Extended Golden Fingers based on Wuxia/Xianxia novels
export const goldenFingers: GoldenFinger[] = [
  {
    id: 'system',
    name: 'The System',
    description: 'A mysterious voice in your head assigns daily quests with instant rewards. Like a game interface overlaying reality.',
    icon: '📊',
    effect: 'Receive daily cultivation quests. Complete them for bonus experience and rare items.',
  },
  {
    id: 'grandpa',
    name: 'Grandpa in the Ring',
    description: 'An ancient soul resides in a worn ring, offering wisdom and emergency power. A powerful senior from millions of years ago.',
    icon: '💍',
    effect: 'Can ask for hints during difficult situations. Once per life, borrow power to survive death.',
  },
  {
    id: 'copycat',
    name: 'Copycat Eye',
    description: 'Your eyes can see through techniques and copy them perfectly. All secrets of martial arts are revealed before you.',
    icon: '👁️',
    effect: 'View enemy stats and cultivation. Learn one technique per battle by observation.',
  },
  {
    id: 'alchemy',
    name: 'Alchemy God Body',
    description: 'Your body is a natural pill furnace with perfect refinement. Pills that would poison others become divine medicine to you.',
    icon: '⚗️',
    effect: '100% success rate in pill refinement. Pills you consume have doubled effects.',
  },
  {
    id: 'reincarnator',
    name: 'Memories of Past Lives',
    description: 'Fragments of knowledge from your previous incarnations surface at crucial moments. You have lived a thousand lifetimes.',
    icon: '🔮',
    effect: 'Occasionally receive prophetic warnings. Start with knowledge of hidden treasures.',
  },
  {
    id: 'heavenly-demon',
    name: 'Heavenly Demon Body',
    description: 'Your constitution absorbs negative energy and converts it to power. The path of the demon is your cultivation road.',
    icon: '😈',
    effect: 'Gain cultivation from killing. Dark techniques cost less Qi. Beware of Heart Demons.',
  },
  {
    id: 'azure-dragon',
    name: 'Azure Dragon Bloodline',
    description: 'The blood of the Azure Dragon flows through your veins, dormant but awakening. You are a descendant of divine beasts.',
    icon: '🐉',
    effect: 'Dragon aura intimidates weaker enemies. Can awaken bloodline abilities at higher realms.',
  },
  {
    id: 'time-reversal',
    name: 'Karmic Time Wheel',
    description: 'Once per major crisis, you can rewind time by a few moments. But karma must be paid eventually.',
    icon: '⏰',
    effect: 'Can undo one fatal mistake per chapter. Each use accumulates karmic debt.',
  },
  {
    id: 'merchant',
    name: 'Heavenly Merchant System',
    description: 'An interdimensional shop interface only you can see. Trade across realms and time for rare treasures.',
    icon: '💰',
    effect: 'Access to rare items. Can sell unwanted items for spirit stones. Prices vary by karma.',
  },
  {
    id: 'sword-spirit',
    name: 'Primordial Sword Spirit',
    description: 'A sentient sword spirit resides within you, teaching the Dao of the Sword. It seeks a worthy inheritor.',
    icon: '⚔️',
    effect: 'Sword techniques learn 3x faster. Can manifest a spirit sword made of pure Qi.',
  },
  {
    id: 'heaven-eye',
    name: 'Heaven Defying Eye',
    description: 'Your third eye can see through illusions, detect treasures, and perceive cultivation realms of others.',
    icon: '🔍',
    effect: 'See hidden treasures and traps. Perceive true nature of disguised beings.',
  },
  {
    id: 'soul-palace',
    name: 'Nine Layers Soul Palace',
    description: 'Your soul sea contains an ancient palace with nine layers. Each layer unlocks new mental abilities.',
    icon: '🏛️',
    effect: 'Immune to soul attacks. Can practice cultivation in dreams. Enhanced spiritual perception.',
  },
  {
    id: 'body-refiner',
    name: 'Indestructible Vajra Body',
    description: 'Your physical form can be tempered to rival divine weapons. The path of body cultivation is yours.',
    icon: '💪',
    effect: 'Physical damage reduced. Can break through physical limits. Body is a weapon.',
  },
  {
    id: 'fate-plunderer',
    name: 'Fate Plunderer Constitution',
    description: 'You can steal the luck and opportunities of others. Their fortune becomes your stepping stone.',
    icon: '🎲',
    effect: 'Defeating enemies may grant their lucky encounters. High risk of karmic backlash.',
  },
  {
    id: 'poison-king',
    name: 'Poison Immunity Body',
    description: 'All poisons become nourishment for you. You can develop and resist any toxin in existence.',
    icon: '☠️',
    effect: 'Immune to all poisons. Can extract and use poisons. Poison attacks deal extra damage.',
  },
];

// Scenario prompts for each golden finger
export const goldenFingerScenarios: GoldenFingerScenario[] = [
  {
    goldenFingerId: 'system',
    introMessage: 'As consciousness returns to you after a near-death experience, a strange mechanical voice echoes in your mind...',
    scenarioPrompt: `Generate a tutorial scenario where the player awakens the "System" golden finger. 
    The scenario should include:
    - A near-death trigger (being beaten, poisoned, or falling from cliff)
    - A mechanical/robotic voice announcing "System Binding..."
    - An explanation of basic features (quests, rewards, status screen)
    - A simple first quest to complete (survive, find something, or defeat a weak enemy)
    - 3-4 choice-based interactions leading to acquiring the System`,
  },
  {
    goldenFingerId: 'grandpa',
    introMessage: 'You stumble upon an old ring in the mud, half-buried and forgotten. As you pick it up, a voice resonates directly in your mind...',
    scenarioPrompt: `Generate a tutorial scenario where the player encounters the "Grandpa in the Ring" golden finger.
    The scenario should include:
    - Finding or inheriting an ancient ring
    - An ancient senior's soul awakening and introducing himself
    - The grandpa testing the player's character (willpower, kindness, or determination)
    - A dangerous situation where the grandpa helps for the first time
    - 3-4 choice-based interactions leading to forming a contract with the ancient soul`,
  },
  {
    goldenFingerId: 'copycat',
    introMessage: 'A burning sensation erupts behind your eyes. When it fades, the world looks... different. You can see things others cannot...',
    scenarioPrompt: `Generate a tutorial scenario where the player awakens the "Copycat Eye" golden finger.
    The scenario should include:
    - A moment of extreme danger or desperation triggering the awakening
    - Unusual visual phenomena (seeing qi flows, technique structures)
    - Witnessing a technique being performed and instinctively copying it
    - A test of the new ability against an enemy or obstacle
    - 3-4 choice-based interactions leading to mastering the initial eye ability`,
  },
  {
    goldenFingerId: 'alchemy',
    introMessage: 'You are forced to consume a poisonous pill meant to kill you. But instead of death, warmth spreads through your body...',
    scenarioPrompt: `Generate a tutorial scenario where the player discovers the "Alchemy God Body" golden finger.
    The scenario should include:
    - Being poisoned or forced to consume a deadly pill
    - The body unexpectedly absorbing and refining the poison into power
    - Discovering the ability to sense pill ingredients and their properties
    - A first attempt at refining or enhancing a simple pill
    - 3-4 choice-based interactions leading to understanding the alchemy body`,
  },
  {
    goldenFingerId: 'reincarnator',
    introMessage: 'Dreams plague you—visions of lives not your own. Memories of places you have never been, techniques you never learned...',
    scenarioPrompt: `Generate a tutorial scenario where the player unlocks "Memories of Past Lives" golden finger.
    The scenario should include:
    - Vivid dreams or flashbacks of previous incarnations
    - Recognizing a person, place, or danger from past life memories
    - Using a fragment of ancient knowledge to solve a problem or escape danger
    - A vision revealing a hidden treasure or secret location nearby
    - 3-4 choice-based interactions leading to accepting the memories as part of yourself`,
  },
  {
    goldenFingerId: 'heavenly-demon',
    introMessage: 'Darkness calls to you. In a moment of rage and despair, something sinister awakens within your very blood...',
    scenarioPrompt: `Generate a tutorial scenario where the player awakens the "Heavenly Demon Body" golden finger.
    The scenario should include:
    - A moment of extreme negative emotion (rage, hatred, despair)
    - Dark energy erupting from within, possibly harming those nearby
    - The intoxicating feeling of power from absorbing negative energy
    - A choice between embracing or resisting the demonic nature
    - 3-4 choice-based interactions leading to accepting the demon constitution`,
  },
  {
    goldenFingerId: 'azure-dragon',
    introMessage: 'Your blood burns like fire, and for a moment, scales shimmer beneath your skin. The roar of a dragon echoes in your soul...',
    scenarioPrompt: `Generate a tutorial scenario where the player awakens the "Azure Dragon Bloodline" golden finger.
    The scenario should include:
    - A life-threatening situation triggering bloodline awakening
    - Physical manifestations (scales, dragon eyes, overwhelming pressure)
    - An ancient dragon consciousness speaking from within the bloodline
    - Demonstrating dragon authority over beasts or intimidating enemies
    - 3-4 choice-based interactions leading to initial bloodline acceptance`,
  },
  {
    goldenFingerId: 'time-reversal',
    introMessage: 'The moment of your death... you reject it. Reality bends. Time flows backward. You stand again, seconds before disaster...',
    scenarioPrompt: `Generate a tutorial scenario where the player discovers the "Karmic Time Wheel" golden finger.
    The scenario should include:
    - A fatal moment that triggers time reversal
    - The disorienting experience of reliving the same moments
    - Making different choices to avoid death
    - A warning about karmic debt and overuse
    - 3-4 choice-based interactions leading to understanding the time power`,
  },
  {
    goldenFingerId: 'merchant',
    introMessage: 'A translucent shop interface materializes before your eyes, visible only to you. A cheerful voice welcomes you as a VIP customer...',
    scenarioPrompt: `Generate a tutorial scenario where the player discovers the "Heavenly Merchant System" golden finger.
    The scenario should include:
    - The shop interface appearing unexpectedly
    - Browsing impossible items from across dimensions
    - Making a first trade (selling something worthless for something valuable)
    - Learning about karma-based pricing and rare item alerts
    - 3-4 choice-based interactions leading to becoming a registered merchant`,
  },
  {
    goldenFingerId: 'sword-spirit',
    introMessage: 'A broken sword lies before you, ancient and forgotten. As your blood drips upon it, a feminine voice speaks from within...',
    scenarioPrompt: `Generate a tutorial scenario where the player bonds with the "Primordial Sword Spirit" golden finger.
    The scenario should include:
    - Discovering or being drawn to an ancient broken sword
    - The sword spirit awakening upon contact
    - A test of sword intent or willpower
    - Manifesting a spirit sword for the first time
    - 3-4 choice-based interactions leading to forming a bond with the sword spirit`,
  },
  {
    goldenFingerId: 'heaven-eye',
    introMessage: 'Agony splits your forehead, and then... you can SEE. Not just see—you can perceive the very fabric of reality...',
    scenarioPrompt: `Generate a tutorial scenario where the player opens the "Heaven Defying Eye" golden finger.
    The scenario should include:
    - A painful awakening of the third eye
    - Seeing through an illusion or disguise for the first time
    - Detecting a hidden treasure or danger others missed
    - Learning to control the eye to avoid qi exhaustion
    - 3-4 choice-based interactions leading to mastering basic eye control`,
  },
  {
    goldenFingerId: 'soul-palace',
    introMessage: 'In meditation, you find yourself standing before an impossibly vast palace within your own mind. Its gates slowly open...',
    scenarioPrompt: `Generate a tutorial scenario where the player enters the "Nine Layers Soul Palace" golden finger.
    The scenario should include:
    - Entering deep meditation and discovering the soul palace
    - Exploring the first layer of the palace
    - Finding ancient knowledge or techniques left by previous owners
    - Resisting a soul attack that proves the palace's protective power
    - 3-4 choice-based interactions leading to claiming the soul palace as your own`,
  },
  {
    goldenFingerId: 'body-refiner',
    introMessage: 'Your body refuses to break. Where bones should shatter, they hold. Where flesh should tear, it hardens like metal...',
    scenarioPrompt: `Generate a tutorial scenario where the player awakens the "Indestructible Vajra Body" golden finger.
    The scenario should include:
    - Surviving an attack that should have been fatal
    - Feeling the body transforming, hardening beyond normal limits
    - Testing the new physical abilities (breaking stone, resisting weapons)
    - Understanding the path of body refinement cultivation
    - 3-4 choice-based interactions leading to accepting the body cultivation path`,
  },
  {
    goldenFingerId: 'fate-plunderer',
    introMessage: 'You defeat your enemy, and something strange happens—their luck, their fortune, flows into you like a river...',
    scenarioPrompt: `Generate a tutorial scenario where the player discovers the "Fate Plunderer Constitution" golden finger.
    The scenario should include:
    - Defeating or witnessing the defeat of a lucky individual
    - Feeling their fortune and karma flowing into you
    - An immediate lucky encounter proving the ability works
    - A warning about karmic backlash from stealing fate
    - 3-4 choice-based interactions leading to understanding fate plundering`,
  },
  {
    goldenFingerId: 'poison-king',
    introMessage: 'The assassin\'s poison should have killed you in seconds. Instead, you feel... stronger. The poison is becoming part of you...',
    scenarioPrompt: `Generate a tutorial scenario where the player awakens the "Poison Immunity Body" golden finger.
    The scenario should include:
    - Being poisoned with a deadly toxin
    - The body absorbing and converting the poison to power
    - Developing the ability to sense and identify poisons
    - Using poison offensively for the first time
    - 3-4 choice-based interactions leading to embracing the poison path`,
  },
];

export const origins: Origin[] = [
  {
    id: 'broken-meridian',
    title: 'Broken Meridians',
    description: 'Born into the prestigious Xiao family, but your meridians were shattered at birth. Your fiancée seeks to break the engagement.',
    spiritRoot: 'Trash',
    bonuses: { luck: 3, intelligence: 2 },
    penalties: { cultivation: -5 },
  },
  {
    id: 'orphan-slave',
    title: 'Orphan Slave',
    description: 'Sold as a child to the mines. Years of suffering have hardened your will, but you possess a mysterious jade pendant from your parents.',
    spiritRoot: 'Earth',
    bonuses: { strength: 3 },
    penalties: { charisma: -2 },
  },
  {
    id: 'fallen-noble',
    title: 'Fallen Noble',
    description: 'Your family was massacred by enemies. You alone survived, hidden by a loyal servant. Vengeance burns in your heart.',
    spiritRoot: 'Fire',
    bonuses: { intelligence: 2, charisma: 1 },
    penalties: { luck: -2 },
  },
  {
    id: 'sect-janitor',
    title: 'Sect Janitor',
    description: 'An outer disciple assigned to sweep the courtyards. The inner disciples mock you daily, but you have discovered a hidden passage...',
    spiritRoot: 'Wood',
    bonuses: { agility: 2, luck: 1 },
    penalties: { strength: -1 },
  },
];
