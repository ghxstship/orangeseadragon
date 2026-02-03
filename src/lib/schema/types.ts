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
  | 'computed'
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
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp | string;
  };

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
    options?: Array<{ value: string; label: string }>; // Static options
    optionsEndpoint?: string;  // Dynamic options from API
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
    list?: ListViewConfig;
    grid?: GridViewConfig;
    kanban?: KanbanViewConfig;
    calendar?: CalendarViewConfig;
    timeline?: TimelineViewConfig;
    gantt?: GanttViewConfig;
    gallery?: GalleryViewConfig;
    map?: MapViewConfig;
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
    | { type: 'fields'; fields: string[]; editable?: boolean }
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
    columnVisibility?: boolean;
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

export interface ListViewConfig {
  titleField: string;
  subtitleField?: string;
  descriptionField?: string;
  avatarField?: string;
  badgeField?: string;
  metaFields?: string[];
  showChevron?: boolean;
}

export interface GridViewConfig {
  cardFields: string[];
  imageField?: string;
  titleField: string;
  subtitleField?: string;
  badgeField?: string;
  columns?: number;
}

export interface GanttViewConfig {
  startField: string;
  endField: string;
  titleField: string;
  progressField?: string;
  dependenciesField?: string;
  assigneeField?: string;
}

export type ColumnFormat =
  | { type: 'text' }
  | { type: 'number'; decimals?: number }
  | { type: 'currency'; currency?: string }
  | { type: 'percentage'; decimals?: number }
  | { type: 'date'; format?: string }
  | { type: 'datetime'; format?: string }
  | { type: 'boolean'; trueLabel?: string; falseLabel?: string }
  | { type: 'badge'; colorMap?: Record<string, string> }
  | { type: 'link'; hrefField?: string }
  | { type: 'avatar'; fallbackField?: string }
  | { type: 'custom'; render?: string };

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
    | { type: 'function'; fn: (record: any, context: ActionContext) => void | Promise<void> }
    | { type: 'external'; url: string | ((record: any) => string) };
  
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
  prefix?: string;
  suffix?: string;
  
  trend?: {
    compare: 'previous-period' | 'target' | { field: string };
    direction?: boolean;
    percentage?: boolean;
  };
  
  onClick?: { tab: string } | { navigate: string };
}

export interface OverviewBlockDefinition {
  key: string;
  span?: number;
  title?: string;
  
  content: 
    | { type: 'fields'; fields: string[]; editable?: boolean }
    | { type: 'stats'; stats: string[] }
    | { type: 'chart'; chartType: string; data: any }
    | { type: 'custom'; component: string; props?: any };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER PROP TYPES (for custom field rendering)
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldRenderProps {
  field: FieldDefinition;
  fieldKey: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  mode: 'create' | 'edit' | 'table' | 'detail' | 'filter';
  record?: any;
}

export interface CellRenderProps {
  field: FieldDefinition;
  value: any;
  record: any;
  onChange?: (value: any) => void;
}

export interface DetailRenderProps {
  field: FieldDefinition;
  value: any;
  record: any;
  onChange?: (value: any) => void;
}

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
