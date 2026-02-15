"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/motion";
import { TopBar } from "./top-bar";
import { Sidebar, MobileSidebar } from "./sidebar";
import { CommandPalette } from "@/components/common/command-palette";
import { NotificationCenter } from "@/components/common/notification-center";
import { QuickAddTask } from "@/components/common/quick-add-task";
import { CopilotDrawer, CopilotTrigger } from "@/components/common/copilot-drawer";
import { useUIStore } from "@/stores/ui-store";
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
  const router = useRouter();
  const pathname = usePathname();
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

  // Global keyboard shortcut: ⌘. to toggle AI Copilot
  React.useEffect(() => {
    const handleCopilotShortcut = (e: KeyboardEvent) => {
      if (e.key === "." && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().toggleCopilot();
      }
    };
    document.addEventListener("keydown", handleCopilotShortcut);
    return () => document.removeEventListener("keydown", handleCopilotShortcut);
  }, []);

  React.useEffect(() => {
    const handleAppNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<{ href?: string }>;
      const href = customEvent.detail?.href;
      if (typeof href === "string" && href.length > 0) {
        customEvent.preventDefault();
        router.push(href);
      }
    };

    window.addEventListener("app:navigate", handleAppNavigate as EventListener);
    return () => {
      window.removeEventListener("app:navigate", handleAppNavigate as EventListener);
    };
  }, [router]);

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        {/* WCAG 2.4.1 — Skip navigation link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <TopBar />

        {/* Only show sidebar for traditional pages */}
        {!useFullWidth && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className={cn(
            "min-h-[calc(100vh-3.5rem)] pt-14 transition-all duration-300 focus:outline-none",
            // Traditional layout with sidebar
            !useFullWidth && (sidebarCollapsed ? "md:pl-16" : "md:pl-64"),
            // Full-width layout for new system
            useFullWidth && "pl-0"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={pathname}>
              {useFullWidth ? (
                // New layout system - no container wrapper, layouts control their own spacing
                children
              ) : (
                // Traditional layout with container
                <div className="container mx-auto p-6">{children}</div>
              )}
            </PageTransition>
          </AnimatePresence>
        </main>

        <MobileSidebar />
        <CommandPalette />
        <NotificationCenter />
        <QuickAddTask />
        <CopilotDrawer />
        <CopilotTrigger />
      </div>
    </LayoutContext.Provider>
  );
}
