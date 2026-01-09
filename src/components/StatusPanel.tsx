import { Character, getRarityColor, getRankColor } from '@/types/game';
import { cn } from '@/lib/utils';
import { Heart, Zap, Calendar, Mountain, Sparkles, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActiveEffectsDisplay } from './ActiveEffectsDisplay';
import { RegenerationService } from '@/services/regenerationService';
import { 
  getKarmaLabel, 
  getKarmaDescription, 
  getKarmaBadgeColor, 
  getKarmaAuraColor,
  getKarmaIcon 
} from '@/lib/karma';

type StatusPanelProps = {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onPanelClose?: () => void; // Called when panel closes (for tutorial)
};

export function StatusPanel({ character, isOpen, onClose, onPanelClose }: StatusPanelProps) {
  const handleClose = () => {
    onClose();
    onPanelClose?.(); // Trigger tutorial callback if exists
  };
  const healthPercentage = (character.health / character.maxHealth) * 100;
  const qiPercentage = (character.qi / character.maxQi) * 100;
  const staminaPercentage = ((character.stamina || 0) / (character.maxStamina || 100)) * 100;
  const cultivationProgress = character.cultivationProgress || 0;
  
  // Calculate regeneration rates
  const regen = RegenerationService.calculateRegeneration(character);
  const effectiveStats = RegenerationService.getEffectiveStats(character);
  const statModifiers = RegenerationService.calculateStatModifiers(character);

  const getHealthColor = () => {
    if (healthPercentage > 60) return 'bg-jade';
    if (healthPercentage > 30) return 'bg-gold';
    return 'bg-blood';
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-[340px] max-w-[90vw] bg-black/90 backdrop-blur-xl border-l border-white/10",
        "transform transition-transform duration-300 ease-out z-50",
        "flex flex-col shadow-2xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-black/50">
        <h2 className="font-display text-xl text-gold">Status</h2>
        <Button variant="ghost" size="icon" onClick={handleClose} className="text-white/70 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-5 space-y-6">
          {/* Character Info */}
          <div className="text-center space-y-2 pb-4 border-b border-white/10">
            <h3 className="font-display text-2xl text-gold-gradient">{character.name}</h3>
            <p className="text-sm text-white/60">{character.origin}</p>
            <div className="flex items-center justify-center gap-2 text-sm bg-jade/20 py-2 px-4 rounded-lg inline-flex mx-auto">
              <Mountain className="w-4 h-4 text-jade-glow" />
              <span className="text-jade-glow font-display">{character.realm}</span>
            </div>
          </div>

          {/* Bars */}
          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
            {/* Health */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <Heart className="w-4 h-4 text-red-400" /> Health
                </span>
                <span className="text-white">{character.health}/{character.maxHealth}</span>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500 rounded-full", getHealthColor())}
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
            </div>

            {/* Qi */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <Zap className="w-4 h-4 text-purple-400" /> Qi
                </span>
                <span className="text-white">{Math.round(character.qi)}/{character.maxQi}</span>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500 rounded-full"
                  style={{ width: `${qiPercentage}%` }}
                />
              </div>
            </div>

            {/* Stamina */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <TrendingUp className="w-4 h-4 text-amber-400" /> Stamina
                </span>
                <span className="text-white">{Math.round(character.stamina || 0)}/{character.maxStamina || 100}</span>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                  style={{ width: `${staminaPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-white/40 text-right">
                +{regen.stamina.toFixed(1)}/s (Strength bonus)
              </p>
            </div>

            {/* Cultivation Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <Sparkles className="w-4 h-4 text-gold" /> Cultivation
                </span>
                <span className={cn("text-white", character.breakthroughReady && 'text-gold animate-pulse')}>
                  {cultivationProgress}%{character.breakthroughReady ? ' ⚡' : ''}
                </span>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500 rounded-full", character.breakthroughReady ? 'bg-gradient-to-r from-gold to-yellow-300 animate-pulse' : 'bg-gradient-to-r from-gold to-yellow-500')}
                  style={{ width: `${cultivationProgress}%` }}
                />
              </div>
              {character.breakthroughReady && (
                <p className="text-xs text-gold text-center font-display">✨ Ready for Breakthrough! ✨</p>
              )}
            </div>
          </div>

          {/* Regeneration Info */}
          <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-xs font-display text-gold/80 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Regeneration
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">HP/s:</span>
                <span className={cn("font-medium", regen.health > 0 ? "text-jade-glow" : "text-white/40")}>
                  +{regen.health.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Qi/s:</span>
                <span className={cn("font-medium", regen.qi > 0 ? "text-purple-400" : "text-white/40")}>
                  +{regen.qi.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Active Effects */}
          {character.activeEffects && character.activeEffects.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-display text-gold/80">Active Effects ({character.activeEffects.length})</h4>
              <ActiveEffectsDisplay character={character} compact={false} />
            </div>
          )}

          {/* Stats */}
          <div className="space-y-3">
            <h4 className="text-sm font-display text-gold/80">Attributes</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(character.stats).slice(0, 5).map(([stat, value]) => {
                const modifier = statModifiers[stat as keyof typeof statModifiers] || 0;
                const effective = effectiveStats[stat as keyof typeof effectiveStats] || value;
                
                return (
                  <div key={stat} className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-white/60 capitalize">{stat}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-medium">{value}</span>
                      {modifier !== 0 && (
                        <span className={cn("text-xs", modifier > 0 ? "text-jade-glow" : "text-red-400")}>
                          ({modifier > 0 ? '+' : ''}{modifier})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Life Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-display text-gold/80">Life</h4>
            <div className="flex items-center gap-2 text-sm p-3 bg-white/5 rounded-lg border border-white/10">
              <Calendar className="w-4 h-4 text-white/60" />
              <span className="text-white/70">Age: </span>
              <span className="text-white font-medium">{character.stats.currentAge} / {character.stats.lifespan}</span>
            </div>
          </div>

          {/* Karma - Enhanced Visual */}
          <div className="space-y-2">
            <h4 className="text-sm font-display text-gold/80">Karma & Alignment</h4>
            
            {/* Karma Value */}
            <div className="text-sm p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Karma: </span>
                <span className={cn("font-medium text-lg", character.karma >= 0 ? 'text-jade-glow' : 'text-blood')}>
                  {character.karma >= 0 ? '+' : ''}{character.karma}
                </span>
              </div>
            </div>

            {/* Karma Alignment Badge */}
            <div className={cn(
              "p-3 rounded-lg border relative overflow-hidden",
              getKarmaBadgeColor(character.karma).bg,
              getKarmaBadgeColor(character.karma).border
            )}>
              {/* Aura Effect */}
              <div className={cn(
                "absolute inset-0 opacity-20 bg-gradient-to-r blur-xl",
                getKarmaAuraColor(character.karma)
              )} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getKarmaIcon(character.karma)}</span>
                  <span className={cn("font-display text-lg", getKarmaBadgeColor(character.karma).text)}>
                    {getKarmaLabel(character.karma)}
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  {getKarmaDescription(character.karma)}
                </p>
              </div>
            </div>

            {/* Karma Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>😈 Demonic</span>
                <span>⚖️ Neutral</span>
                <span>✨ Righteous</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden relative">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-gray-500 to-jade" />
                
                {/* Karma indicator */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50"
                  style={{ 
                    left: `${((character.karma + 150) / 300) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>-150</span>
                <span>0</span>
                <span>+150</span>
              </div>
            </div>
          </div>

          {/* Golden Finger */}
          <div className="space-y-2">
            <h4 className="text-sm font-display text-gold/80">Golden Finger</h4>
            <div className="p-3 bg-gold/10 border border-gold/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{character.goldenFinger.icon}</span>
                <span className="font-display text-gold">{character.goldenFinger.name}</span>
              </div>
              <p className="text-xs text-white/60">{character.goldenFinger.effect}</p>
            </div>
          </div>

          {/* Spirit Root */}
          <div className="space-y-2">
            <h4 className="text-sm font-display text-gold/80">Spirit Root</h4>
            <div className={cn(
              "p-3 rounded-lg border",
              character.spiritRoot === 'Trash' 
                ? 'bg-blood/10 border-blood/20' 
                : 'bg-jade/10 border-jade/20'
            )}>
              <span className={cn("font-display", character.spiritRoot === 'Trash' ? 'text-blood' : 'text-jade-glow')}>
                {character.spiritRoot} Root
              </span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
