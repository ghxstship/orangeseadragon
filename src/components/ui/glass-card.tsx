"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { HOVER, TAP } from "@/lib/tokens/motion";

/* ─────────────────────────────────────────────────────────────
   GLASS CARD
   Glassmorphism card with layered depth, translucent backgrounds,
   and subtle backdrop blur. Fully tokenized for white-label.
   
   Variants:
   - default: Subtle glass with border
   - elevated: Stronger blur + shadow lift
   - floating: Maximum blur, used for overlays/popovers
   - solid: Opaque fallback (no blur)
   ───────────────────────────────────────────────────────────── */

type GlassVariant = "default" | "elevated" | "floating" | "solid";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  animated?: boolean;
}

const variantStyles: Record<GlassVariant, string> = {
  default: "glass-card border border-border/50 shadow-sm",
  elevated:
    "glass-card--elevated border border-border/40 shadow-lg shadow-black/[0.03] dark:shadow-black/[0.15]",
  floating:
    "glass-card--floating border border-white/10 dark:border-white/5 shadow-2xl shadow-black/[0.08] dark:shadow-black/[0.3]",
  solid: "bg-card border border-border shadow-sm",
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = "default",
      hover = true,
      glow = false,
      padding = "md",
      animated = true,
      children,
      ...props
    },
    ref
  ) => {
    const shouldReduce = useReducedMotion();
    const useMotion = animated && !shouldReduce;

    const sharedClassName = cn(
      "rounded-xl text-card-foreground transition-all duration-300 relative overflow-hidden",
      variantStyles[variant],
      paddingStyles[padding],
      hover && "hover:border-border/80 hover:shadow-md",
      glow && "hover:shadow-glow",
      className
    );

    if (useMotion) {
      return (
        <motion.div
          ref={ref}
          className={sharedClassName}
          whileHover={hover ? HOVER.lift : undefined}
          whileTap={hover ? TAP.subtle : undefined}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={sharedClassName} {...props}>
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

/* ── Glass Card Sub-components ───────────────────────────── */

export const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
GlassCardHeader.displayName = "GlassCardHeader";

export const GlassCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
GlassCardTitle.displayName = "GlassCardTitle";

export const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
GlassCardContent.displayName = "GlassCardContent";

export const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
GlassCardFooter.displayName = "GlassCardFooter";
