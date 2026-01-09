import { cn } from '@/lib/utils';

interface TutorialProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function TutorialProgress({ current, total, className }: TutorialProgressProps) {
  const chapters = [
    { name: 'Survival', steps: [1, 2, 3, 4, 5] },
    { name: 'Combat', steps: [6, 7, 8, 9] },
    { name: 'Cultivation', steps: [10, 11, 12] },
    { name: 'Golden Finger', steps: [13, 14] },
    { name: 'Advanced', steps: [15] }
  ];

  const getCurrentChapter = () => {
    for (const chapter of chapters) {
      if (chapter.steps.includes(current)) {
        return chapter.name;
      }
    }
    return 'Unknown';
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Chapter indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-yellow-400">
          Chapter: {getCurrentChapter()}
        </span>
        <span className="text-sm text-gray-400">
          {current}/{total} Steps
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 transition-all duration-500 ease-out"
          style={{ width: `${(current / total) * 100}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              step < current && "bg-yellow-500 scale-110",
              step === current && "bg-yellow-400 scale-125 ring-2 ring-yellow-400/50 animate-pulse",
              step > current && "bg-gray-600 scale-90"
            )}
            title={`Step ${step}`}
          />
        ))}
      </div>
    </div>
  );
}
