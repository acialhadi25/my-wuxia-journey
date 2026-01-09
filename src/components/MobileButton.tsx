import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { vibrate } from '@/lib/mobile';

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  vibrate?: boolean;
  vibratePattern?: number | number[];
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, onClick, vibrate: shouldVibrate = true, vibratePattern = 50, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Vibrate on click if enabled
      if (shouldVibrate) {
        vibrate(vibratePattern);
      }

      // Call original onClick
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(
          // Mobile-optimized touch targets
          'min-h-[44px] min-w-[44px]',
          // Better tap feedback
          'active:scale-95 transition-transform',
          // Prevent text selection on double tap
          'select-none',
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

MobileButton.displayName = 'MobileButton';
