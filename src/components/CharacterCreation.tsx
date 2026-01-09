import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { goldenFingers } from '@/data/goldenFingers';
import { spiritualRoots, SpiritualRoot } from '@/data/spiritualRoots';
import { GoldenFinger, Character, CharacterStats, GeneratedOrigin } from '@/types/game';
import { Sparkles, ChevronRight, ChevronLeft, Dices, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeepseekService } from '@/services/deepseekService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { validateCharacterName } from '@/lib/validation';
import { trackGameEvent } from '@/lib/analytics';
import { notify } from '@/lib/notifications';
import { perf } from '@/lib/performance';
import { SEO } from '@/components/SEO';

type Step = 'basics' | 'golden-finger' | 'fate' | 'confirm';

type CharacterCreationProps = {
  onComplete: (character: Character) => void;
  onBack: () => void;
  userId?: string;
};

export function CharacterCreation({ onComplete, onBack, userId }: CharacterCreationProps) {
  const [step, setStep] = useState<Step>('basics');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [selectedSpiritRoot, setSelectedSpiritRoot] = useState<SpiritualRoot | null>(null);
  const [selectedGoldenFinger, setSelectedGoldenFinger] = useState<GoldenFinger | null>(null);
  const [generatedOrigin, setGeneratedOrigin] = useState<GeneratedOrigin | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const { language } = useLanguage();

  const rollFate = async () => {
    if (!name || !gender || !selectedSpiritRoot || !selectedGoldenFinger) {
      notify.error('Missing Information', 'Please complete all previous steps first.');
      return;
    }

    setIsRolling(true);
    setGeneratedOrigin(null);

    try {
      perf.start('Generate Fate');
      
      // Generate fate with full context
      const origin = await DeepseekService.generateFate(
        name, 
        gender, 
        language,
        selectedSpiritRoot.element,
        selectedGoldenFinger.name
      );
      
      perf.end('Generate Fate');
      
      setGeneratedOrigin(origin as GeneratedOrigin);
      notify.success('Fate Revealed', 'The heavens have spoken. Your destiny awaits.');
    } catch (error) {
      console.error('Fate generation error:', error);
      perf.end('Generate Fate', false);
      
      // The service now provides a fallback, so this shouldn't happen often
      // But just in case, we still have a local fallback
      const fallbackOrigins: GeneratedOrigin[] = [
        {
          title: "Broken Meridians",
          description: `Born into the prestigious Xiao family, but ${name}'s meridians were shattered at birth.`,
          spiritRoot: "Trash",
          backstory: `${name} was born to the Xiao family, once destined for greatness. But fate is cruel - ${gender === 'Male' ? 'his' : 'her'} meridians were damaged during a difficult birth. Now ${gender === 'Male' ? 'his' : 'her'} fiancée seeks to break the engagement, and ${gender === 'Male' ? 'his' : 'her'} relatives look upon ${gender === 'Male' ? 'him' : 'her'} with disdain.`,
          startingLocation: "Xiao Family Estate",
          bonuses: { luck: 3, intelligence: 2 },
          penalties: { cultivation: -5 },
        },
        {
          title: "Orphan Slave",
          description: `Sold as a child to the mines. Years of suffering have hardened ${name}'s will.`,
          spiritRoot: "Earth",
          backstory: `${name} knows nothing but suffering. Sold to the mines as a child, ${gender === 'Male' ? 'he' : 'she'} has toiled for years. But ${gender === 'Male' ? 'he' : 'she'} possesses a mysterious jade pendant - ${gender === 'Male' ? 'his' : 'her'} only connection to ${gender === 'Male' ? 'his' : 'her'} unknown parents.`,
          startingLocation: "Black Iron Mines",
          bonuses: { strength: 3 },
          penalties: { charisma: -2 },
        },
        {
          title: "Fallen Noble",
          description: `${name}'s family was massacred by enemies. ${gender === 'Male' ? 'He' : 'She'} alone survived.`,
          spiritRoot: "Fire",
          backstory: `${name} watched as enemies destroyed everything. ${gender === 'Male' ? 'His' : 'Her'} family, ${gender === 'Male' ? 'his' : 'her'} home, ${gender === 'Male' ? 'his' : 'her'} future - all taken in one bloody night. Only ${gender === 'Male' ? 'he' : 'she'} escaped, hidden by a loyal servant. Vengeance burns in ${gender === 'Male' ? 'his' : 'her'} heart.`,
          startingLocation: "Burning Ruins",
          bonuses: { intelligence: 2, charisma: 1 },
          penalties: { luck: -2 },
        },
      ];
      setGeneratedOrigin(fallbackOrigins[Math.floor(Math.random() * fallbackOrigins.length)]);
      notify.success('Fate Generated', 'Your origin story has been created.');
    } finally {
      setIsRolling(false);
    }
  };

  const createCharacter = (): Character => {
    const origin = generatedOrigin!;
    const spiritRoot = selectedSpiritRoot!;
    
    // Apply spirit root bonuses
    const spiritRootBonuses = {
      strength: spiritRoot.bonuses.strength || 0,
      agility: spiritRoot.bonuses.agility || 0,
      intelligence: spiritRoot.bonuses.intelligence || 0,
      charisma: spiritRoot.bonuses.charisma || 0,
      luck: spiritRoot.bonuses.luck || 0,
      cultivation: spiritRoot.bonuses.cultivation || 0,
    };
    
    const baseStats: CharacterStats = {
      strength: 10 + (origin.bonuses.strength || 0) + (origin.penalties.strength || 0) + spiritRootBonuses.strength,
      agility: 10 + (origin.bonuses.agility || 0) + (origin.penalties.agility || 0) + spiritRootBonuses.agility,
      intelligence: 10 + (origin.bonuses.intelligence || 0) + (origin.penalties.intelligence || 0) + spiritRootBonuses.intelligence,
      charisma: 10 + (origin.bonuses.charisma || 0) + (origin.penalties.charisma || 0) + spiritRootBonuses.charisma,
      luck: 10 + (origin.bonuses.luck || 0) + (origin.penalties.luck || 0) + spiritRootBonuses.luck,
      cultivation: 0 + (origin.bonuses.cultivation || 0) + (origin.penalties.cultivation || 0) + spiritRootBonuses.cultivation,
      lifespan: 80,
      currentAge: 16,
    };

    return {
      id: crypto.randomUUID(),
      name,
      origin: origin.title,
      spiritRoot: spiritRoot.element,
      realm: 'Mortal',
      goldenFinger: selectedGoldenFinger!,
      stats: baseStats,
      qi: 0,
      maxQi: 50,
      health: 100,
      maxHealth: 100,
      stamina: 100 + (baseStats.strength * 5), // Initial stamina based on strength
      maxStamina: 100 + (baseStats.strength * 5),
      karma: 0,
      cultivationProgress: 0,
      breakthroughReady: false,
      techniques: [],
      inventory: [],
      relationships: [],
      tutorialCompleted: false,
      goldenFingerUnlocked: false,
      visualTraits: {
        hairColor: 'Black',
        eyeColor: 'Brown',
        scars: [],
        aura: 'None',
        clothing: 'Ragged robes',
        gender: gender,
      },
    };
  };

  const handleComplete = async () => {
    if (!userId) {
      notify.error('Authentication Required', 'Please login to save your character.');
      return;
    }

    const character = createCharacter();
    
    try {
      // Save character to database
      const { saveCharacterToDatabase } = await import('@/services/gameService');
      const characterId = await saveCharacterToDatabase(character, userId);
      
      // Update character with database ID
      const savedCharacter = { ...character, id: characterId };
      
      // Track character creation
      trackGameEvent.characterCreated(
        character.name,
        generatedOrigin?.title || 'Unknown',
        selectedGoldenFinger?.name || 'Unknown'
      );
      
      notify.success('Character Created', `${character.name} has been saved to your journey.`);
      
      onComplete(savedCharacter);
    } catch (error) {
      console.error('Error saving character:', error);
      notify.error('Save Failed', 'Character created but not saved. You can continue playing.');
      
      // Still allow playing even if save fails
      onComplete(character);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'basics': return name.trim().length >= 2 && gender !== '' && selectedSpiritRoot !== null;
      case 'golden-finger': return selectedGoldenFinger !== null;
      case 'fate': return generatedOrigin !== null;
      default: return true;
    }
  };

  const nextStep = () => {
    const steps: Step[] = ['basics', 'golden-finger', 'fate', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['basics', 'golden-finger', 'fate', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      onBack();
    }
  };

  return (
    <>
      <SEO 
        title="Create Character"
        description="Create your unique cultivator and begin your journey in the Jianghu. Choose your origin, golden finger, and forge your destiny."
      />
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
          backgroundImage: 'url(/assets/backgrounds/wuxia-mystical.jpg)',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm text-gold/60 uppercase tracking-[0.3em] mb-3">
            Chapter 0
          </p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-gradient drop-shadow-lg">
            {step === 'basics' && 'Choose Your Path'}
            {step === 'golden-finger' && 'Select Your Cheat'}
            {step === 'fate' && 'Roll Your Fate'}
            {step === 'confirm' && 'Confirm Your Path'}
          </h1>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-3 mb-6 sm:mb-8">
          {['basics', 'golden-finger', 'fate', 'confirm'].map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                step === s ? 'bg-gold w-10 shadow-lg shadow-gold/50' : i < ['basics', 'golden-finger', 'fate', 'confirm'].indexOf(step) ? 'bg-gold/60 w-2' : 'bg-white/20 w-2'
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-lg mx-auto w-full">
          {step === 'basics' && (
            <div className="space-y-6 animate-fade-in p-6 sm:p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
              <p className="text-white/70 text-center text-base sm:text-lg leading-relaxed">
                In the Jianghu, your name is your legend. Choose wisely.
              </p>
              
              <div className="space-y-4">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-black/40 border-gold/30 text-center text-xl h-16 font-display text-white placeholder:text-white/40 focus:border-gold focus:ring-gold/30"
                  maxLength={20}
                />
                
                <div className="space-y-3">
                  <p className="text-white/60 text-center text-sm">Select your gender:</p>
                  <div className="flex gap-3">
                    <Button
                      variant={gender === 'Male' ? 'golden' : 'ink'}
                      onClick={() => setGender('Male')}
                      className={cn(
                        "flex-1 h-12 font-display transition-all duration-300",
                        gender === 'Male' 
                          ? "bg-gold/20 border-gold text-gold shadow-lg shadow-gold/20" 
                          : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                      )}
                    >
                      ♂ Male
                    </Button>
                    <Button
                      variant={gender === 'Female' ? 'golden' : 'ink'}
                      onClick={() => setGender('Female')}
                      className={cn(
                        "flex-1 h-12 font-display transition-all duration-300",
                        gender === 'Female' 
                          ? "bg-gold/20 border-gold text-gold shadow-lg shadow-gold/20" 
                          : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                      )}
                    >
                      ♀ Female
                    </Button>
                  </div>
                </div>

                {/* Spiritual Root Selection */}
                <div className="space-y-3">
                  <p className="text-white/60 text-center text-sm">Select your spiritual root:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {spiritualRoots.map((root) => (
                      <button
                        key={root.element}
                        onClick={() => setSelectedSpiritRoot(root)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all duration-300 backdrop-blur-md",
                          selectedSpiritRoot?.element === root.element
                            ? "bg-gold/20 border-gold shadow-lg shadow-gold/20 scale-[1.02]"
                            : "bg-white/10 hover:bg-white/20 border-white/20"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{root.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              "font-display text-sm",
                              selectedSpiritRoot?.element === root.element ? "text-gold" : "text-white"
                            )}>
                              {root.element}
                            </h4>
                            <p className="text-xs text-white/50 truncate">{root.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-white/40 text-center">
                Name: 2-20 characters • Gender & Spirit Root: Required for story generation
              </p>
            </div>
          )}

          {step === 'fate' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 sm:p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
                <p className="text-white/70 text-center mb-6 text-base sm:text-lg leading-relaxed">
                  Let the heavens decide your fate. Your destiny will be written by the cosmos itself.
                </p>
                
                <Button
                  variant="golden"
                  size="lg"
                  onClick={rollFate}
                  disabled={isRolling}
                  className="w-full h-14 text-lg font-display shadow-lg hover:shadow-gold/30 transition-all duration-300"
                >
                  {isRolling ? (
                    <>
                      <Loader2 className="mr-3 w-5 h-5 animate-spin" />
                      Consulting the Heavens...
                    </>
                  ) : (
                    <>
                      <Dices className="mr-3 w-5 h-5" />
                      Roll Fate (AI Generated)
                    </>
                  )}
                </Button>
              </div>

              {generatedOrigin && (
                <div className={cn(
                  "p-5 sm:p-6 rounded-2xl border transition-all duration-500 transform",
                  "bg-black/50 backdrop-blur-md border-gold/40 shadow-xl",
                  isRolling && "opacity-50 scale-95"
                )}>
                  <h3 className="font-display text-xl sm:text-2xl text-gold mb-3 drop-shadow-lg">
                    {generatedOrigin.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/80 mb-4 leading-relaxed">
                    {generatedOrigin.description}
                  </p>
                  <p className="text-xs sm:text-sm text-white/60 mb-4 italic leading-relaxed border-l-2 border-gold/30 pl-4">
                    {generatedOrigin.backstory}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-jade/30 text-jade-glow border border-jade/30">
                      Spirit Root: {generatedOrigin.spiritRoot}
                    </span>
                    <span className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white/10 text-white/70 border border-white/10">
                      📍 {generatedOrigin.startingLocation}
                    </span>
                    {Object.entries(generatedOrigin.bonuses).filter(([_, val]) => val !== undefined && val > 0).map(([stat, val]) => (
                      <span key={stat} className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-gold/30 text-gold border border-gold/30">
                        {stat.charAt(0).toUpperCase() + stat.slice(1)} +{val}
                      </span>
                    ))}
                    {Object.entries(generatedOrigin.penalties).filter(([_, val]) => val !== undefined && val < 0).map(([stat, val]) => (
                      <span key={stat} className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-blood/30 text-red-400 border border-blood/30">
                        {stat.charAt(0).toUpperCase() + stat.slice(1)} {val}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'golden-finger' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 sm:p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 mb-4">
                <p className="text-white/70 text-center text-base sm:text-lg">
                  Every protagonist has a cheat. What is yours?
                </p>
              </div>
              
              <ScrollArea className="h-[50vh] sm:h-[55vh]">
                <div className="space-y-3 pr-2 sm:pr-4">
                  {goldenFingers.map((gf) => (
                    <button
                      key={gf.id}
                      onClick={() => setSelectedGoldenFinger(gf)}
                      className={cn(
                        "w-full p-4 sm:p-5 rounded-xl border text-left transition-all duration-300 backdrop-blur-md",
                        selectedGoldenFinger?.id === gf.id
                          ? "bg-gold/20 border-gold shadow-lg shadow-gold/20 scale-[1.02]"
                          : "bg-black/40 border-white/10 hover:border-gold/50 hover:bg-black/50"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl sm:text-4xl">{gf.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-white text-base sm:text-lg flex items-center gap-2">
                            {gf.name}
                            {selectedGoldenFinger?.id === gf.id && (
                              <Check className="w-5 h-5 text-gold flex-shrink-0" />
                            )}
                          </h3>
                          <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed">
                            {gf.description}
                          </p>
                          <p className="text-xs sm:text-sm text-jade-glow mt-2">
                            ⚡ {gf.effect}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {step === 'confirm' && generatedOrigin && selectedGoldenFinger && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 sm:p-8 rounded-2xl bg-black/50 backdrop-blur-md border border-gold/30 space-y-5 shadow-2xl">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-gold mx-auto mb-3" />
                    <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 bg-gold/30 blur-xl rounded-full mx-auto" />
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl text-gold-gradient drop-shadow-lg">{name}</h2>
                  <p className="text-base sm:text-lg text-white/60 mt-1">{generatedOrigin.title}</p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs sm:text-sm text-white/50 mb-1">Name</p>
                    <p className="text-white text-base sm:text-lg font-display">{name}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs sm:text-sm text-white/50 mb-1">Gender</p>
                    <p className="text-white text-base sm:text-lg font-display">{gender === 'Male' ? '♂ Male' : '♀ Female'}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs sm:text-sm text-white/50 mb-1">Spirit Root</p>
                    <p className="text-jade-glow text-base sm:text-lg font-display">{generatedOrigin.spiritRoot}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs sm:text-sm text-white/50 mb-1">Realm</p>
                    <p className="text-white text-base sm:text-lg font-display">Mortal</p>
                  </div>
                  <div className="col-span-2 p-3 sm:p-4 rounded-xl bg-gold/10 border border-gold/30">
                    <p className="text-xs sm:text-sm text-white/50 mb-1">Golden Finger</p>
                    <p className="text-gold text-base sm:text-lg font-display">{selectedGoldenFinger.icon} {selectedGoldenFinger.name}</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs sm:text-sm text-white/50 mb-2">Starting Location</p>
                  <p className="text-white text-base sm:text-lg">📍 {generatedOrigin.startingLocation}</p>
                </div>

                <p className="text-sm text-white/40 text-center italic pt-2">
                  "Before your journey begins, you must first awaken your Golden Finger..."
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-6 sm:mt-8 max-w-lg mx-auto w-full">
          <Button 
            variant="ink" 
            onClick={prevStep} 
            className="flex-1 h-12 sm:h-14 bg-white/10 hover:bg-white/20 border-white/20 text-white font-display"
          >
            <ChevronLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
          
          {step !== 'confirm' ? (
            <Button 
              variant="golden" 
              onClick={nextStep} 
              disabled={!canProceed()}
              className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-display shadow-lg hover:shadow-gold/30 transition-all duration-300"
            >
              Next
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          ) : (
            <Button 
              variant="golden" 
              onClick={handleComplete}
              className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-display shadow-lg hover:shadow-gold/30 transition-all duration-300"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Awaken
            </Button>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
