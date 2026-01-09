import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { GameChoice } from '@/types/game';
import { cn } from '@/lib/utils';

type ActionInputProps = {
  choices: GameChoice[];
  onAction: (action: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  allowCustomAction?: boolean; // New prop to control custom action availability
};

export function ActionInput({ choices, onAction, isLoading, disabled, allowCustomAction = true }: ActionInputProps) {
  const [customAction, setCustomAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAction.trim() && !isLoading && !disabled) {
      onAction(customAction.trim());
      setCustomAction('');
    }
  };

  const handleChoiceClick = (choice: GameChoice) => {
    if (!isLoading && !disabled) {
      onAction(choice.text);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4">
      {/* Quick Action Buttons */}
      {choices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {choices.slice(0, 3).map((choice) => (
            <Button
              key={choice.id}
              variant="action"
              size="sm"
              className={cn(
                "flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 sm:flex-initial",
                "justify-center text-center h-auto py-2.5 px-3 sm:py-3 sm:px-4 md:px-6",
                "bg-white/10 hover:bg-gold/20 border border-white/20 hover:border-gold/50",
                "text-white hover:text-gold transition-all duration-300",
                "text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl backdrop-blur-md",
                "touch-manipulation active:scale-95"
              )}
              onClick={() => handleChoiceClick(choice)}
              disabled={isLoading || disabled}
            >
              <span className="truncate leading-tight">{choice.text}</span>
              {choice.checkType && (
                <span className="text-xs text-white/40 ml-1.5 sm:ml-2 hidden md:inline">
                  [{choice.checkType}]
                </span>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Free Text Input */}
      {allowCustomAction ? (
        <>
          <form onSubmit={handleSubmit} className="relative">
            <Input
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              placeholder="Type your own action..."
              className={cn(
                "bg-black/40 border-white/20 pr-12 sm:pr-14 h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg",
                "text-white placeholder:text-white/40 rounded-lg sm:rounded-xl backdrop-blur-md",
                "focus:border-gold/50 focus:ring-gold/20 focus:bg-black/50",
                "touch-manipulation"
              )}
              disabled={isLoading || disabled}
              maxLength={200}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gold hover:bg-gold/20 rounded-lg touch-manipulation active:scale-95"
              disabled={!customAction.trim() || isLoading || disabled}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              )}
            </Button>
          </form>

          <p className="text-xs sm:text-sm text-white/40 text-center">
            Express yourself freely. The Jianghu responds to your actions.
          </p>
        </>
      ) : (
        <div className="p-4 sm:p-6 rounded-xl bg-gold/10 border border-gold/30 backdrop-blur-md">
          <p className="text-xs sm:text-sm text-gold text-center font-medium">
            🔒 Awakening in Progress
          </p>
          <p className="text-xs text-white/60 text-center mt-2">
            Choose from the guided actions above. Custom actions will unlock after your Golden Finger awakens.
          </p>
        </div>
      )}
    </div>
  );
}
