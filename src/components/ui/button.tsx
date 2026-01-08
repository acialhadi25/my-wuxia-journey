import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-display tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Wuxia Custom Variants
        golden: "bg-gradient-to-r from-[hsl(42,85%,55%)] to-[hsl(42,60%,75%)] text-[hsl(220,20%,6%)] font-bold shadow-lg hover:shadow-xl hover:scale-105",
        blood: "bg-gradient-to-r from-[hsl(0,70%,45%)] to-[hsl(0,65%,30%)] text-[hsl(40,20%,95%)] font-bold shadow-lg hover:scale-105",
        jade: "bg-[hsl(170,35%,40%)] text-foreground border border-[hsl(170,40%,50%)]/50 hover:bg-[hsl(170,40%,50%)] shadow-md",
        ink: "bg-[hsl(220,15%,20%)] text-foreground border border-border hover:bg-muted hover:border-muted-foreground/30",
        spirit: "bg-[hsl(260,40%,50%)] text-foreground shadow-lg hover:shadow-xl hover:scale-105",
        action: "bg-muted/80 text-foreground border border-border hover:bg-muted hover:border-primary/50 hover:text-primary transition-all",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
