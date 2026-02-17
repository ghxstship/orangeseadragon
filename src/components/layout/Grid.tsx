import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: string;
}

const columnStyles: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  7: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7",
  8: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8",
  9: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-9",
  10: "grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10",
  11: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-11",
  12: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-12",
};

export function Grid({ children, className, cols = 12, gap = 'gap-4' }: GridProps) {
  return (
    <div className={cn("grid", columnStyles[cols] || columnStyles[12], gap, className)}>
      {children}
    </div>
  );
}
