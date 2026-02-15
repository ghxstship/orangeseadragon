import * as React from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  underHeader?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  contentPadding?: boolean;
  stickyHeader?: boolean;
}

export function PageShell({
  title,
  description,
  icon,
  actions,
  underHeader,
  children,
  className,
  headerClassName,
  contentClassName,
  contentPadding = true,
  stickyHeader = true,
}: PageShellProps) {
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <header
        className={cn(
          "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40",
          stickyHeader && "sticky top-0",
          headerClassName
        )}
      >
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {icon}
              <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
            </div>
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {underHeader && <div className="px-4 sm:px-6 border-t bg-muted/30">{underHeader}</div>}
      </header>

      <div
        className={cn(
          "flex-1 overflow-auto",
          contentPadding && "p-4 sm:p-6",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
