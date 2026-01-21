"use client";

import * as React from "react";
import { SettingsPage } from "@/components/common";
import { accountProfilePageConfig } from "@/config/pages/account-profile";

export default function AccountProfilePage() {
  const handleSave = React.useCallback((data: Record<string, unknown>) => {
    console.log("Save profile:", data);
  }, []);

  return (
    <SettingsPage
      config={accountProfilePageConfig}
      onSave={handleSave}
    />
  );
}
