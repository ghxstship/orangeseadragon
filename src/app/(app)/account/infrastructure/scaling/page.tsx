"use client";

import * as React from "react";
import { SettingsPage } from "@/components/common";
import { resourceScalingPageConfig } from "@/config/pages/resource-scaling";

export default function ResourceScalingPage() {
  const handleSave = React.useCallback((data: Record<string, unknown>) => {
    console.log("Save resource scaling settings:", data);
  }, []);

  return (
    <SettingsPage
      config={resourceScalingPageConfig}
      onSave={handleSave}
    />
  );
}
