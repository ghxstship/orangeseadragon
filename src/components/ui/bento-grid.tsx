"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { HOVER, TAP, SPRING } from "@/lib/tokens/motion";

/* ─────────────────────────────────────────────────────────────
   BENTO GRID
   Variable-size masonry-style grid layout for dashboards.
   Each item can span multiple columns/rows for visual hierarchy.
   
   Uses CSS Grid with explicit col-span/row-span for each item.
   Fully responsive: collapses to single column on mobile.
   ───────────────────────────────────────────────────────────── */

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 3 | 4 | 6;
  gap?: "sm" | "md" | "lg";
}

const gapStyles = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

const columnStyles = {
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

export function BentoGrid({
  children,
  className,
  columns = 4,
  gap = "md",
}: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(120px,auto)]",
        columnStyles[columns],
        gapStyles[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

/* ── Bento Item ──────────────────────────────────────────── */

export interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  variant?: "default" | "glass" | "gradient" | "outline";
  interactive?: boolean;
  onClick?: () => void;
}

const colSpanStyles = {
  1: "col-span-1",
  2: "col-span-1 md:col-span-2",
  3: "col-span-1 md:col-span-2 lg:col-span-3",
  4: "col-span-1 md:col-span-2 lg:col-span-4",
};

const rowSpanStyles = {
  1: "row-span-1",
  2: "row-span-1 md:row-span-2",
  3: "row-span-1 md:row-span-2 lg:row-span-3",
};

const variantStyles = {
  default:
    "bg-card border border-border shadow-sm",
  glass:
    "bg-card/70 backdrop-blur-xl border border-border/50 shadow-lg",
  gradient:
    "bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 shadow-md",
  outline:
    "bg-transparent border-2 border-dashed border-border/60",
};

export function BentoItem({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  variant = "default",
  interactive = false,
  onClick,
}: BentoItemProps) {
  const shouldReduce = useReducedMotion();

  const content = (
    <div
      className={cn(
        "rounded-xl overflow-hidden h-full",
        variantStyles[variant],
        interactive && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );

  if (shouldReduce || !interactive) {
    return (
      <div
        className={cn(
          colSpanStyles[colSpan],
          rowSpanStyles[rowSpan]
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        colSpanStyles[colSpan],
        rowSpanStyles[rowSpan]
      )}
      whileHover={HOVER.bento}
      whileTap={TAP.subtle}
      transition={SPRING.snappy}
    >
      {content}
    </motion.div>
  );
}

/* ── Bento Item Sub-components ───────────────────────────── */

export function BentoItemHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between p-4 pb-2", className)}>
      {children}
    </div>
  );
}

export function BentoItemTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-[10px] font-black uppercase tracking-[0.2em] opacity-40",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function BentoItemContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-4 pt-0", className)}>{children}</div>;
}

export function BentoItemValue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-3xl font-black tracking-tighter", className)}>
      {children}
    </div>
  );
}
