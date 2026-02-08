import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", className)}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-black tracking-tighter uppercase opacity-90">{title}</h1>
          {badge && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-30 mt-2">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            {title && <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">{title}</h2>}
            {description && (
              <p className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-widest">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </section>
  );
}
