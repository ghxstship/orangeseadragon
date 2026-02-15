'use client';

import { EntitySchema, EntityRecord, SidebarSectionDefinition } from '@/lib/schema/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Clock,
  Receipt,
  FileText,
  Timer,
} from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_LOCALE } from '@/lib/config';

interface SidebarRendererProps {
  schema: EntitySchema;
  record: EntityRecord;
  onTabChange?: (tab: string) => void;
}

/**
 * SIDEBAR RENDERER
 *
 * Renders sidebar sections from schema.layouts.detail.sidebar config.
 * Supports: stats, quick-actions, activity, related, presence, custom.
 */
export function SidebarRenderer({ schema, record, onTabChange }: SidebarRendererProps) {
  const sidebarConfig = schema.layouts.detail.sidebar;
  if (!sidebarConfig) return null;

  return (
    <div className="space-y-6">
      {sidebarConfig.sections.map((section) => (
        <SidebarSection
          key={section.key}
          section={section}
          schema={schema}
          record={record}
          onTabChange={onTabChange}
        />
      ))}
    </div>
  );
}

function SidebarSection({
  section,
  schema,
  record,
  onTabChange,
}: {
  section: SidebarSectionDefinition;
  schema: EntitySchema;
  record: EntityRecord;
  onTabChange?: (tab: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(section.defaultCollapsed ?? false);

  return (
    <div>
      {section.title && (
        <Button
          variant="ghost"
          className="flex items-center justify-between w-full text-left mb-2 group h-auto p-0 hover:bg-transparent"
          onClick={() => section.collapsible && setCollapsed(!collapsed)}
          disabled={!section.collapsible}
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h4>
          {section.collapsible && (
            collapsed
              ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </Button>
      )}

      {!collapsed && (
        <SidebarSectionContent
          section={section}
          schema={schema}
          record={record}
          onTabChange={onTabChange}
        />
      )}
    </div>
  );
}

function SidebarSectionContent({
  section,
  schema,
  record,
  onTabChange,
}: {
  section: SidebarSectionDefinition;
  schema: EntitySchema;
  record: EntityRecord;
  onTabChange?: (tab: string) => void;
}) {
  const { content } = section;

  switch (content.type) {
    case 'stats':
      return <StatsSection fields={content.stats} schema={schema} record={record} />;

    case 'quick-actions':
      return <QuickActionsSection actions={content.actions} onTabChange={onTabChange} />;

    case 'activity':
      return <ActivitySection limit={content.limit} record={record} />;

    case 'related':
      return <RelatedSection entity={content.entity} record={record} limit={content.limit} />;

    case 'presence':
      return <PresenceSection />;

    case 'ai-suggestions':
      return <AISuggestionsSection />;

    default:
      return (
        <div className="text-xs text-muted-foreground">
          Unknown section type: {content.type}
        </div>
      );
  }
}

/**
 * Stats section — displays key field values from the record
 */
function StatsSection({
  fields,
  schema,
  record,
}: {
  fields: string[];
  schema: EntitySchema;
  record: EntityRecord;
}) {
  return (
    <div className="space-y-2">
      {fields.map((fieldKey) => {
        const fieldDef = schema.data.fields[fieldKey];
        const value = record[fieldKey];
        const label = fieldDef?.label || fieldKey;

        let displayValue: React.ReactNode;

        if (value == null || value === '') {
          displayValue = <span className="text-muted-foreground">—</span>;
        } else if (fieldDef?.type === 'currency') {
          displayValue = `$${Number(value).toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (fieldDef?.type === 'date' || fieldDef?.type === 'datetime') {
          displayValue = new Date(value as string).toLocaleDateString();
        } else if (fieldDef?.type === 'select' && fieldDef.options) {
          const options = Array.isArray(fieldDef.options) ? fieldDef.options : [];
          const option = options.find((o) =>
            typeof o === 'string' ? o === value : o.value === value
          );
          const optionLabel = typeof option === 'string' ? option : option?.label || String(value);
          const optionColor = typeof option === 'object' ? option?.color : undefined;
          displayValue = (
            <Badge
              variant="outline"
              className="text-[10px] h-5"
              style={optionColor ? { borderColor: optionColor, color: optionColor } : undefined}
            >
              {optionLabel}
            </Badge>
          );
        } else {
          displayValue = String(value);
        }

        return (
          <div key={fieldKey} className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium text-foreground">{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Quick actions section — contextual action buttons
 */
const QUICK_ACTION_CONFIG: Record<string, { label: string; icon: typeof Plus; variant?: 'default' | 'outline' | 'ghost'; tab?: string }> = {
  'create-task': { label: 'Add Task', icon: Plus, variant: 'outline', tab: 'tasks' },
  'log-time': { label: 'Log Time', icon: Timer, variant: 'outline', tab: 'time' },
  'submit-expense': { label: 'Submit Expense', icon: Receipt, variant: 'outline', tab: 'expenses' },
  'generate-invoice': { label: 'Generate Invoice', icon: FileText, variant: 'outline', tab: 'invoices' },
};

function QuickActionsSection({
  actions,
  onTabChange,
}: {
  actions: string[];
  onTabChange?: (tab: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      {actions.map((actionKey) => {
        const config = QUICK_ACTION_CONFIG[actionKey];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <Button
            key={actionKey}
            variant={config.variant || 'outline'}
            size="sm"
            className="w-full justify-start text-xs h-8"
            onClick={() => config.tab && onTabChange?.(config.tab)}
          >
            <Icon className="h-3.5 w-3.5 mr-2" />
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Activity section — recent activity feed (placeholder)
 */
function ActivitySection({ limit = 5, record }: { limit?: number; record: EntityRecord }) {
  return (
    <div className="space-y-2">
      <div className="text-center py-4">
        <Clock className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground/30" />
        <p className="text-[10px] text-muted-foreground">
          Activity for {record.id?.slice(0, 8)}...
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          Showing last {limit} events
        </p>
      </div>
    </div>
  );
}

/**
 * Related records section (placeholder)
 */
function RelatedSection({ entity, record: _record, limit = 5 }: { entity: string; record: EntityRecord; limit?: number }) {
  return (
    <div className="text-center py-4">
      <p className="text-[10px] text-muted-foreground">
        Related {entity} ({limit} max)
      </p>
    </div>
  );
}

/**
 * Presence section — who else is viewing this record (placeholder)
 */
function PresenceSection() {
  return (
    <div className="text-center py-2">
      <p className="text-[10px] text-muted-foreground">Only you are viewing</p>
    </div>
  );
}

/**
 * AI suggestions section (placeholder)
 */
function AISuggestionsSection() {
  return (
    <div className="text-center py-2">
      <p className="text-[10px] text-muted-foreground">No suggestions</p>
    </div>
  );
}
