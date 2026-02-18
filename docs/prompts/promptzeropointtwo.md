# ═══════════════════════════════════════════════════════════════════════════════
# GHXSTSHIP PLATFORM - SCHEMA-DRIVEN ARCHITECTURE MIGRATION
# ═══════════════════════════════════════════════════════════════════════════════
#
# OBJECTIVE: Migrate entire codebase from per-entity component files to a
# centralized, schema-driven CRUD system with strict UI Single Source of Truth
#
# RESULT: 80%+ reduction in code, single-file bug fixes, instant new entity setup
#
# ═══════════════════════════════════════════════════════════════════════════════

## CRITICAL RULES - READ BEFORE ANY CODE CHANGES

### RULE 1: SINGLE SOURCE OF TRUTH (SSOT)
```
EVERY piece of UI configuration MUST be defined EXACTLY ONCE.

❌ VIOLATION: Defining column headers in both schema AND component
❌ VIOLATION: Duplicating field labels across form and table
❌ VIOLATION: Hardcoding entity names in multiple places

✅ CORRECT: Schema defines field.label, ALL components read from schema
✅ CORRECT: Schema defines display.title, ALL views use schema.display.title()
✅ CORRECT: Schema defines actions, ALL action menus read from schema
```

### RULE 2: THIRD NORMAL FORM (3NF)
```
NEVER store what can be computed. NEVER duplicate data.

❌ VIOLATION: Storing "taskCount" field on Event record
❌ VIOLATION: Storing "daysUntil" as a database column
❌ VIOLATION: Duplicating client name on every event

✅ CORRECT: Compute taskCount from relation at runtime
✅ CORRECT: Compute daysUntil from startDate at render time
✅ CORRECT: Store clientId, resolve client.name via relation
```

### RULE 3: SUBPAGES VS FILTERS
```
SUBPAGES are distinct data subsets (different base queries).
FILTERS refine the current dataset (additive conditions).

❌ VIOLATION: Subpage tabs for "Draft", "Active", "Complete" (these are status FILTERS)
❌ VIOLATION: Subpage tabs for date ranges (these are FILTERS)

✅ CORRECT SUBPAGES: "All Events", "My Events", "Archived", "Templates"
✅ CORRECT FILTERS: Status dropdown, Date range picker, Category multiselect
```

### RULE 4: TABS ARE FOR RELATED DATA
```
Detail page tabs show RELATED ENTITIES, not categories or views.

❌ VIOLATION: Tabs for "Details", "Info", "Settings" (vague categories)
❌ VIOLATION: Tabs for "Card View", "List View" (view switching)
❌ VIOLATION: Tabs for "Pending", "Approved" (status filter)

✅ CORRECT TABS: "Overview", "Schedule", "Team", "Budget", "Files", "Activity"
✅ Each tab = different related dataset or distinct content type
```

### RULE 5: ZERO PER-ENTITY COMPONENTS
```
After migration, there should be ZERO entity-specific component files.

❌ VIOLATION: EventTable.tsx, EventForm.tsx, EventCard.tsx
❌ VIOLATION: useEvents.ts, useEventMutations.ts
❌ VIOLATION: EventFilters.tsx, EventActions.tsx

✅ CORRECT: One DataTable.tsx that renders ANY entity via schema
✅ CORRECT: One DynamicForm.tsx that renders ANY entity via schema
✅ CORRECT: One useCrud.ts hook that handles ANY entity via schema
```

---

## PHASE 0: CODEBASE ANALYSIS

Before writing ANY migration code, analyze the existing codebase:

### Step 0.1: Generate Entity Inventory
```bash
# Run these commands and document results:

# Find all entity-related component files
echo "=== COMPONENT FILES ===" > entity_inventory.txt
find . -type f -name "*.tsx" | xargs grep -l "Table\|Form\|List\|Card\|Detail\|Modal" | grep -v node_modules | sort >> entity_inventory.txt

# Find all entity hooks
echo "\n=== HOOK FILES ===" >> entity_inventory.txt
find . -type f -name "use*.ts" | grep -v node_modules | sort >> entity_inventory.txt

# Find all type definitions
echo "\n=== TYPE FILES ===" >> entity_inventory.txt
find . -type f -name "*.ts" | xargs grep -l "interface\|type" | grep -v node_modules | grep types >> entity_inventory.txt

# Find all API routes
echo "\n=== API ROUTES ===" >> entity_inventory.txt
find . -path "*/api/*" -name "*.ts" | grep -v node_modules | sort >> entity_inventory.txt

# Find all page routes
echo "\n=== PAGE ROUTES ===" >> entity_inventory.txt
find . -path "*/app/*" -name "page.tsx" | grep -v node_modules | sort >> entity_inventory.txt

# Count lines of code to be migrated
echo "\n=== LINES OF CODE ===" >> entity_inventory.txt
find . -type f \( -name "*.tsx" -o -name "*.ts" \) | grep -v node_modules | xargs wc -l | tail -1 >> entity_inventory.txt
```

### Step 0.2: Create Entity Registry

Create a tracking document:
```typescript
// /migration/entity-registry.ts

/**
 * ENTITY REGISTRY
 * 
 * Document ALL entities found in codebase.
 * Update status as migration progresses.
 */

interface EntityMigrationStatus {
  name: string;
  status: 'not-started' | 'schema-created' | 'pages-updated' | 'tested' | 'complete';
  
  // Existing files found
  existingFiles: {
    components: string[];
    hooks: string[];
    types: string[];
    pages: string[];
    api: string[];
  };
  
  // Migration notes
  notes: string[];
  
  // Custom requirements
  customizations: string[];
}

export const entityRegistry: EntityMigrationStatus[] = [
  // POPULATE THIS LIST BY ANALYZING CODEBASE
  // Example:
  {
    name: 'Event',
    status: 'not-started',
    existingFiles: {
      components: [
        'components/events/EventTable.tsx',
        'components/events/EventForm.tsx',
        'components/events/EventCard.tsx',
        'components/events/EventFilters.tsx',
        'components/events/EventActions.tsx',
      ],
      hooks: [
        'hooks/useEvents.ts',
        'hooks/useEvent.ts',
        'hooks/useEventMutations.ts',
      ],
      types: ['types/event.ts'],
      pages: [
        'app/events/page.tsx',
        'app/events/[id]/page.tsx',
        'app/events/new/page.tsx',
        'app/events/[id]/edit/page.tsx',
      ],
      api: ['app/api/events/route.ts', 'app/api/events/[id]/route.ts'],
    },
    notes: [],
    customizations: ['Custom run sheet generation', 'Client notification workflow'],
  },
  // ... ADD ALL OTHER ENTITIES
];
```

### Step 0.3: Identify Shared Patterns

Analyze existing components to extract common patterns:
```typescript
// /migration/pattern-analysis.ts

/**
 * PATTERN ANALYSIS
 * 
 * Document common patterns across existing entity components
 * to ensure generic system handles all cases.
 */

export const patternAnalysis = {
  // Table patterns found
  tablePatterns: {
    columnTypes: [
      // List all column render types found
      'text', 'number', 'currency', 'date', 'datetime', 'status-badge',
      'avatar', 'link', 'actions', 'checkbox', 'progress', 'tags',
      // ... add all found
    ],
    features: [
      // List all table features found
      'sorting', 'filtering', 'pagination', 'selection', 'inline-edit',
      'row-expansion', 'column-resize', 'column-reorder', 'export',
      // ... add all found
    ],
  },
  
  // Form patterns found
  formPatterns: {
    fieldTypes: [
      // List all field types found
      'text', 'textarea', 'richtext', 'number', 'currency', 'email',
      'phone', 'url', 'select', 'multiselect', 'checkbox', 'switch',
      'date', 'datetime', 'time', 'daterange', 'file', 'image',
      'relation', 'location', 'color', 'json',
      // ... add all found
    ],
    features: [
      // List all form features found
      'validation', 'conditional-fields', 'field-dependencies',
      'autosave', 'draft-recovery', 'section-collapse',
      // ... add all found
    ],
  },
  
  // Action patterns found
  actionPatterns: {
    rowActions: [
      // List all row actions found across entities
      'view', 'edit', 'duplicate', 'archive', 'delete',
      'send-invite', 'generate-pdf', 'mark-complete',
      // ... add all found
    ],
    bulkActions: [
      // List all bulk actions found
      'delete', 'archive', 'export', 'assign', 'update-status',
      // ... add all found
    ],
  },
  
  // View patterns found
  viewPatterns: {
    viewTypes: [
      // List all view types used
      'table', 'kanban', 'calendar', 'timeline', 'gallery', 'map',
      // ... add all found
    ],
  },
};
```

---

## PHASE 1: BUILD CORE INFRASTRUCTURE

Create the generic system BEFORE migrating any entities.

### Step 1.1: Create Directory Structure
```bash
# Create new directory structure
mkdir -p lib/schema
mkdir -p lib/layouts/components
mkdir -p lib/views/components
mkdir -p lib/crud/components
mkdir -p lib/crud/hooks
mkdir -p lib/components/fields
mkdir -p lib/components/ui
mkdir -p schemas
mkdir -p migration/deprecated
```

### Step 1.2: Create Schema Type System
```typescript
// /lib/schema/types.ts

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER SCHEMA TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This is the SINGLE SOURCE OF TRUTH for all entity configuration.
 * Every layout, view, and component reads from this schema.
 * 
 * NEVER duplicate these definitions elsewhere.
 * NEVER hardcode values that should come from schema.
 */

// ─────────────────────────────────────────────────────────────────────────────
// FIELD TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType =
  // Text
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'code'
  // Numbers
  | 'number'
  | 'currency'
  | 'percentage'
  // Contact
  | 'email'
  | 'phone'
  | 'url'
  // Selection
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  // Date/Time
  | 'date'
  | 'datetime'
  | 'time'
  | 'daterange'
  | 'duration'
  // Media
  | 'file'
  | 'image'
  | 'avatar'
  | 'gallery'
  // Special
  | 'relation'
  | 'location'
  | 'address'
  | 'color'
  | 'rating'
  | 'tags'
  | 'json'
  | 'signature'
  // Custom
  | 'custom';

export interface FieldDefinition {
  type: FieldType;
  label: string;
  
  // ─────────────────────────────────────────────────────────────
  // BASIC PROPERTIES
  // ─────────────────────────────────────────────────────────────
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean | ((context: FieldContext) => boolean);
  hidden?: boolean | ((context: FieldContext) => boolean);
  default?: any | ((context: FieldContext) => any);
  
  // ─────────────────────────────────────────────────────────────
  // VISIBILITY (where this field appears)
  // ─────────────────────────────────────────────────────────────
  inTable?: boolean;           // Show in table view
  inForm?: boolean;            // Show in create/edit forms
  inDetail?: boolean;          // Show in detail view
  inCard?: boolean;            // Show in card view
  inExport?: boolean;          // Include in exports
  
  // Override for specific contexts
  inCreate?: boolean;          // Override inForm for create
  inEdit?: boolean;            // Override inForm for edit
  
  // ─────────────────────────────────────────────────────────────
  // TABLE BEHAVIOR
  // ─────────────────────────────────────────────────────────────
  sortable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  
  tableWidth?: number | string;
  tableMinWidth?: number;
  tableMaxWidth?: number;
  tableFrozen?: 'left' | 'right';
  tableAlign?: 'left' | 'center' | 'right';
  
  // ─────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp | string;
  
  validate?: (value: any, context: FieldContext) => string | undefined;
  
  // ─────────────────────────────────────────────────────────────
  // SELECT/MULTISELECT OPTIONS
  // ─────────────────────────────────────────────────────────────
  options?: FieldOption[] | string[] | ((context: FieldContext) => FieldOption[]);
  optionsEndpoint?: string;    // Dynamic options from API
  
  // ─────────────────────────────────────────────────────────────
  // RELATION CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  relation?: {
    entity: string;            // Related schema name
    display: string | ((item: any) => string);
    searchable?: boolean;
    multiple?: boolean;
    createInline?: boolean;    // Allow creating new related record inline
    preload?: boolean;         // Preload options
    filter?: Record<string, any>;
  };
  
  // ─────────────────────────────────────────────────────────────
  // DISPLAY FORMATTING
  // ─────────────────────────────────────────────────────────────
  format?: (value: any, record: any) => string | React.ReactNode;
  formatTable?: (value: any, record: any) => React.ReactNode;
  formatDetail?: (value: any, record: any) => React.ReactNode;
  
  // ─────────────────────────────────────────────────────────────
  // CUSTOM RENDERING (escape hatch - use sparingly)
  // ─────────────────────────────────────────────────────────────
  renderField?: (props: FieldRenderProps) => React.ReactNode;
  renderCell?: (props: CellRenderProps) => React.ReactNode;
  renderDetail?: (props: DetailRenderProps) => React.ReactNode;
}

interface FieldOption {
  value: string;
  label: string;
  color?: string;
  icon?: string;
  disabled?: boolean;
}

interface FieldContext {
  mode: 'create' | 'edit' | 'table' | 'detail' | 'filter';
  record?: any;
  user?: any;
  formData?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTED FIELDS (3NF - Never stored, always derived)
// ─────────────────────────────────────────────────────────────────────────────

export interface ComputedFieldDefinition {
  label: string;
  
  computation:
    | { type: 'derived'; compute: (record: any) => any }
    | { type: 'relation-count'; entity: string; foreignKey: string; filter?: Record<string, any> }
    | { type: 'relation-sum'; entity: string; foreignKey: string; field: string; filter?: Record<string, any> }
    | { type: 'relation-avg'; entity: string; foreignKey: string; field: string; filter?: Record<string, any> }
    | { type: 'relation-min'; entity: string; foreignKey: string; field: string; filter?: Record<string, any> }
    | { type: 'relation-max'; entity: string; foreignKey: string; field: string; filter?: Record<string, any> };
  
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'date' | 'relative';
  
  inTable?: boolean;
  inDetail?: boolean;
  inCard?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTITY SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

export interface EntitySchema<T = any> {
  // ═══════════════════════════════════════════════════════════════
  // IDENTITY
  // ═══════════════════════════════════════════════════════════════
  identity: {
    name: string;
    namePlural: string;
    slug: string;
    icon: string;
    color?: string;
    description?: string;
  };
  
  // ═══════════════════════════════════════════════════════════════
  // DATA
  // ═══════════════════════════════════════════════════════════════
  data: {
    endpoint: string;
    primaryKey?: string;       // Default: 'id'
    
    fields: Record<string, FieldDefinition>;
    computed?: Record<string, ComputedFieldDefinition>;
    
    timestamps?: {
      created?: string;        // Default: 'createdAt'
      updated?: string;        // Default: 'updatedAt'
    };
  };
  
  // ═══════════════════════════════════════════════════════════════
  // RELATIONSHIPS
  // ═══════════════════════════════════════════════════════════════
  relationships?: {
    belongsTo?: Array<{
      entity: string;
      foreignKey: string;
      label: string;
    }>;
    hasMany?: Array<{
      entity: string;
      foreignKey: string;
      label: string;
      cascade?: 'delete' | 'nullify' | 'restrict';
    }>;
    manyToMany?: Array<{
      entity: string;
      through: string;
      label: string;
    }>;
  };
  
  // ═══════════════════════════════════════════════════════════════
  // DISPLAY (SSOT - used by ALL views)
  // ═══════════════════════════════════════════════════════════════
  display: {
    title: string | ((record: T) => string);
    subtitle?: string | ((record: T) => string);
    description?: string | ((record: T) => string);
    image?: string | ((record: T) => string | undefined);
    icon?: string | ((record: T) => string);
    badge?: (record: T) => { label: string; variant: string } | undefined;
    
    defaultSort: { field: string; direction: 'asc' | 'desc' };
  };
  
  // ═══════════════════════════════════════════════════════════════
  // SEARCH & FILTERS
  // ═══════════════════════════════════════════════════════════════
  search: {
    enabled: boolean;
    fields: string[];
    placeholder: string;
    minLength?: number;
    debounce?: number;
  };
  
  filters: {
    quick: QuickFilterDefinition[];
    advanced: string[];            // Field names
    presets?: FilterPresetDefinition[];
    allowSave?: boolean;
  };
  
  // ═══════════════════════════════════════════════════════════════
  // LAYOUTS
  // ═══════════════════════════════════════════════════════════════
  layouts: {
    list: ListLayoutConfig;
    detail: DetailLayoutConfig;
    form: FormLayoutConfig;
  };
  
  // ═══════════════════════════════════════════════════════════════
  // VIEWS
  // ═══════════════════════════════════════════════════════════════
  views: {
    table?: TableViewConfig;
    kanban?: KanbanViewConfig;
    calendar?: CalendarViewConfig;
    timeline?: TimelineViewConfig;
    gallery?: GalleryViewConfig;
    map?: MapViewConfig;
    // ... other view configs
  };
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════
  actions: {
    row: ActionDefinition[];
    bulk: ActionDefinition[];
    global: ActionDefinition[];
  };
  
  // ═══════════════════════════════════════════════════════════════
  // PERMISSIONS
  // ═══════════════════════════════════════════════════════════════
  permissions: {
    create?: boolean | ((user: any) => boolean);
    read?: boolean | ((user: any, record?: T) => boolean);
    update?: boolean | ((user: any, record: T) => boolean);
    delete?: boolean | ((user: any, record: T) => boolean);
  };
  
  // ═══════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════
  hooks?: {
    beforeCreate?: (data: Partial<T>) => Partial<T> | Promise<Partial<T>>;
    afterCreate?: (record: T) => void | Promise<void>;
    beforeUpdate?: (id: string, data: Partial<T>, existing: T) => Partial<T> | Promise<Partial<T>>;
    afterUpdate?: (record: T, changes: Partial<T>) => void | Promise<void>;
    beforeDelete?: (id: string, record: T) => boolean | Promise<boolean>;
    afterDelete?: (id: string) => void | Promise<void>;
    onView?: (record: T) => void;
  };
  
  // ═══════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════
  validate?: (data: Partial<T>, mode: 'create' | 'edit') => Record<string, string> | undefined;
  
  // ═══════════════════════════════════════════════════════════════
  // EXPORT/IMPORT
  // ═══════════════════════════════════════════════════════════════
  export?: {
    enabled: boolean;
    formats: ('csv' | 'xlsx' | 'pdf' | 'json')[];
    fields?: string[];
    maxRecords?: number;
  };
  
  import?: {
    enabled: boolean;
    formats: ('csv' | 'xlsx' | 'json')[];
    templateUrl?: string;
    fieldMapping?: Record<string, string>;
    validate?: (rows: any[]) => { valid: any[]; errors: any[] };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

export interface ListLayoutConfig {
  subpages: SubpageDefinition[];
  defaultView: string;
  availableViews: string[];
  pageSize?: number;
  pageSizeOptions?: number[];
}

export interface SubpageDefinition {
  key: string;
  label: string;
  icon?: string;
  
  query: {
    where?: Record<string, any>;
    orderBy?: { field: string; direction: 'asc' | 'desc' };
  };
  
  count?: boolean;
  countHighlight?: 'always' | 'when-nonzero' | 'when-changed';
  
  empty?: {
    title: string;
    description: string;
    action?: { label: string; onClick: 'create' | string };
  };
  
  // Optional view override for this subpage
  defaultView?: string;
  availableViews?: string[];
}

export interface DetailLayoutConfig {
  tabs: DetailTabDefinition[];
  overview: OverviewConfig;
  sidebar?: SidebarConfig;
}

export interface DetailTabDefinition {
  key: string;
  label: string;
  icon?: string;
  
  content:
    | { type: 'overview' }
    | { type: 'related'; entity: string; foreignKey: string; defaultView?: string; allowCreate?: boolean }
    | { type: 'activity' }
    | { type: 'comments' }
    | { type: 'files' }
    | { type: 'custom'; component: string };
  
  badge?: 'count' | 'status' | { compute: (record: any) => string | number };
  lazy?: boolean;
}

export interface OverviewConfig {
  stats: QuickStatDefinition[];
  blocks: OverviewBlockDefinition[];
}

export interface FormLayoutConfig {
  sections: FormSectionDefinition[];
  autosave?: boolean;
  autosaveDelay?: number;
  showProgress?: boolean;
}

export interface FormSectionDefinition {
  key: string;
  title: string;
  description?: string;
  
  fields: (string | FieldGroupDefinition)[];
  
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  condition?: (data: any, mode: 'create' | 'edit') => boolean;
}

export interface FieldGroupDefinition {
  fields: string[];
  layout: 'row' | 'column';
  gap?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

export interface TableViewConfig {
  columns: (string | TableColumnDefinition)[];
  rowKey?: string;
  
  features?: {
    selection?: boolean;
    multiSelect?: boolean;
    inlineEdit?: boolean;
    rowExpansion?: boolean;
    columnResize?: boolean;
    columnReorder?: boolean;
  };
}

export interface TableColumnDefinition {
  field: string;
  width?: number | string;
  minWidth?: number;
  frozen?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
}

export interface KanbanViewConfig {
  columnField: string;
  columns: KanbanColumnDefinition[];
  
  card: {
    title: string | ((record: any) => string);
    subtitle?: string | ((record: any) => string);
    image?: string;
    fields?: string[];
    badge?: string;
  };
  
  swimlane?: {
    field: string;
    collapsed?: boolean;
  };
  
  features?: {
    dragDrop?: boolean;
    quickAdd?: boolean;
    columnCollapse?: boolean;
    wipLimits?: boolean;
  };
}

export interface KanbanColumnDefinition {
  value: string;
  label: string;
  color?: string;
  icon?: string;
  limit?: number;
}

export interface CalendarViewConfig {
  startField: string;
  endField?: string;
  titleField: string;
  
  allDayField?: string;
  colorField?: string;
  resourceField?: string;
  
  defaultView?: 'month' | 'week' | 'day' | 'agenda';
  
  features?: {
    dragDrop?: boolean;
    resize?: boolean;
    quickAdd?: boolean;
  };
}

export interface TimelineViewConfig {
  startField: string;
  endField: string;
  titleField: string;
  
  groupField?: string;
  progressField?: string;
  dependencyField?: string;
  milestoneField?: string;
  
  features?: {
    dragDrop?: boolean;
    resize?: boolean;
    dependencies?: boolean;
    criticalPath?: boolean;
  };
}

export interface GalleryViewConfig {
  imageField: string;
  titleField: string;
  subtitleField?: string;
  badgeField?: string;
  
  aspectRatio?: '1:1' | '4:3' | '16:9' | 'auto';
  columns?: number | { sm: number; md: number; lg: number; xl: number };
  
  features?: {
    lightbox?: boolean;
    download?: boolean;
    zoom?: boolean;
  };
}

export interface MapViewConfig {
  latitudeField: string;
  longitudeField: string;
  
  titleField: string;
  markerIcon?: string | ((record: any) => string);
  markerColor?: string | ((record: any) => string);
  
  features?: {
    clustering?: boolean;
    heatmap?: boolean;
    directions?: boolean;
    search?: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export type BuiltInAction = 
  | 'view' 
  | 'edit' 
  | 'duplicate' 
  | 'archive' 
  | 'restore'
  | 'delete' 
  | 'export';

export interface ActionDefinition {
  key: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'warning';
  
  // When to show
  condition?: (record: any, context: ActionContext) => boolean;
  permission?: string;
  
  // Confirmation
  confirm?: {
    title: string;
    message: string | ((record: any) => string);
    confirmLabel?: string;
    cancelLabel?: string;
    requireInput?: string;  // Require typing specific text
  };
  
  // Action handler
  handler: 
    | { type: 'navigate'; path: string | ((record: any) => string) }
    | { type: 'modal'; component: string }
    | { type: 'api'; endpoint: string; method: string }
    | { type: 'function'; fn: (record: any, context: ActionContext) => void | Promise<void> };
  
  // Feedback
  successMessage?: string;
  errorMessage?: string;
}

interface ActionContext {
  user: any;
  selectedIds?: string[];
  refresh: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface QuickFilterDefinition {
  key: string;
  label: string;
  icon?: string;
  
  query: Record<string, any>;
  
  // Badge showing count
  count?: boolean;
}

export interface FilterPresetDefinition {
  key: string;
  label: string;
  filters: Record<string, any>;
  isDefault?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT & BLOCK DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface QuickStatDefinition {
  key: string;
  label: string;
  
  value:
    | { type: 'field'; field: string }
    | { type: 'computed'; compute: (record: any) => number | string }
    | { type: 'relation-count'; entity: string; foreignKey: string; filter?: Record<string, any> }
    | { type: 'relation-sum'; entity: string; foreignKey: string; field: string; filter?: Record<string, any> };
  
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'date' | 'relative';
  
  trend?: {
    compare: 'previous-period' | 'target' | { field: string };
    direction?: boolean;
    percentage?: boolean;
  };
  
  onClick?: { tab: string } | { navigate: string };
}

export interface OverviewBlockDefinition {
  key: string;
  span: 1 | 2 | 'full';
  
  content:
    | { type: 'fields'; fields: string[]; editable?: boolean }
    | { type: 'description'; field: string; editable?: boolean }
    | { type: 'timeline'; entity: string; foreignKey: string; limit?: number }
    | { type: 'checklist'; entity: string; foreignKey: string; limit?: number; allowAdd?: boolean }
    | { type: 'related'; entity: string; foreignKey: string; view?: string; limit?: number }
    | { type: 'chart'; chartType: string; data: any }
    | { type: 'ai-insights'; types?: string[] }
    | { type: 'activity'; limit?: number }
    | { type: 'custom'; component: string };
  
  title?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface SidebarConfig {
  width?: number;
  collapsible?: boolean;
  defaultState?: 'open' | 'collapsed';
  
  sections: SidebarSectionDefinition[];
}

export interface SidebarSectionDefinition {
  key: string;
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  
  content:
    | { type: 'presence' }
    | { type: 'ai-suggestions' }
    | { type: 'quick-actions'; actions: string[] }
    | { type: 'stats'; stats: string[] }
    | { type: 'related'; entity: string; foreignKey: string; limit?: number }
    | { type: 'activity'; limit?: number }
    | { type: 'custom'; component: string };
}
```

### Step 1.3: Create Schema Helper
```typescript
// /lib/schema/defineSchema.ts

import type { EntitySchema } from './types';

/**
 * Schema definition helper with defaults and validation.
 */
export function defineSchema<T = any>(config: EntitySchema<T>): EntitySchema<T> {
  // Apply defaults
  const schema: EntitySchema<T> = {
    ...config,
    
    data: {
      primaryKey: 'id',
      timestamps: {
        created: 'createdAt',
        updated: 'updatedAt',
      },
      ...config.data,
    },
    
    search: {
      enabled: true,
      minLength: 2,
      debounce: 300,
      ...config.search,
    },
    
    filters: {
      allowSave: true,
      ...config.filters,
    },
    
    layouts: {
      list: {
        pageSize: 25,
        pageSizeOptions: [10, 25, 50, 100],
        ...config.layouts.list,
      },
      ...config.layouts,
    },
    
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: true,
      ...config.permissions,
    },
  };
  
  // Validate schema
  validateSchema(schema);
  
  return schema;
}

function validateSchema(schema: EntitySchema): void {
  // Ensure SSOT compliance
  const errors: string[] = [];
  
  // Check that all form section fields exist in data.fields
  schema.layouts.form.sections.forEach(section => {
    section.fields.forEach(field => {
      const fieldName = typeof field === 'string' ? field : field.fields[0];
      if (!schema.data.fields[fieldName] && !schema.data.computed?.[fieldName]) {
        errors.push(`Form section "${section.key}" references undefined field "${fieldName}"`);
      }
    });
  });
  
  // Check that all table columns exist in data.fields
  if (schema.views.table) {
    schema.views.table.columns.forEach(col => {
      const fieldName = typeof col === 'string' ? col : col.field;
      if (!schema.data.fields[fieldName] && !schema.data.computed?.[fieldName]) {
        errors.push(`Table view references undefined column "${fieldName}"`);
      }
    });
  }
  
  // Check subpage queries reference valid fields
  schema.layouts.list.subpages.forEach(subpage => {
    if (subpage.query.where) {
      Object.keys(subpage.query.where).forEach(field => {
        if (!schema.data.fields[field] && field !== 'archived' && !field.startsWith('$')) {
          errors.push(`Subpage "${subpage.key}" query references undefined field "${field}"`);
        }
      });
    }
  });
  
  if (errors.length > 0) {
    console.error('Schema validation errors:', errors);
    throw new Error(`Schema "${schema.identity.name}" has ${errors.length} validation errors`);
  }
}
```

### Step 1.4: Create Generic CRUD Components
```typescript
// /lib/crud/components/CrudList.tsx

'use client';

import { EntitySchema } from '@/lib/schema/types';
import { useCrud } from '../hooks/useCrud';
import { useViewPreference } from '../hooks/useViewPreference';
import { EntityListLayout } from '@/lib/layouts/components/EntityListLayout';
import { ViewRenderer } from '@/lib/views/components/ViewRenderer';

interface CrudListProps {
  schema: EntitySchema;
  initialSubpage?: string;
}

/**
 * GENERIC LIST COMPONENT
 * 
 * Renders ANY entity list based on schema configuration.
 * NEVER add entity-specific logic here.
 */
export function CrudList({ schema, initialSubpage }: CrudListProps) {
  const [currentSubpage, setCurrentSubpage] = useState(
    initialSubpage || schema.layouts.list.subpages[0]?.key || 'all'
  );
  
  const [currentView, setCurrentView] = useViewPreference(
    schema.identity.slug,
    schema.layouts.list.defaultView
  );
  
  const subpageConfig = schema.layouts.list.subpages.find(s => s.key === currentSubpage);
  
  const crud = useCrud(schema, {
    query: subpageConfig?.query,
  });
  
  return (
    <EntityListLayout
      schema={schema}
      subpages={schema.layouts.list.subpages}
      currentSubpage={currentSubpage}
      onSubpageChange={setCurrentSubpage}
      currentView={currentView}
      onViewChange={setCurrentView}
      availableViews={subpageConfig?.availableViews || schema.layouts.list.availableViews}
    >
      <ViewRenderer
        schema={schema}
        viewType={currentView}
        viewConfig={schema.views[currentView]}
        data={crud.data}
        loading={crud.loading}
        error={crud.error}
        selection={crud.selection}
        onSelectionChange={crud.setSelection}
        pagination={crud.pagination}
        onPaginationChange={crud.setPagination}
        sort={crud.sort}
        onSortChange={crud.setSort}
      />
    </EntityListLayout>
  );
}

// /lib/crud/components/CrudDetail.tsx

'use client';

import { EntitySchema } from '@/lib/schema/types';
import { useCrud } from '../hooks/useCrud';
import { EntityDetailLayout } from '@/lib/layouts/components/EntityDetailLayout';
import { TabRenderer } from './TabRenderer';

interface CrudDetailProps {
  schema: EntitySchema;
  id: string;
  initialTab?: string;
}

/**
 * GENERIC DETAIL COMPONENT
 * 
 * Renders ANY entity detail view based on schema configuration.
 * NEVER add entity-specific logic here.
 */
export function CrudDetail({ schema, id, initialTab }: CrudDetailProps) {
  const [currentTab, setCurrentTab] = useState(
    initialTab || schema.layouts.detail.tabs[0]?.key || 'overview'
  );
  
  const { record, loading, error, refresh } = useCrud(schema).useRecord(id);
  
  if (loading) return <DetailSkeleton schema={schema} />;
  if (error) return <DetailError error={error} onRetry={refresh} />;
  if (!record) return <DetailNotFound schema={schema} />;
  
  const tabConfig = schema.layouts.detail.tabs.find(t => t.key === currentTab);
  
  return (
    <EntityDetailLayout
      schema={schema}
      record={record}
      tabs={schema.layouts.detail.tabs}
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      sidebar={schema.layouts.detail.sidebar}
    >
      <TabRenderer
        schema={schema}
        tabConfig={tabConfig}
        record={record}
        onRefresh={refresh}
      />
    </EntityDetailLayout>
  );
}

// /lib/crud/components/CrudForm.tsx

'use client';

import { EntitySchema } from '@/lib/schema/types';
import { useCrud } from '../hooks/useCrud';
import { EntityFormLayout } from '@/lib/layouts/components/EntityFormLayout';
import { DynamicForm } from './DynamicForm';

interface CrudFormProps {
  schema: EntitySchema;
  mode: 'create' | 'edit';
  id?: string;  // Required for edit mode
}

/**
 * GENERIC FORM COMPONENT
 * 
 * Renders ANY entity create/edit form based on schema configuration.
 * NEVER add entity-specific logic here.
 */
export function CrudForm({ schema, mode, id }: CrudFormProps) {
  const crud = useCrud(schema);
  const router = useRouter();
  
  // Load existing record for edit mode
  const { record, loading: recordLoading } = mode === 'edit' && id
    ? crud.useRecord(id)
    : { record: undefined, loading: false };
  
  const handleSubmit = async (data: any) => {
    try {
      if (mode === 'create') {
        const created = await crud.create(data);
        toast.success(`${schema.identity.name} created`);
        router.push(`/${schema.identity.slug}/${created.id}`);
      } else {
        await crud.update(id!, data);
        toast.success(`${schema.identity.name} updated`);
        router.push(`/${schema.identity.slug}/${id}`);
      }
    } catch (error) {
      toast.error(`Failed to ${mode} ${schema.identity.name}`);
      throw error;
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  if (mode === 'edit' && recordLoading) {
    return <FormSkeleton schema={schema} />;
  }
  
  return (
    <EntityFormLayout
      schema={schema}
      mode={mode}
      onCancel={handleCancel}
    >
      <DynamicForm
        schema={schema}
        mode={mode}
        initialData={record}
        onSubmit={handleSubmit}
        autosave={schema.layouts.form.autosave}
      />
    </EntityFormLayout>
  );
}
```

### Step 1.5: Create Generic Hook
```typescript
// /lib/crud/hooks/useCrud.ts

import { EntitySchema } from '@/lib/schema/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * GENERIC CRUD HOOK
 * 
 * Handles data operations for ANY entity based on schema.
 * NEVER add entity-specific logic here.
 */
export function useCrud<T = any>(schema: EntitySchema<T>, options?: CrudOptions) {
  const queryClient = useQueryClient();
  const endpoint = schema.data.endpoint;
  
  // Build query params from options
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    
    if (options?.query?.where) {
      params.set('where', JSON.stringify(options.query.where));
    }
    if (options?.query?.orderBy) {
      params.set('orderBy', JSON.stringify(options.query.orderBy));
    }
    if (options?.pagination) {
      params.set('page', String(options.pagination.page));
      params.set('pageSize', String(options.pagination.pageSize));
    }
    if (options?.search) {
      params.set('search', options.search);
    }
    
    return params.toString();
  }, [options]);
  
  // List query
  const listQuery = useQuery({
    queryKey: [schema.identity.slug, 'list', queryParams],
    queryFn: async () => {
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });
  
  // Single record hook
  const useRecord = (id: string) => {
    return useQuery({
      queryKey: [schema.identity.slug, 'record', id],
      queryFn: async () => {
        const res = await fetch(`${endpoint}/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      },
    });
  };
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<T>) => {
      // Apply beforeCreate hook
      let processedData = data;
      if (schema.hooks?.beforeCreate) {
        processedData = await schema.hooks.beforeCreate(data);
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });
      
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: async (record) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: [schema.identity.slug, 'list'] });
      
      // Apply afterCreate hook
      if (schema.hooks?.afterCreate) {
        await schema.hooks.afterCreate(record);
      }
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      // Apply beforeUpdate hook
      let processedData = data;
      if (schema.hooks?.beforeUpdate) {
        const existing = queryClient.getQueryData([schema.identity.slug, 'record', id]);
        processedData = await schema.hooks.beforeUpdate(id, data, existing as T);
      }
      
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });
      
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: async (record, { id, data }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [schema.identity.slug] });
      
      // Apply afterUpdate hook
      if (schema.hooks?.afterUpdate) {
        await schema.hooks.afterUpdate(record, data);
      }
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Apply beforeDelete hook
      if (schema.hooks?.beforeDelete) {
        const record = queryClient.getQueryData([schema.identity.slug, 'record', id]);
        const canDelete = await schema.hooks.beforeDelete(id, record as T);
        if (!canDelete) {
          throw new Error('Delete prevented by hook');
        }
      }
      
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      return id;
    },
    onSuccess: async (id) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [schema.identity.slug] });
      
      // Apply afterDelete hook
      if (schema.hooks?.afterDelete) {
        await schema.hooks.afterDelete(id);
      }
    },
  });
  
  return {
    // List data
    data: listQuery.data?.records || [],
    total: listQuery.data?.total || 0,
    loading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    
    // Single record
    useRecord,
    
    // Mutations
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<T>) => updateMutation.mutateAsync({ id, data }),
    delete: deleteMutation.mutateAsync,
    
    // Mutation states
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
    
    // Selection state (for bulk actions)
    selection: options?.selection || [],
    setSelection: options?.onSelectionChange,
    
    // Pagination state
    pagination: options?.pagination,
    setPagination: options?.onPaginationChange,
    
    // Sort state
    sort: options?.sort,
    setSort: options?.onSortChange,
  };
}

interface CrudOptions {
  query?: {
    where?: Record<string, any>;
    orderBy?: { field: string; direction: 'asc' | 'desc' };
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: any) => void;
  search?: string;
  sort?: { field: string; direction: 'asc' | 'desc' };
  onSortChange?: (sort: any) => void;
  selection?: string[];
  onSelectionChange?: (ids: string[]) => void;
}
```

### Step 1.6: Create Field Renderers
```typescript
// /lib/components/fields/index.tsx

/**
 * FIELD RENDERER REGISTRY
 * 
 * Maps field types to render components.
 * Add new field types here.
 */

import { FieldType, FieldDefinition } from '@/lib/schema/types';

// Import all field components
import { TextField } from './TextField';
import { TextareaField } from './TextareaField';
import { RichtextField } from './RichtextField';
import { NumberField } from './NumberField';
import { CurrencyField } from './CurrencyField';
import { SelectField } from './SelectField';
import { MultiselectField } from './MultiselectField';
import { DateField } from './DateField';
import { DatetimeField } from './DatetimeField';
import { RelationField } from './RelationField';
import { FileField } from './FileField';
import { ImageField } from './ImageField';
import { CheckboxField } from './CheckboxField';
import { SwitchField } from './SwitchField';
import { LocationField } from './LocationField';
import { ColorField } from './ColorField';
import { TagsField } from './TagsField';
// ... import all field types

export const fieldRenderers: Record<FieldType, React.ComponentType<FieldRenderProps>> = {
  text: TextField,
  textarea: TextareaField,
  richtext: RichtextField,
  number: NumberField,
  currency: CurrencyField,
  percentage: NumberField,  // Uses NumberField with % formatting
  email: TextField,         // Uses TextField with email validation
  phone: TextField,         // Uses TextField with phone formatting
  url: TextField,           // Uses TextField with URL validation
  select: SelectField,
  multiselect: MultiselectField,
  radio: SelectField,       // Uses SelectField with radio variant
  checkbox: CheckboxField,
  switch: SwitchField,
  date: DateField,
  datetime: DatetimeField,
  time: DatetimeField,      // Uses DatetimeField with time-only mode
  daterange: DateField,     // Uses DateField with range mode
  duration: NumberField,    // Uses NumberField with duration formatting
  file: FileField,
  image: ImageField,
  avatar: ImageField,       // Uses ImageField with circular crop
  gallery: ImageField,      // Uses ImageField with multi-upload
  relation: RelationField,
  location: LocationField,
  address: LocationField,   // Uses LocationField with address mode
  color: ColorField,
  rating: NumberField,      // Uses NumberField with star display
  tags: TagsField,
  json: TextareaField,      // Uses TextareaField with JSON formatting
  signature: ImageField,    // Uses ImageField with signature pad
  custom: () => null,       // Handled by schema.renderField
};

export interface FieldRenderProps {
  field: FieldDefinition;
  fieldKey: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  mode: 'create' | 'edit' | 'filter';
  record?: any;
}

/**
 * DYNAMIC FIELD RENDERER
 * 
 * Renders the appropriate field component based on field type.
 */
export function FieldRenderer(props: FieldRenderProps) {
  const { field, ...rest } = props;
  
  // Use custom renderer if provided
  if (field.renderField) {
    return field.renderField(props);
  }
  
  // Get renderer for field type
  const Renderer = fieldRenderers[field.type];
  
  if (!Renderer) {
    console.warn(`No renderer for field type: ${field.type}`);
    return null;
  }
  
  return <Renderer field={field} {...rest} />;
}
```

---

## PHASE 2: ENTITY MIGRATION

Now migrate each entity systematically.

### Step 2.1: Migration Template

For EACH entity, create a schema file following this template:
```typescript
// /schemas/[entity].schema.ts

import { defineSchema } from '@/lib/schema';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * [ENTITY NAME] SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * MIGRATION SOURCE FILES:
 * - components/[entity]/[Entity]Table.tsx → views.table
 * - components/[entity]/[Entity]Form.tsx → layouts.form + data.fields
 * - components/[entity]/[Entity]Card.tsx → views.gallery (card config)
 * - hooks/use[Entity].ts → (replaced by generic useCrud)
 * - hooks/use[Entity]s.ts → (replaced by generic useCrud)
 * - types/[entity].ts → data.fields types
 * 
 * AFTER MIGRATION, DELETE:
 * - All files listed above
 * - Any other entity-specific components
 */

export const [entity]Schema = defineSchema({
  // ═══════════════════════════════════════════════════════════════
  // IDENTITY
  // ═══════════════════════════════════════════════════════════════
  identity: {
    name: '[Entity]',
    namePlural: '[Entities]',
    slug: '[entities]',
    icon: '[icon-name]',
    color: '[color]',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // DATA
  // ═══════════════════════════════════════════════════════════════
  data: {
    endpoint: '/api/[entities]',
    
    fields: {
      // EXTRACT FROM: types/[entity].ts AND [Entity]Form.tsx
      
      id: {
        type: 'text',
        label: 'ID',
        inTable: false,
        inForm: false,
      },
      
      // ... define ALL fields here
    },
    
    computed: {
      // 3NF: Define computed fields that should NOT be stored
      // EXTRACT FROM: any derived values in existing components
    },
  },
  
  // ═══════════════════════════════════════════════════════════════
  // RELATIONSHIPS
  // ═══════════════════════════════════════════════════════════════
  relationships: {
    belongsTo: [
      // EXTRACT FROM: relation fields with single values
    ],
    hasMany: [
      // EXTRACT FROM: related entity queries in detail views
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════
  // DISPLAY
  // ═══════════════════════════════════════════════════════════════
  display: {
    // EXTRACT FROM: How entity is displayed in tables, cards, dropdowns
    title: (record) => record.name,
    subtitle: (record) => record.type,
    badge: (record) => record.status ? { label: record.status, variant: statusVariant(record.status) } : undefined,
    
    defaultSort: { field: 'createdAt', direction: 'desc' },
  },
  
  // ═══════════════════════════════════════════════════════════════
  // SEARCH & FILTERS
  // ═══════════════════════════════════════════════════════════════
  search: {
    // EXTRACT FROM: [Entity]Filters.tsx search functionality
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search [entities]...',
  },
  
  filters: {
    // EXTRACT FROM: [Entity]Filters.tsx filter controls
    quick: [
      // Convert existing tab filters to quick filters
    ],
    advanced: [
      // List filterable field names
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════
  // LAYOUTS
  // ═══════════════════════════════════════════════════════════════
  layouts: {
    list: {
      // IMPORTANT: Subpages are DATA SUBSETS, not status filters
      subpages: [
        {
          key: 'all',
          label: 'All',
          query: { where: { archived: false } },
          count: true,
        },
        {
          key: 'my-[entities]',
          label: 'My [Entities]',
          query: { where: { ownerId: '$currentUser', archived: false } },
          count: true,
        },
        {
          key: 'archived',
          label: 'Archived',
          query: { where: { archived: true } },
        },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'calendar'],  // Based on entity type
    },
    
    detail: {
      // IMPORTANT: Tabs are RELATED DATA, not categories
      tabs: [
        { key: 'overview', label: 'Overview', icon: 'layout-dashboard', content: { type: 'overview' } },
        // Add tabs for each hasMany relationship
      ],
      overview: {
        stats: [
          // EXTRACT FROM: Detail view header stats
        ],
        blocks: [
          // EXTRACT FROM: Detail view content sections
        ],
      },
      sidebar: {
        sections: [
          { key: 'actions', content: { type: 'quick-actions', actions: ['edit', 'duplicate', 'delete'] } },
          // Add more sidebar sections as needed
        ],
      },
    },
    
    form: {
      // EXTRACT FROM: [Entity]Form.tsx structure
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['name', 'type', 'status'],
        },
        // Add more sections based on existing form structure
      ],
      autosave: true,
    },
  },
  
  // ═══════════════════════════════════════════════════════════════
  // VIEWS
  // ═══════════════════════════════════════════════════════════════
  views: {
    table: {
      // EXTRACT FROM: [Entity]Table.tsx columns
      columns: [
        // List columns in order
      ],
      features: {
        selection: true,
        inlineEdit: true,
      },
    },
    
    // Add other view configs as needed
  },
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════
  actions: {
    // EXTRACT FROM: [Entity]Actions.tsx and row action menus
    row: [
      'view',
      'edit',
      'duplicate',
      // Add entity-specific actions
      'archive',
      'delete',
    ],
    bulk: [
      'archive',
      'delete',
      'export',
    ],
    global: [
      { key: 'create', label: 'Create [Entity]', icon: 'plus', handler: { type: 'navigate', path: '/[entities]/new' } },
      { key: 'import', label: 'Import', icon: 'upload', handler: { type: 'modal', component: 'ImportModal' } },
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════
  // PERMISSIONS
  // ═══════════════════════════════════════════════════════════════
  permissions: {
    // EXTRACT FROM: Existing permission checks
    create: (user) => ['admin', 'manager'].includes(user.role),
    update: (user, record) => user.role === 'admin' || record.ownerId === user.id,
    delete: (user) => user.role === 'admin',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════
  hooks: {
    // EXTRACT FROM: Existing mutation side effects
    beforeCreate: async (data) => ({
      ...data,
      createdBy: getCurrentUserId(),
    }),
    // Add other hooks as needed
  },
  
  // ═══════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════
  validate: (data, mode) => {
    // EXTRACT FROM: Existing form validation
    const errors: Record<string, string> = {};
    
    // Add cross-field validation
    
    return Object.keys(errors).length ? errors : undefined;
  },
});
```

### Step 2.2: Update Page Files

Replace verbose page files with minimal schema-based ones:
```typescript
// /app/[entities]/page.tsx

import { CrudList } from '@/lib/crud';
import { [entity]Schema } from '@/schemas/[entity].schema';

export default function [Entities]Page() {
  return <CrudList schema={[entity]Schema} />;
}

// /app/[entities]/new/page.tsx

import { CrudForm } from '@/lib/crud';
import { [entity]Schema } from '@/schemas/[entity].schema';

export default function New[Entity]Page() {
  return <CrudForm schema={[entity]Schema} mode="create" />;
}

// /app/[entities]/[id]/page.tsx

import { CrudDetail } from '@/lib/crud';
import { [entity]Schema } from '@/schemas/[entity].schema';

export default function [Entity]DetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={[entity]Schema} id={params.id} />;
}

// /app/[entities]/[id]/edit/page.tsx

import { CrudForm } from '@/lib/crud';
import { [entity]Schema } from '@/schemas/[entity].schema';

export default function Edit[Entity]Page({ params }: { params: { id: string } }) {
  return <CrudForm schema={[entity]Schema} mode="edit" id={params.id} />;
}
```

### Step 2.3: Deprecate Old Files
```bash
# For each entity, move old files to deprecated folder

# Components
mv components/[entity]/ migration/deprecated/components/[entity]/

# Hooks
mv hooks/use[Entity].ts migration/deprecated/hooks/
mv hooks/use[Entity]s.ts migration/deprecated/hooks/
mv hooks/use[Entity]Mutations.ts migration/deprecated/hooks/

# Types (if now redundant - may keep if used elsewhere)
mv types/[entity].ts migration/deprecated/types/
```

---

## PHASE 3: TESTING & VERIFICATION

### Step 3.1: Test Checklist per Entity
```markdown
## [Entity] Migration Test Checklist

### List View
- [ ] Page loads without errors
- [ ] Subpage navigation works correctly
- [ ] Default view renders data
- [ ] All available views render correctly
- [ ] Search functionality works
- [ ] Quick filters work
- [ ] Advanced filters work
- [ ] Sorting works on all sortable columns
- [ ] Pagination works
- [ ] Row selection works
- [ ] Row actions menu appears and works
- [ ] Bulk actions work
- [ ] Empty state displays correctly
- [ ] Loading state displays correctly
- [ ] Error state displays correctly

### Detail View
- [ ] Page loads without errors
- [ ] Header displays correct title/subtitle/badge
- [ ] Quick stats show correct values
- [ ] All tabs load correctly
- [ ] Overview tab displays all blocks
- [ ] Related entity tabs show correct data
- [ ] Sidebar sections load correctly
- [ ] Edit action works
- [ ] Delete action works with confirmation
- [ ] Other row actions work

### Create Form
- [ ] Page loads without errors
- [ ] All form sections render
- [ ] All fields render correctly
- [ ] Required field validation works
- [ ] Custom validation works
- [ ] Relation fields load options
- [ ] Form submits successfully
- [ ] Redirect after create works
- [ ] Cancel button works

### Edit Form
- [ ] Page loads without errors
- [ ] Data pre-populates correctly
- [ ] All changes save correctly
- [ ] Autosave works (if enabled)
- [ ] Cancel with dirty form shows warning

### Permissions
- [ ] Create button hidden when no permission
- [ ] Edit button hidden when no permission
- [ ] Delete button hidden when no permission
- [ ] API enforces permissions
```

### Step 3.2: SSOT Verification
```typescript
// Run this verification script after migration

function verifySSOT() {
  const violations: string[] = [];
  
  // Check for hardcoded entity names
  const files = glob.sync('**/*.{ts,tsx}', { ignore: ['node_modules/**', 'schemas/**'] });
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check for hardcoded column headers (should come from schema)
    if (/header:\s*['"][A-Z]/.test(content) && !file.includes('/lib/')) {
      violations.push(`${file}: Possible hardcoded column header`);
    }
    
    // Check for hardcoded field labels (should come from schema)
    if (/label:\s*['"][A-Z]/.test(content) && !file.includes('/lib/') && !file.includes('/schemas/')) {
      violations.push(`${file}: Possible hardcoded field label`);
    }
    
    // Check for entity-specific component files that should not exist
    if (/components\/\w+\/\w+(Table|Form|Card|List|Detail)\.tsx/.test(file)) {
      violations.push(`${file}: Entity-specific component should be deleted`);
    }
    
    // Check for entity-specific hooks that should not exist
    if (/hooks\/use[A-Z]\w+s?\.ts/.test(file) && !file.includes('/lib/')) {
      violations.push(`${file}: Entity-specific hook should be deleted`);
    }
  }
  
  if (violations.length > 0) {
    console.error('SSOT VIOLATIONS FOUND:');
    violations.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }
  
  console.log('✅ SSOT verification passed');
}
```

---

## PHASE 4: CLEANUP

### Step 4.1: Delete Deprecated Files

After all entities pass testing:
```bash
# Verify no imports from deprecated folder
grep -r "from.*deprecated" . --include="*.ts" --include="*.tsx"

# If no results, safe to delete
rm -rf migration/deprecated/
```

### Step 4.2: Remove Unused Dependencies
```bash
# Check for unused packages
npx depcheck

# Remove any entity-specific packages that are no longer needed
npm uninstall [unused-packages]
```

### Step 4.3: Final Verification
```bash
# Build check
npm run build

# Type check
npm run typecheck

# Lint check
npm run lint

# Test suite
npm run test
```

---

## MIGRATION PROGRESS TRACKING

Update this after each entity:
```markdown
| Entity | Schema | Pages | Tested | Old Files Deleted | Notes |
|--------|--------|-------|--------|-------------------|-------|
| Event | ✅ | ✅ | ✅ | ✅ | Complete |
| Venue | ✅ | ✅ | 🔄 | ❌ | Testing in progress |
| Client | ✅ | ❌ | ❌ | ❌ | Schema complete |
| Project | ❌ | ❌ | ❌ | ❌ | Not started |
| ... | | | | | |
```

## SUCCESS METRICS

Track these metrics before/after migration:

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Total TypeScript files | | | -70% |
| Total lines of code | | | -60% |
| Entity-specific components | | 0 | 0 |
| Entity-specific hooks | | 0 | 0 |
| Time to add new entity | 2-3 days | | <2 hours |
| Bug fix scope (files touched) | 50+ | | 1-3 |

---

## TROUBLESHOOTING

### Common Issues

**Issue: Field not rendering in table**
Check: Is `inTable: true` set in schema field definition?

**Issue: Field not appearing in form**
Check: Is `inForm: true` set? Is field in a form section?

**Issue: Relation field not loading options**
Check: Is relation.entity spelled correctly? Is endpoint accessible?

**Issue: Subpage showing wrong data**
Check: Is query.where correct? Are field names exact matches?

**Issue: Custom action not working**
Check: Is handler properly defined? Is condition returning true?

---

## FINAL NOTES

1. **Do NOT skip Phase 0** - Complete codebase analysis prevents missed files
2. **Do NOT rush Phase 1** - Generic system must be solid before migration
3. **Migrate ONE entity completely** before starting the next
4. **Test thoroughly** before deleting old files
5. **Keep deprecated folder** until production verification complete
6. **Update entity registry** after each step

This migration will take time but results in a dramatically more maintainable codebase.