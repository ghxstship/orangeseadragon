"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  MoreHorizontal,
  Mail,
  Phone,
  Link as LinkIcon,
  Copy,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DetailPageConfig, DetailSectionConfig, InfoSectionConfig, RelatedListSectionConfig } from "@/config/pages/detail-types";

export interface DetailPageProps<T extends object> {
  config: DetailPageConfig;
  data: T;
  relatedData?: Record<string, unknown[]>;
  onAction?: (actionId: string, payload?: unknown) => void;
  loading?: boolean;
}

function formatValue(value: unknown, format?: string): string {
  if (value === null || value === undefined) return "—";
  
  switch (format) {
    case "date":
      return new Date(String(value)).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "datetime":
      return new Date(String(value)).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(value));
    case "number":
      return new Intl.NumberFormat("en-US").format(Number(value));
    default:
      return String(value);
  }
}

function InfoSection<T extends object>({ section, data }: { section: InfoSectionConfig; data: T }) {
  const record = data as Record<string, unknown>;
  const gridCols = section.columns === 3 ? "md:grid-cols-3" : section.columns === 2 ? "md:grid-cols-2" : "grid-cols-1";

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const getIcon = (format?: string) => {
    switch (format) {
      case "email": return <Mail className="h-4 w-4 text-muted-foreground" />;
      case "phone": return <Phone className="h-4 w-4 text-muted-foreground" />;
      case "link": return <LinkIcon className="h-4 w-4 text-muted-foreground" />;
      case "date":
      case "datetime": return <Calendar className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-4", gridCols)}>
          {section.fields.map((field) => {
            const value = record[field.field];
            const formattedValue = formatValue(value, field.format);
            const icon = getIcon(field.format);

            return (
              <div key={field.field} className="space-y-1">
                <p className="text-sm text-muted-foreground">{field.label}</p>
                <div className="flex items-center gap-2">
                  {icon}
                  {field.format === "badge" && value ? (
                    <Badge>{String(value)}</Badge>
                  ) : field.format === "link" && value ? (
                    <a href={String(value)} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {formattedValue}
                    </a>
                  ) : field.format === "email" && value ? (
                    <a href={`mailto:${value}`} className="text-primary hover:underline">
                      {formattedValue}
                    </a>
                  ) : field.format === "phone" && value ? (
                    <a href={`tel:${value}`} className="text-primary hover:underline">
                      {formattedValue}
                    </a>
                  ) : (
                    <p className="font-medium">{formattedValue}</p>
                  )}
                  {field.copyable && value ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(String(value))}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function RelatedListSection({ section, data }: { section: RelatedListSectionConfig; data: unknown[] }) {
  const items = data.slice(0, section.limit ?? 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No items found</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {section.columns.map((col) => (
                    <th key={col.field} className="p-2 text-left font-medium">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const record = item as Record<string, unknown>;
                  return (
                    <tr key={index} className="border-t">
                      {section.columns.map((col) => (
                        <td key={col.field} className="p-2">
                          {formatValue(record[col.field], col.format)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailSection<T extends object>({
  section,
  data,
  relatedData,
}: {
  section: DetailSectionConfig;
  data: T;
  relatedData?: Record<string, unknown[]>;
}) {
  switch (section.type) {
    case "info":
      return <InfoSection section={section} data={data} />;
    case "related-list":
      return <RelatedListSection section={section} data={relatedData?.[section.entity] ?? []} />;
    case "description": {
      const record = data as Record<string, unknown>;
      const content = record[section.field];
      return (
        <Card>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {content ? String(content) : <p className="text-muted-foreground">No description</p>}
            </div>
          </CardContent>
        </Card>
      );
    }
    case "metadata": {
      const record = data as Record<string, unknown>;
      return (
        <Card>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {section.fields.map((field) => (
                <div key={field.field} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground">{field.label}</span>
                  <span className="text-sm font-medium">{formatValue(record[field.field])}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }
    case "activity":
      return (
        <Card>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">Activity timeline coming soon</p>
          </CardContent>
        </Card>
      );
    case "comments":
      return (
        <Card>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">Comments coming soon</p>
          </CardContent>
        </Card>
      );
    case "attachments":
      return (
        <Card>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">Attachments coming soon</p>
          </CardContent>
        </Card>
      );
    default:
      return null;
  }
}

export function DetailPage<T extends object>({
  config,
  data,
  relatedData,
  onAction,
}: DetailPageProps<T>) {
  const record = data as Record<string, unknown>;
  const title = String(record[config.titleField] ?? "");
  const subtitle = config.subtitleField ? String(record[config.subtitleField] ?? "") : undefined;
  const badge = config.badgeField ? String(record[config.badgeField] ?? "") : undefined;
  const avatar = config.avatarField ? String(record[config.avatarField] ?? "") : undefined;

  const primaryAction = config.actions?.find((a) => a.primary);
  const secondaryActions = config.actions?.filter((a) => !a.primary) ?? [];

  const hasTabs = config.tabs && config.tabs.length > 0;
  const sectionsWithoutTabs = hasTabs
    ? []
    : config.sections;

  return (
    <div className="space-y-6">
      {config.breadcrumbs && config.breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={config.breadcrumbs[0].href} className="flex items-center gap-1 hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            {config.breadcrumbs[0].label}
          </Link>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {avatar && (
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-xl">
                {title.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{title}</h1>
              {badge && <Badge>{badge}</Badge>}
            </div>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {primaryAction && (
            <Button onClick={() => onAction?.(primaryAction.id)}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {secondaryActions.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => onAction?.(action.id)}
                    className={action.variant === "destructive" ? "text-destructive" : undefined}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {hasTabs ? (
        <Tabs defaultValue={config.tabs![0].id}>
          <TabsList>
            {config.tabs!.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {config.tabs!.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-6">
              {config.sections
                .filter((s) => tab.sectionIds.includes(s.id))
                .map((section) => (
                  <DetailSection
                    key={section.id}
                    section={section}
                    data={data}
                    relatedData={relatedData}
                  />
                ))}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-6">
          {sectionsWithoutTabs.map((section) => (
            <DetailSection
              key={section.id}
              section={section}
              data={data}
              relatedData={relatedData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
