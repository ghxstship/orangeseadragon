// /lib/navigation/ia-structure.ts

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL INFORMATION ARCHITECTURE - v5
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This is the SINGLE SOURCE OF TRUTH for all navigation.
 * All sidebar, page, and subpage rendering derives from this structure.
 *
 * v5 STRUCTURE (7 Modules, 57 Pages):
 * - CORE: Personal workspace (6 pages)
 * - PRODUCTIONS: Pre/post event lifecycle (8 pages)
 * - OPERATIONS: Run of show (7 pages)
 * - PEOPLE: Human resources (11 pages)
 * - ASSETS: Equipment & logistics (9 pages) - Catalog = Equipment SSOT
 * - BUSINESS: Revenue + relationships (8 pages) - Products & Services = Business SSOT
 * - FINANCE: Money in/out (8 pages)
 * - NETWORK: Community/social layer (header access, not sidebar)
 *
 * DESIGN PRINCIPLES:
 * - 3NF/SSOT compliance (zero data overlap)
 * - Cognitive load reduction (7±2 items per level)
 * - Workflow-based page ordering
 * - Catalog = Equipment (what you OWN)
 * - Products & Services = Business offerings (what you SELL)
 *
 * MODIFICATION RULES:
 * - Adding a page? It goes in ONE group only.
 * - Adding a subpage? It's defined in the page schema, not here.
 * - Adding a view mode? It's defined in the page schema views config.
 * - Need cross-linking? Use contextual links, not duplicate entries.
 *
 * See: /docs/OPTIMIZED_IA_STRUCTURE.md for full specification
 */

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1: SIDEBAR GROUPS (7 Modules + Settings)
// ─────────────────────────────────────────────────────────────────────────────

export type SidebarGroupKey =
  | 'core'          // Personal workspace
  | 'productions'   // Pre/post event lifecycle
  | 'advancing'     // Production advance coordination
  | 'operations'    // Run of show
  | 'people'        // Human resources
  | 'assets'        // Equipment & logistics
  | 'business'      // Revenue + relationships
  | 'finance'       // Money in/out
  | 'network'       // Community/social (header access)
  | 'settings';     // Configuration, preferences

export interface SidebarGroupDefinition {
  key: SidebarGroupKey;
  label: string;
  icon: string;
  description: string;

  // Pages in this group (references PageKey)
  pages: PageKey[];

  // Permissions
  permission?: string;

  // Display
  collapsible?: boolean;
  defaultExpanded?: boolean;

  // Badge (e.g., notification count)
  badge?: {
    type: 'count' | 'dot';
    source: string;  // API endpoint for count
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2: PAGES
// ─────────────────────────────────────────────────────────────────────────────

export type PageKey =
  // CORE (6 pages)
  | 'dashboard'
  | 'calendar'
  | 'tasks'
  | 'inbox'
  | 'documents'
  | 'workflows'
  // PRODUCTIONS (7 pages)
  | 'productions'
  | 'events'
  | 'activations'
  | 'build-strike'
  | 'compliance'
  | 'inspections'
  | 'punch-lists'
  // ADVANCING (5 pages)
  | 'advancing-dashboard'
  | 'advancing-advances'
  | 'advancing-items'
  | 'advancing-fulfillment'
  | 'advancing-vendors'
  // OPERATIONS (7 pages)
  | 'shows'
  | 'runsheets'
  | 'venues'
  | 'incidents'
  | 'work-orders'
  | 'daily-reports'
  | 'comms'
  // PEOPLE (11 pages)
  | 'rosters'
  | 'availability'
  | 'travel'
  | 'recruitment'
  | 'onboarding'
  | 'training'
  | 'scheduling'
  | 'timekeeping'
  | 'performance'
  | 'certifications'
  | 'positions'
  // ASSETS (8 pages)
  | 'catalog'
  | 'inventory'
  | 'locations'
  | 'reservations'
  | 'deployment'
  | 'logistics'
  | 'asset-status'
  | 'maintenance'
  // BUSINESS (8 pages)
  | 'pipeline'
  | 'companies'
  | 'proposals'
  | 'contracts'
  | 'products'
  | 'campaigns'
  | 'subscribers'
  | 'brand-kit'
  // FINANCE (8 pages)
  | 'budgets'
  | 'procurement'
  | 'expenses'
  | 'invoices'
  | 'payments'
  | 'payroll'
  | 'accounts'
  | 'reports'
  // NETWORK (header access)
  | 'connections'
  | 'discussions'
  | 'marketplace'
  | 'opportunities'
  | 'showcase'
  | 'challenges'
  // Settings
  | 'settings';

export interface PageDefinition {
  key: PageKey;
  path: string;
  label: string;
  icon: string;

  // Primary entity (for CRUD pages)
  entity?: string;  // References schema name

  // Page type
  type: 'dashboard' | 'entity-list' | 'entity-detail' | 'settings' | 'custom';

  // Subpages (LEVEL 3) - defined by key, actual config in schema
  subpages?: SubpageKey[];

  // Permissions
  permission?: string;

  // Badge
  badge?: {
    type: 'count' | 'dot' | 'status';
    source: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 3: SUBPAGES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subpages are DATA SUBSETS of the parent page entity.
 * They are NOT:
 * - Different entities (those are separate pages)
 * - Different views (those are view modes)
 * - Workflows (those are actions/modals)
 */

export type SubpageKey = string;  // Defined per-entity in schema

export interface SubpageDefinition {
  key: SubpageKey;
  label: string;
  icon?: string;

  // Data subset definition
  query: {
    where: Record<string, unknown>;
    orderBy?: { field: string; direction: 'asc' | 'desc' };
  };

  // Count badge
  showCount?: boolean;

  // Subpage-specific empty state
  emptyState?: {
    title: string;
    description: string;
    action?: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 4: CONTEXTUAL ELEMENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contextual elements appear within pages, not as navigation.
 * They include:
 * - Modals (create, edit, confirm)
 * - Drawers/Slide-overs (quick edit, preview)
 * - Popovers (quick actions, info)
 * - Inline sections (expandable details)
 */

export type ContextualType =
  | 'modal'
  | 'drawer'
  | 'popover'
  | 'inline'
  | 'sheet';

// Contextual elements are NOT defined in IA structure.
// They are defined in component/schema configurations.

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL IA DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

export const informationArchitecture: {
  groups: SidebarGroupDefinition[];
  pages: Record<PageKey, PageDefinition>;
} = {
  groups: [
    // ═══════════════════════════════════════════════════════════════
    // CORE - Personal Workspace (6 pages)
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'core',
      label: 'Core',
      icon: 'layout-dashboard',
      description: 'Personal workspace',
      pages: ['dashboard', 'calendar', 'tasks', 'inbox', 'documents', 'workflows'],
      collapsible: false,
      defaultExpanded: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // PRODUCTIONS - Pre/Post Event Lifecycle (7 pages)
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'productions',
      label: 'Productions',
      icon: 'clapperboard',
      description: 'Pre/post event lifecycle',
      pages: ['productions', 'events', 'activations', 'build-strike', 'compliance', 'inspections', 'punch-lists'],
      defaultExpanded: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // ADVANCING - Production Advance Coordination (5 pages)
    // Unified module for all advance coordination: technical, logistics,
    // hospitality, staffing, safety, marketing. Consolidates former
    // PRODUCTIONS > Advancing and ASSETS > Logistics > Advances.
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'advancing',
      label: 'Advancing',
      icon: 'clipboard-check',
      description: 'Production advance coordination',
      pages: ['advancing-dashboard', 'advancing-advances', 'advancing-items', 'advancing-fulfillment', 'advancing-vendors'],
      defaultExpanded: false,
    },

    // ═══════════════════════════════════════════════════════════════
    // OPERATIONS - Run of Show (7 pages)
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'operations',
      label: 'Operations',
      icon: 'clipboard-list',
      description: 'Run of show',
      pages: ['shows', 'runsheets', 'venues', 'incidents', 'work-orders', 'daily-reports', 'comms'],
    },

    // ═══════════════════════════════════════════════════════════════
    // PEOPLE - Human Resources (11 pages)
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'people',
      label: 'People',
      icon: 'users',
      description: 'Human resources',
      pages: ['rosters', 'availability', 'travel', 'recruitment', 'onboarding', 'training', 'scheduling', 'timekeeping', 'performance', 'certifications', 'positions'],
    },

    // ═══════════════════════════════════════════════════════════════
    // ASSETS - Equipment & Logistics (8 pages)
    // Catalog = Equipment SSOT (what you OWN)
    // Note: Advances moved to ADVANCING module for unified coordination
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'assets',
      label: 'Assets',
      icon: 'package',
      description: 'Equipment & logistics',
      pages: ['catalog', 'inventory', 'locations', 'reservations', 'deployment', 'logistics', 'asset-status', 'maintenance'],
    },

    // ═══════════════════════════════════════════════════════════════
    // BUSINESS - Revenue + Relationships (8 pages)
    // Products & Services = Business SSOT (what you SELL)
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'business',
      label: 'Business',
      icon: 'building-2',
      description: 'Revenue + relationships',
      pages: ['pipeline', 'companies', 'proposals', 'contracts', 'products', 'campaigns', 'subscribers', 'brand-kit'],
    },

    // ═══════════════════════════════════════════════════════════════
    // FINANCE - Money In/Out (8 pages)
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'finance',
      label: 'Finance',
      icon: 'dollar-sign',
      description: 'Money in/out',
      pages: ['budgets', 'procurement', 'expenses', 'invoices', 'payments', 'payroll', 'accounts', 'reports'],
      permission: 'finance:read',
    },

    // ═══════════════════════════════════════════════════════════════
    // NETWORK - Community/Social (Header Access)
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'network',
      label: 'Network',
      icon: 'link',
      description: 'Community & social',
      pages: ['connections', 'discussions', 'marketplace', 'opportunities', 'showcase', 'challenges'],
      collapsible: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // SETTINGS
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'settings',
      label: 'Settings',
      icon: 'settings',
      description: 'Configuration and preferences',
      pages: ['settings'],
      collapsible: false,
    },
  ],

  pages: {
    // ═══════════════════════════════════════════════════════════════
    // CORE PAGES
    // ═══════════════════════════════════════════════════════════════
    dashboard: {
      key: 'dashboard',
      path: '/core/dashboard',
      label: 'Dashboard',
      icon: 'layout-dashboard',
      type: 'dashboard',
    },
    calendar: {
      key: 'calendar',
      path: '/core/calendar',
      label: 'Calendar',
      icon: 'calendar',
      type: 'custom',
    },
    tasks: {
      key: 'tasks',
      path: '/core/tasks',
      label: 'Tasks',
      icon: 'check-square',
      entity: 'task',
      type: 'entity-list',
    },
    inbox: {
      key: 'inbox',
      path: '/core/inbox',
      label: 'Inbox',
      icon: 'inbox',
      type: 'custom',
    },
    documents: {
      key: 'documents',
      path: '/core/documents',
      label: 'Documents',
      icon: 'file-text',
      entity: 'document',
      type: 'entity-list',
    },
    workflows: {
      key: 'workflows',
      path: '/core/workflows',
      label: 'Workflows',
      icon: 'git-branch',
      entity: 'workflow',
      type: 'entity-list',
    },

    // ═══════════════════════════════════════════════════════════════
    // PRODUCTIONS PAGES
    // ═══════════════════════════════════════════════════════════════
    productions: {
      key: 'productions',
      path: '/productions',
      label: 'Productions',
      icon: 'clapperboard',
      entity: 'production',
      type: 'entity-list',
    },
    events: {
      key: 'events',
      path: '/productions/events',
      label: 'Events',
      icon: 'calendar',
      entity: 'event',
      type: 'entity-list',
    },
    activations: {
      key: 'activations',
      path: '/productions/activations',
      label: 'Activations',
      icon: 'award',
      entity: 'activation',
      type: 'entity-list',
    },
    'build-strike': {
      key: 'build-strike',
      path: '/productions/build-strike',
      label: 'Build & Strike',
      icon: 'wrench',
      entity: 'buildStrikeTask',
      type: 'entity-list',
    },
    compliance: {
      key: 'compliance',
      path: '/productions/compliance',
      label: 'Compliance',
      icon: 'clipboard-list',
      entity: 'permit',
      type: 'entity-list',
      subpages: ['permits', 'licenses', 'certificates'],
    },
    inspections: {
      key: 'inspections',
      path: '/productions/inspections',
      label: 'Inspections',
      icon: 'check-square',
      entity: 'inspection',
      type: 'entity-list',
    },
    'punch-lists': {
      key: 'punch-lists',
      path: '/productions/punch-lists',
      label: 'Punch Lists',
      icon: 'clipboard-list',
      entity: 'punchItem',
      type: 'entity-list',
    },

    // ═══════════════════════════════════════════════════════════════
    // ADVANCING PAGES
    // ═══════════════════════════════════════════════════════════════
    'advancing-dashboard': {
      key: 'advancing-dashboard',
      path: '/advancing',
      label: 'Dashboard',
      icon: 'layout-dashboard',
      type: 'dashboard',
    },
    'advancing-advances': {
      key: 'advancing-advances',
      path: '/advancing/advances',
      label: 'Advances',
      icon: 'clipboard-list',
      entity: 'productionAdvance',
      type: 'entity-list',
    },
    'advancing-items': {
      key: 'advancing-items',
      path: '/advancing/items',
      label: 'Items',
      icon: 'package',
      entity: 'advanceItem',
      type: 'entity-list',
      subpages: ['technical', 'logistics', 'hospitality', 'staffing', 'safety', 'marketing'],
    },
    'advancing-fulfillment': {
      key: 'advancing-fulfillment',
      path: '/advancing/fulfillment',
      label: 'Fulfillment',
      icon: 'truck',
      entity: 'advanceItemFulfillment',
      type: 'entity-list',
    },
    'advancing-vendors': {
      key: 'advancing-vendors',
      path: '/advancing/vendors',
      label: 'Vendors',
      icon: 'building-2',
      entity: 'company',
      type: 'entity-list',
      subpages: ['communications', 'performance'],
    },

    // ═══════════════════════════════════════════════════════════════
    // OPERATIONS PAGES
    // ═══════════════════════════════════════════════════════════════
    shows: {
      key: 'shows',
      path: '/operations/shows',
      label: 'Shows',
      icon: 'clapperboard',
      entity: 'show',
      type: 'entity-list',
    },
    runsheets: {
      key: 'runsheets',
      path: '/operations/runsheets',
      label: 'Runsheets',
      icon: 'clipboard-list',
      entity: 'runsheet',
      type: 'entity-list',
    },
    venues: {
      key: 'venues',
      path: '/operations/venues',
      label: 'Venues',
      icon: 'map-pin',
      entity: 'venue',
      type: 'entity-list',
      subpages: ['floor-plans', 'zones', 'checkpoints'],
    },
    incidents: {
      key: 'incidents',
      path: '/operations/incidents',
      label: 'Incidents',
      icon: 'clipboard-list',
      entity: 'incident',
      type: 'entity-list',
    },
    'work-orders': {
      key: 'work-orders',
      path: '/operations/work-orders',
      label: 'Work Orders',
      icon: 'wrench',
      entity: 'workOrder',
      type: 'entity-list',
    },
    'daily-reports': {
      key: 'daily-reports',
      path: '/operations/daily-reports',
      label: 'Daily Reports',
      icon: 'file-text',
      entity: 'dailyReport',
      type: 'entity-list',
    },
    comms: {
      key: 'comms',
      path: '/operations/comms',
      label: 'Comms',
      icon: 'message-square',
      entity: 'radioChannel',
      type: 'entity-list',
      subpages: ['radio', 'weather'],
    },

    // ═══════════════════════════════════════════════════════════════
    // PEOPLE PAGES
    // ═══════════════════════════════════════════════════════════════
    rosters: {
      key: 'rosters',
      path: '/people/rosters',
      label: 'Rosters',
      icon: 'users',
      entity: 'person',
      type: 'entity-list',
    },
    availability: {
      key: 'availability',
      path: '/people/availability',
      label: 'Availability',
      icon: 'calendar',
      entity: 'availability',
      type: 'entity-list',
    },
    travel: {
      key: 'travel',
      path: '/people/travel',
      label: 'Travel & Lodging',
      icon: 'map-pin',
      entity: 'travelRequest',
      type: 'entity-list',
      subpages: ['bookings', 'accommodations'],
    },
    recruitment: {
      key: 'recruitment',
      path: '/people/recruitment',
      label: 'Recruitment',
      icon: 'user-plus',
      entity: 'candidate',
      type: 'entity-list',
    },
    onboarding: {
      key: 'onboarding',
      path: '/people/onboarding',
      label: 'Onboarding',
      icon: 'check-square',
      entity: 'onboardingTask',
      type: 'entity-list',
    },
    training: {
      key: 'training',
      path: '/people/training',
      label: 'Training',
      icon: 'award',
      entity: 'trainingRecord',
      type: 'entity-list',
      subpages: ['courses', 'materials'],
    },
    scheduling: {
      key: 'scheduling',
      path: '/people/scheduling',
      label: 'Scheduling',
      icon: 'calendar',
      entity: 'schedule',
      type: 'entity-list',
      subpages: ['shifts'],
    },
    timekeeping: {
      key: 'timekeeping',
      path: '/people/timekeeping',
      label: 'Timekeeping',
      icon: 'clipboard-list',
      entity: 'timesheet',
      type: 'entity-list',
    },
    performance: {
      key: 'performance',
      path: '/people/performance',
      label: 'Performance',
      icon: 'bar-chart-3',
      entity: 'performanceReview',
      type: 'entity-list',
      subpages: ['reviews', 'goals'],
    },
    certifications: {
      key: 'certifications',
      path: '/people/certifications',
      label: 'Certifications',
      icon: 'award',
      entity: 'certification',
      type: 'entity-list',
    },
    positions: {
      key: 'positions',
      path: '/people/positions',
      label: 'Positions',
      icon: 'users',
      entity: 'position',
      type: 'entity-list',
    },

    // ═══════════════════════════════════════════════════════════════
    // ASSETS PAGES
    // ═══════════════════════════════════════════════════════════════
    catalog: {
      key: 'catalog',
      path: '/assets/catalog',
      label: 'Catalog',
      icon: 'package',
      entity: 'catalogItem',
      type: 'entity-list',
      subpages: ['categories'],
    },
    inventory: {
      key: 'inventory',
      path: '/assets/inventory',
      label: 'Inventory',
      icon: 'package',
      entity: 'asset',
      type: 'entity-list',
    },
    locations: {
      key: 'locations',
      path: '/assets/locations',
      label: 'Locations',
      icon: 'map-pin',
      entity: 'location',
      type: 'entity-list',
      subpages: ['warehouses', 'staging'],
    },
    reservations: {
      key: 'reservations',
      path: '/assets/reservations',
      label: 'Reservations',
      icon: 'calendar',
      entity: 'reservation',
      type: 'entity-list',
    },
    deployment: {
      key: 'deployment',
      path: '/assets/deployment',
      label: 'Deployment',
      icon: 'map-pin',
      entity: 'deployment',
      type: 'entity-list',
    },
    logistics: {
      key: 'logistics',
      path: '/assets/logistics',
      label: 'Logistics',
      icon: 'truck',
      entity: 'shipment',
      type: 'entity-list',
      subpages: ['shipments', 'vehicles'],
    },
    'asset-status': {
      key: 'asset-status',
      path: '/assets/status',
      label: 'Asset Status',
      icon: 'check-square',
      entity: 'assetStatus',
      type: 'entity-list',
      subpages: ['check', 'service'],
    },
    maintenance: {
      key: 'maintenance',
      path: '/assets/maintenance',
      label: 'Maintenance',
      icon: 'wrench',
      entity: 'maintenance',
      type: 'entity-list',
      subpages: ['scheduled', 'repairs'],
    },

    // ═══════════════════════════════════════════════════════════════
    // BUSINESS PAGES
    // ═══════════════════════════════════════════════════════════════
    pipeline: {
      key: 'pipeline',
      path: '/business/pipeline',
      label: 'Pipeline',
      icon: 'bar-chart-3',
      entity: 'deal',
      type: 'entity-list',
      subpages: ['leads', 'opportunities'],
    },
    companies: {
      key: 'companies',
      path: '/business/companies',
      label: 'Companies',
      icon: 'building-2',
      entity: 'company',
      type: 'entity-list',
      subpages: ['contacts'],
    },
    proposals: {
      key: 'proposals',
      path: '/business/proposals',
      label: 'Proposals',
      icon: 'file-text',
      entity: 'proposal',
      type: 'entity-list',
    },
    contracts: {
      key: 'contracts',
      path: '/business/contracts',
      label: 'Contracts',
      icon: 'file-text',
      entity: 'contract',
      type: 'entity-list',
    },
    products: {
      key: 'products',
      path: '/business/products',
      label: 'Products & Services',
      icon: 'shopping-cart',
      entity: 'product',
      type: 'entity-list',
      subpages: ['list', 'services'],
    },
    campaigns: {
      key: 'campaigns',
      path: '/business/campaigns',
      label: 'Campaigns',
      icon: 'mail',
      entity: 'campaign',
      type: 'entity-list',
      subpages: ['email', 'content', 'forms'],
    },
    subscribers: {
      key: 'subscribers',
      path: '/business/subscribers',
      label: 'Subscribers',
      icon: 'users',
      entity: 'subscriber',
      type: 'entity-list',
    },
    'brand-kit': {
      key: 'brand-kit',
      path: '/business/brand',
      label: 'Brand Kit',
      icon: 'palette',
      entity: 'brandAsset',
      type: 'entity-list',
      subpages: ['logos', 'colors', 'typography'],
    },

    // ═══════════════════════════════════════════════════════════════
    // FINANCE PAGES
    // ═══════════════════════════════════════════════════════════════
    budgets: {
      key: 'budgets',
      path: '/finance/budgets',
      label: 'Budgets',
      icon: 'dollar-sign',
      entity: 'budget',
      type: 'entity-list',
      subpages: ['line-items'],
      permission: 'finance:read',
    },
    procurement: {
      key: 'procurement',
      path: '/finance/procurement',
      label: 'Procurement',
      icon: 'shopping-cart',
      entity: 'purchaseOrder',
      type: 'entity-list',
      permission: 'finance:read',
    },
    expenses: {
      key: 'expenses',
      path: '/finance/expenses',
      label: 'Expenses',
      icon: 'credit-card',
      entity: 'expense',
      type: 'entity-list',
      permission: 'finance:read',
    },
    invoices: {
      key: 'invoices',
      path: '/finance/invoices',
      label: 'Invoices',
      icon: 'file-text',
      entity: 'invoice',
      type: 'entity-list',
      subpages: ['line-items', 'payments'],
      permission: 'finance:read',
    },
    payments: {
      key: 'payments',
      path: '/finance/payments',
      label: 'Payments',
      icon: 'credit-card',
      entity: 'payment',
      type: 'entity-list',
      subpages: ['incoming', 'outgoing'],
      permission: 'finance:read',
    },
    payroll: {
      key: 'payroll',
      path: '/finance/payroll',
      label: 'Payroll',
      icon: 'users',
      entity: 'payrollRun',
      type: 'entity-list',
      subpages: ['stubs'],
      permission: 'finance:read',
    },
    accounts: {
      key: 'accounts',
      path: '/finance/accounts',
      label: 'Accounts',
      icon: 'building-2',
      entity: 'account',
      type: 'entity-list',
      subpages: ['gl', 'bank'],
      permission: 'finance:read',
    },
    reports: {
      key: 'reports',
      path: '/finance/reports',
      label: 'Reports',
      icon: 'bar-chart-3',
      type: 'custom',
      subpages: ['pnl', 'cash-flow', 'ar-ap'],
      permission: 'finance:read',
    },

    // ═══════════════════════════════════════════════════════════════
    // NETWORK PAGES (Header Access)
    // ═══════════════════════════════════════════════════════════════
    connections: {
      key: 'connections',
      path: '/network/connections',
      label: 'Connections',
      icon: 'link',
      entity: 'connection',
      type: 'entity-list',
    },
    discussions: {
      key: 'discussions',
      path: '/network/discussions',
      label: 'Discussions',
      icon: 'message-circle',
      entity: 'discussion',
      type: 'entity-list',
    },
    marketplace: {
      key: 'marketplace',
      path: '/network/marketplace',
      label: 'Marketplace',
      icon: 'store',
      entity: 'marketplaceItem',
      type: 'entity-list',
    },
    opportunities: {
      key: 'opportunities',
      path: '/network/opportunities',
      label: 'Opportunities',
      icon: 'compass',
      entity: 'opportunity',
      type: 'entity-list',
    },
    showcase: {
      key: 'showcase',
      path: '/network/showcase',
      label: 'Showcase',
      icon: 'award',
      entity: 'showcase',
      type: 'entity-list',
    },
    challenges: {
      key: 'challenges',
      path: '/network/challenges',
      label: 'Challenges',
      icon: 'trophy',
      entity: 'challenge',
      type: 'entity-list',
    },

    // ═══════════════════════════════════════════════════════════════
    // SETTINGS
    // ═══════════════════════════════════════════════════════════════
    settings: {
      key: 'settings',
      path: '/settings',
      label: 'Settings',
      icon: 'settings',
      type: 'settings',
      subpages: ['general', 'account', 'team', 'integrations', 'billing'],
    },
  },
};
