import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: number;
  gap?: string;
}

export function Grid({ children, className, cols = 12, gap = 'gap-4' }: GridProps) {
  return (
    <div className={cn(`grid grid-cols-${cols} ${gap}`, className)}>
      {children}
    </div>
  );
}
