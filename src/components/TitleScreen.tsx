import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sword, Scroll, RotateCcw, Settings } from 'lucide-react';
import { OptionsDialog } from './OptionsDialog';
import { useLanguage } from '@/contexts/LanguageContext';

type TitleScreenProps = {
  onStart: () => void;
  onNewGame?: () => void;
  hasSavedGame?: boolean;
  isLoggedIn?: boolean;
};

export function TitleScreen({ onStart, onNewGame, hasSavedGame, isLoggedIn }: TitleScreenProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/assets/backgrounds/wuxia-landscape-3.jpg)',
        }}
      />
      
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      
      {/* Animated mist effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold/10 rounded-full blur-[100px] animate-mist" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-jade/10 rounded-full blur-[120px] animate-mist" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gold/5 rounded-full blur-[80px] animate-mist" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-6 sm:space-y-8 max-w-lg w-full px-6 sm:px-8">
        {/* Decorative top element */}
        <div className="flex justify-center mb-4">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
        </div>

        {/* Title Card */}
        <div className="relative p-6 sm:p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-gold/20 shadow-2xl">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/50 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold/50 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold/50 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/50 rounded-br-xl" />
          
          {/* Title */}
          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gold-gradient tracking-wider animate-fade-in drop-shadow-lg">
              我的武俠之旅
            </h1>
            <p className="font-display text-xl sm:text-2xl md:text-3xl text-white/90 tracking-widest animate-fade-in drop-shadow-md" style={{ animationDelay: '0.2s' }}>
              {t('title.main')}
            </p>
          </div>

          {/* Subtitle */}
          <div className="space-y-2 mt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-lg sm:text-xl text-gold/90 font-body italic">
              {t('title.subtitle')}
            </p>
            <p className="text-sm sm:text-base text-white/60">
              "Infinite Freedom, Ruthless World, Zero to Hero"
            </p>
          </div>

          {/* Decorative Sword */}
          <div className="flex justify-center py-6 animate-float">
            <div className="relative">
              <Sword className="w-12 h-12 sm:w-14 sm:h-14 text-gold rotate-45 drop-shadow-lg" strokeWidth={1.5} />
              <div className="absolute inset-0 w-12 h-12 sm:w-14 sm:h-14 bg-gold/30 blur-xl rounded-full" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          {hasSavedGame && isLoggedIn ? (
            <>
              <Button 
                variant="golden" 
                size="lg" 
                onClick={onStart}
                className="w-full h-14 text-lg font-display tracking-wide shadow-lg hover:shadow-gold/30 transition-all duration-300 touch-manipulation"
              >
                <Scroll className="mr-3 w-5 h-5" />
                {t('title.continue')}
              </Button>
              
              <Button 
                variant="ink" 
                size="lg"
                className="w-full h-12 bg-white/10 hover:bg-white/20 border-white/20 text-white touch-manipulation"
                onClick={onNewGame}
              >
                <RotateCcw className="mr-2 w-4 h-4" />
                {t('title.newGame')}
              </Button>
              
              {/* Options Button */}
              <Button 
                variant="ghost" 
                size="lg"
                className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-gold/50 text-white/70 hover:text-gold touch-manipulation transition-all duration-300"
                onClick={() => setIsOptionsOpen(true)}
              >
                <Settings className="mr-2 w-4 h-4" />
                {t('title.options')}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="golden" 
                size="lg" 
                onClick={onStart}
                className="w-full h-14 text-lg font-display tracking-wide shadow-lg hover:shadow-gold/30 transition-all duration-300 touch-manipulation"
              >
                <Scroll className="mr-3 w-5 h-5" />
                {isLoggedIn ? t('title.start') : 'Login to Play'}
              </Button>
              
              {/* Options Button - Show even when not logged in */}
              <Button 
                variant="ghost" 
                size="lg"
                className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-gold/50 text-white/70 hover:text-gold touch-manipulation transition-all duration-300"
                onClick={() => setIsOptionsOpen(true)}
              >
                <Settings className="mr-2 w-4 h-4" />
                {t('title.options')}
              </Button>
              
              {!isLoggedIn && (
                <p className="text-sm text-white/50 mt-2">
                  Create an account to save your progress
                </p>
              )}
            </>
          )}
        </div>

        {/* Bottom text */}
        <p className="text-sm text-white/40 pt-4 animate-fade-in tracking-wide" style={{ animationDelay: '1s' }}>
          Swipe to explore • Type to act • Survive to ascend
        </p>
      </div>

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      
      {/* Options Dialog */}
      <OptionsDialog isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} />
    </div>
  );
}
