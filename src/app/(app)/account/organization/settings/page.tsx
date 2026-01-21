"use client";

import * as React from "react";
import { SettingsPage } from "@/components/common";
import { organizationSettingsPageConfig } from "@/config/pages/organization-settings";

export default function AccountOrganizationSettingsPage() {
  const handleSave = React.useCallback((data: Record<string, unknown>) => {
    console.log("Save organization settings:", data);
  }, []);

  return (
    <SettingsPage
      config={organizationSettingsPageConfig}
      onSave={handleSave}
    />
  );
}
