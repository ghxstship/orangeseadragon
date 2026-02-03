"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

type TabsVariant = "default" | "underline";

const Tabs = TabsPrimitive.Root;

const TabsVariantContext = React.createContext<TabsVariant>("default");

const tabsListStyles: Record<TabsVariant, string> = {
  default:
    "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
  underline:
    "inline-flex h-12 items-center gap-0 bg-transparent p-0 text-muted-foreground",
};

const tabsTriggerBase =
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const tabsTriggerStyles: Record<TabsVariant, string> = {
  default:
    "rounded-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
  underline:
    "relative h-12 rounded-none border-b-2 border-transparent px-4 transition-colors hover:bg-accent/50 data-[state=active]:border-primary data-[state=active]:bg-transparent",
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
