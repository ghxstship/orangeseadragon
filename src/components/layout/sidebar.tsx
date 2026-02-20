"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeftClose, PanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TRANSITION } from "@/lib/tokens/motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResponsiveMenu } from "@/components/common/responsive-menu";
import { UI_DEFAULTS } from "@/lib/config";
import { sidebarNavigation, type NavSection, type NavItem } from "@/config/navigation";
import { useUIStore } from "@/stores/ui-store";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SIDEBAR_WIDTH = UI_DEFAULTS.SIDEBAR_WIDTH;
const SIDEBAR_COLLAPSED_WIDTH = UI_DEFAULTS.SIDEBAR_COLLAPSED_WIDTH;

function SidebarContent({ collapsed, onToggle, onNavigate }: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  const navigation = (
    <nav className="space-y-1 px-2">
      {sidebarNavigation.map((section) => (
        <SidebarSection
          key={section.title}
          section={section}
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
        {collapsed ? (
          <div className="flex-1 overflow-y-auto py-2">{navigation}</div>
        ) : (
          <ScrollArea className="flex-1 py-2">{navigation}</ScrollArea>
        )}
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center h-10 hover:bg-muted transition-colors rounded-xl"
            onClick={onToggle}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4 opacity-70" />
            ) : (
              <PanelLeftClose className="h-4 w-4 opacity-70" />
            )}
          </Button>
        </div>
      </>
    </TooltipProvider>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      role="navigation"
      aria-label="Main navigation"
      initial={false}
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      className={cn(
        "fixed left-0 top-14 z-30 hidden md:flex h-[calc(100vh-3.5rem)] flex-col glass-panel transition-all duration-500 overflow-hidden border-r border-white/10"
      )}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </motion.aside>
  );
}

export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <VisuallyHidden>
          <SheetTitle>Navigation</SheetTitle>
        </VisuallyHidden>
        <SidebarContent
          collapsed={false}
          onToggle={() => setMobileSidebarOpen(false)}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

interface SidebarSectionProps {
  section: NavSection;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}

function SidebarSection({ section, collapsed, pathname, onNavigate }: SidebarSectionProps) {
  const [expanded, setExpanded] = React.useState(section.defaultExpanded ?? true);

  if (collapsed) {
    return (
      <div className="space-y-1" role="group" aria-label={section.title}>
        <span className="sr-only">{section.title}</span>
        {section.items.map((item) => (
          <SidebarItemCollapsed key={item.path} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 mb-6">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="h-auto w-full justify-between px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-colors group"
      >
        {section.title}
        <motion.div
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={TRANSITION.normal}
        >
          <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </Button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-0.5 overflow-hidden"
          >
            {section.items.map((item) => (
              <SidebarItem key={item.path} item={item} pathname={pathname} onNavigate={onNavigate} />
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
  onNavigate?: () => void;
}

function SidebarItem({ item, pathname, onNavigate }: SidebarItemProps) {
  const hasSubpages = item.subpages && item.subpages.length > 0;
  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
  const Icon = item.icon;
  const [expanded, setExpanded] = React.useState(isActive);

  if (hasSubpages) {
    return (
      <div className="space-y-0.5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "h-auto w-full justify-start items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-300 group",
            isActive
              ? "bg-primary/10 text-primary shadow-nav-active"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")} />
          <span className="truncate flex-1 text-left tracking-tight">{item.title}</span>
          <motion.div
            animate={{ rotate: expanded ? 0 : -90 }}
          >
            <ChevronDown className="h-3 w-3 shrink-0 opacity-40" />
          </motion.div>
        </Button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ml-5 space-y-0.5 border-l border-border pl-3 overflow-hidden"
            >
              {item.subpages!.map((subpage) => {
                const isSubActive = pathname === subpage.path;
                return (
                  <Link
                    key={subpage.path}
                    href={subpage.path}
                    onClick={onNavigate}
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
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-300 group",
        isActive
          ? "bg-primary/10 text-primary shadow-nav-active"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")} />
      <span className="truncate tracking-tight">{item.title}</span>
      {item.badge && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 px-1.5 text-[9px] font-black text-primary shadow-nav-badge">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarItemCollapsed({ item, pathname, onNavigate }: SidebarItemProps) {
  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
  const Icon = item.icon;
  const hasSubpages = Boolean(item.subpages?.length);

  const triggerClassName = cn(
    "flex h-10 w-10 items-center justify-center rounded-md transition-colors mx-auto",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  );

  if (hasSubpages) {
    return (
      <ResponsiveMenu
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={triggerClassName}
            aria-label={`${item.title} navigation`}
            title={item.title}
          >
            <Icon className="h-5 w-5" />
          </Button>
        }
        title={item.title}
        side="right"
        align="start"
      >
        <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={item.path}
            onClick={onNavigate}
            className={cn(pathname === item.path && "text-primary")}
          >
            {item.title}
          </Link>
        </DropdownMenuItem>
        {item.subpages!.map((subpage) => {
          const isSubActive = pathname === subpage.path;
          return (
            <DropdownMenuItem key={subpage.path} asChild>
              <Link
                href={subpage.path}
                onClick={onNavigate}
                className={cn(isSubActive && "text-primary")}
              >
                {subpage.title}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </ResponsiveMenu>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.path}
          onClick={onNavigate}
          className={triggerClassName}
          aria-label={item.title}
          title={item.title}
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
