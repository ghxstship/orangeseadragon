"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import { TopBar } from "./top-bar";
import { Sidebar, MobileSidebar } from "./sidebar";
import { useUIStore } from "@/stores/ui-store";
import { useAppStore } from "@/stores/app-store";
import { notificationService } from "@/lib/notifications/notificationService";
import type { LayoutType } from "@/lib/layouts/types";

const CommandPalette = dynamic(
  () => import("@/components/common/command-palette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

const NotificationCenter = dynamic(
  () => import("@/components/common/notification-center").then((mod) => mod.NotificationCenter),
  { ssr: false }
);

const QuickAddTask = dynamic(
  () => import("@/components/common/quick-add-task").then((mod) => mod.QuickAddTask),
  { ssr: false }
);

const CopilotDrawer = dynamic(
  () => import("@/components/common/copilot-drawer").then((mod) => mod.CopilotDrawer),
  { ssr: false }
);

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
  const commandPaletteOpen = useUIStore((state) => state.commandPaletteOpen);
  const notificationsPanelOpen = useUIStore((state) => state.notificationsPanelOpen);
  const quickAddTaskOpen = useUIStore((state) => state.quickAddTaskOpen);
  const copilotOpen = useUIStore((state) => state.copilotOpen);
  const toggleCopilot = useUIStore((state) => state.toggleCopilot);
  const sidebarCollapsed = useAppStore((state) => state.isCollapsed);
  const toggleSidebarCollapsed = useAppStore((state) => state.toggleCollapsed);
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

  // Initialize push notification service
  React.useEffect(() => {
    notificationService.initialize();
  }, []);

  // Global keyboard shortcuts for on-demand shell overlays
  React.useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) {
        return;
      }

      if (e.key === "k" && !e.shiftKey) {
        e.preventDefault();
        useUIStore.getState().setCommandPaletteOpen(true);
        return;
      }

      if (e.key.toLowerCase() === "t" && e.shiftKey) {
        e.preventDefault();
        useUIStore.getState().setQuickAddTaskOpen(true);
        return;
      }

      if (e.key === ".") {
        e.preventDefault();
        useUIStore.getState().toggleCopilot();
      }
    };

    document.addEventListener("keydown", handleGlobalShortcuts);
    return () => document.removeEventListener("keydown", handleGlobalShortcuts);
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
            onToggle={toggleSidebarCollapsed}
          />
        )}

        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className={cn(
            "min-h-[calc(100vh-3.5rem)] pt-14 transition-all duration-300 focus:outline-none",
            // Traditional layout with sidebar
            !useFullWidth && (sidebarCollapsed ? "md:pl-[var(--sidebar-collapsed-width,64px)]" : "md:pl-[var(--sidebar-width,280px)]"),
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
        {commandPaletteOpen ? <CommandPalette /> : null}
        {notificationsPanelOpen ? <NotificationCenter /> : null}
        {quickAddTaskOpen ? <QuickAddTask /> : null}
        {copilotOpen ? <CopilotDrawer /> : null}
        <Button
          type="button"
          size="icon"
          variant="default"
          onClick={toggleCopilot}
          className="fixed bottom-6 right-6 z-[80] h-12 w-12 rounded-2xl shadow-lg transition-shadow hover:shadow-xl hover:shadow-primary/20"
          aria-label={copilotOpen ? "Close AI Copilot" : "Open AI Copilot"}
        >
          <span className="sr-only">{copilotOpen ? "Close AI Copilot" : "Open AI Copilot"}</span>
          <Sparkles className="mx-auto h-5 w-5" />
        </Button>
      </div>
    </LayoutContext.Provider>
  );
}
