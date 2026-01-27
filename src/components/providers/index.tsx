"use client";

import * as React from "react";
import { QueryProvider } from "./query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <TooltipProvider delayDuration={0}>
                {children}
            </TooltipProvider>
        </QueryProvider>
    );
}
