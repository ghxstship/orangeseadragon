'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, RotateCcw } from 'lucide-react';

// Settings field types
export type SettingsFieldType = 'text' | 'number' | 'email' | 'switch' | 'select' | 'textarea' | 'color';

export interface SettingsField {
  key: string;
  label: string;
  description?: string;
  type: SettingsFieldType;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
}

export interface SettingsSection {
  key: string;
  title: string;
  description?: string;
  fields: SettingsField[];
}

export interface SettingsTab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  sections: SettingsSection[];
}

export interface SettingsTemplateProps {
  title: string;
  description?: string;
  tabs: SettingsTab[];
  initialValues?: Record<string, unknown>;
  onSave?: (values: Record<string, unknown>) => Promise<void>;
  onReset?: () => void;
}

export function SettingsTemplate({
  title,
  description,
  tabs,
  initialValues = {},
  onSave,
  onReset,
}: SettingsTemplateProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || '');

  const handleChange = (key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(values);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    onReset?.();
  };

  const renderField = (field: SettingsField) => {
    const value = values[field.key] ?? field.defaultValue ?? '';

    switch (field.type) {
      case 'switch':
        return (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">{field.description}</p>
              )}
            </div>
            <Switch
              id={field.key}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleChange(field.key, checked)}
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Select
              value={String(value)}
              onValueChange={(v) => handleChange(field.key, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Textarea
              id={field.key}
              className="min-h-[80px]"
              value={String(value)}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Input
              id={field.key}
              type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
              value={String(value)}
              onChange={(e) => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="space-y-6">
            {tab.sections.map((section) => (
              <Card key={section.key}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.fields.map((field, fieldIdx) => (
                    <div key={field.key}>
                      {renderField(field)}
                      {fieldIdx < section.fields.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
