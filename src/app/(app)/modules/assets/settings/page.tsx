"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SettingsLayout } from "@/lib/layouts";
import { assetsSettingsConfig, assetsSettingsDefaults } from "@/config/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function AssetSettingsPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = React.useState("general");
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState(assetsSettingsDefaults);
  const [isDirty, setIsDirty] = React.useState(false);

  const updateSettings = (section: string, field: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], [field]: value },
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setIsDirty(false);
  };

  const handleReset = () => {
    setSettings(assetsSettingsDefaults);
    setIsDirty(false);
  };

  const renderSection = () => {
    switch (currentSection) {
      case "general":
        return (
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic asset configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Asset Tag Prefix</Label>
                  <Input value={settings.general.assetTagPrefix} onChange={(e) => updateSettings("general", "assetTagPrefix", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Starting Number</Label>
                  <Input value={settings.general.assetTagStartNumber} onChange={(e) => updateSettings("general", "assetTagStartNumber", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable barcodes</p>
                  <p className="text-sm text-muted-foreground">Generate barcodes for assets</p>
                </div>
                <Switch checked={settings.general.enableBarcodes} onCheckedChange={(c) => updateSettings("general", "enableBarcodes", c)} />
              </div>
            </CardContent>
          </Card>
        );
      case "tracking":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tracking Settings</CardTitle>
              <CardDescription>Asset tracking options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable location tracking</p>
                  <p className="text-sm text-muted-foreground">Track asset locations</p>
                </div>
                <Switch checked={settings.tracking.enableLocationTracking} onCheckedChange={(c) => updateSettings("tracking", "enableLocationTracking", c)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Track checkouts</p>
                  <p className="text-sm text-muted-foreground">Log asset check-in/out</p>
                </div>
                <Switch checked={settings.tracking.trackCheckouts} onCheckedChange={(c) => updateSettings("tracking", "trackCheckouts", c)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require checkout approval</p>
                  <p className="text-sm text-muted-foreground">Checkouts require manager approval</p>
                </div>
                <Switch checked={settings.tracking.requireCheckoutApproval} onCheckedChange={(c) => updateSettings("tracking", "requireCheckoutApproval", c)} />
              </div>
            </CardContent>
          </Card>
        );
      case "maintenance":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Settings</CardTitle>
              <CardDescription>Maintenance scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable scheduled maintenance</p>
                  <p className="text-sm text-muted-foreground">Schedule recurring maintenance</p>
                </div>
                <Switch checked={settings.maintenance.enableScheduledMaintenance} onCheckedChange={(c) => updateSettings("maintenance", "enableScheduledMaintenance", c)} />
              </div>
              <div className="space-y-2">
                <Label>Default Interval (days)</Label>
                <Input type="number" value={settings.maintenance.defaultMaintenanceInterval} onChange={(e) => updateSettings("maintenance", "defaultMaintenanceInterval", parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Reminder Days Before</Label>
                <Input type="number" value={settings.maintenance.reminderDaysBefore} onChange={(e) => updateSettings("maintenance", "reminderDaysBefore", parseInt(e.target.value))} />
              </div>
            </CardContent>
          </Card>
        );
      case "depreciation":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Settings</CardTitle>
              <CardDescription>Asset depreciation configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable depreciation</p>
                  <p className="text-sm text-muted-foreground">Track asset depreciation</p>
                </div>
                <Switch checked={settings.depreciation.enableDepreciation} onCheckedChange={(c) => updateSettings("depreciation", "enableDepreciation", c)} />
              </div>
              <div className="space-y-2">
                <Label>Default Method</Label>
                <Select value={settings.depreciation.defaultMethod} onValueChange={(v) => updateSettings("depreciation", "defaultMethod", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight_line">Straight Line</SelectItem>
                    <SelectItem value="declining_balance">Declining Balance</SelectItem>
                    <SelectItem value="sum_of_years">Sum of Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Lifespan (months)</Label>
                <Input type="number" value={settings.depreciation.defaultLifespan} onChange={(e) => updateSettings("depreciation", "defaultLifespan", parseInt(e.target.value))} />
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      config={assetsSettingsConfig}
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      saving={saving}
      isDirty={isDirty}
      onSave={handleSave}
      onReset={handleReset}
      onBack={() => router.back()}
    >
      {renderSection()}
    </SettingsLayout>
  );
}
