import { useState, useEffect, useRef, useCallback } from 'react';
import { Character, CultivationRealm, REALM_ORDER, REALM_MAX_QI, REALM_MAX_HEALTH, getNextRealm } from '@/types/game';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Sparkles, Zap, Mountain, AlertTriangle } from 'lucide-react';

type CultivationPanelProps = {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onMeditationComplete: (qiGained: number, cultivationGained: number) => void;
  onBreakthroughAttempt: (success: boolean, newRealm?: CultivationRealm, damage?: number) => void;
};

type MeditationState = 'idle' | 'focusing' | 'gathering' | 'complete';

export function CultivationPanel({ 
  character, 
  isOpen, 
  onClose, 
  onMeditationComplete,
  onBreakthroughAttempt 
}: CultivationPanelProps) {
  const [meditationState, setMeditationState] = useState<MeditationState>('idle');
  const [focusLevel, setFocusLevel] = useState(0);
  const [qiGathered, setQiGathered] = useState(0);
  const [cultivationGained, setCultivationGained] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [targetZone, setTargetZone] = useState({ start: 40, end: 60 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [perfectHits, setPerfectHits] = useState(0);
  const [isBreakthroughMode, setIsBreakthroughMode] = useState(false);
  const [breakthroughPhase, setBreakthroughPhase] = useState(0);
  const [showResult, setShowResult] = useState<'success' | 'failure' | null>(null);
  
  const animationRef = useRef<number>();
  const breathRef = useRef<number>();
  const meditationRounds = useRef(0);

  const nextRealm = getNextRealm(character.realm);
  const canBreakthrough = character.breakthroughReady && nextRealm;

  // Cursor oscillation for timing mini-game
  useEffect(() => {
    if (meditationState !== 'gathering' && !isBreakthroughMode) return;

    let direction = 1;
    const speed = isBreakthroughMode ? 3 : 2; // Faster during breakthrough
    
    const animate = () => {
      setCursorPosition(prev => {
        let next = prev + direction * speed;
        if (next >= 100) { direction = -1; next = 100; }
        if (next <= 0) { direction = 1; next = 0; }
        return next;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [meditationState, isBreakthroughMode]);

  // Breathing cycle for focus phase
  useEffect(() => {
    if (meditationState !== 'focusing') return;

    const cycle = () => {
      setBreathPhase(prev => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    };

    breathRef.current = window.setInterval(cycle, 2000);
    return () => {
      if (breathRef.current) clearInterval(breathRef.current);
    };
  }, [meditationState]);

  // Random target zone for each gathering phase
  useEffect(() => {
    if (meditationState === 'gathering' || isBreakthroughMode) {
      const zoneWidth = isBreakthroughMode ? 15 : 20;
      const start = Math.floor(Math.random() * (100 - zoneWidth - 10)) + 5;
      setTargetZone({ start, end: start + zoneWidth });
    }
  }, [meditationState, isBreakthroughMode, perfectHits]);

  const startMeditation = () => {
    setMeditationState('focusing');
    setFocusLevel(0);
    setQiGathered(0);
    setCultivationGained(0);
    setPerfectHits(0);
    meditationRounds.current = 0;
  };

  const handleBreathClick = () => {
    if (meditationState !== 'focusing') return;
    
    // Clicking during 'hold' phase gives best focus
    let focusGain = 0;
    if (breathPhase === 'hold') {
      focusGain = 20;
    } else if (breathPhase === 'inhale') {
      focusGain = 10;
    } else {
      focusGain = 5;
    }
    
    setFocusLevel(prev => {
      const next = Math.min(100, prev + focusGain);
      if (next >= 100) {
        setTimeout(() => setMeditationState('gathering'), 500);
      }
      return next;
    });
  };

  const handleGatherClick = () => {
    if (meditationState !== 'gathering') return;

    const inZone = cursorPosition >= targetZone.start && cursorPosition <= targetZone.end;
    const perfectCenter = Math.abs(cursorPosition - (targetZone.start + targetZone.end) / 2) < 5;

    if (inZone) {
      const baseQi = 5;
      const baseCultivation = 3;
      const multiplier = perfectCenter ? 2 : 1;
      const spiritBonus = character.spiritRoot !== 'Trash' ? 1.2 : 0.8;
      
      const qi = Math.floor(baseQi * multiplier * spiritBonus);
      const cultivation = Math.floor(baseCultivation * multiplier * spiritBonus);
      
      setQiGathered(prev => prev + qi);
      setCultivationGained(prev => prev + cultivation);
      setPerfectHits(prev => prev + (perfectCenter ? 1 : 0));
      meditationRounds.current++;

      // After 5 successful gathers, complete meditation
      if (meditationRounds.current >= 5) {
        setMeditationState('complete');
      }
    } else {
      // Miss - lose some focus
      setFocusLevel(prev => Math.max(0, prev - 20));
      if (focusLevel <= 20) {
        // Meditation broken
        setMeditationState('complete');
      }
    }
  };

  const completeMeditation = () => {
    onMeditationComplete(qiGathered, cultivationGained);
    resetState();
  };

  const startBreakthrough = () => {
    setIsBreakthroughMode(true);
    setBreakthroughPhase(0);
    setPerfectHits(0);
    setCursorPosition(0);
  };

  const handleBreakthroughClick = () => {
    if (!isBreakthroughMode) return;

    const inZone = cursorPosition >= targetZone.start && cursorPosition <= targetZone.end;
    
    if (inZone) {
      const newPhase = breakthroughPhase + 1;
      setBreakthroughPhase(newPhase);
      setPerfectHits(prev => prev + 1);

      if (newPhase >= 3) {
        // Calculate success chance
        const baseChance = 50;
        const luckBonus = character.stats.luck * 2;
        const cultivationBonus = character.stats.cultivation;
        const perfectBonus = perfectHits * 10;
        const successChance = Math.min(95, baseChance + luckBonus + cultivationBonus + perfectBonus);
        
        const roll = Math.random() * 100;
        const success = roll < successChance;

        if (success && nextRealm) {
          setShowResult('success');
          setTimeout(() => {
            onBreakthroughAttempt(true, nextRealm);
            resetState();
          }, 2000);
        } else {
          setShowResult('failure');
          const damage = Math.floor(character.maxHealth * 0.3);
          setTimeout(() => {
            onBreakthroughAttempt(false, undefined, damage);
            resetState();
          }, 2000);
        }
      }
    } else {
      // Failure - immediate qi deviation
      setShowResult('failure');
      const damage = Math.floor(character.maxHealth * 0.4);
      setTimeout(() => {
        onBreakthroughAttempt(false, undefined, damage);
        resetState();
      }, 2000);
    }
  };

  const resetState = () => {
    setMeditationState('idle');
    setIsBreakthroughMode(false);
    setBreakthroughPhase(0);
    setShowResult(null);
    setFocusLevel(0);
    setQiGathered(0);
    setCultivationGained(0);
    setPerfectHits(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-black/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-gold" />
              <div className="absolute inset-0 w-6 h-6 bg-gold/30 blur-lg rounded-full" />
            </div>
            <h2 className="font-display text-lg sm:text-xl text-gold">
              {isBreakthroughMode ? 'Breakthrough Attempt' : 'Cultivation Chamber'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { resetState(); onClose(); }} className="text-white/70 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Realm Info */}
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Mountain className="w-5 h-5 text-jade-glow" />
              <span className="text-jade-glow font-display text-lg">{character.realm}</span>
            </div>
            <div className="h-3 bg-black/50 rounded-full overflow-hidden mb-2">
              <div 
                className={cn(
                  "h-full transition-all duration-300 rounded-full",
                  character.breakthroughReady ? "bg-gradient-to-r from-gold to-yellow-300 animate-pulse" : "bg-gradient-to-r from-gold to-yellow-500"
                )}
                style={{ width: `${character.cultivationProgress}%` }}
              />
            </div>
            <p className="text-sm text-white/60">
              Cultivation Progress: <span className="text-gold">{character.cultivationProgress}%</span>
              {character.breakthroughReady && <span className="text-gold ml-2">⚡ Ready!</span>}
            </p>
          </div>

          {/* Result Screen */}
          {showResult && (
            <div className={cn(
              "text-center py-8 space-y-4 animate-fade-in",
              showResult === 'success' ? 'text-gold' : 'text-blood'
            )}>
              {showResult === 'success' ? (
                <>
                  <Sparkles className="w-16 h-16 mx-auto animate-pulse" />
                  <h3 className="font-display text-2xl">BREAKTHROUGH!</h3>
                  <p className="text-foreground">You have ascended to {nextRealm}!</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-16 h-16 mx-auto" />
                  <h3 className="font-display text-2xl">Qi Deviation!</h3>
                  <p className="text-foreground">The breakthrough failed. You suffer internal injuries.</p>
                </>
              )}
            </div>
          )}

          {/* Idle State */}
          {meditationState === 'idle' && !isBreakthroughMode && !showResult && (
            <div className="space-y-5 text-center">
              <p className="text-white/60 text-base leading-relaxed">
                Enter a meditative state to gather Qi and advance your cultivation.
              </p>
              <div className="space-y-3">
                <Button variant="golden" onClick={startMeditation} className="w-full h-14 text-lg font-display shadow-lg hover:shadow-gold/30">
                  <Zap className="w-5 h-5 mr-3" />
                  Begin Meditation
                </Button>
                {canBreakthrough && (
                  <Button 
                    variant="ink" 
                    onClick={startBreakthrough} 
                    className="w-full h-12 border-gold/50 text-gold hover:bg-gold/10 hover:border-gold font-display"
                  >
                    <Mountain className="w-5 h-5 mr-2" />
                    Attempt Breakthrough
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Focusing Phase */}
          {meditationState === 'focusing' && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                Tap during the <span className="text-gold">HOLD</span> phase to focus your mind.
              </p>
              
              <div 
                className={cn(
                  "h-32 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-500",
                  breathPhase === 'inhale' && "bg-spirit/20 scale-105",
                  breathPhase === 'hold' && "bg-gold/30 scale-100 ring-2 ring-gold",
                  breathPhase === 'exhale' && "bg-muted/20 scale-95"
                )}
                onClick={handleBreathClick}
              >
                <span className={cn(
                  "font-display text-2xl uppercase transition-all",
                  breathPhase === 'hold' ? "text-gold" : "text-muted-foreground"
                )}>
                  {breathPhase}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Focus</span>
                  <span>{focusLevel}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-spirit transition-all duration-200"
                    style={{ width: `${focusLevel}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Gathering Phase */}
          {meditationState === 'gathering' && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                Tap when the marker is in the <span className="text-jade-glow">green zone</span>!
              </p>

              <div 
                className="h-16 bg-muted rounded-lg relative cursor-pointer overflow-hidden"
                onClick={handleGatherClick}
              >
                {/* Target Zone */}
                <div 
                  className="absolute top-0 bottom-0 bg-jade/30"
                  style={{ 
                    left: `${targetZone.start}%`, 
                    width: `${targetZone.end - targetZone.start}%` 
                  }}
                />
                {/* Perfect Center */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-jade"
                  style={{ left: `${(targetZone.start + targetZone.end) / 2}%` }}
                />
                {/* Cursor */}
                <div 
                  className="absolute top-0 bottom-0 w-2 bg-gold shadow-lg shadow-gold/50 transition-none"
                  style={{ left: `${cursorPosition}%` }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Qi Gathered: <span className="text-spirit">{qiGathered}</span></span>
                <span className="text-muted-foreground">Cultivation: <span className="text-gold">+{cultivationGained}%</span></span>
              </div>

              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      i < meditationRounds.current ? "bg-jade" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Complete Phase */}
          {meditationState === 'complete' && !showResult && (
            <div className="space-y-4 text-center">
              <Sparkles className="w-12 h-12 text-gold mx-auto" />
              <h3 className="font-display text-xl text-gold">Meditation Complete</h3>
              <div className="space-y-2 text-sm">
                <p className="text-spirit">Qi Gained: +{qiGathered}</p>
                <p className="text-gold">Cultivation Progress: +{cultivationGained}%</p>
                {perfectHits > 0 && (
                  <p className="text-jade-glow">Perfect Hits: {perfectHits} ⭐</p>
                )}
              </div>
              <Button variant="golden" onClick={completeMeditation} className="w-full">
                Accept Rewards
              </Button>
            </div>
          )}

          {/* Breakthrough Mode */}
          {isBreakthroughMode && !showResult && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gold font-display mb-2">
                  Breakthrough to {nextRealm}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hit 3 perfect timings to attempt the breakthrough!
                </p>
              </div>

              <div 
                className="h-20 bg-muted rounded-lg relative cursor-pointer overflow-hidden"
                onClick={handleBreakthroughClick}
              >
                {/* Target Zone */}
                <div 
                  className="absolute top-0 bottom-0 bg-gold/30"
                  style={{ 
                    left: `${targetZone.start}%`, 
                    width: `${targetZone.end - targetZone.start}%` 
                  }}
                />
                {/* Perfect Center */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-gold"
                  style={{ left: `${(targetZone.start + targetZone.end) / 2}%` }}
                />
                {/* Cursor */}
                <div 
                  className="absolute top-0 bottom-0 w-2 bg-crimson shadow-lg shadow-crimson/50 transition-none"
                  style={{ left: `${cursorPosition}%` }}
                />
              </div>

              <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      i < breakthroughPhase ? "bg-gold text-background" : "bg-muted"
                    )}
                  >
                    {i < breakthroughPhase && <Sparkles className="w-4 h-4" />}
                  </div>
                ))}
              </div>

              <p className="text-xs text-center text-blood">
                ⚠️ Failure causes Qi Deviation and health damage!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
