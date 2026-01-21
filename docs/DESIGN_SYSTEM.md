# ATLVS Design System 2026

## Design Tokens

### Color Primitives

```css
:root {
  /* Brand Colors (White-label overridable) */
  --brand-50: #f0f9ff;
  --brand-100: #e0f2fe;
  --brand-200: #bae6fd;
  --brand-300: #7dd3fc;
  --brand-400: #38bdf8;
  --brand-500: #0ea5e9;
  --brand-600: #0284c7;
  --brand-700: #0369a1;
  --brand-800: #075985;
  --brand-900: #0c4a6e;
  --brand-950: #082f49;

  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;

  /* Neutral Palette */
  --neutral-0: #ffffff;
  --neutral-50: #fafafa;
  --neutral-100: #f4f4f5;
  --neutral-200: #e4e4e7;
  --neutral-300: #d4d4d8;
  --neutral-400: #a1a1aa;
  --neutral-500: #71717a;
  --neutral-600: #52525b;
  --neutral-700: #3f3f46;
  --neutral-800: #27272a;
  --neutral-900: #18181b;
  --neutral-950: #09090b;
}
```

### Typography Scale

```css
:root {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --font-display: "Cal Sans", "Inter", sans-serif;

  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}
```

### Spacing Scale

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### Data Density Variants

| Variant | Row Height | Cell Padding | Font Size |
|---------|------------|--------------|-----------|
| Compact | 32px | 4px 8px | 12px |
| Comfortable | 40px | 8px 12px | 14px |
| Spacious | 48px | 12px 16px | 16px |

---

## White-Label Theme Engine

### Theme Configuration Schema

```typescript
interface WhiteLabelTheme {
  id: string;
  organizationId: string;
  
  brand: {
    primaryColor: string;      // Hex color
    secondaryColor: string;
    accentColor: string;
    logoUrl: string;           // Full logo
    logomarkUrl: string;       // Icon only
    faviconUrl: string;
  };
  
  typography: {
    fontFamily: string;        // Google Fonts or custom
    headingFontFamily: string;
    baseFontSize: number;      // 14-18px
  };
  
  modes: {
    light: ColorMode;
    dark: ColorMode;
  };
  
  components: {
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    buttonStyle: 'solid' | 'outline' | 'ghost';
    cardStyle: 'flat' | 'elevated' | 'bordered';
  };
  
  layout: {
    sidebarWidth: number;          // 240-320px
    sidebarCollapsedWidth: number; // 64-80px
    headerHeight: number;          // 48-64px
  };
}
```

### Default Themes

| Theme | Primary | Secondary | Use Case |
|-------|---------|-----------|----------|
| Default | #0ea5e9 | #6366f1 | Standard |
| Midnight | #8b5cf6 | #ec4899 | Creative |
| Forest | #10b981 | #059669 | Sustainability |
| Sunset | #f97316 | #ef4444 | Energy |

---

## Component Library

### Primitives

- Button (solid, outline, ghost, link)
- Input (text, number, email, password)
- Select (single, multi, searchable)
- Checkbox, Radio, Switch
- Textarea
- Label, Badge, Avatar

### Data Display

- DataTable (virtualized, sortable, filterable)
- Card, CardHeader, CardContent
- List, ListItem
- Stat, StatLabel, StatValue
- Progress, Skeleton

### Data Entry

- Form, FormField, FormLabel, FormMessage
- DatePicker, DateRangePicker
- TimePicker
- FileUpload, ImageUpload
- RichTextEditor
- ColorPicker

### Feedback

- Alert, AlertTitle, AlertDescription
- Toast (success, error, warning, info)
- Dialog, AlertDialog
- Tooltip, Popover
- Progress, Spinner

### Layout

- Sidebar, SidebarItem, SidebarGroup
- Header, HeaderNav
- PageHeader, PageContent
- Tabs, TabsList, TabsTrigger, TabsContent
- Accordion, AccordionItem

### Navigation

- Breadcrumb, BreadcrumbItem
- CommandPalette (Cmd+K)
- NavigationMenu
- Pagination

### Overlay

- Modal, ModalHeader, ModalContent, ModalFooter
- Sheet (slide-in panel)
- Drawer
- ContextMenu, DropdownMenu

---

## View Components

### ListView

```tsx
<ListView
  data={tasks}
  groupBy="status"
  renderItem={(task) => <TaskListItem task={task} />}
  enableDragDrop
  onReorder={handleReorder}
/>
```

### TableView

```tsx
<TableView
  data={assets}
  columns={assetColumns}
  density="comfortable"
  enableSorting
  enableFiltering
  enableColumnResize
  enableRowSelection
  toolbar={{ search: true, filter: true, export: true }}
/>
```

### BoardView

```tsx
<BoardView
  data={deals}
  columns={pipelineStages}
  groupBy="stage_id"
  cardConfig={{
    title: 'name',
    subtitle: 'company.name',
    badges: ['priority', 'amount'],
  }}
  enableDragDrop
  onCardMove={handleDealMove}
/>
```

### CalendarView

```tsx
<CalendarView
  events={calendarEvents}
  view="week"
  resources={venues}
  enableDragDrop
  onEventCreate={handleCreate}
  onEventUpdate={handleUpdate}
/>
```

### TimelineView

```tsx
<TimelineView
  items={projectTasks}
  startField="start_date"
  endField="due_date"
  dependencies={taskDependencies}
  milestones={projectMilestones}
  zoomLevel="week"
/>
```

---

## Accessibility (WCAG 2.2 AAA)

### Requirements

- Color contrast ratio ≥ 7:1 for normal text
- Color contrast ratio ≥ 4.5:1 for large text
- Focus indicators visible on all interactive elements
- Keyboard navigation for all functionality
- Screen reader announcements for dynamic content
- Reduced motion support via `prefers-reduced-motion`

### Implementation

```tsx
// Focus ring utility
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

// Skip link for keyboard users
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// ARIA live regions for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

---

## Responsive Breakpoints

| Breakpoint | Width | Columns | Sidebar |
|------------|-------|---------|---------|
| Mobile | < 640px | 1 | Hidden |
| Tablet | 640-1024px | 2 | Collapsed |
| Desktop | 1024-1280px | 3 | Expanded |
| Wide | > 1280px | 4 | Expanded |

---

## Animation Guidelines

### Duration

- Micro-interactions: 150ms
- Standard transitions: 200ms
- Complex animations: 300-500ms

### Easing

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
