import { GameMessage } from '@/types/game';
import { cn } from '@/lib/utils';
import { Swords, MessageCircle, AlertCircle, Footprints } from 'lucide-react';

type StoryMessageProps = {
  message: GameMessage;
  isLatest?: boolean;
};

export function StoryMessage({ message, isLatest = false }: StoryMessageProps) {
  const getIcon = () => {
    switch (message.type) {
      case 'combat':
        return <Swords className="w-4 h-4 text-blood" />;
      case 'dialogue':
        return <MessageCircle className="w-4 h-4 text-jade-glow" />;
      case 'system':
        return <AlertCircle className="w-4 h-4 text-gold" />;
      case 'action':
        return <Footprints className="w-4 h-4 text-mist" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    switch (message.type) {
      case 'combat':
        return 'border-l-red-500 bg-red-500/10';
      case 'dialogue':
        return 'border-l-emerald-400 bg-emerald-400/10';
      case 'system':
        return 'border-l-gold bg-gold/15';
      case 'action':
        return 'border-l-purple-400 bg-purple-400/10';
      default:
        return 'border-l-white/30 bg-white/5';
    }
  };

  return (
    <div
      className={cn(
        "p-4 sm:p-5 border-l-3 rounded-xl backdrop-blur-md transition-all duration-500",
        "bg-black/40 border border-white/10",
        getStyles(),
        isLatest && "animate-slide-up shadow-lg"
      )}
    >
      {message.speaker && (
        <div className="flex items-center gap-2 mb-3">
          {getIcon()}
          <span className="text-sm sm:text-base font-display text-white/70">
            {message.speaker}
          </span>
        </div>
      )}
      
      <p className={cn(
        "text-white/90 leading-relaxed text-sm sm:text-base",
        message.type === 'narration' && "italic text-white/80",
        message.type === 'system' && "text-sm text-gold/90"
      )}>
        {message.content}
      </p>
    </div>
  );
}
