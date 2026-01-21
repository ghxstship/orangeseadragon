"use client";

import * as React from "react";
import { SettingsPage } from "@/components/common";
import { organizationPageConfig } from "@/config/pages/organization";

export default function OrganizationPage() {
  const handleSave = React.useCallback((data: Record<string, unknown>) => {
    console.log("Save organization settings:", data);
  }, []);

  return (
    <SettingsPage
      config={organizationPageConfig}
      onSave={handleSave}
    />
  );
}
