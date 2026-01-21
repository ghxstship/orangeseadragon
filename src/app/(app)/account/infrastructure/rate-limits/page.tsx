"use client";

import * as React from "react";
import { SettingsPage } from "@/components/common";
import { rateLimitsSettingsPageConfig } from "@/config/pages/rate-limits-settings";

export default function RateLimitsPage() {
  const handleSave = React.useCallback((data: Record<string, unknown>) => {
    console.log("Save rate limits settings:", data);
  }, []);

  return (
    <SettingsPage
      config={rateLimitsSettingsPageConfig}
      onSave={handleSave}
    />
  );
}
