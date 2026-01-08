import { Button } from '@/components/ui/button';
import { X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage, Language } from '@/contexts/LanguageContext';

type OptionsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function OptionsDialog({ isOpen, onClose }: OptionsDialogProps) {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-gradient-to-b from-ink via-ink-light to-ink border-2 border-gold/30 rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-gold" />
              </div>
              <h2 className="font-display text-2xl text-gold-gradient">
                {t('options.title')}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 text-white/70 hover:text-gold hover:bg-white/10 rounded-lg touch-manipulation"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Language Selection */}
            <div className="space-y-3">
              <label className="text-sm text-white/60 font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('options.language')}
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={language === 'en' ? 'golden' : 'ink'}
                  onClick={() => handleLanguageChange('en')}
                  className={cn(
                    "h-16 flex flex-col items-center justify-center gap-1 touch-manipulation transition-all duration-300",
                    language === 'en' 
                      ? "bg-gold/20 border-gold text-gold shadow-lg shadow-gold/20 scale-105" 
                      : "bg-white/5 hover:bg-white/10 border-white/20 text-white hover:border-gold/50"
                  )}
                >
                  <span className="text-2xl">🇬🇧</span>
                  <span className="text-sm font-display">{t('options.english')}</span>
                </Button>

                <Button
                  variant={language === 'id' ? 'golden' : 'ink'}
                  onClick={() => handleLanguageChange('id')}
                  className={cn(
                    "h-16 flex flex-col items-center justify-center gap-1 touch-manipulation transition-all duration-300",
                    language === 'id' 
                      ? "bg-gold/20 border-gold text-gold shadow-lg shadow-gold/20 scale-105" 
                      : "bg-white/5 hover:bg-white/10 border-white/20 text-white hover:border-gold/50"
                  )}
                >
                  <span className="text-2xl">🇮🇩</span>
                  <span className="text-sm font-display">{t('options.indonesian')}</span>
                </Button>
              </div>

              <p className="text-xs text-white/40 text-center mt-2">
                {language === 'en' 
                  ? 'AI will respond in the selected language'
                  : 'AI akan merespons dalam bahasa yang dipilih'
                }
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <Button
              variant="golden"
              onClick={onClose}
              className="w-full h-12 text-base font-display shadow-lg hover:shadow-gold/30 transition-all duration-300 touch-manipulation"
            >
              {t('options.close')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
