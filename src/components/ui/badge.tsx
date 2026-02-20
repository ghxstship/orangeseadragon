import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-primary-badge",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-destructive-badge",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-semantic-success/15 text-semantic-success hover:bg-semantic-success/25",
        warning:
          "border-transparent bg-semantic-warning/15 text-semantic-warning hover:bg-semantic-warning/25",
        glass:
          "glass border-white/20 text-foreground shadow-sm hover:shadow-md backdrop-blur-md",
        spatial:
          "bg-background/80 border-border/50 text-foreground shadow-spatial-badge backdrop-blur-sm",
        aurora:
          "bg-gradient-to-r from-semantic-indigo via-semantic-purple to-semantic-accent text-white border-none shadow-aurora-badge animate-aurora bg-[length:200%_200%]",
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
