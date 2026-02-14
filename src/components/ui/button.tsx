import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[13px] font-bold tracking-wide ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_0_rgba(var(--primary),0.39)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.23)] hover:-translate-y-[1px] active:translate-y-[0px]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground",
        glass: "glass text-foreground hover:bg-white/10 dark:hover:bg-white/5 border border-white/20 hover:border-white/30 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] backdrop-blur-md",
        spatial: "bg-gradient-to-b from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 border border-white/20 shadow-[0_2px_10px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] text-foreground backdrop-blur-md",
        link: "text-primary underline-offset-4 hover:underline",
        shiny: "bg-primary text-primary-foreground animate-shimmer bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border-slate-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Helper to combine standard button props with motion props
type CombinedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, CombinedButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // If it's a Slot (asChild), we pass simpler props to avoid motion conflicts if the child is also motion
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }

    // Standard button implementation (no motion wrapper by default to avoidref issues with 3rd party libs expectation)
    // We rely on CSS transitions defined in the variants for the "motion" feel
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export type ButtonProps = CombinedButtonProps;
export { Button, buttonVariants };
