"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBreakpoint } from "@/hooks/ui/use-breakpoint";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ResponsiveMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * Renders a DropdownMenu on desktop and a bottom Sheet on mobile/touch.
 * Children should be DropdownMenuItem-compatible elements.
 */
export function ResponsiveMenu({
  trigger,
  children,
  title = "Actions",
  align = "end",
  side = "bottom",
}: ResponsiveMenuProps) {
  const { isMobile } = useBreakpoint();
  const [open, setOpen] = React.useState(false);

  if (isMobile) {
    return (
      <>
        <div onClick={() => setOpen(true)}>{trigger}</div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl px-2 pb-8">
            <VisuallyHidden>
              <SheetTitle>{title}</SheetTitle>
            </VisuallyHidden>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
            <div className="space-y-1" onClick={() => setOpen(false)}>
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side}>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}
