"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommandPalette } from "@/components/common/command-palette";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NotificationCenter } from "@/components/common/notification-center";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={cn(
          "min-h-[calc(100vh-3.5rem)] pt-14 transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-64"
        )}
      >
        <div className="container mx-auto p-6">{children}</div>
      </main>
      <CommandPalette />
      <NotificationCenter />
    </div>
  );
}
