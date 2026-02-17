'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceLayout } from '@/lib/layouts';
import type { WorkspaceLayoutConfig } from '@/lib/layouts/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Share2,
  Download,
  BarChart3,
  LineChart,
  PieChart,
  Table2,
  GripVertical,
  X,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface ReportField {
  id: string;
  label: string;
  module: string;
  type: 'dimension' | 'measure';
}

const availableFields: ReportField[] = [
  { id: 'project_name', label: 'Project Name', module: 'Projects', type: 'dimension' },
  { id: 'client_name', label: 'Client', module: 'Business', type: 'dimension' },
  { id: 'status', label: 'Status', module: 'Projects', type: 'dimension' },
  { id: 'phase', label: 'Phase', module: 'Projects', type: 'dimension' },
  { id: 'department', label: 'Department', module: 'People', type: 'dimension' },
  { id: 'person_name', label: 'Person', module: 'People', type: 'dimension' },
  { id: 'category', label: 'Category', module: 'Finance', type: 'dimension' },
  { id: 'month', label: 'Month', module: 'Time', type: 'dimension' },
  { id: 'revenue', label: 'Revenue', module: 'Finance', type: 'measure' },
  { id: 'cost', label: 'Cost', module: 'Finance', type: 'measure' },
  { id: 'margin', label: 'Margin', module: 'Finance', type: 'measure' },
  { id: 'hours', label: 'Hours', module: 'Time', type: 'measure' },
  { id: 'utilization', label: 'Utilization %', module: 'People', type: 'measure' },
  { id: 'count', label: 'Record Count', module: 'System', type: 'measure' },
];

type ChartType = 'table' | 'bar' | 'line' | 'pie' | 'area';

export default function ReportBuilderPage() {
  const router = useRouter();
  const [reportName, setReportName] = React.useState('Untitled Report');
  const [chartType, setChartType] = React.useState<ChartType>('table');
  const [rows, setRows] = React.useState<string[]>(['project_name']);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [values, setValues] = React.useState<string[]>(['revenue']);

  const addField = (target: 'rows' | 'columns' | 'values', fieldId: string) => {
    const setter = target === 'rows' ? setRows : target === 'columns' ? setColumns : setValues;
    setter((prev) => (prev.includes(fieldId) ? prev : [...prev, fieldId]));
  };

  const removeField = (target: 'rows' | 'columns' | 'values', fieldId: string) => {
    const setter = target === 'rows' ? setRows : target === 'columns' ? setColumns : setValues;
    setter((prev) => prev.filter((f) => f !== fieldId));
  };

  const getFieldLabel = (id: string) => availableFields.find((f) => f.id === id)?.label || id;

  const config: WorkspaceLayoutConfig = {
    title: reportName,
    icon: 'BarChart3',
    tabs: [
      { key: 'design', label: 'Design' },
      { key: 'preview', label: 'Preview' },
    ],
  };

  const [activeTab, setActiveTab] = React.useState('design');

  const sidebarContent = (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Visualization</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {([
            { type: 'table' as ChartType, icon: Table2, label: 'Table' },
            { type: 'bar' as ChartType, icon: BarChart3, label: 'Bar' },
            { type: 'line' as ChartType, icon: LineChart, label: 'Line' },
            { type: 'pie' as ChartType, icon: PieChart, label: 'Pie' },
          ]).map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setChartType(type)}
              className={`flex flex-col items-center gap-1 p-2 rounded-md text-xs transition-colors ${
                chartType === type ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Available Fields</h3>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {availableFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-grab text-xs group"
              draggable
            >
              <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
              <Badge variant={field.type === 'dimension' ? 'secondary' : 'outline'} className="text-[9px] px-1">
                {field.type === 'dimension' ? 'DIM' : 'MSR'}
              </Badge>
              <span className="flex-1 truncate">{field.label}</span>
              <span className="text-[10px] text-muted-foreground">{field.module}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Share2 className="h-3 w-3" /> Share Report
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Download className="h-3 w-3" /> Export
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceLayout
      config={config}
      currentTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => router.push('/analytics/reports')}
      sidebarContent={sidebarContent}
    >
      {activeTab === 'design' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rows */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase">Rows</span>
                </div>
                <div className="space-y-1 min-h-[60px]">
                  {rows.map((fieldId) => (
                    <div key={fieldId} className="flex items-center justify-between bg-muted rounded px-2 py-1">
                      <span className="text-xs">{getFieldLabel(fieldId)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeField('rows', fieldId)}
                        aria-label={`Remove ${getFieldLabel(fieldId)} from rows`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Select onValueChange={(v) => addField('rows', v)}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="+ Add field" /></SelectTrigger>
                    <SelectContent>
                      {availableFields.filter((f) => f.type === 'dimension' && !rows.includes(f.id)).map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Columns */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase">Columns</span>
                </div>
                <div className="space-y-1 min-h-[60px]">
                  {columns.map((fieldId) => (
                    <div key={fieldId} className="flex items-center justify-between bg-muted rounded px-2 py-1">
                      <span className="text-xs">{getFieldLabel(fieldId)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeField('columns', fieldId)}
                        aria-label={`Remove ${getFieldLabel(fieldId)} from columns`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Select onValueChange={(v) => addField('columns', v)}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="+ Add field" /></SelectTrigger>
                    <SelectContent>
                      {availableFields.filter((f) => f.type === 'dimension' && !columns.includes(f.id)).map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Values */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase">Values</span>
                </div>
                <div className="space-y-1 min-h-[60px]">
                  {values.map((fieldId) => (
                    <div key={fieldId} className="flex items-center justify-between bg-muted rounded px-2 py-1">
                      <span className="text-xs">{getFieldLabel(fieldId)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeField('values', fieldId)}
                        aria-label={`Remove ${getFieldLabel(fieldId)} from values`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Select onValueChange={(v) => addField('values', v)}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="+ Add field" /></SelectTrigger>
                    <SelectContent>
                      {availableFields.filter((f) => f.type === 'measure' && !values.includes(f.id)).map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview area */}
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Report Preview</p>
                <p className="text-xs mt-1">Configure rows, columns, and values, then click Run Report</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="p-6">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Run the report to see results</p>
                <p className="text-xs mt-1">Click &ldquo;Run Report&rdquo; in the header to generate data</p>
                <Button className="mt-4" size="sm">
                  <Play className="mr-2 h-4 w-4" /> Run Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </WorkspaceLayout>
  );
}
