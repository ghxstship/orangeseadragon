# Component Architecture Guide

This guide documents the reusable component library created during the codebase migration. All components follow consistent patterns and are designed for maximum reusability across different functional areas.

## Table of Contents

1. [PageLayout](#pagelayout) - Consistent page structure
2. [StatCard](#statcard) - Metric displays with trends
3. [ActionBar](#actionbar) - Standardized action buttons
4. [DataTable](#datatable) - Universal table with features
5. [FormBuilder](#formbuilder) - Dynamic form generation
6. [DashboardGrid](#dashboardgrid) - Widget-based layouts
7. [WorkflowEngine](#workflowengine) - Approval workflows
8. [CalendarScheduler](#calendarscheduler) - Event management

## PageLayout

The foundational component for consistent page structure across the application.

### Basic Usage

```tsx
import { PageLayout } from "@/lib/components/PageLayout";

export default function MyPage() {
  const breadcrumbs = [
    { label: 'Parent', href: '/parent' },
    { label: 'Current Page' },
  ];

  const actions = [
    {
      key: 'create',
      label: 'Create New',
      icon: 'plus',
      primary: true,
      onClick: () => console.log('Create action'),
    },
  ];

  return (
    <PageLayout
      title="Page Title"
      description="Page description"
      breadcrumbs={breadcrumbs}
      actions={actions}
      loading={false}
      error={null}
    >
      <div>Your page content here</div>
    </PageLayout>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | Page title |
| `description` | `string` | ❌ | Page subtitle |
| `breadcrumbs` | `BreadcrumbItem[]` | ❌ | Navigation breadcrumbs |
| `actions` | `ActionItem[]` | ❌ | Page action buttons |
| `stats` | `StatItem[]` | ❌ | Statistics to display |
| `loading` | `boolean` | ❌ | Show loading state |
| `error` | `string \| null` | ❌ | Error message to display |
| `onRetry` | `() => void` | ❌ | Retry function for errors |
| `children` | `ReactNode` | ✅ | Page content |

### BreadcrumbItem

```tsx
interface BreadcrumbItem {
  label: string;
  href?: string; // Optional link
  icon?: ReactNode;
}
```

### ActionItem

```tsx
interface ActionItem {
  key: string;
  label: string;
  icon?: ReactNode | keyof typeof iconMap;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  loading?: boolean;
  visible?: boolean | (() => boolean);
  onClick: () => void | Promise<void>;
  shortcut?: string; // Keyboard shortcut
  danger?: boolean; // Marks as destructive
  primary?: boolean; // Primary action
}
```

## StatCard

Displays metrics, KPIs, and statistics with optional trends and progress indicators.

### Basic Usage

```tsx
import { StatCard, StatGrid } from "@/lib/components/StatCard";

const stats = [
  {
    key: "revenue",
    title: "Total Revenue",
    value: "$125,890",
    icon: "dollarSign",
    color: "success",
  },
  {
    key: "users",
    title: "Active Users",
    value: "2,543",
    change: 12.5,
    changeLabel: "vs last month",
    icon: "users",
    color: "info",
  },
];

return (
  <StatGrid stats={stats} />
);

// Or individual cards
return (
  <div className="grid gap-4 md:grid-cols-3">
    {stats.map(stat => (
      <StatCard key={stat.key} {...stat} />
    ))}
  </div>
);
```

### StatItem Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `key` | `string` | ✅ | Unique identifier |
| `title` | `string` | ✅ | Metric title |
| `value` | `string \| number` | ✅ | Metric value |
| `description` | `string` | ❌ | Additional context |
| `change` | `number` | ❌ | Percentage change |
| `changeLabel` | `string` | ❌ | Change description |
| `changeType` | `'percentage' \| 'absolute' \| 'currency'` | ❌ | How to format change |
| `icon` | `ReactNode \| string` | ❌ | Icon to display |
| `color` | `'default' \| 'success' \| 'warning' \| 'error' \| 'info'` | ❌ | Color theme |
| `size` | `'sm' \| 'md' \| 'lg'` | ❌ | Card size |
| `progress` | `number` | ❌ | Progress bar (0-100) |
| `progressLabel` | `string` | ❌ | Progress description |

## ActionBar

Standardized action buttons with consistent styling and behavior.

### Basic Usage

```tsx
import { ActionBar, commonActions } from "@/lib/components/ActionBar";

const actions = [
  commonActions.create(() => handleCreate()),
  commonActions.edit(() => handleEdit()),
  commonActions.delete(() => handleDelete()),
  {
    key: 'export',
    label: 'Export Data',
    icon: 'download',
    onClick: () => handleExport(),
  },
];

return (
  <ActionBar
    actions={actions}
    variant="default"
    maxVisible={3}
  />
);
```

### Common Actions

Pre-built action configurations:

```tsx
import { commonActions } from "@/lib/components/ActionBar";

commonActions.create(onClick)     // Create new item
commonActions.edit(onClick)       // Edit current item
commonActions.delete(onClick)     // Delete item (dangerous)
commonActions.duplicate(onClick)  // Duplicate item
commonActions.export(onClick)     // Export data
commonActions.import(onClick)     // Import data
commonActions.refresh(onClick)    // Refresh/reload
commonActions.settings(onClick)   // Open settings
```

### Variants

- `default` - Standard horizontal layout
- `compact` - Smaller buttons, less spacing
- `minimal` - Ghost buttons, minimal styling

## DataTable

Universal table component with sorting, filtering, pagination, and bulk actions.

### Basic Usage

```tsx
import { DataTable } from "@/lib/components/DataTable";

const columns = [
  {
    key: 'name',
    label: 'Name',
    width: 200,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => (
      <Badge variant={value === 'active' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    ),
  },
  {
    key: 'created_at',
    label: 'Created',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
];

const actions = {
  row: [
    {
      key: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      handler: (row) => handleEdit(row),
    },
  ],
  bulk: [
    {
      key: 'delete',
      label: 'Delete Selected',
      handler: (selectedRows) => handleBulkDelete(selectedRows),
    },
  ],
};

return (
  <DataTable
    data={items}
    columns={columns}
    actions={actions}
    searchPlaceholder="Search items..."
    pagination={{
      pageSize: 10,
      showSizeSelector: true,
      showInfo: true,
    }}
    selection={{
      enabled: true,
      multiSelect: true,
    }}
  />
);
```

### Column Definition

```tsx
interface Column<T = any> {
  key: keyof T | string;  // Data field key
  label: string;          // Display label
  width?: number;         // Column width in pixels
  sortable?: boolean;     // Enable sorting (default: true)
  filterable?: boolean;   // Enable filtering (default: true)
  render?: (value: any, row: T, index: number) => ReactNode; // Custom renderer
}
```

### Actions Configuration

```tsx
interface Actions<T = any> {
  row?: ActionItem<T>[];     // Row-level actions
  bulk?: ActionItem<T[]>[];  // Bulk actions (selected rows)
  global?: ActionItem[];     // Global actions (always visible)
}
```

## FormBuilder

Dynamic form generation with validation, conditional logic, and sections.

### Basic Usage

```tsx
import { FormBuilder, type FormSection } from "@/lib/components/FormBuilder";

const sections: FormSection[] = [
  {
    key: 'personal-info',
    title: 'Personal Information',
    fields: [
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        required: true,
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        validation: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
      },
      {
        name: 'department',
        type: 'select',
        label: 'Department',
        options: [
          { value: 'engineering', label: 'Engineering' },
          { value: 'design', label: 'Design' },
          { value: 'marketing', label: 'Marketing' },
        ],
      },
    ],
  },
];

return (
  <FormBuilder
    sections={sections}
    initialData={{}}
    onSubmit={(data) => handleSubmit(data)}
    submitLabel="Save Changes"
    autosave={true}
  />
);
```

### Field Types

- `text` - Text input
- `email` - Email input with validation
- `password` - Password input
- `number` - Number input
- `textarea` - Multi-line text
- `select` - Dropdown selection
- `multiselect` - Multiple selection
- `checkbox` - Boolean checkbox
- `switch` - Toggle switch
- `date` - Date picker
- `file` - File upload

### Conditional Logic

```tsx
{
  name: 'managerApproval',
  type: 'checkbox',
  label: 'Requires Manager Approval',
  condition: (values) => values.role === 'manager',
}
```

## DashboardGrid

Widget-based dashboard layouts with drag-and-drop functionality.

### Basic Usage

```tsx
import { DashboardGrid } from "@/lib/components/DashboardGrid";

const widgetTypes = [
  {
    type: 'metric',
    label: 'Metric Card',
    icon: <TrendingUp className="h-4 w-4" />,
    defaultSize: { w: 2, h: 1 },
    render: (widget, config) => (
      <div className="p-4">
        <h3 className="font-medium">{widget.title}</h3>
        <p className="text-2xl font-bold">{widget.data.value}</p>
      </div>
    ),
  },
];

const layouts = [
  {
    id: 'metric-1',
    x: 0, y: 0, w: 2, h: 1,
    widget: { id: 'metric-1', type: 'metric', title: 'Revenue', data: { value: '$12,345' } }
  },
];

return (
  <DashboardGrid
    layouts={layouts}
    availableWidgets={widgetTypes}
    editable={true}
    cols={12}
    rowHeight={100}
  />
);
```

## WorkflowEngine

Multi-step approval workflows with status tracking and notifications.

### Basic Usage

```tsx
import { WorkflowEngine } from "@/lib/components/WorkflowEngine";

const workflow = {
  id: 'approval-workflow',
  name: 'Content Approval',
  description: 'Review and approve content changes',
  steps: [
    {
      id: 'draft',
      name: 'Draft Review',
      type: 'review',
      assignee: { id: 'user1', name: 'Editor', email: 'editor@company.com' },
      actions: {
        approve: { label: 'Approve', nextStep: 'final' },
        reject: { label: 'Reject', nextStep: 'revision' },
      },
    },
    {
      id: 'final',
      name: 'Final Approval',
      type: 'approval',
      assignees: [
        { id: 'user2', name: 'Manager', email: 'manager@company.com' },
        { id: 'user3', name: 'Director', email: 'director@company.com' },
      ],
      required: true,
    },
  ],
};

return (
  <WorkflowEngine
    workflow={workflow}
    instance={currentInstance}
    data={workflowData}
    currentUser={user}
    onAction={(action, stepId, data) => handleWorkflowAction(action, stepId, data)}
  />
);
```

## CalendarScheduler

Event scheduling and management with multiple view modes.

### Basic Usage

```tsx
import { CalendarScheduler } from "@/lib/components/CalendarScheduler";

const events = [
  {
    id: 'event-1',
    title: 'Team Meeting',
    start: new Date('2024-01-15T10:00:00'),
    end: new Date('2024-01-15T11:00:00'),
    location: 'Conference Room A',
    attendees: [
      { id: 'user1', name: 'John Doe', email: 'john@company.com' },
    ],
  },
];

return (
  <CalendarScheduler
    events={events}
    view="month"
    onEventCreate={(event) => handleEventCreate(event)}
    onEventUpdate={(id, updates) => handleEventUpdate(id, updates)}
    editable={true}
  />
);
```

## Migration Patterns

### From Legacy Components

**Before (Custom Page Structure):**
```tsx
<div className="space-y-6">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold">Page Title</h1>
      <p className="text-muted-foreground">Description</p>
    </div>
    <Button>Create New</Button>
  </div>
  {/* Custom content */}
</div>
```

**After (Component Architecture):**
```tsx
<PageLayout
  title="Page Title"
  description="Description"
  actions={[commonActions.create(() => handleCreate())]}
>
  <DataTable data={items} columns={columns} actions={actions} />
</PageLayout>
```

### Best Practices

1. **Always use PageLayout** for consistent page structure
2. **Use StatGrid** for metrics displays (3-4 cards maximum per row)
3. **Prefer DataTable** over custom table implementations
4. **Use FormBuilder** for any form with more than 2 fields
5. **Implement proper loading/error states** with PageLayout
6. **Add breadcrumbs** for navigation context
7. **Use commonActions** for standard CRUD operations

### Component Composition

Components are designed to work together:

```tsx
<PageLayout
  title="Dashboard"
  description="Business overview"
  breadcrumbs={breadcrumbs}
  actions={pageActions}
  loading={loading}
  error={error}
>
  <StatGrid stats={stats} />

  <div className="grid gap-6 lg:grid-cols-2">
    <DataTable
      data={items}
      columns={columns}
      actions={tableActions}
    />

    <FormBuilder
      sections={formSections}
      onSubmit={handleSubmit}
    />
  </div>
</PageLayout>
```

This architecture provides consistency, maintainability, and rapid development across the entire application.
