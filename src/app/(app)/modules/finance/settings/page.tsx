"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SettingsLayout } from "@/lib/layouts";
import { financeSettingsConfig, financeSettingsDefaults } from "@/config/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function FinanceSettingsPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = React.useState("general");
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState(financeSettingsDefaults);
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
    setSettings(financeSettingsDefaults);
    setIsDirty(false);
  };

  const renderSection = () => {
    switch (currentSection) {
      case "general":
        return (
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic financial configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select value={settings.general.defaultCurrency} onValueChange={(v) => updateSettings("general", "defaultCurrency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fiscal Year Start</Label>
                  <Select value={settings.general.fiscalYearStart} onValueChange={(v) => updateSettings("general", "fiscalYearStart", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="july">July</SelectItem>
                      <SelectItem value="october">October</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "invoicing":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Invoicing Settings</CardTitle>
              <CardDescription>Configure invoice generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Invoice Prefix</Label>
                  <Input value={settings.invoicing.invoicePrefix} onChange={(e) => updateSettings("invoicing", "invoicePrefix", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Starting Number</Label>
                  <Input value={settings.invoicing.invoiceStartNumber} onChange={(e) => updateSettings("invoicing", "invoiceStartNumber", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Terms (days)</Label>
                <Input type="number" value={settings.invoicing.paymentTermsDays} onChange={(e) => updateSettings("invoicing", "paymentTermsDays", parseInt(e.target.value))} />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-medium">Auto-send reminders</p>
                  <p className="text-sm text-muted-foreground">Send payment reminders before due date</p>
                </div>
                <Switch checked={settings.invoicing.autoSendReminders} onCheckedChange={(c) => updateSettings("invoicing", "autoSendReminders", c)} />
              </div>
            </CardContent>
          </Card>
        );
      case "expenses":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Expense Settings</CardTitle>
              <CardDescription>Configure expense management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require approval</p>
                  <p className="text-sm text-muted-foreground">Expenses require manager approval</p>
                </div>
                <Switch checked={settings.expenses.requireApproval} onCheckedChange={(c) => updateSettings("expenses", "requireApproval", c)} />
              </div>
              <div className="space-y-2">
                <Label>Approval Threshold ($)</Label>
                <Input type="number" value={settings.expenses.approvalThreshold} onChange={(e) => updateSettings("expenses", "approvalThreshold", parseInt(e.target.value))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require receipts</p>
                  <p className="text-sm text-muted-foreground">Require receipt upload for expenses</p>
                </div>
                <Switch checked={settings.expenses.requireReceipts} onCheckedChange={(c) => updateSettings("expenses", "requireReceipts", c)} />
              </div>
            </CardContent>
          </Card>
        );
      case "payments":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Payment Method</Label>
                <Select value={settings.payments.defaultMethod} onValueChange={(v) => updateSettings("payments", "defaultMethod", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-reconcile</p>
                  <p className="text-sm text-muted-foreground">Automatically reconcile payments</p>
                </div>
                <Switch checked={settings.payments.autoReconcile} onCheckedChange={(c) => updateSettings("payments", "autoReconcile", c)} />
              </div>
            </CardContent>
          </Card>
        );
      case "taxes":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Configure tax calculation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable tax calculation</p>
                  <p className="text-sm text-muted-foreground">Calculate taxes on invoices</p>
                </div>
                <Switch checked={settings.taxes.enableTaxCalculation} onCheckedChange={(c) => updateSettings("taxes", "enableTaxCalculation", c)} />
              </div>
              <div className="space-y-2">
                <Label>Default Tax Rate (%)</Label>
                <Input type="number" value={settings.taxes.defaultTaxRate} onChange={(e) => updateSettings("taxes", "defaultTaxRate", parseFloat(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Tax ID Label</Label>
                <Input value={settings.taxes.taxIdLabel} onChange={(e) => updateSettings("taxes", "taxIdLabel", e.target.value)} />
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
      config={financeSettingsConfig}
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
