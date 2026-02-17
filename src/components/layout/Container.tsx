import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  padding?: string;
}

export function Container({
  children,
  className,
  maxWidth = 'max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl',
  padding = 'px-4 sm:px-6 lg:px-8'
}: ContainerProps) {
  return (
    <div className={cn('mx-auto', maxWidth, padding, className)}>
      {children}
    </div>
  );
}
