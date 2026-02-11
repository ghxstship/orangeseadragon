"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "@/components/common/command-palette";
import { NotificationCenter } from "@/components/common/notification-center";
import { QuickAddTask } from "@/components/common/quick-add-task";
import type { LayoutType } from "@/lib/layouts/types";

interface AppShellProps {
  children: React.ReactNode;
}

// Context to communicate layout preferences to AppShell
interface LayoutContextValue {
  layoutType?: LayoutType;
  setLayoutType: (type?: LayoutType) => void;
}

const LayoutContext = React.createContext<LayoutContextValue>({
  setLayoutType: () => {},
});

export const useLayout = () => React.useContext(LayoutContext);

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [layoutType, setLayoutType] = React.useState<LayoutType | undefined>();

  const contextValue = React.useMemo(() => ({
    layoutType,
    setLayoutType,
  }), [layoutType]);

  // Determine if we should use full-width layout for new layout system
  const useFullWidth = layoutType && [
    'entity-list',
    'entity-detail',
    'entity-form',
    'dashboard'
  ].includes(layoutType);

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        <TopBar />

        {/* Only show sidebar for traditional pages */}
        {!useFullWidth && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        <main
          className={cn(
            "min-h-[calc(100vh-3.5rem)] pt-14 transition-all duration-300",
            // Traditional layout with sidebar
            !useFullWidth && (sidebarCollapsed ? "pl-16" : "pl-64"),
            // Full-width layout for new system
            useFullWidth && "pl-0"
          )}
        >
          {useFullWidth ? (
            // New layout system - no container wrapper, layouts control their own spacing
            children
          ) : (
            // Traditional layout with container
            <div className="container mx-auto p-6">{children}</div>
          )}
        </main>

        <CommandPalette />
        <NotificationCenter />
        <QuickAddTask />
      </div>
    </LayoutContext.Provider>
  );
}
