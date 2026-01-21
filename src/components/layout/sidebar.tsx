"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sidebarNavigation, type NavSection, type NavItem } from "@/config/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-14 z-30 flex h-[calc(100vh-3.5rem)] flex-col border-r bg-background transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {sidebarNavigation.map((section) => (
              <SidebarSection
                key={section.title}
                section={section}
                collapsed={collapsed}
                pathname={pathname}
              />
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={onToggle}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

interface SidebarSectionProps {
  section: NavSection;
  collapsed: boolean;
  pathname: string;
}

function SidebarSection({ section, collapsed, pathname }: SidebarSectionProps) {
  const [expanded, setExpanded] = React.useState(section.defaultExpanded ?? true);

  if (collapsed) {
    return (
      <div className="space-y-1">
        {section.items.map((item) => (
          <SidebarItemCollapsed key={item.path} item={item} pathname={pathname} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        {section.title}
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>
      {expanded && (
        <div className="space-y-0.5">
          {section.items.map((item) => (
            <SidebarItem key={item.path} item={item} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarItemProps {
  item: NavItem;
  pathname: string;
}

function SidebarItem({ item, pathname }: SidebarItemProps) {
  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.path}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.title}</span>
      {item.badge && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarItemCollapsed({ item, pathname }: SidebarItemProps) {
  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
  const Icon = item.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.path}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md transition-colors mx-auto",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-4">
        {item.title}
        {item.badge && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
            {item.badge}
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
