"use client";

import * as React from "react";
import { PageHeader } from "./page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SettingsPageConfig, FieldConfig, SectionConfig } from "@/config/pages/settings-types";

export interface SettingsPageProps {
  config: SettingsPageConfig;
  data?: Record<string, unknown>;
  onSave?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  loading?: boolean;
}

function SettingsField({ field, value, onChange }: {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `field-${field.id}`;

  switch (field.type) {
    case "text":
    case "email":
    case "password":
    case "tel":
    case "url":
    case "number":
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={id}
            type={field.type}
            placeholder={field.placeholder}
            value={String(value ?? field.defaultValue ?? "")}
            onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
            disabled={field.disabled}
            required={field.required}
          />
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Textarea
            id={id}
            placeholder={field.placeholder}
            value={String(value ?? field.defaultValue ?? "")}
            onChange={(e) => onChange(e.target.value)}
            disabled={field.disabled}
            required={field.required}
            className="min-h-[100px]"
          />
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      );

    case "select":
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={String(value ?? field.defaultValue ?? "")}
            onValueChange={onChange}
            disabled={field.disabled}
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder={field.placeholder ?? "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      );

    case "switch":
      return (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor={id}>{field.label}</Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
          <Switch
            id={id}
            checked={Boolean(value ?? field.defaultValue ?? false)}
            onCheckedChange={onChange}
            disabled={field.disabled}
          />
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={id}
            checked={Boolean(value ?? field.defaultValue ?? false)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={field.disabled}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor={id} className="font-normal">
            {field.label}
          </Label>
        </div>
      );

    case "color":
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{field.label}</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id={id}
              value={String(value ?? field.defaultValue ?? "#000000")}
              onChange={(e) => onChange(e.target.value)}
              disabled={field.disabled}
              className="h-10 w-10 rounded border cursor-pointer"
            />
            <Input
              value={String(value ?? field.defaultValue ?? "#000000")}
              onChange={(e) => onChange(e.target.value)}
              disabled={field.disabled}
              className="flex-1"
            />
          </div>
        </div>
      );

    case "file":
    case "image":
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{field.label}</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            <input
              type="file"
              id={id}
              accept={field.accept}
              disabled={field.disabled}
              className="hidden"
              onChange={(e) => onChange(e.target.files?.[0])}
            />
            <label htmlFor={id} className="cursor-pointer">
              <p className="text-sm text-muted-foreground">
                {field.placeholder ?? "Click to upload or drag and drop"}
              </p>
              {field.description && (
                <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
              )}
            </label>
          </div>
        </div>
      );

    case "date":
    case "time":
    case "datetime":
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{field.label}</Label>
          <Input
            id={id}
            type={field.type === "datetime" ? "datetime-local" : field.type}
            value={String(value ?? field.defaultValue ?? "")}
            onChange={(e) => onChange(e.target.value)}
            disabled={field.disabled}
          />
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}

function SettingsSection({ section, data, onChange, collapsed, onToggleCollapse }: {
  section: SectionConfig;
  data: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const gridCols = section.columns === 2 ? "md:grid-cols-2" : "grid-cols-1";

  return (
    <Card>
      <CardHeader
        className={cn(section.collapsible && "cursor-pointer")}
        onClick={section.collapsible ? onToggleCollapse : undefined}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{section.title}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </div>
          {section.collapsible && (
            collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          <div className={cn("grid gap-4", gridCols)}>
            {section.fields.map((field) => (
              <div key={field.id} className={field.columns === 2 ? "md:col-span-2" : ""}>
                <SettingsField
                  field={field}
                  value={data[field.id]}
                  onChange={(value) => onChange(field.id, value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function SettingsPage({
  config,
  data: initialData = {},
  onSave,
  onCancel,
  loading = false,
}: SettingsPageProps) {
  const [formData, setFormData] = React.useState<Record<string, unknown>>(initialData);
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(() => {
    const collapsed = new Set<string>();
    config.sections.forEach((section) => {
      if (section.defaultCollapsed) collapsed.add(section.id);
    });
    return collapsed;
  });

  const handleFieldChange = React.useCallback((fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleSave = React.useCallback(() => {
    onSave?.(formData);
  }, [formData, onSave]);

  const toggleSection = React.useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const showSave = config.actions?.save?.enabled !== false;
  const showCancel = config.actions?.cancel?.enabled !== false;

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
      />

      <div className="space-y-6">
        {config.sections.map((section) => (
          <SettingsSection
            key={section.id}
            section={section}
            data={formData}
            onChange={handleFieldChange}
            collapsed={collapsedSections.has(section.id)}
            onToggleCollapse={() => toggleSection(section.id)}
          />
        ))}
      </div>

      {(showSave || showCancel) && (
        <div className="flex justify-end gap-2">
          {showCancel && (
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              {config.actions?.cancel?.label ?? "Cancel"}
            </Button>
          )}
          {showSave && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : config.actions?.save?.label ?? "Save Changes"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
