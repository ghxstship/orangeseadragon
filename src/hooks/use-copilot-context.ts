"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

interface CopilotContextOptions {
  module?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
}

/**
 * Automatically sets copilot context based on the current page.
 * Call from hub pages, CrudList pages, and CrudDetail pages.
 * Falls back to inferring module from the URL pathname.
 */
export function useCopilotContext(options?: CopilotContextOptions) {
  const pathname = usePathname();
  const setCopilotContext = useUIStore((s) => s.setCopilotContext);

  useEffect(() => {
    const contextModule = options?.module || inferModuleFromPath(pathname);
    setCopilotContext({
      module: contextModule,
      entityType: options?.entityType,
      entityId: options?.entityId,
      entityName: options?.entityName,
      pagePath: pathname,
    });

    return () => {
      setCopilotContext({});
    };
  }, [pathname, options?.module, options?.entityType, options?.entityId, options?.entityName, setCopilotContext]);
}

function inferModuleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  const moduleMap: Record<string, string> = {
    productions: "productions",
    finance: "finance",
    business: "business",
    people: "people",
    assets: "assets",
    operations: "operations",
    advancing: "productions",
    analytics: "analytics",
    network: "network",
    core: segments[1] === "dashboard" ? "dashboard" : "core",
    account: "account",
  };

  return moduleMap[first] || "default";
}
