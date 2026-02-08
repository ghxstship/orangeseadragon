'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Settings, Plus, GripVertical, ChevronRight } from 'lucide-react';

export interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
  type: 'metric' | 'chart' | 'list' | 'calendar' | 'activity' | 'custom';
  size: 'small' | 'medium' | 'large' | 'full';
  content?: React.ReactNode;
  value?: string | number;
  change?: number;
  changeLabel?: string;
  href?: string;
}

export interface DashboardSection {
  id: string;
  title?: string;
  widgets: DashboardWidget[];
}

export interface DashboardTemplateProps {
  title: string;
  subtitle?: string;
  sections: DashboardSection[];
  actions?: React.ReactNode;
  onCustomize?: () => void;
  onAddWidget?: () => void;
  editable?: boolean;
}

const sizeClasses = {
  small: 'md:col-span-1',
  medium: 'md:col-span-2',
  large: 'md:col-span-3',
  full: 'md:col-span-4',
};

function MetricWidget({ widget }: { widget: DashboardWidget }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{widget.value}</div>
        {widget.change !== undefined && (
          <p className={cn(
            'text-xs',
            widget.change > 0 ? 'text-green-500' : widget.change < 0 ? 'text-red-500' : 'text-muted-foreground'
          )}>
            {widget.change > 0 ? '+' : ''}{widget.change}% {widget.changeLabel || 'from last period'}
          </p>
        )}
        {widget.description && (
          <p className="text-xs text-muted-foreground mt-1">{widget.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ChartWidget({ widget }: { widget: DashboardWidget }) {
  return (
    <Card className={sizeClasses[widget.size]}>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
        {widget.description && <CardDescription>{widget.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {widget.content || (
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed bg-muted/50">
            <p className="text-sm text-muted-foreground">Chart placeholder</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ListWidget({ widget }: { widget: DashboardWidget }) {
  return (
    <Card className={sizeClasses[widget.size]}>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
        {widget.description && <CardDescription>{widget.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {widget.content || (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border p-2">
                <div className="h-8 w-8 rounded bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="mt-1 h-3 w-16 rounded bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityWidget({ widget }: { widget: DashboardWidget }) {
  return (
    <Card className={sizeClasses[widget.size]}>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
        {widget.description && <CardDescription>{widget.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {widget.content || (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="mt-1 h-3 w-20 rounded bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WidgetRenderer({ widget, editable }: { widget: DashboardWidget; editable?: boolean }) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={cn('relative group', sizeClasses[widget.size])}>
      {editable && (
        <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab">
            <GripVertical className="h-3 w-3" />
          </Button>
        </div>
      )}
      {children}
    </div>
  );

  switch (widget.type) {
    case 'metric':
      return <Wrapper><MetricWidget widget={widget} /></Wrapper>;
    case 'chart':
      return <Wrapper><ChartWidget widget={widget} /></Wrapper>;
    case 'list':
      return <Wrapper><ListWidget widget={widget} /></Wrapper>;
    case 'activity':
      return <Wrapper><ActivityWidget widget={widget} /></Wrapper>;
    case 'custom':
      const customCard = (
        <Card className={cn(
          sizeClasses[widget.size],
          widget.href && "cursor-pointer hover:bg-accent/50 transition-colors"
        )}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{widget.title}</CardTitle>
              {widget.description && <CardDescription>{widget.description}</CardDescription>}
            </div>
            {widget.href && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
          </CardHeader>
          <CardContent>{widget.content}</CardContent>
        </Card>
      );
      return (
        <Wrapper>
          {widget.href ? (
            <Link href={widget.href}>{customCard}</Link>
          ) : (
            customCard
          )}
        </Wrapper>
      );
    default:
      return null;
  }
}

export function DashboardTemplate({
  title,
  subtitle,
  sections,
  actions,
  onCustomize,
  onAddWidget,
  editable = false,
}: DashboardTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onAddWidget && (
            <Button variant="outline" onClick={onAddWidget}>
              <Plus className="mr-2 h-4 w-4" />
              Add Widget
            </Button>
          )}
          {onCustomize && (
            <Button variant="outline" onClick={onCustomize}>
              <Settings className="mr-2 h-4 w-4" />
              Customize
            </Button>
          )}
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="space-y-4">
          {section.title && (
            <h2 className="text-lg font-semibold">{section.title}</h2>
          )}
          <div className="grid gap-4 md:grid-cols-4">
            {section.widgets.map((widget) => (
              <WidgetRenderer key={widget.id} widget={widget} editable={editable} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
