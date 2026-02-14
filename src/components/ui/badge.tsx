import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_4px_10px_-2px_rgba(var(--primary),0.3)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-[0_4px_10px_-2px_rgba(var(--destructive),0.3)]",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25",
        warning:
          "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25",
        glass:
          "glass border-white/20 text-foreground shadow-sm hover:shadow-md backdrop-blur-md",
        spatial:
          "bg-background/80 border-border/50 text-foreground shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] backdrop-blur-sm",
        aurora:
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none shadow-[0_4px_14px_0_rgba(168,85,247,0.4)] animate-aurora bg-[length:200%_200%]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
