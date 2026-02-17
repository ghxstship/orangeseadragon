"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

type TabsVariant = "default" | "underline" | "spatial";

const Tabs = TabsPrimitive.Root;

const TabsVariantContext = React.createContext<TabsVariant>("default");

const tabsListStyles: Record<TabsVariant, string> = {
  default:
    "inline-flex h-10 items-center justify-start rounded-xl bg-muted p-1 text-muted-foreground border border-border overflow-x-auto scrollbar-hide max-w-full",
  underline:
    "inline-flex h-12 items-center gap-0 bg-transparent p-0 text-muted-foreground overflow-x-auto scrollbar-hide max-w-full",
  spatial:
    "inline-flex h-11 items-center justify-start rounded-2xl bg-muted backdrop-blur-3xl p-1 text-muted-foreground border border-border shadow-2xl overflow-x-auto scrollbar-hide max-w-full",
};

const tabsTriggerBase =
  "inline-flex items-center justify-center whitespace-nowrap text-xs sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const tabsTriggerStyles: Record<TabsVariant, string> = {
  default:
    "rounded-lg px-4 py-1.5 data-[state=active]:bg-accent data-[state=active]:text-primary data-[state=active]:shadow-xl",
  underline:
    "relative h-12 rounded-none border-b-2 border-transparent px-6 transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary",
  spatial:
    "rounded-xl px-6 py-2 transition-all duration-500 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_hsl(var(--primary)/0.3)] data-[state=active]:border-primary/20 border border-transparent",
};

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TabsVariant;
  }
>(({ className, variant = "default", children, ...props }, ref) => (
  <TabsVariantContext.Provider value={variant}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListStyles[variant], className)}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  </TabsVariantContext.Provider>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: TabsVariant;
  }
>(({ className, variant, ...props }, ref) => {
  const contextVariant = React.useContext(TabsVariantContext);
  const resolvedVariant = variant ?? contextVariant;

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerBase, tabsTriggerStyles[resolvedVariant], className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
