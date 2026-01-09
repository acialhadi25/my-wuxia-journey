import { Character, ActiveEffect } from '@/types/game';
import { cn } from '@/lib/utils';
import { RegenerationService } from '@/services/regenerationService';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type ActiveEffectsDisplayProps = {
  character: Character;
  onRemoveEffect?: (effectName: string) => void;
  compact?: boolean;
};

export function ActiveEffectsDisplay({ character, onRemoveEffect, compact = false }: ActiveEffectsDisplayProps) {
  const [, setTick] = useState(0);

  // Update every second to show remaining time
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!character.activeEffects || character.activeEffects.length === 0) {
    return null;
  }

  const getEffectColor = (type: ActiveEffect['type']) => {
    switch (type) {
      case 'buff': return 'border-jade/50 bg-jade/10';
      case 'blessing': return 'border-gold/50 bg-gold/10';
      case 'debuff': return 'border-red-400/50 bg-red-400/10';
      case 'poison': return 'border-green-500/50 bg-green-500/10';
      case 'curse': return 'border-purple-500/50 bg-purple-500/10';
      case 'qi_deviation': return 'border-orange-500/50 bg-orange-500/10';
      default: return 'border-white/20 bg-white/5';
    }
  };

  const getEffectTextColor = (type: ActiveEffect['type']) => {
    switch (type) {
      case 'buff': return 'text-jade-glow';
      case 'blessing': return 'text-gold';
      case 'debuff': return 'text-red-400';
      case 'poison': return 'text-green-400';
      case 'curse': return 'text-purple-400';
      case 'qi_deviation': return 'text-orange-400';
      default: return 'text-white';
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds === -1) return '∞';
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {character.activeEffects.map((effect) => {
          const remaining = RegenerationService.getEffectRemainingTime(character, effect.name);
          return (
            <div
              key={effect.id}
              className={cn(
                "px-2 py-1 rounded border text-xs flex items-center gap-1",
                getEffectColor(effect.type)
              )}
              title={effect.description}
            >
              <span>{effect.icon || '•'}</span>
              {effect.stacks && effect.stacks > 1 && (
                <span className="font-bold">x{effect.stacks}</span>
              )}
              {!effect.isPermanent && remaining !== -1 && (
                <span className="text-white/60">{formatTime(remaining)}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {character.activeEffects.map((effect) => {
        const remaining = RegenerationService.getEffectRemainingTime(character, effect.name);
        const progress = effect.isPermanent || remaining === -1 
          ? 100 
          : (remaining / effect.duration) * 100;

        return (
          <div
            key={effect.id}
            className={cn(
              "p-3 rounded-lg border relative overflow-hidden",
              getEffectColor(effect.type)
            )}
          >
            {/* Progress bar background */}
            {!effect.isPermanent && remaining !== -1 && (
              <div
                className="absolute inset-0 bg-white/5 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            )}

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{effect.icon || '•'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium text-sm", getEffectTextColor(effect.type))}>
                        {effect.name}
                      </span>
                      {effect.stacks && effect.stacks > 1 && (
                        <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded">
                          x{effect.stacks}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-0.5">{effect.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!effect.isPermanent && remaining !== -1 ? (
                    <span className="text-xs text-white/70 font-mono">
                      {formatTime(remaining)}
                    </span>
                  ) : (
                    <span className="text-xs text-gold">Permanent</span>
                  )}
                  
                  {onRemoveEffect && !effect.isPermanent && (
                    <button
                      onClick={() => onRemoveEffect(effect.name)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Remove effect (cheat)"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Effect details */}
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {effect.statModifiers && Object.entries(effect.statModifiers).map(([stat, value]) => (
                  value !== 0 && (
                    <span
                      key={stat}
                      className={cn(
                        "px-2 py-0.5 rounded",
                        value > 0 ? "bg-jade/20 text-jade-glow" : "bg-red-400/20 text-red-400"
                      )}
                    >
                      {stat}: {value > 0 ? '+' : ''}{value * (effect.stacks || 1)}
                    </span>
                  )
                ))}
                
                {effect.regenModifiers && (
                  <>
                    {effect.regenModifiers.healthRegen !== undefined && effect.regenModifiers.healthRegen !== 0 && (
                      <span className={cn(
                        "px-2 py-0.5 rounded",
                        effect.regenModifiers.healthRegen > 0 ? "bg-jade/20 text-jade-glow" : "bg-red-400/20 text-red-400"
                      )}>
                        HP Regen: {effect.regenModifiers.healthRegen > 0 ? '+' : ''}{effect.regenModifiers.healthRegen}/s
                      </span>
                    )}
                    {effect.regenModifiers.qiRegen !== undefined && effect.regenModifiers.qiRegen !== 0 && (
                      <span className={cn(
                        "px-2 py-0.5 rounded",
                        effect.regenModifiers.qiRegen > 0 ? "bg-jade/20 text-jade-glow" : "bg-red-400/20 text-red-400"
                      )}>
                        Qi Regen: {effect.regenModifiers.qiRegen > 0 ? '+' : ''}{effect.regenModifiers.qiRegen}/s
                      </span>
                    )}
                  </>
                )}

                {effect.damageOverTime && (
                  <>
                    {effect.damageOverTime.healthDamage !== undefined && effect.damageOverTime.healthDamage > 0 && (
                      <span className="px-2 py-0.5 rounded bg-red-400/20 text-red-400">
                        -{effect.damageOverTime.healthDamage} HP/s
                      </span>
                    )}
                    {effect.damageOverTime.qiDrain !== undefined && effect.damageOverTime.qiDrain > 0 && (
                      <span className="px-2 py-0.5 rounded bg-red-400/20 text-red-400">
                        -{effect.damageOverTime.qiDrain} Qi/s
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
