import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DaoMasterMessageProps {
  message: string;
  stepNumber: number;
  totalSteps: number;
  className?: string;
}

export function DaoMasterMessage({ 
  message, 
  stepNumber, 
  totalSteps,
  className 
}: DaoMasterMessageProps) {
  return (
    <div className={cn(
      "relative p-6 mb-4 rounded-lg border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-amber-900/20 backdrop-blur-sm shadow-lg",
      "animate-in fade-in slide-in-from-top-4 duration-500",
      className
    )}>
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-yellow-400">Dao Master</h3>
          <p className="text-xs text-yellow-600">
            Tutorial Step {stepNumber}/{totalSteps}
          </p>
        </div>
      </div>

      {/* Message */}
      <div className="pl-13">
        <p className="text-base leading-relaxed text-gray-200">
          {message}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-yellow-400 to-amber-600 transition-all duration-500"
          style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
