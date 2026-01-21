"use client";

import * as React from "react";
import { SettingsPage } from "@/components/common";
import { passwordPolicyPageConfig } from "@/config/pages/password-policy";

export default function PasswordPolicyPage() {
  const handleSave = React.useCallback((data: Record<string, unknown>) => {
    console.log("Save password policy:", data);
  }, []);

  return (
    <SettingsPage
      config={passwordPolicyPageConfig}
      onSave={handleSave}
    />
  );
}
