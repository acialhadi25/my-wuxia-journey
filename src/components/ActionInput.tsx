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
    <div className="mb-0">
      {/* Quick Action Buttons - Fixed Width Cards */}
      {choices.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 mb-1">
          {choices.map((choice) => (
            <Button
              key={choice.id}
              variant="action"
              size="sm"
              className={cn(
                "flex-shrink-0 justify-start text-left h-auto",
                // Single choice (tutorial): full width
                choices.length === 1 && "w-full",
                // Two choices (gameplay): 50% each
                choices.length === 2 && "w-[calc(50%-4px)] min-w-[160px]",
                // More than 2 (fallback): scrollable
                choices.length > 2 && "min-w-[160px] max-w-[200px]",
                "py-2.5 px-3",
                "bg-white/10 hover:bg-gold/20 border border-white/20 hover:border-gold/50",
                "text-white hover:text-gold transition-all duration-300",
                "text-xs sm:text-sm leading-snug",
                "rounded-lg backdrop-blur-md",
                "touch-manipulation active:scale-95"
              )}
              onClick={() => handleChoiceClick(choice)}
              disabled={isLoading || disabled}
            >
              <span className="block w-full whitespace-normal break-words">
                {choice.text}
              </span>
              {choice.checkType && (
                <span className="text-[9px] text-white/40 mt-1 block">
                  [{choice.checkType}]
                </span>
              )}
            </Button>
          ))}
        </div>
      ) : (
        // Placeholder when no choices - maintains layout height
        <div className="h-[44px] flex items-center justify-center mb-1">
          <p className="text-xs text-white/40">
            {isLoading ? 'Generating choices...' : 'Type your action below'}
          </p>
        </div>
      )}

      {/* Free Text Input */}
      {allowCustomAction ? (
        <form onSubmit={handleSubmit} className="relative mb-0">
            <Input
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              placeholder="Type your own action..."
              className={cn(
                "bg-black/40 border-white/20 pr-12 h-11 text-sm",
                "text-white placeholder:text-white/40 rounded-lg backdrop-blur-md",
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
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gold hover:bg-gold/20 rounded-lg touch-manipulation active:scale-95"
              disabled={!customAction.trim() || isLoading || disabled}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </form>
      ) : (
        <div className="p-3 rounded-lg bg-gold/10 border border-gold/30 backdrop-blur-md mb-0">
          <p className="text-xs text-gold text-center font-medium">
            🔒 Awakening in Progress
          </p>
          <p className="text-[10px] text-white/60 text-center mt-1">
            Choose from the guided actions above. Custom actions will unlock after your Golden Finger awakens.
          </p>
        </div>
      )}
    </div>
  );
}
