# GHXSTSHIP Platform - 2026 UI/UX Optimized Layout System

## ARCHITECTURAL PRINCIPLES

### Single Source of Truth (SSOT)
- ONE schema defines ALL entity behavior
- NO duplicate configuration across layouts/views
- Computed values derived at runtime, never stored
- Relationships defined once, referenced everywhere

### Third Normal Form (3NF) Applied to UI
- Layouts contain ONLY structural configuration
- Views contain ONLY data visualization logic
- Fields contain ONLY input/display logic
- NO mixing of concerns across layers

### 2026 UI/UX Standards
- Content-first, chrome-minimal
- Progressive disclosure over overwhelming options
- Contextual actions over global toolbars
- Inline editing as default interaction
- AI-assisted where it adds value
- Real-time collaboration awareness
- Motion as communication, not decoration
- Accessibility as foundation, not afterthought

---

# PART 1: OPTIMIZED LAYOUT SYSTEM

## Layout Architecture
```typescript
// /lib/layouts/types.ts

/**
 * LAYOUT RESPONSIBILITY:
 * - Page structure and chrome
 * - Navigation and routing
 * - Section organization
 * - Responsive breakpoints
 * 
 * LAYOUT DOES NOT HANDLE:
 * - Data fetching (handled by hooks)
 * - Data visualization (handled by views)
 * - Field rendering (handled by field components)
 * - Actions (handled by action system)
 */

export type LayoutType =
  | 'entity-list'      // Primary data listing with subpage nav
  | 'entity-detail'    // Single record with related data tabs
  | 'entity-form'      // Create/Edit with sectioned fields
  | 'entity-split'     // Master-detail side-by-side
  | 'dashboard'        // Metric widgets and summaries
  | 'workspace'        // Container for nested entities
  | 'settings'         // Configuration panels
  | 'wizard'           // Multi-step process
  | 'canvas'           // Freeform spatial layout
  | 'document'         // Rich content editor
  | 'empty'            // Zero-state with CTA
  | 'error';           // Error recovery

export interface LayoutShell {
  /**
   * Minimal chrome wrapper - just structure
   * Content is injected, not configured here
   */
  
  // Structural regions (SSOT - defined once)
  regions: {
    header: HeaderRegion;
    content: ContentRegion;
    sidebar?: SidebarRegion;
    footer?: FooterRegion;
  };
  
  // Responsive behavior
  breakpoints: {
    mobile: LayoutAdaptation;
    tablet: LayoutAdaptation;
    desktop: LayoutAdaptation;
  };
  
  // Transitions between layouts
  transitions: {
    enter: AnimationConfig;
    exit: AnimationConfig;
  };
}
```

---

## 1. ENTITY LIST LAYOUT (Optimized)

**2026 Best Practices Applied:**
- Subpage navigation replaces inline filters (cleaner mental model)
- Toolbar is global app chrome, not layout-specific
- Progressive disclosure: search visible, advanced filters in panel
- Keyboard-first with cmd+k integration
- Bulk actions appear contextually on selection
- Infinite scroll with virtual rendering
```typescript
// /lib/layouts/EntityListLayout.tsx

interface EntityListLayoutConfig {
  /**
   * STRUCTURE ONLY - No data logic
   * 
   * Layout regions:
   * ┌─────────────────────────────────────────────────┐
   * │ [Breadcrumb] ─────────────────── [Global Actions] │ ← Header
   * ├─────────────────────────────────────────────────┤
   * │ [Subpage Nav]  [Search] ──── [Toolbar: Views etc] │ ← Subheader
   * ├─────────────────────────────────────────────────┤
   * │                                                   │
   * │                                                   │
   * │              [View Renders Here]                  │ ← Content
   * │              (Table/Kanban/etc)                   │
   * │                                                   │
   * │                                                   │
   * ├─────────────────────────────────────────────────┤
   * │ [Selection Count] ──────────── [Bulk Actions]    │ ← Footer (contextual)
   * └─────────────────────────────────────────────────┘
   */
  
  header: {
    // Breadcrumb auto-generated from route
    breadcrumb: 'auto';
    
    // Global actions (create, import, export)
    // Defined in schema.globalActions, not here (SSOT)
    actions: 'from-schema';
  };
  
  subheader: {
    // Subpage navigation - NOT filters
    // These are distinct data subsets, not filter states
    subpages: SubpageConfig[];
    
    // Search bar - always visible, cmd+k accessible
    search: {
      placeholder: 'from-schema';  // schema.search.placeholder
      shortcut: 'cmd+k';
      expandable: false;  // Always visible in 2026
    };
    
    // Toolbar handled by global app shell
    // View switcher, density toggle, etc. are app-level
    toolbar: 'global';
  };
  
  content: {
    // View component mounted here
    // Type determined by user preference + schema.defaultView
    view: 'dynamic';
    
    // Loading state
    loading: {
      type: 'skeleton';  // Matches view structure
      delay: 200;        // Avoid flash for fast loads
    };
    
    // Empty state
    empty: {
      type: 'contextual';  // Different per subpage
      illustration: true;
      cta: 'from-schema';
    };
  };
  
  footer: {
    // Only appears when items selected
    visibility: 'on-selection';
    
    // Selection info
    selection: {
      count: true;
      summary: true;  // "3 events selected ($45,000 total)"
    };
    
    // Bulk actions from schema
    bulkActions: 'from-schema';
  };
  
  // Responsive adaptations
  responsive: {
    mobile: {
      subheader: {
        subpages: 'horizontal-scroll';
        search: 'collapsible';
      };
      content: {
        defaultView: 'card-list';  // Force card view on mobile
      };
      footer: {
        position: 'fixed-bottom';
      };
    };
  };
}

/**
 * SUBPAGE CONFIGURATION
 * 
 * Subpages are DISTINCT DATA SUBSETS, not filter states.
 * They represent different "slices" of the entity collection.
 * 
 * ✅ CORRECT subpage usage:
 * - "All Events" vs "My Events" vs "Archived"
 * - "Active Projects" vs "Templates" vs "Completed"
 * - "Team Members" vs "Contractors" vs "Pending Invites"
 * 
 * ❌ INCORRECT (use filters instead):
 * - Status: Draft/Active/Complete (this is a filter)
 * - Date ranges (this is a filter)
 * - Categories (this is a filter)
 */
interface SubpageConfig {
  key: string;
  label: string;
  
  // Data subset definition
  query: {
    // Base filter for this subpage
    where: Record<string, any>;
    
    // Default sort for this subpage
    orderBy?: { field: string; direction: 'asc' | 'desc' };
  };
  
  // Count badge (real-time)
  count: {
    show: boolean;
    highlight?: 'when-nonzero' | 'when-changed';
  };
  
  // Subpage-specific empty state
  empty?: {
    title: string;
    description: string;
    action?: ActionConfig;
  };
  
  // Subpage-specific available views (optional override)
  views?: ViewType[];
}

// EXAMPLE: Event subpages
const eventSubpages: SubpageConfig[] = [
  {
    key: 'all',
    label: 'All Events',
    query: { where: { archived: false } },
    count: { show: true },
  },
  {
    key: 'upcoming',
    label: 'Upcoming',
    query: { 
      where: { startDate: { gte: 'now' }, archived: false },
      orderBy: { field: 'startDate', direction: 'asc' }
    },
    count: { show: true, highlight: 'when-nonzero' },
  },
  {
    key: 'my-events',
    label: 'My Events',
    query: { where: { assignedTo: { contains: '$currentUser' }, archived: false } },
    count: { show: true },
  },
  {
    key: 'drafts',
    label: 'Drafts',
    query: { where: { status: 'draft' } },
    count: { show: true },
    empty: {
      title: 'No draft events',
      description: 'Events you\'re working on will appear here',
      action: { type: 'create', label: 'Create Event' }
    },
  },
  {
    key: 'archived',
    label: 'Archived',
    query: { where: { archived: true } },
    count: { show: false },
    views: ['table'],  // Only table view for archived
  },
];
```

---

## 2. ENTITY DETAIL LAYOUT (Optimized)

**2026 Best Practices Applied:**
- Tabs are for RELATED DATA SUBPAGES, not categories
- Overview tab is a dashboard summary, not a form
- Sticky header with progressive collapse
- Contextual sidebar (AI suggestions, quick actions)
- Real-time collaboration presence
- Inline editing throughout
```typescript
// /lib/layouts/EntityDetailLayout.tsx

interface EntityDetailLayoutConfig {
  /**
   * STRUCTURE ONLY - No data logic
   * 
   * Layout regions:
   * ┌─────────────────────────────────────────────────────────────┐
   * │ [← Back] [Breadcrumb] ─────────────── [Actions ▾] [⋮ More] │ ← Header
   * ├─────────────────────────────────────────────────────────────┤
   * │ [Icon] Title ──────────────────────────────────────────────│
   * │        Subtitle • Badge • Quick Stats                       │ ← Hero
   * ├─────────────────────────────────────────────────────────────┤
   * │ [Overview] [Schedule] [Team] [Budget] [Files] [Activity]    │ ← Tabs
   * ├───────────────────────────────────────────┬─────────────────┤
   * │                                           │ [AI Suggestions]│
   * │                                           │ [Quick Actions] │
   * │           [Tab Content]                   │ [Related Items] │ ← Content + Sidebar
   * │                                           │ [Collaborators] │
   * │                                           │                 │
   * └───────────────────────────────────────────┴─────────────────┘
   */
  
  header: {
    // Navigation
    back: {
      show: true;
      label: 'dynamic';  // "Back to Events"
    };
    breadcrumb: 'auto';
    
    // Primary actions (Edit, common workflows)
    // Secondary actions in overflow menu
    actions: {
      primary: 'from-schema';    // First 2-3 actions
      overflow: 'from-schema';   // Rest in menu
    };
    
    // Sticky behavior
    sticky: {
      enabled: true;
      collapse: 'on-scroll';     // Hero collapses, tabs stay
      threshold: 100;
    };
  };
  
  hero: {
    // Entity identity (SSOT from schema.display)
    identity: {
      icon: 'from-schema';
      title: 'from-schema';      // schema.display.title
      subtitle: 'from-schema';   // schema.display.subtitle
      badge: 'from-schema';      // schema.display.badge
      image: 'from-schema';      // Optional hero image
    };
    
    // Quick stats (computed, not stored - 3NF)
    stats: QuickStatConfig[];
    
    // Collaboration presence
    presence: {
      show: true;
      position: 'right';
    };
  };
  
  tabs: TabConfig[];  // Defined separately below
  
  content: {
    // Tab content renders here
    padding: 'comfortable';
    maxWidth: 'readable';  // ~65ch for text content
  };
  
  sidebar: {
    position: 'right';
    width: 320;
    collapsible: true;
    defaultState: 'open';  // Desktop: open, Mobile: closed
    
    sections: SidebarSectionConfig[];
  };
  
  responsive: {
    mobile: {
      hero: { stats: 'hide' };
      tabs: { style: 'scrollable' };
      sidebar: { position: 'bottom-sheet' };
    };
  };
}

/**
 * TAB CONFIGURATION
 * 
 * Tabs are SUBPAGES of related data, NOT categories/filters.
 * Each tab shows a distinct related dataset or view.
 * 
 * ✅ CORRECT tab usage:
 * - Overview (dashboard summary of the entity)
 * - Related entities (Schedule, Team, Budget, Files)
 * - Activity/History log
 * - Settings/Configuration
 * 
 * ❌ INCORRECT (these are filters, not tabs):
 * - Draft/Active/Complete (status filter)
 * - By Category (filter)
 * - This Week/This Month (date filter)
 */
interface DetailTabConfig {
  key: string;
  label: string;
  icon?: string;
  
  // Tab content type
  type: 
    | 'overview'          // Dashboard summary
    | 'related-entity'    // Child/associated records
    | 'activity'          // Audit log / timeline
    | 'comments'          // Discussion thread
    | 'files'             // Attachments
    | 'settings'          // Entity-specific config
    | 'custom';           // Custom component
  
  // For 'related-entity' type
  relation?: {
    entity: string;       // Schema name
    foreignKey: string;   // Relationship field
    defaultView: ViewType;
    allowedViews?: ViewType[];
    allowCreate?: boolean;
    allowInlineEdit?: boolean;
  };
  
  // Badge/count
  badge?: {
    type: 'count' | 'status' | 'custom';
    highlight?: boolean;
  };
  
  // Lazy loading
  lazy?: boolean;  // Don't load until tab selected
}

// EXAMPLE: Event detail tabs (OPTIMIZED)
const eventDetailTabs: DetailTabConfig[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: 'layout-dashboard',
    type: 'overview',
    // Overview content defined in schema.layouts.detail.overview
  },
  {
    key: 'schedule',
    label: 'Schedule',
    icon: 'calendar-clock',
    type: 'related-entity',
    relation: {
      entity: 'scheduleItem',
      foreignKey: 'eventId',
      defaultView: 'timeline',
      allowedViews: ['timeline', 'table', 'calendar-day'],
      allowCreate: true,
      allowInlineEdit: true,
    },
    badge: { type: 'count' },
  },
  {
    key: 'team',
    label: 'Team',
    icon: 'users',
    type: 'related-entity',
    relation: {
      entity: 'assignment',
      foreignKey: 'eventId',
      defaultView: 'table',
      allowedViews: ['table', 'box', 'org-chart'],
      allowCreate: true,
    },
    badge: { type: 'count' },
  },
  {
    key: 'budget',
    label: 'Budget',
    icon: 'calculator',
    type: 'related-entity',
    relation: {
      entity: 'budgetLine',
      foreignKey: 'eventId',
      defaultView: 'table',
      allowedViews: ['table'],
      allowCreate: true,
      allowInlineEdit: true,
    },
    badge: { type: 'status', highlight: true },  // Shows over/under budget
  },
  {
    key: 'files',
    label: 'Files',
    icon: 'folder',
    type: 'files',
    badge: { type: 'count' },
    lazy: true,
  },
  {
    key: 'activity',
    label: 'Activity',
    icon: 'activity',
    type: 'activity',
    lazy: true,
  },
];
```

---

## 3. ENTITY FORM LAYOUT (Optimized)

**2026 Best Practices Applied:**
- Autosave with version history (no more lost work)
- AI-assisted field completion
- Progressive disclosure (advanced fields hidden by default)
- Validation as-you-type, not on submit
- Side-by-side preview for content fields
- Keyboard navigation between sections
```typescript
// /lib/layouts/EntityFormLayout.tsx

interface EntityFormLayoutConfig {
  /**
   * STRUCTURE ONLY - No field logic
   * 
   * Layout regions:
   * ┌─────────────────────────────────────────────────────────────┐
   * │ [← Cancel] Create/Edit Entity ─────────── [Discard] [Save] │ ← Header (sticky)
   * ├─────────────────────────────────────────────────────────────┤
   * │ ● Basic Info ○ Details ○ Settings ──────────── [Progress]  │ ← Section Nav (optional)
   * ├───────────────────────────────────────────┬─────────────────┤
   * │                                           │                 │
   * │  Section Title                            │  [Preview]      │
   * │  ─────────────                            │  or             │
   * │                                           │  [AI Assist]    │
   * │  [Field]                                  │  or             │
   * │  [Field]                                  │  [Related]      │
   * │  [Field]                                  │                 │
   * │                                           │                 │
   * │  ▶ Advanced Options (collapsed)           │                 │
   * │                                           │                 │
   * └───────────────────────────────────────────┴─────────────────┘
   */
  
  header: {
    // Cancel/back action
    cancel: {
      label: 'Cancel';
      confirmIfDirty: true;
      confirmMessage: 'Discard unsaved changes?';
    };
    
    // Dynamic title
    title: {
      create: 'Create {entityName}';
      edit: 'Edit {displayTitle}';
    };
    
    // Form actions
    actions: {
      discard: {
        show: 'when-dirty';
        label: 'Discard';
      };
      save: {
        label: {
          create: 'Create';
          edit: 'Save';
        };
        loading: {
          create: 'Creating...';
          edit: 'Saving...';
        };
        shortcut: 'cmd+s';
      };
    };
    
    // Sticky behavior
    sticky: true;
    
    // Autosave indicator
    autosave: {
      show: true;
      position: 'header-right';
    };
  };
  
  // Section navigation (for long forms)
  sectionNav: {
    show: 'when-multiple-sections';
    style: 'steps' | 'tabs' | 'sidebar';
    progress: true;
  };
  
  content: {
    // Form sections (SSOT from schema.layouts.form.sections)
    sections: 'from-schema';
    
    // Layout mode
    layout: 'single-column' | 'two-column' | 'adaptive';
    
    // Field spacing
    density: 'comfortable';
    
    // Validation
    validation: {
      mode: 'onChange';       // Validate as user types
      debounce: 300;          // ms delay
      showValid: false;       // Don't show green checkmarks
      showInvalid: true;      // Show red errors
    };
  };
  
  sidebar: {
    show: 'desktop-only';
    width: 300;
    
    content: {
      type: 'contextual';
      
      // Shows based on focused field
      sections: [
        { type: 'field-help' },      // Help text for current field
        { type: 'ai-suggestions' },   // AI recommendations
        { type: 'preview' },          // Live preview
        { type: 'related-picker' },   // Quick relation selection
      ];
    };
  };
  
  // Autosave configuration
  autosave: {
    enabled: true;
    debounce: 2000;           // Save 2s after last change
    storage: 'server-draft';  // Store on server, not localStorage
    indicator: true;
    versionHistory: true;     // Keep previous versions
  };
  
  responsive: {
    mobile: {
      sectionNav: { style: 'steps' };
      sidebar: { show: false };
      content: { layout: 'single-column' };
    };
  };
}

/**
 * FORM SECTION CONFIGURATION
 * 
 * Sections group related fields for progressive disclosure.
 * NOT for separating required/optional (use field.required instead)
 * 
 * ✅ CORRECT section usage:
 * - "Basic Information" (identity fields)
 * - "Date & Time" (temporal fields)
 * - "Location" (spatial fields)
 * - "Advanced" (power user fields, collapsed)
 * 
 * ❌ INCORRECT section usage:
 * - "Required Fields" / "Optional Fields" (redundant)
 * - One section per field (defeats purpose)
 */
interface FormSectionConfig {
  key: string;
  title: string;
  description?: string;
  
  // Fields in this section (SSOT from schema.fields)
  fields: Array<string | FieldGroupConfig>;
  
  // Collapse behavior
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  
  // Conditional visibility
  condition?: (formData: any) => boolean;
  
  // Section-level validation summary
  showValidation?: boolean;
}

// EXAMPLE: Event form sections (OPTIMIZED)
const eventFormSections: FormSectionConfig[] = [
  {
    key: 'identity',
    title: 'Event Details',
    description: 'Basic information about your event',
    fields: [
      'name',
      'eventType',
      { group: ['startDate', 'endDate'], layout: 'row' },
    ],
  },
  {
    key: 'location',
    title: 'Location',
    fields: [
      'venueId',
      'location',  // Map picker
    ],
  },
  {
    key: 'stakeholders',
    title: 'Client & Team',
    fields: [
      'clientId',
      'projectManager',
      'attendeeCount',
    ],
  },
  {
    key: 'financials',
    title: 'Budget',
    fields: [
      { group: ['budget', 'currency'], layout: 'row' },
      'paymentTerms',
    ],
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    key: 'content',
    title: 'Description & Media',
    fields: [
      'description',
      'coverImage',
      'tags',
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
  {
    key: 'advanced',
    title: 'Advanced Options',
    fields: [
      'internalNotes',
      'customFields',
      'integrations',
    ],
    collapsible: true,
    defaultCollapsed: true,
    condition: (data) => data.eventType !== 'simple',
  },
];
```

---

## 4. DASHBOARD LAYOUT (Optimized)

**2026 Best Practices Applied:**
- Bento box grid (asymmetric, visually interesting)
- Personalized widget arrangement (user preference)
- Real-time data with subtle update animations
- AI insights prominently featured
- Drill-down on click (not just pretty numbers)
```typescript
// /lib/layouts/DashboardLayout.tsx

interface DashboardLayoutConfig {
  /**
   * Bento-style widget grid with personalization
   * 
   * Example layout:
   * ┌───────────────────┬───────────┬───────────┐
   * │                   │           │           │
   * │   AI Insights     │  Metric   │  Metric   │
   * │   (2x1)           │  (1x1)    │  (1x1)    │
   * │                   │           │           │
   * ├───────────────────┼───────────┴───────────┤
   * │                   │                       │
   * │   Chart           │     Activity Feed     │
   * │   (2x2)           │     (1x2)             │
   * │                   │                       │
   * │                   │                       │
   * ├───────┬───────────┼───────────────────────┤
   * │       │           │                       │
   * │ Stat  │  List     │     Calendar Preview  │
   * │ (1x1) │  (1x1)    │     (2x1)             │
   * │       │           │                       │
   * └───────┴───────────┴───────────────────────┘
   */
  
  header: {
    title: 'Dashboard';
    greeting: true;  // "Good morning, Julian"
    dateRange: {
      show: true;
      presets: ['today', '7d', '30d', '90d', 'ytd', 'custom'];
      default: '30d';
    };
    actions: [
      { type: 'customize', label: 'Customize', icon: 'settings' },
      { type: 'export', label: 'Export', icon: 'download' },
    ];
  };
  
  grid: {
    type: 'bento';
    columns: { sm: 2, md: 4, lg: 6, xl: 8 };
    gap: 16;
    
    // User can rearrange
    draggable: true;
    resizable: true;
    
    // Save preference
    persistLayout: true;
  };
  
  widgets: WidgetConfig[];  // Defined separately
  
  // AI insights banner (2026 feature)
  aiInsights: {
    show: true;
    position: 'top';
    refreshInterval: 3600;  // 1 hour
    dismissible: true;
  };
  
  responsive: {
    mobile: {
      grid: { columns: 1, draggable: false };
      widgets: 'stack';  // Full width, stacked
    };
  };
}

/**
 * WIDGET CONFIGURATION
 * 
 * Widgets are self-contained data visualizations.
 * Data fetching is handled by the widget, not the layout.
 */
interface WidgetConfig {
  key: string;
  type: WidgetType;
  title: string;
  
  // Grid placement (default, user can change)
  defaultPosition: { col: number; row: number; width: number; height: number };
  
  // Min/max size constraints
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  
  // Data configuration
  data: {
    entity: string;
    query: QueryConfig;
    realTime?: boolean;
    refreshInterval?: number;
  };
  
  // Widget-specific config
  config: Record<string, any>;
  
  // Click behavior
  onClick?: {
    action: 'navigate' | 'expand' | 'drill-down';
    target?: string;
  };
}

type WidgetType =
  | 'metric'           // Single KPI with trend
  | 'metric-group'     // Multiple related KPIs
  | 'chart-line'       // Time series
  | 'chart-bar'        // Comparisons
  | 'chart-pie'        // Composition
  | 'chart-area'       // Cumulative trends
  | 'list'             // Top N items
  | 'table'            // Mini data table
  | 'calendar'         // Date overview
  | 'activity'         // Recent activity
  | 'progress'         // Goal tracking
  | 'map'              // Geographic summary
  | 'ai-insight'       // AI-generated insight
  | 'custom';          // Custom component
```

---

## 5. OVERVIEW TAB CONTENT (New - Optimized)

**2026 Best Practices Applied:**
- Overview is a MINI-DASHBOARD, not a form
- Shows entity summary + key metrics + quick actions
- Computed stats, not stored values (3NF)
- Contextual AI recommendations
- Quick links to related data
```typescript
// /lib/layouts/OverviewTabContent.tsx

interface OverviewTabConfig {
  /**
   * Overview tab is a contextual dashboard for a single entity.
   * 
   * Layout:
   * ┌─────────────────────────────────────────────────────────┐
   * │ [Quick Stats Row - 4-6 key metrics]                     │
   * ├─────────────────────────────────────────────────────────┤
   * │ ┌─────────────────────┐  ┌─────────────────────────┐   │
   * │ │                     │  │                         │   │
   * │ │   Key Information   │  │   Progress/Timeline     │   │
   * │ │   (editable)        │  │                         │   │
   * │ │                     │  │                         │   │
   * │ └─────────────────────┘  └─────────────────────────┘   │
   * ├─────────────────────────────────────────────────────────┤
   * │ ┌─────────────────────┐  ┌─────────────────────────┐   │
   * │ │   Related Summary   │  │   AI Insights           │   │
   * │ │   (tasks, notes)    │  │                         │   │
   * │ └─────────────────────┘  └─────────────────────────┘   │
   * └─────────────────────────────────────────────────────────┘
   */
  
  // Quick stats bar at top
  quickStats: QuickStatConfig[];
  
  // Main content blocks
  blocks: OverviewBlockConfig[];
  
  // Layout
  layout: {
    columns: 2;
    gap: 24;
  };
}

interface QuickStatConfig {
  key: string;
  label: string;
  
  // Value computation (3NF - computed, not stored)
  value: {
    type: 'field' | 'computed' | 'related-count' | 'related-sum';
    
    // For 'field'
    field?: string;
    
    // For 'computed'
    compute?: (entity: any) => number | string;
    
    // For 'related-count' or 'related-sum'
    relation?: {
      entity: string;
      foreignKey: string;
      filter?: Record<string, any>;
      sumField?: string;  // For related-sum
    };
  };
  
  // Display
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'date' | 'relative';
  
  // Trend indicator
  trend?: {
    compare: 'previous-period' | 'target' | 'custom';
    showDirection: boolean;
    showPercentage: boolean;
  };
  
  // Click action
  onClick?: { tab: string } | { navigate: string };
}

interface OverviewBlockConfig {
  key: string;
  type: OverviewBlockType;
  title?: string;
  
  // Grid placement
  span: 1 | 2 | 'full';
  
  // Block-specific config
  config: Record<string, any>;
}

type OverviewBlockType =
  | 'key-fields'       // Editable field group
  | 'description'      // Rich text display
  | 'timeline'         // Mini timeline of related events
  | 'progress'         // Progress indicator
  | 'checklist'        // Task checklist
  | 'related-summary'  // Count/preview of related entities
  | 'chart'            // Mini chart
  | 'ai-insights'      // AI recommendations
  | 'activity-preview' // Recent activity
  | 'custom';          // Custom component

// EXAMPLE: Event overview configuration
const eventOverviewConfig: OverviewTabConfig = {
  quickStats: [
    {
      key: 'daysUntil',
      label: 'Days Until',
      value: {
        type: 'computed',
        compute: (event) => differenceInDays(event.startDate, new Date()),
      },
      format: 'number',
    },
    {
      key: 'budgetUsed',
      label: 'Budget Used',
      value: {
        type: 'related-sum',
        relation: { entity: 'budgetLine', foreignKey: 'eventId', sumField: 'actual' },
      },
      format: 'currency',
      trend: { compare: 'target', showDirection: true, showPercentage: true },
      onClick: { tab: 'budget' },
    },
    {
      key: 'teamSize',
      label: 'Team Size',
      value: {
        type: 'related-count',
        relation: { entity: 'assignment', foreignKey: 'eventId' },
      },
      format: 'number',
      onClick: { tab: 'team' },
    },
    {
      key: 'openTasks',
      label: 'Open Tasks',
      value: {
        type: 'related-count',
        relation: { 
          entity: 'task', 
          foreignKey: 'eventId',
          filter: { status: { not: 'completed' } }
        },
      },
      format: 'number',
      trend: { compare: 'previous-period', showDirection: true },
    },
    {
      key: 'progress',
      label: 'Progress',
      value: { type: 'field', field: 'progress' },
      format: 'percentage',
    },
  ],
  
  blocks: [
    {
      key: 'key-info',
      type: 'key-fields',
      title: 'Event Information',
      span: 1,
      config: {
        fields: ['status', 'eventType', 'startDate', 'endDate', 'venueId', 'clientId'],
        editable: true,
      },
    },
    {
      key: 'timeline',
      type: 'timeline',
      title: 'Schedule Overview',
      span: 1,
      config: {
        relation: { entity: 'scheduleItem', foreignKey: 'eventId' },
        limit: 5,
        showMore: { tab: 'schedule' },
      },
    },
    {
      key: 'description',
      type: 'description',
      span: 'full',
      config: {
        field: 'description',
        editable: true,
        placeholder: 'Add event description...',
      },
    },
    {
      key: 'tasks',
      type: 'related-summary',
      title: 'Tasks',
      span: 1,
      config: {
        relation: { entity: 'task', foreignKey: 'eventId' },
        display: 'checklist',
        limit: 5,
        filter: { status: { not: 'completed' } },
        showMore: { tab: 'tasks' },
        allowQuickAdd: true,
      },
    },
    {
      key: 'ai-insights',
      type: 'ai-insights',
      title: 'Recommendations',
      span: 1,
      config: {
        types: ['risk-alert', 'optimization', 'reminder'],
        limit: 3,
      },
    },
  ],
  
  layout: {
    columns: 2,
    gap: 24,
  },
};
```

---

## 6. SIDEBAR CONFIGURATION (Optimized)

**2026 Best Practices Applied:**
- Contextual, not static
- AI-first (suggestions, predictions)
- Real-time collaboration presence
- Quick actions, not navigation
- Collapsible to maximize content space
```typescript
// /lib/layouts/SidebarConfig.tsx

interface SidebarConfig {
  position: 'right';  // Always right in 2026 (left for nav)
  width: 320;
  
  // Collapse behavior
  collapsible: true;
  defaultState: 'open' | 'collapsed';
  collapseBelow: 'lg';  // Auto-collapse on smaller screens
  
  // Sections
  sections: SidebarSectionConfig[];
}

interface SidebarSectionConfig {
  key: string;
  type: SidebarSectionType;
  title?: string;
  
  // Collapse behavior
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  
  // Visibility
  condition?: (context: any) => boolean;
  
  // Section-specific config
  config: Record<string, any>;
}

type SidebarSectionType =
  | 'presence'          // Who's viewing/editing
  | 'ai-suggestions'    // AI recommendations
  | 'quick-actions'     // Common actions
  | 'quick-stats'       // Key metrics
  | 'related-list'      // Related entity preview
  | 'activity-mini'     // Recent activity
  | 'comments-mini'     // Recent comments
  | 'field-help'        // Contextual help (forms)
  | 'preview'           // Content preview (forms)
  | 'custom';           // Custom component

// EXAMPLE: Event detail sidebar
const eventDetailSidebar: SidebarConfig = {
  position: 'right',
  width: 320,
  collapsible: true,
  defaultState: 'open',
  collapseBelow: 'lg',
  
  sections: [
    {
      key: 'presence',
      type: 'presence',
      config: {
        showViewers: true,
        showEditors: true,
        maxAvatars: 5,
      },
    },
    {
      key: 'ai',
      type: 'ai-suggestions',
      title: 'AI Insights',
      collapsible: true,
      config: {
        types: ['risk', 'optimization', 'similar-events'],
        refreshTrigger: 'on-data-change',
      },
    },
    {
      key: 'actions',
      type: 'quick-actions',
      title: 'Quick Actions',
      config: {
        actions: [
          { key: 'addTask', label: 'Add Task', icon: 'plus' },
          { key: 'addNote', label: 'Add Note', icon: 'sticky-note' },
          { key: 'scheduleCall', label: 'Schedule Call', icon: 'phone' },
          { key: 'sendUpdate', label: 'Send Update', icon: 'send' },
        ],
      },
    },
    {
      key: 'stats',
      type: 'quick-stats',
      title: 'Key Metrics',
      collapsible: true,
      defaultCollapsed: false,
      config: {
        stats: ['daysUntil', 'budgetRemaining', 'taskCompletion', 'teamSize'],
      },
    },
    {
      key: 'tasks',
      type: 'related-list',
      title: 'Open Tasks',
      collapsible: true,
      config: {
        entity: 'task',
        filter: { status: { not: 'completed' } },
        limit: 5,
        display: 'compact',
        showMore: { tab: 'tasks' },
      },
    },
    {
      key: 'activity',
      type: 'activity-mini',
      title: 'Recent Activity',
      collapsible: true,
      defaultCollapsed: true,
      config: {
        limit: 5,
        showMore: { tab: 'activity' },
      },
    },
  ],
};
```

---

# PART 2: COMPLETE UNIFIED SCHEMA (3NF + SSOT)
```typescript
// /lib/schema/types.ts

/**
 * UNIFIED ENTITY SCHEMA
 * 
 * Single source of truth for:
 * - Data structure (fields, types, validation)
 * - UI presentation (layouts, views, display)
 * - Behavior (actions, permissions, hooks)
 * - Relationships (references, computed values)
 * 
 * 3NF Principles Applied:
 * - No duplicate data definitions
 * - Computed values derived at runtime
 * - Relationships reference other schemas, not duplicate data
 */

export interface EntitySchema<T = any> {
  // ═══════════════════════════════════════════════════════════
  // IDENTITY (defined once, used everywhere)
  // ═══════════════════════════════════════════════════════════
  identity: {
    name: string;            // "Event"
    namePlural: string;      // "Events"
    slug: string;            // "events" (URL path)
    icon: string;            // "calendar"
    color?: string;          // "violet"
    description?: string;    // For documentation
  };
  
  // ═══════════════════════════════════════════════════════════
  // DATA LAYER
  // ═══════════════════════════════════════════════════════════
  data: {
    endpoint: string;        // "/api/events"
    
    // Field definitions
    fields: Record<string, FieldDefinition>;
    
    // Computed fields (3NF - derived, not stored)
    computed?: Record<string, ComputedFieldDefinition>;
    
    // Relationships
    relations: RelationshipDefinition[];
    
    // Validation
    validate?: (data: Partial<T>, mode: 'create' | 'edit') => ValidationResult;
  };
  
  // ═══════════════════════════════════════════════════════════
  // DISPLAY LAYER (SSOT for all views)
  // ═══════════════════════════════════════════════════════════
  display: {
    // How to display a single record anywhere in the app
    title: (row: T) => string;
    subtitle?: (row: T) => string;
    description?: (row: T) => string;
    image?: (row: T) => string | undefined;
    badge?: (row: T) => { label: string; color: string } | undefined;
    
    // Default sort across all views
    defaultSort: { field: keyof T; direction: 'asc' | 'desc' };
  };
  
  // ═══════════════════════════════════════════════════════════
  // SEARCH & FILTER LAYER
  // ═══════════════════════════════════════════════════════════
  search: {
    enabled: boolean;
    fields: Array<keyof T>;        // Fields to search
    placeholder?: string;
  };
  
  filters: {
    // Quick filters (always visible chips)
    quick?: QuickFilterConfig[];
    
    // Advanced filter fields
    advanced?: Array<keyof T>;
    
    // Allow saving filter presets
    saved?: boolean;
  };
  
  // ═══════════════════════════════════════════════════════════
  // LAYOUT LAYER (structure only, references display layer)
  // ═══════════════════════════════════════════════════════════
  layouts: {
    list: {
      subpages: SubpageConfig[];
      defaultView: ViewType;
      availableViews: ViewType[];
    };
    
    detail: {
      tabs: DetailTabConfig[];
      overview: OverviewTabConfig;
      sidebar?: SidebarConfig;
    };
    
    form: {
      sections: FormSectionConfig[];
      autosave?: boolean;
    };
  };
  
  // ═══════════════════════════════════════════════════════════
  // VIEW LAYER (data visualization configs)
  // ═══════════════════════════════════════════════════════════
  views: Partial<Record<ViewType, ViewConfig<T>>>;
  
  // ═══════════════════════════════════════════════════════════
  // ACTION LAYER (behaviors)
  // ═══════════════════════════════════════════════════════════
  actions: {
    // Row-level actions
    row: Array<BuiltInAction | CustomAction>;
    
    // Bulk actions
    bulk: Array<BuiltInAction | CustomAction>;
    
    // Global page actions
    global: Array<CustomAction>;
  };
  
  // ═══════════════════════════════════════════════════════════
  // PERMISSION LAYER
  // ═══════════════════════════════════════════════════════════
  permissions: {
    create?: PermissionCheck;
    read?: PermissionCheck;
    update?: PermissionCheck<T>;
    delete?: PermissionCheck<T>;
  };
  
  // ═══════════════════════════════════════════════════════════
  // HOOK LAYER (lifecycle events)
  // ═══════════════════════════════════════════════════════════
  hooks?: {
    beforeCreate?: (data: Partial<T>) => Partial<T> | Promise<Partial<T>>;
    afterCreate?: (record: T) => void | Promise<void>;
    beforeUpdate?: (id: string, data: Partial<T>) => Partial<T> | Promise<Partial<T>>;
    afterUpdate?: (record: T) => void | Promise<void>;
    beforeDelete?: (id: string) => boolean | Promise<boolean>;
    afterDelete?: (id: string) => void | Promise<void>;
  };
  
  // ═══════════════════════════════════════════════════════════
  // EXPORT/IMPORT LAYER
  // ═══════════════════════════════════════════════════════════
  export?: {
    enabled: boolean;
    formats: Array<'csv' | 'xlsx' | 'pdf' | 'json'>;
    fields?: Array<keyof T>;
  };
  
  import?: {
    enabled: boolean;
    formats: Array<'csv' | 'xlsx' | 'json'>;
    template?: string;
  };
}

// ═══════════════════════════════════════════════════════════
// SUPPORTING TYPES
// ═══════════════════════════════════════════════════════════

interface ComputedFieldDefinition {
  label: string;
  
  // Computation type
  type: 'derived' | 'related-count' | 'related-sum' | 'related-avg';
  
  // For 'derived'
  compute?: (record: any) => any;
  
  // For related computations
  relation?: {
    entity: string;
    foreignKey: string;
    filter?: Record<string, any>;
    field?: string;  // For sum/avg
  };
  
  // Display
  format?: FieldFormat;
  
  // Where to show
  inTable?: boolean;
  inDetail?: boolean;
}

type PermissionCheck<T = any> = boolean | ((user: User, record?: T) => boolean);
```

---

# PART 3: MIGRATION EXECUTION PROMPT
```markdown
## WINDSURF MIGRATION PROMPT

### PHASE 1: Build Optimized Core System

Create `/lib/` infrastructure following 2026 UI standards:

1. **Layout System** (`/lib/layouts/`)
   - [ ] EntityListLayout.tsx - Subpage nav, no inline filters
   - [ ] EntityDetailLayout.tsx - Tabs for related data only
   - [ ] EntityFormLayout.tsx - Autosave, progressive disclosure
   - [ ] DashboardLayout.tsx - Bento grid, personalizable
   - [ ] OverviewTabContent.tsx - Mini-dashboard for detail pages
   - [ ] SidebarConfig.tsx - Contextual, AI-first
   - [ ] Layout type definitions

2. **View System** (`/lib/views/`)
   - [ ] All view type components (Table, Kanban, Calendar, etc.)
   - [ ] ViewSwitcher handled by global toolbar
   - [ ] View type definitions

3. **Schema System** (`/lib/schema/`)
   - [ ] Unified EntitySchema type
   - [ ] defineSchema helper
   - [ ] Schema-to-UI utilities

4. **CRUD System** (`/lib/crud/`)
   - [ ] CrudList, CrudDetail, CrudCreate, CrudEdit
   - [ ] DynamicForm with autosave
   - [ ] Generic hooks

### PHASE 2: Migrate Entities

For EACH entity:

1. **Create Schema** (`/schemas/[entity].schema.ts`)
   - Extract fields from existing components
   - Define layouts.list.subpages (NOT filters)
   - Define layouts.detail.tabs (related entities only)
   - Define computed fields (3NF)
   - Configure all views

2. **Replace Pages** (`/app/[entity]/`)
   - List page: 5 lines
   - Detail page: 5 lines
   - Create page: 5 lines
   - Edit page: 5 lines

3. **Deprecate Old Files**
   - Move to `/deprecated/`
   - Test thoroughly
   - Delete after verification

### KEY PRINCIPLES TO ENFORCE

1. **Subpages ≠ Filters**
   - Subpages: "All", "My Items", "Archived" (distinct datasets)
   - Filters: Status, Category, Date (refine current dataset)

2. **Tabs = Related Data Only**
   - ✅ Overview, Schedule, Team, Budget, Files, Activity
   - ❌ Draft, Active, Completed (use status filter)

3. **Overview = Mini-Dashboard**
   - Quick stats (computed, not stored)
   - Key fields (editable inline)
   - Related summaries (with quick-add)
   - AI insights

4. **3NF Compliance**
   - Computed values: `daysUntil`, `budgetUsed`, `taskCount`
   - Never store what can be derived
   - Relationships reference schemas, not duplicate

5. **SSOT Compliance**
   - Display config defined once in schema
   - Layouts reference schema, don't redefine
   - Actions defined once, available everywhere
```

---

This optimized architecture follows 2026 best practices while maintaining strict SSOT and 3NF principles. Want me to create the actual implementation code for any specific component?