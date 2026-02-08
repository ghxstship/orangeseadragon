import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]",
        secondary:
          "border-border bg-muted text-muted-foreground",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive shadow-[0_0_10px_rgba(var(--destructive),0.2)]",
        outline: "border-border text-foreground",
        success:
          "border-green-500/20 bg-green-500/10 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
        spatial:
          "border-border bg-muted backdrop-blur-xl text-foreground shadow-2xl hover:border-primary/30 transition-all",
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
