# ATLVS Component Usage Examples

This document provides usage examples for the reusable view components in ATLVS.

## Table of Contents

- [DataTable](#datatable)
- [KanbanBoard](#kanbanboard)
- [CalendarView](#calendarview)
- [GanttView](#ganttview)
- [WorkloadView](#workloadview)
- [MapView](#mapview)
- [ActivityFeed](#activityfeed)
- [DashboardWidgets](#dashboardwidgets)
- [FormBuilder](#formbuilder)
- [Toolbar](#toolbar)

---

## DataTable

Full-featured data table with sorting, filtering, and pagination.

```tsx
import { DataTable, type ColumnDef } from "@/components/views";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
}

const columns: ColumnDef<Task>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "priority", header: "Priority" },
  { accessorKey: "assignee", header: "Assignee" },
];

const tasks: Task[] = [
  { id: "1", title: "Design mockups", status: "In Progress", priority: "High", assignee: "Alice" },
  { id: "2", title: "API integration", status: "Todo", priority: "Medium", assignee: "Bob" },
];

<DataTable
  columns={columns}
  data={tasks}
  searchKey="title"
  searchPlaceholder="Search tasks..."
/>
```

---

## KanbanBoard

Drag-and-drop board with customizable columns.

```tsx
import { KanbanBoard, type KanbanColumn, type KanbanItem } from "@/components/views";

const columns: KanbanColumn[] = [
  { id: "todo", title: "To Do", color: "#6B7280" },
  { id: "in_progress", title: "In Progress", color: "#3B82F6" },
  { id: "done", title: "Done", color: "#10B981" },
];

const items: KanbanItem[] = [
  { id: "1", title: "Task 1", columnId: "todo", description: "First task" },
  { id: "2", title: "Task 2", columnId: "in_progress", description: "Second task" },
];

<KanbanBoard
  columns={columns}
  items={items}
  onItemMove={(itemId, fromColumn, toColumn) => {
    console.log(`Moved ${itemId} from ${fromColumn} to ${toColumn}`);
  }}
  onItemClick={(item) => console.log("Clicked:", item)}
/>
```

---

## CalendarView

Multi-view calendar component.

```tsx
import { CalendarView, type CalendarEvent } from "@/components/views";

const events: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Meeting",
    start: new Date(2024, 5, 15, 10, 0),
    end: new Date(2024, 5, 15, 11, 0),
    color: "#3B82F6",
  },
  {
    id: "2",
    title: "Project Review",
    start: new Date(2024, 5, 16, 14, 0),
    end: new Date(2024, 5, 16, 15, 30),
    color: "#10B981",
  },
];

<CalendarView
  events={events}
  defaultView="month"
  onEventClick={(event) => console.log("Event clicked:", event)}
  onDateSelect={(date) => console.log("Date selected:", date)}
/>
```

---

## GanttView

Project Gantt chart with dependencies and milestones.

```tsx
import { GanttView, type GanttTask } from "@/components/views";

const tasks: GanttTask[] = [
  {
    id: "1",
    name: "Project Planning",
    startDate: "2024-06-01",
    endDate: "2024-06-07",
    progress: 100,
    status: "completed",
  },
  {
    id: "2",
    name: "Design Phase",
    startDate: "2024-06-08",
    endDate: "2024-06-21",
    progress: 60,
    status: "in_progress",
    dependencies: ["1"],
  },
  {
    id: "3",
    name: "Design Review",
    startDate: "2024-06-21",
    endDate: "2024-06-21",
    progress: 0,
    status: "pending",
    isMilestone: true,
    dependencies: ["2"],
  },
];

<GanttView
  tasks={tasks}
  title="Project Timeline"
  showDependencies
  showCriticalPath
  onTaskClick={(task) => console.log("Task clicked:", task)}
/>
```

---

## WorkloadView

Resource capacity and workload visualization.

```tsx
import { WorkloadView, type WorkloadResource } from "@/components/views";

const resources: WorkloadResource[] = [
  {
    id: "1",
    name: "Alice Johnson",
    role: "Designer",
    capacity: 8,
    tasks: [
      { id: "t1", title: "UI Design", startDate: "2024-06-10", endDate: "2024-06-14", hours: 32 },
      { id: "t2", title: "Review", startDate: "2024-06-15", endDate: "2024-06-15", hours: 4 },
    ],
  },
  {
    id: "2",
    name: "Bob Smith",
    role: "Developer",
    capacity: 8,
    tasks: [
      { id: "t3", title: "API Development", startDate: "2024-06-10", endDate: "2024-06-20", hours: 64 },
    ],
  },
];

<WorkloadView
  resources={resources}
  title="Team Workload"
  daysToShow={14}
  capacityThresholds={{ warning: 80, overloaded: 100 }}
  onResourceClick={(resource) => console.log("Resource:", resource)}
/>
```

---

## MapView

Interactive map with markers and clustering.

```tsx
import { MapView, type MapMarker } from "@/components/views";

const markers: MapMarker[] = [
  {
    id: "1",
    latitude: 40.7128,
    longitude: -74.006,
    title: "New York Office",
    description: "Headquarters",
    type: "venue",
  },
  {
    id: "2",
    latitude: 34.0522,
    longitude: -118.2437,
    title: "Los Angeles Venue",
    description: "West coast events",
    type: "venue",
  },
];

<MapView
  markers={markers}
  title="Locations"
  center={{ lat: 39.8283, lng: -98.5795 }}
  zoom={4}
  showSearch
  showFilters
  showList
  onMarkerClick={(marker) => console.log("Marker:", marker)}
/>
```

---

## ActivityFeed

Chronological activity stream.

```tsx
import { ActivityFeed, type ActivityItem } from "@/components/views";

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "created",
    timestamp: new Date(),
    user: { id: "u1", name: "Alice Johnson", avatar: "/avatars/alice.jpg" },
    entity: { type: "task", id: "t1", name: "New Feature" },
  },
  {
    id: "2",
    type: "commented",
    timestamp: new Date(Date.now() - 3600000),
    user: { id: "u2", name: "Bob Smith" },
    entity: { type: "task", id: "t1", name: "New Feature" },
    metadata: { comment: "Looks great! Ready for review." },
  },
  {
    id: "3",
    type: "status_changed",
    timestamp: new Date(Date.now() - 7200000),
    user: { id: "u1", name: "Alice Johnson" },
    entity: { type: "task", id: "t1", name: "New Feature" },
    metadata: { oldValue: "In Progress", newValue: "Review" },
  },
];

<ActivityFeed
  activities={activities}
  title="Recent Activity"
  showFilters
  onActivityClick={(activity) => console.log("Activity:", activity)}
/>
```

---

## DashboardWidgets

Collection of dashboard widget components.

```tsx
import {
  MetricWidget,
  ProgressWidget,
  ListWidget,
  DonutWidget,
  SparklineWidget,
} from "@/components/views";

// Metric Widget
<MetricWidget
  title="Total Revenue"
  value="$125,430"
  trend={{ value: 12.5, direction: "up", label: "vs last month" }}
  icon={<DollarSign className="h-4 w-4" />}
/>

// Progress Widget
<ProgressWidget
  title="Project Completion"
  value={75}
  max={100}
  status="success"
  description="On track for deadline"
/>

// List Widget
<ListWidget
  title="Top Performers"
  items={[
    { id: "1", label: "Alice", value: 42, trend: "up" },
    { id: "2", label: "Bob", value: 38, trend: "up" },
    { id: "3", label: "Carol", value: 35, trend: "down" },
  ]}
  onItemClick={(item) => console.log("Item:", item)}
/>

// Donut Widget
<DonutWidget
  title="Task Status"
  data={[
    { label: "Completed", value: 45, color: "#10B981" },
    { label: "In Progress", value: 30, color: "#3B82F6" },
    { label: "Pending", value: 25, color: "#6B7280" },
  ]}
  centerValue="100"
  centerLabel="Total"
/>

// Sparkline Widget
<SparklineWidget
  title="Weekly Activity"
  value="1,234"
  data={[10, 25, 15, 30, 22, 35, 28]}
  trend={{ value: 8.2, direction: "up" }}
/>
```

---

## FormBuilder

Dynamic form builder with drag-and-drop.

```tsx
import { FormBuilder, FormRenderer, type FormField } from "@/components/views";

// Form Builder (for creating forms)
const [fields, setFields] = useState<FormField[]>([]);

<FormBuilder
  fields={fields}
  onChange={setFields}
  title="Contact Form"
  description="Build your custom form"
/>

// Form Renderer (for displaying forms)
const formFields: FormField[] = [
  { id: "name", type: "text", label: "Full Name", required: true },
  { id: "email", type: "email", label: "Email", required: true },
  { id: "department", type: "select", label: "Department", options: [
    { label: "Sales", value: "sales" },
    { label: "Engineering", value: "engineering" },
  ]},
  { id: "message", type: "textarea", label: "Message" },
];

const [values, setValues] = useState({});

<FormRenderer
  fields={formFields}
  values={values}
  onChange={setValues}
  onSubmit={(data) => console.log("Submitted:", data)}
/>
```

---

## Toolbar

Global toolbar with search, filters, and actions.

```tsx
import { Toolbar, type ToolbarFilter, type ToolbarSort } from "@/components/views";

const [searchValue, setSearchValue] = useState("");
const [activeFilters, setActiveFilters] = useState<ToolbarFilter[]>([]);
const [sort, setSort] = useState<ToolbarSort | null>(null);
const [view, setView] = useState<"table" | "kanban" | "calendar">("table");

<Toolbar
  search={{
    value: searchValue,
    onChange: setSearchValue,
    placeholder: "Search tasks...",
  }}
  filters={{
    active: activeFilters,
    available: [
      { id: "status", label: "Status", value: "", options: [
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
      ]},
      { id: "priority", label: "Priority", value: "", options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ]},
    ],
    onAdd: (filter) => setActiveFilters([...activeFilters, filter]),
    onRemove: (id) => setActiveFilters(activeFilters.filter(f => f.id !== id)),
    onClear: () => setActiveFilters([]),
  }}
  sort={{
    value: sort,
    options: [
      { field: "title", label: "Title" },
      { field: "created", label: "Created Date" },
      { field: "priority", label: "Priority" },
    ],
    onChange: setSort,
  }}
  view={{
    current: view,
    available: ["table", "kanban", "calendar"],
    onChange: setView,
  }}
  actions={{
    primary: {
      id: "create",
      label: "New Task",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => console.log("Create task"),
    },
  }}
  export={{
    formats: ["csv", "xlsx", "pdf"],
    onExport: (format) => console.log("Export as:", format),
  }}
  refresh={{
    onRefresh: () => console.log("Refresh"),
    loading: false,
  }}
/>
```

---

## Services

### Notification Service

```tsx
import { notificationService } from "@/lib/notifications";

// Send a notification
await notificationService.send({
  recipientId: "user-123",
  category: "task",
  title: "Task Assigned",
  body: "You have been assigned a new task",
  channels: ["email", "in_app", "push"],
  templateId: "task_assigned",
  templateVariables: {
    taskName: "Design Review",
    assignerName: "Alice",
  },
});

// Get user notifications
const notifications = await notificationService.getUserNotifications("user-123", {
  status: ["pending", "delivered"],
  limit: 20,
});

// Mark as read
await notificationService.markAsRead("notification-id");
```

### Audit Service

```tsx
import { auditService } from "@/lib/audit";

// Log an action
await auditService.log({
  organizationId: "org-123",
  action: "update",
  category: "data",
  actor: {
    id: "user-123",
    type: "user",
    name: "Alice Johnson",
    email: "alice@example.com",
  },
  target: {
    type: "task",
    id: "task-456",
    name: "Design Review",
  },
  description: "Updated task status",
  changes: [
    { field: "status", oldValue: "in_progress", newValue: "completed" },
  ],
});

// Query audit logs
const logs = await auditService.query({
  organizationId: "org-123",
  action: ["create", "update", "delete"],
  startDate: new Date("2024-01-01"),
  limit: 100,
});

// Get statistics
const stats = await auditService.getStats({ organizationId: "org-123" });
```

### Workflow Service

```tsx
import { workflowService } from "@/lib/workflow-engine";

// Create workflow from template
const workflow = await workflowService.createFromTemplate(
  "task_approval",
  "org-123",
  { approvers: ["user-1", "user-2"] }
);

// Execute workflow
const execution = await workflowService.executeWorkflow(workflow.id, {
  taskId: "task-123",
  requesterId: "user-456",
});

// Get workflow status
const status = await workflowService.getExecution(execution.id);
```

---

## Theming

### Apply White-Label Theme

```tsx
import { applyTheme, themePresets, type WhiteLabelTheme } from "@/lib/theming";

// Apply a preset theme
applyTheme(themePresets.corporate.theme, "light");

// Apply custom theme
const customTheme: WhiteLabelTheme = {
  brand: {
    primaryColor: "#0066FF",
    secondaryColor: "#10B981",
    logoUrl: "/logo.svg",
    faviconUrl: "/favicon.ico",
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    headingFontFamily: "Cal Sans, sans-serif",
  },
  components: {
    borderRadius: "md",
    buttonStyle: "default",
    cardStyle: "elevated",
    inputStyle: "default",
  },
  layout: {
    sidebarWidth: 256,
    headerHeight: 64,
    contentMaxWidth: 1280,
  },
};

applyTheme(customTheme, "light");
```
