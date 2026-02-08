"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeftClose, PanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        className={cn(
          "fixed left-0 top-14 z-30 flex h-[calc(100vh-3.5rem)] flex-col border-r border-white/5 bg-background/5 backdrop-blur-3xl transition-all duration-500 shadow-2xl overflow-hidden",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
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
        <div className="border-t border-white/5 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center h-10 hover:bg-white/5 transition-colors rounded-xl"
            onClick={onToggle}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4 opacity-70" />
            ) : (
              <PanelLeftClose className="h-4 w-4 opacity-70" />
            )}
          </Button>
        </div>
      </motion.aside>
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
    <div className="space-y-1 mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-colors group"
      >
        {section.title}
        <motion.div
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-0.5 overflow-hidden"
          >
            {section.items.map((item) => (
              <SidebarItem key={item.path} item={item} pathname={pathname} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SidebarItemProps {
  item: NavItem;
  pathname: string;
}

function SidebarItem({ item, pathname }: SidebarItemProps) {
  const hasSubpages = item.subpages && item.subpages.length > 0;
  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
  const Icon = item.icon;
  const [expanded, setExpanded] = React.useState(isActive);

  if (hasSubpages) {
    return (
      <div className="space-y-0.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-300 group",
            isActive
              ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}
        >
          <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")} />
          <span className="truncate flex-1 text-left tracking-tight">{item.title}</span>
          <motion.div
            animate={{ rotate: expanded ? 0 : -90 }}
          >
            <ChevronDown className="h-3 w-3 shrink-0 opacity-40" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ml-5 space-y-0.5 border-l border-white/5 pl-3 overflow-hidden"
            >
              {item.subpages!.map((subpage) => {
                const isSubActive = pathname === subpage.path;
                return (
                  <Link
                    key={subpage.path}
                    href={subpage.path}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all",
                      isSubActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.02]"
                    )}
                  >
                    {subpage.title}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.path}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-300 group",
        isActive
          ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")} />
      <span className="truncate tracking-tight">{item.title}</span>
      {item.badge && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 px-1.5 text-[9px] font-black text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]">
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
