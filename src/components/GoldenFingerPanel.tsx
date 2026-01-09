import { Character } from '@/types/game';
import { cn } from '@/lib/utils';
import { X, Sparkles, Zap, Eye, Book, Shield, Flame, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type GoldenFingerPanelProps = {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onUseAbility?: (abilityId: string) => void;
};

// Golden Finger abilities based on type
const GOLDEN_FINGER_ABILITIES: Record<string, Array<{
  id: string;
  name: string;
  description: string;
  icon: any;
  cost?: string;
  cooldown?: string;
  type: 'active' | 'passive' | 'toggle';
}>> = {
  'system': [
    { id: 'scan', name: 'Scan Enemy', description: 'Reveal enemy stats, weaknesses, and cultivation level', icon: Eye, type: 'active', cost: 'Free' },
    { id: 'quest', name: 'View Quests', description: 'Check active quests and claim rewards', icon: Book, type: 'active', cost: 'Free' },
    { id: 'shop', name: 'System Shop', description: 'Access the System Shop to purchase items', icon: Star, type: 'active', cost: 'System Points' },
    { id: 'status', name: 'Detailed Status', description: 'View comprehensive character analysis', icon: Sparkles, type: 'active', cost: 'Free' },
  ],
  'grandpa': [
    { id: 'wisdom', name: 'Seek Wisdom', description: 'Ask Grandpa for advice on current situation', icon: Book, type: 'active', cost: 'Free', cooldown: '1 hour' },
    { id: 'emergency', name: 'Emergency Power', description: 'Grandpa lends you immense power temporarily', icon: Flame, type: 'active', cost: '1 use per life', cooldown: 'Once' },
    { id: 'identify', name: 'Identify Item', description: 'Grandpa identifies mysterious items and treasures', icon: Eye, type: 'active', cost: 'Free' },
    { id: 'teach', name: 'Request Teaching', description: 'Learn technique insights from Grandpa', icon: Sparkles, type: 'active', cost: 'Free', cooldown: 'Daily' },
  ],
  'copycat': [
    { id: 'observe', name: 'Observe Technique', description: 'Watch and analyze enemy techniques to copy them', icon: Eye, type: 'active', cost: '10 Qi' },
    { id: 'copy', name: 'Copy Technique', description: 'Instantly copy an observed technique', icon: Zap, type: 'active', cost: '30 Qi', cooldown: '1 hour' },
    { id: 'see_stats', name: 'See Through', description: 'Perceive enemy cultivation and stats', icon: Sparkles, type: 'active', cost: '5 Qi' },
  ],
  'alchemy': [
    { id: 'sense', name: 'Sense Ingredients', description: 'Detect medicinal properties of plants and materials', icon: Eye, type: 'passive', cost: 'Always Active' },
    { id: 'refine', name: 'Perfect Refinement', description: 'Refine pills with 100% success rate', icon: Flame, type: 'passive', cost: 'Always Active' },
    { id: 'absorb', name: 'Absorb Poison', description: 'Convert poison into cultivation energy', icon: Shield, type: 'active', cost: 'Free' },
  ],
  'reincarnator': [
    { id: 'recall', name: 'Recall Memory', description: 'Access memories from past lives for knowledge', icon: Book, type: 'active', cost: 'Free', cooldown: 'Daily' },
    { id: 'foresight', name: 'Prophetic Vision', description: 'Glimpse possible future outcomes', icon: Eye, type: 'active', cost: '20 Qi', cooldown: '6 hours' },
    { id: 'wisdom', name: 'Ancient Wisdom', description: 'Passive knowledge from countless lifetimes', icon: Sparkles, type: 'passive', cost: 'Always Active' },
  ],
  'heavenly-demon': [
    { id: 'devour', name: 'Devour Essence', description: 'Absorb power from defeated enemies', icon: Flame, type: 'passive', cost: 'Always Active' },
    { id: 'rage', name: 'Demonic Rage', description: 'Unleash demonic power, boost all stats temporarily', icon: Zap, type: 'active', cost: '50 Qi', cooldown: '1 hour' },
    { id: 'intimidate', name: 'Demonic Pressure', description: 'Release overwhelming killing intent', icon: Shield, type: 'active', cost: '10 Qi' },
  ],
  'azure-dragon': [
    { id: 'scales', name: 'Dragon Scales', description: 'Manifest protective dragon scales', icon: Shield, type: 'active', cost: '20 Qi', cooldown: '30 min' },
    { id: 'roar', name: 'Dragon Roar', description: 'Unleash devastating dragon roar', icon: Zap, type: 'active', cost: '40 Qi', cooldown: '1 hour' },
    { id: 'bloodline', name: 'Bloodline Resonance', description: 'Passive dragon bloodline benefits', icon: Sparkles, type: 'passive', cost: 'Always Active' },
  ],
  'time-reversal': [
    { id: 'rewind', name: 'Minor Rewind', description: 'Reverse time by 10 seconds', icon: Clock, type: 'active', cost: '100 Qi', cooldown: 'Daily' },
    { id: 'foresee', name: 'Foresee Attack', description: 'See enemy attack 3 seconds before it happens', icon: Eye, type: 'active', cost: '15 Qi' },
    { id: 'karma', name: 'Karmic Vision', description: 'See karmic threads and fate lines', icon: Sparkles, type: 'passive', cost: 'Always Active' },
  ],
  'merchant': [
    { id: 'shop', name: 'Heavenly Shop', description: 'Access the interdimensional merchant shop', icon: Star, type: 'active', cost: 'Gold/Spirit Stones' },
    { id: 'appraise', name: 'Appraise Value', description: 'Instantly know the true value of any item', icon: Eye, type: 'active', cost: 'Free' },
    { id: 'trade', name: 'Favorable Trade', description: 'Always get better deals in transactions', icon: Sparkles, type: 'passive', cost: 'Always Active' },
  ],
  'sword-spirit': [
    { id: 'manifest', name: 'Manifest Sword', description: 'Summon spiritual sword from thin air', icon: Zap, type: 'active', cost: '10 Qi' },
    { id: 'intent', name: 'Sword Intent', description: 'Release overwhelming sword intent', icon: Flame, type: 'active', cost: '30 Qi', cooldown: '1 hour' },
    { id: 'communion', name: 'Spirit Communion', description: 'Communicate with sword spirit for guidance', icon: Book, type: 'active', cost: 'Free' },
  ],
  'heaven-eye': [
    { id: 'pierce', name: 'Pierce Illusion', description: 'See through all illusions and disguises', icon: Eye, type: 'active', cost: '5 Qi' },
    { id: 'treasure', name: 'Detect Treasure', description: 'Sense hidden treasures and opportunities', icon: Star, type: 'active', cost: '10 Qi' },
    { id: 'truth', name: 'See Truth', description: 'Perceive the true nature of things', icon: Sparkles, type: 'passive', cost: 'Always Active' },
  ],
  'soul-palace': [
    { id: 'defend', name: 'Soul Defense', description: 'Protect against soul attacks', icon: Shield, type: 'active', cost: '20 Qi' },
    { id: 'explore', name: 'Explore Palace', description: 'Venture deeper into your Soul Palace', icon: Book, type: 'active', cost: 'Free', cooldown: 'Daily' },
    { id: 'storage', name: 'Soul Storage', description: 'Store items in your Soul Palace', icon: Sparkles, type: 'passive', cost: 'Always Active' },
  ],
  'body-refiner': [
    { id: 'harden', name: 'Iron Body', description: 'Temporarily harden body to extreme degree', icon: Shield, type: 'active', cost: '25 Stamina', cooldown: '30 min' },
    { id: 'regenerate', name: 'Rapid Regeneration', description: 'Accelerate healing dramatically', icon: Sparkles, type: 'active', cost: '30 Qi', cooldown: '1 hour' },
    { id: 'endurance', name: 'Endless Endurance', description: 'Passive stamina and health boost', icon: Flame, type: 'passive', cost: 'Always Active' },
  ],
  'fate-plunderer': [
    { id: 'steal', name: 'Steal Fate', description: 'Steal luck from defeated enemies', icon: Star, type: 'passive', cost: 'Always Active' },
    { id: 'sense', name: 'Sense Fortune', description: 'Detect lucky opportunities nearby', icon: Eye, type: 'active', cost: '10 Qi' },
    { id: 'redirect', name: 'Redirect Misfortune', description: 'Deflect bad luck to enemies', icon: Zap, type: 'active', cost: '40 Qi', cooldown: 'Daily' },
  ],
  'poison-king': [
    { id: 'immunity', name: 'Poison Immunity', description: 'Immune to all poisons', icon: Shield, type: 'passive', cost: 'Always Active' },
    { id: 'create', name: 'Create Poison', description: 'Synthesize deadly poison from materials', icon: Flame, type: 'active', cost: 'Materials' },
    { id: 'weaponize', name: 'Poison Weapon', description: 'Coat weapon with deadly toxin', icon: Zap, type: 'active', cost: '15 Qi' },
  ],
};

export function GoldenFingerPanel({ character, isOpen, onClose, onUseAbility }: GoldenFingerPanelProps) {
  const goldenFingerId = character.goldenFinger.id;
  const abilities = GOLDEN_FINGER_ABILITIES[goldenFingerId] || [];
  const isAwakened = character.goldenFingerUnlocked;

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-[380px] max-w-[90vw] bg-black/90 backdrop-blur-xl border-l border-gold/20",
        "transform transition-transform duration-300 ease-out z-50",
        "flex flex-col shadow-2xl shadow-gold/20",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gold/20 bg-gradient-to-r from-gold/10 to-transparent">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold animate-pulse" />
          <h2 className="font-display text-xl text-gold">Golden Finger</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-5 space-y-6">
          {/* Golden Finger Info */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{character.goldenFinger.icon}</span>
              <div>
                <h3 className="font-display text-lg text-gold">{character.goldenFinger.name}</h3>
                <p className="text-xs text-white/60">{character.goldenFinger.description}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gold/20">
              <p className="text-sm text-white/80">{character.goldenFinger.effect}</p>
            </div>
            
            {/* Awakening Status */}
            <div className="mt-3 pt-3 border-t border-gold/20">
              {isAwakened ? (
                <div className="flex items-center gap-2 text-jade-glow">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-display">Fully Awakened</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/40">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Not Yet Awakened</span>
                </div>
              )}
            </div>
          </div>

          {/* Abilities */}
          {!isAwakened ? (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-white/60 text-sm">
                🔒 Complete the awakening scenario to unlock your Golden Finger abilities
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-display text-gold/80 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Available Abilities
              </h4>
              
              {abilities.map((ability) => {
                const Icon = ability.icon;
                const isPassive = ability.type === 'passive';
                
                return (
                  <div
                    key={ability.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      isPassive 
                        ? "bg-jade/10 border-jade/30" 
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-gold/30 cursor-pointer"
                    )}
                    onClick={() => !isPassive && onUseAbility?.(ability.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isPassive ? "bg-jade/20" : "bg-gold/20"
                      )}>
                        <Icon className={cn("w-5 h-5", isPassive ? "text-jade-glow" : "text-gold")} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className={cn(
                            "font-display text-sm",
                            isPassive ? "text-jade-glow" : "text-gold"
                          )}>
                            {ability.name}
                          </h5>
                          {ability.type === 'passive' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-jade/20 text-jade-glow">
                              PASSIVE
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-white/70 mb-2">
                          {ability.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-[10px] text-white/50">
                          {ability.cost && (
                            <span>💎 {ability.cost}</span>
                          )}
                          {ability.cooldown && (
                            <span>⏱️ {ability.cooldown}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Usage Tips */}
          {isAwakened && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/60">
                💡 <span className="text-gold">Tip:</span> During combat, your Golden Finger abilities will appear as action choices. Use them strategically!
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
