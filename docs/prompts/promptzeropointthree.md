# ═══════════════════════════════════════════════════════════════════════════════
# CODEBASE CONSOLIDATION & INFORMATION ARCHITECTURE HARDENING
# ═══════════════════════════════════════════════════════════════════════════════
#
# OBJECTIVE: Eliminate redundant pages, consolidate overlapping datasets,
# enforce strict 3NF single source of truth, and establish rigid IA hierarchy
#
# OUTCOME: Minimal, logical navigation with zero data duplication
#
# ═══════════════════════════════════════════════════════════════════════════════

## GOVERNING PRINCIPLES

### PRINCIPLE 1: ONE ENTITY, ONE PAGE
```
Every entity type has EXACTLY ONE primary page.
All views of that entity live as subpages or view modes, NOT separate pages.

❌ VIOLATION: /events AND /calendar AND /upcoming-events (3 pages showing events)
❌ VIOLATION: /team AND /staff AND /crew (3 pages showing people)
❌ VIOLATION: /projects AND /active-projects AND /my-projects (3 pages for projects)

✅ CORRECT: /events with subpages [All, Upcoming, Calendar View, My Events]
✅ CORRECT: /team with subpages [All Members, By Department, Contractors]
✅ CORRECT: /projects with subpages [All, Active, My Projects, Archived]
```

### PRINCIPLE 2: STRICT IA HIERARCHY
```
4 LEVELS ONLY - No exceptions:

LEVEL 1: SIDEBAR GROUPS (Functional domains)
    └── LEVEL 2: PAGES (Primary entities)
            └── LEVEL 3: SUBPAGES (Data subsets via tabs/nav)
                    └── LEVEL 4: CONTEXTUAL (Modals, drawers, inline)

Data NEVER appears at multiple levels.
If it's a subpage, it's NOT also a page.
If it's contextual, it's NOT also a subpage.
```

### PRINCIPLE 3: 3NF DATA ARCHITECTURE
```
FIRST NORMAL FORM (1NF): No repeating groups
- Each page represents ONE entity type
- No "combined" pages showing multiple unrelated entities

SECOND NORMAL FORM (2NF): No partial dependencies
- Subpages depend ENTIRELY on the parent page entity
- No subpage that could exist independently

THIRD NORMAL FORM (3NF): No transitive dependencies
- No page that exists only because another page references it
- No duplicate data views across different pages
- Computed/derived views are subpages, not pages
```

### PRINCIPLE 4: NAVIGATION REFLECTS DATA, NOT WORKFLOW
```
Navigation structure follows DATA HIERARCHY, not user workflows.
Workflows are handled through contextual actions and cross-links.

❌ VIOLATION: /onboarding/add-team-member (workflow as page)
❌ VIOLATION: /reports/generate (action as page)
❌ VIOLATION: /quick-actions/send-invoice (shortcut as page)

✅ CORRECT: /team → "Add Member" action opens modal
✅ CORRECT: /reports → subpage or view mode, generation is an action
✅ CORRECT: /invoices → "Send" is a row action
```

---

## PHASE 0: COMPREHENSIVE IA AUDIT

### Step 0.1: Map Current Navigation Structure
```bash
# Generate complete route inventory
echo "=== ALL ROUTES ===" > ia_audit.txt
find ./app -name "page.tsx" | sed 's|./app||' | sed 's|/page.tsx||' | sort >> ia_audit.txt

# Count routes
echo "\n=== ROUTE COUNT ===" >> ia_audit.txt
find ./app -name "page.tsx" | wc -l >> ia_audit.txt

# Find potential duplicates (similar names)
echo "\n=== POTENTIAL DUPLICATES ===" >> ia_audit.txt
find ./app -name "page.tsx" | sed 's|./app||' | sed 's|/page.tsx||' | \
  xargs -I {} basename {} | sort | uniq -d >> ia_audit.txt
```

### Step 0.2: Create Route Analysis Document
```typescript
// /migration/ia-audit.ts

/**
 * INFORMATION ARCHITECTURE AUDIT
 * 
 * Document ALL current routes and classify them.
 */

interface RouteAudit {
  path: string;
  currentLevel: 'group' | 'page' | 'subpage' | 'contextual' | 'unknown';
  primaryEntity: string | null;
  dataSource: string;  // API endpoint or data source
  overlapsWithRoutes: string[];
  recommendation: 'keep' | 'merge' | 'demote' | 'promote' | 'delete';
  mergeInto?: string;
  notes: string;
}

export const routeAudit: RouteAudit[] = [
  // ═══════════════════════════════════════════════════════════════
  // EXAMPLE AUDIT ENTRIES - POPULATE WITH ACTUAL ROUTES
  // ═══════════════════════════════════════════════════════════════
  
  // REDUNDANT ROUTE EXAMPLE
  {
    path: '/events',
    currentLevel: 'page',
    primaryEntity: 'Event',
    dataSource: '/api/events',
    overlapsWithRoutes: ['/calendar', '/upcoming', '/my-events'],
    recommendation: 'keep',
    notes: 'Primary event page - absorb calendar, upcoming, my-events as subpages',
  },
  {
    path: '/calendar',
    currentLevel: 'page',
    primaryEntity: 'Event',
    dataSource: '/api/events',
    overlapsWithRoutes: ['/events'],
    recommendation: 'merge',
    mergeInto: '/events',
    notes: 'Calendar is a VIEW of events, not a separate entity. Becomes view mode.',
  },
  {
    path: '/upcoming',
    currentLevel: 'page',
    primaryEntity: 'Event',
    dataSource: '/api/events?filter=upcoming',
    overlapsWithRoutes: ['/events'],
    recommendation: 'merge',
    mergeInto: '/events',
    notes: 'Upcoming is a FILTER of events, not a separate entity. Becomes subpage.',
  },
  {
    path: '/my-events',
    currentLevel: 'page',
    primaryEntity: 'Event',
    dataSource: '/api/events?filter=mine',
    overlapsWithRoutes: ['/events'],
    recommendation: 'merge',
    mergeInto: '/events',
    notes: 'My Events is a FILTER of events. Becomes subpage.',
  },
  
  // MISPLACED LEVEL EXAMPLE
  {
    path: '/settings/team-permissions',
    currentLevel: 'page',
    primaryEntity: 'Permission',
    dataSource: '/api/permissions',
    overlapsWithRoutes: ['/team'],
    recommendation: 'demote',
    mergeInto: '/team',
    notes: 'Permissions are contextual to team. Becomes tab on team member detail.',
  },
  
  // WORKFLOW-AS-PAGE EXAMPLE
  {
    path: '/onboarding',
    currentLevel: 'page',
    primaryEntity: null,
    dataSource: 'multiple',
    overlapsWithRoutes: [],
    recommendation: 'delete',
    notes: 'Onboarding is a workflow, not a data page. Convert to modal/wizard.',
  },
  
  // POPULATE ALL ROUTES FROM YOUR CODEBASE
  // ...
];
```

### Step 0.3: Identify Overlapping Data Sources
```typescript
// /migration/data-source-analysis.ts

/**
 * DATA SOURCE OVERLAP ANALYSIS
 * 
 * Find all routes that query the same or similar data.
 */

interface DataSourceMapping {
  endpoint: string;
  entity: string;
  usedByRoutes: string[];
  filterVariations: {
    route: string;
    filter: Record<string, any>;
  }[];
}

// Analyze API calls in each page to build this mapping
export const dataSourceMap: DataSourceMapping[] = [
  {
    endpoint: '/api/events',
    entity: 'Event',
    usedByRoutes: [
      '/events',
      '/calendar',
      '/upcoming',
      '/my-events',
      '/dashboard',  // Widget
      '/projects/[id]',  // Related events
    ],
    filterVariations: [
      { route: '/events', filter: { archived: false } },
      { route: '/calendar', filter: { archived: false } },  // Same data, different view
      { route: '/upcoming', filter: { startDate: { gte: 'now' } } },
      { route: '/my-events', filter: { assignedTo: '$currentUser' } },
    ],
  },
  // ... analyze all endpoints
];

/**
 * OVERLAP DETECTION RULES:
 * 
 * 1. Same endpoint, no filter difference = DEFINITE DUPLICATE
 * 2. Same endpoint, filter difference = SHOULD BE SUBPAGE
 * 3. Same endpoint, view difference = SHOULD BE VIEW MODE
 * 4. Different endpoint, same entity = POTENTIAL CONSOLIDATION
 */
```

### Step 0.4: Create Sidebar Group Analysis
```typescript
// /migration/sidebar-analysis.ts

/**
 * SIDEBAR GROUP ANALYSIS
 * 
 * Current vs. Proposed sidebar structure.
 */

interface SidebarGroup {
  key: string;
  label: string;
  icon: string;
  pages: string[];
  
  // Analysis
  hasOverlap: boolean;
  overlapDetails?: string;
  recommendation: 'keep' | 'merge' | 'split' | 'rename';
}

// DOCUMENT CURRENT SIDEBAR
export const currentSidebar: SidebarGroup[] = [
  // POPULATE FROM CURRENT SIDEBAR CONFIGURATION
];

// PROPOSED CONSOLIDATED SIDEBAR
export const proposedSidebar: SidebarGroup[] = [
  // Will be defined after analysis
];
```

---

## PHASE 1: DEFINE TARGET IA STRUCTURE

### Step 1.1: Canonical IA Hierarchy Definition
```typescript
// /lib/navigation/ia-structure.ts

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL INFORMATION ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This is the SINGLE SOURCE OF TRUTH for all navigation.
 * All sidebar, page, and subpage rendering derives from this structure.
 * 
 * MODIFICATION RULES:
 * - Adding a page? It goes in ONE group only.
 * - Adding a subpage? It's defined in the page schema, not here.
 * - Adding a view mode? It's defined in the page schema views config.
 * - Need cross-linking? Use contextual links, not duplicate entries.
 */

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1: SIDEBAR GROUPS
// ─────────────────────────────────────────────────────────────────────────────

export type SidebarGroupKey = 
  | 'overview'      // Dashboard, home, quick access
  | 'production'    // Events, projects, schedules
  | 'operations'    // Venues, inventory, logistics
  | 'people'        // Team, clients, contacts
  | 'finance'       // Budgets, invoices, payments
  | 'content'       // Files, documents, media
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
  // Overview
  | 'dashboard'
  // Production
  | 'events'
  | 'projects'
  // Operations
  | 'venues'
  | 'inventory'
  // People
  | 'team'
  | 'clients'
  | 'contacts'
  // Finance
  | 'budgets'
  | 'invoices'
  // Content
  | 'files'
  | 'documents'
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
    where: Record<string, any>;
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
    // OVERVIEW GROUP
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'overview',
      label: 'Overview',
      icon: 'layout-dashboard',
      description: 'Dashboard and quick access',
      pages: ['dashboard'],
      collapsible: false,
    },
    
    // ═══════════════════════════════════════════════════════════════
    // PRODUCTION GROUP
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'production',
      label: 'Production',
      icon: 'calendar-event',
      description: 'Events, projects, and schedules',
      pages: ['events', 'projects'],
      defaultExpanded: true,
    },
    
    // ═══════════════════════════════════════════════════════════════
    // OPERATIONS GROUP
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'operations',
      label: 'Operations',
      icon: 'building',
      description: 'Venues, inventory, and logistics',
      pages: ['venues', 'inventory'],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // PEOPLE GROUP
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'people',
      label: 'People',
      icon: 'users',
      description: 'Team members, clients, and contacts',
      pages: ['team', 'clients', 'contacts'],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // FINANCE GROUP
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'finance',
      label: 'Finance',
      icon: 'calculator',
      description: 'Budgets, invoices, and payments',
      pages: ['budgets', 'invoices'],
      permission: 'finance:read',
    },
    
    // ═══════════════════════════════════════════════════════════════
    // CONTENT GROUP
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'content',
      label: 'Content',
      icon: 'folder',
      description: 'Files, documents, and media',
      pages: ['files', 'documents'],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // SETTINGS GROUP
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
    // DASHBOARD
    // ═══════════════════════════════════════════════════════════════
    dashboard: {
      key: 'dashboard',
      path: '/',
      label: 'Dashboard',
      icon: 'layout-dashboard',
      type: 'dashboard',
      // Dashboard has NO subpages - it's a unified view
    },
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTS (Consolidated from: /events, /calendar, /upcoming, /my-events)
    // ═══════════════════════════════════════════════════════════════
    events: {
      key: 'events',
      path: '/events',
      label: 'Events',
      icon: 'calendar-event',
      entity: 'event',
      type: 'entity-list',
      // Subpages defined in event.schema.ts layouts.list.subpages
      subpages: ['all', 'upcoming', 'my-events', 'drafts', 'archived'],
      badge: { type: 'count', source: '/api/events/count?filter=upcoming' },
    },
    
    // ═══════════════════════════════════════════════════════════════
    // PROJECTS
    // ═══════════════════════════════════════════════════════════════
    projects: {
      key: 'projects',
      path: '/projects',
      label: 'Projects',
      icon: 'folder-kanban',
      entity: 'project',
      type: 'entity-list',
      subpages: ['all', 'active', 'my-projects', 'archived'],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // VENUES
    // ═══════════════════════════════════════════════════════════════
    venues: {
      key: 'venues',
      path: '/venues',
      label: 'Venues',
      icon: 'building',
      entity: 'venue',
      type: 'entity-list',
      subpages: ['all', 'favorites', 'archived'],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // INVENTORY
    // ═══════════════════════════════════════════════════════════════
    inventory: {
      key: 'inventory',
      path: '/inventory',
      label: 'Inventory',
      icon: 'package',
      entity: 'inventoryItem',
      type: 'entity-list',
      subpages: ['all', 'in-stock', 'low-stock', 'checked-out'],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // TEAM (Consolidated from: /team, /staff, /crew)
    // ═══════════════════════════════════════════════════════════════
    team: {
      key: 'team',
      path: '/team',
      label: 'Team',
      icon: 'users',
      entity: 'teamMember',
      type: 'entity-list',
      subpages: ['all', 'by-department', 'contractors', 'inactive'],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // CLIENTS
    // ═══════════════════════════════════════════════════════════════
    clients: {
      key: 'clients',
      path: '/clients',
      label: 'Clients',
      icon: 'briefcase',
      entity: 'client',
      type: 'entity-list',
      subpages: ['all', 'active', 'prospects', 'archived'],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // CONTACTS
    // ═══════════════════════════════════════════════════════════════
    contacts: {
      key: 'contacts',
      path: '/contacts',
      label: 'Contacts',
      icon: 'contact',
      entity: 'contact',
      type: 'entity-list',
      subpages: ['all', 'vendors', 'partners', 'archived'],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // BUDGETS
    // ═══════════════════════════════════════════════════════════════
    budgets: {
      key: 'budgets',
      path: '/budgets',
      label: 'Budgets',
      icon: 'wallet',
      entity: 'budget',
      type: 'entity-list',
      subpages: ['all', 'active', 'over-budget', 'closed'],
      permission: 'finance:read',
    },
    
    // ═══════════════════════════════════════════════════════════════
    // INVOICES
    // ═══════════════════════════════════════════════════════════════
    invoices: {
      key: 'invoices',
      path: '/invoices',
      label: 'Invoices',
      icon: 'receipt',
      entity: 'invoice',
      type: 'entity-list',
      subpages: ['all', 'pending', 'overdue', 'paid'],
      permission: 'finance:read',
      badge: { type: 'count', source: '/api/invoices/count?filter=overdue' },
    },
    
    // ═══════════════════════════════════════════════════════════════
    // FILES
    // ═══════════════════════════════════════════════════════════════
    files: {
      key: 'files',
      path: '/files',
      label: 'Files',
      icon: 'folder',
      entity: 'file',
      type: 'entity-list',
      subpages: ['all', 'recent', 'shared', 'archived'],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // DOCUMENTS
    // ═══════════════════════════════════════════════════════════════
    documents: {
      key: 'documents',
      path: '/documents',
      label: 'Documents',
      icon: 'file-text',
      entity: 'document',
      type: 'entity-list',
      subpages: ['all', 'templates', 'contracts', 'archived'],
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
      // Settings subpages are sections, not data subsets
      subpages: ['general', 'account', 'team', 'integrations', 'billing'],
    },
  },
};
```

### Step 1.2: Define Consolidation Rules
```typescript
// /lib/navigation/consolidation-rules.ts

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONSOLIDATION RULES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Rules for determining when pages should be consolidated.
 */

export const consolidationRules = {
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 1: SAME ENTITY = SAME PAGE
  // ─────────────────────────────────────────────────────────────────────────
  sameEntity: {
    description: 'Pages showing the same entity type MUST be consolidated',
    examples: [
      { 
        redundant: ['/events', '/calendar', '/upcoming-events'],
        consolidateTo: '/events',
        reason: 'All show Event entities',
      },
      {
        redundant: ['/team', '/staff', '/crew', '/personnel'],
        consolidateTo: '/team',
        reason: 'All show TeamMember entities',
      },
    ],
    action: 'MERGE into primary page, convert others to subpages or view modes',
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 2: FILTERED VIEW = SUBPAGE
  // ─────────────────────────────────────────────────────────────────────────
  filteredView: {
    description: 'A page that is just a filtered view of another entity MUST become a subpage',
    examples: [
      {
        redundant: '/my-events',
        consolidateTo: '/events',
        asSubpage: 'my-events',
        reason: 'Just events filtered by assignee',
      },
      {
        redundant: '/overdue-invoices',
        consolidateTo: '/invoices',
        asSubpage: 'overdue',
        reason: 'Just invoices filtered by due date',
      },
    ],
    action: 'DELETE page, ADD as subpage with appropriate query filter',
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 3: DIFFERENT VISUALIZATION = VIEW MODE
  // ─────────────────────────────────────────────────────────────────────────
  differentVisualization: {
    description: 'A page showing same data in different visual format is a VIEW MODE, not a page',
    examples: [
      {
        redundant: '/calendar',
        consolidateTo: '/events',
        asViewMode: 'calendar',
        reason: 'Calendar is a visualization of events',
      },
      {
        redundant: '/kanban',
        consolidateTo: '/projects',
        asViewMode: 'kanban',
        reason: 'Kanban is a visualization of projects',
      },
      {
        redundant: '/map',
        consolidateTo: '/venues',
        asViewMode: 'map',
        reason: 'Map is a visualization of venues',
      },
    ],
    action: 'DELETE page, ADD as available view in schema.layouts.list.availableViews',
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 4: CHILD ENTITY = TAB ON PARENT DETAIL
  // ─────────────────────────────────────────────────────────────────────────
  childEntity: {
    description: 'Entities that only exist in context of a parent should be TABS, not pages',
    examples: [
      {
        redundant: '/event-schedule',
        consolidateTo: '/events/[id]',
        asTab: 'schedule',
        reason: 'Schedule items only exist for an event',
      },
      {
        redundant: '/project-tasks',
        consolidateTo: '/projects/[id]',
        asTab: 'tasks',
        reason: 'Tasks only exist within a project context',
      },
    ],
    action: 'DELETE page, ADD as tab in parent detail layout',
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 5: WORKFLOW = ACTION/MODAL
  // ─────────────────────────────────────────────────────────────────────────
  workflowAsPage: {
    description: 'Workflows and processes are ACTIONS, not pages',
    examples: [
      {
        redundant: '/onboarding',
        replaceWith: 'Onboarding wizard modal triggered from relevant context',
      },
      {
        redundant: '/import-data',
        replaceWith: 'Import modal triggered from page toolbar',
      },
      {
        redundant: '/generate-report',
        replaceWith: 'Report generation action on relevant entity',
      },
    ],
    action: 'DELETE page, IMPLEMENT as modal/wizard/action',
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 6: AGGREGATE VIEW = DASHBOARD WIDGET
  // ─────────────────────────────────────────────────────────────────────────
  aggregateView: {
    description: 'Pages showing aggregated/summary data are DASHBOARD WIDGETS',
    examples: [
      {
        redundant: '/overview',
        replaceWith: 'Dashboard widgets',
      },
      {
        redundant: '/statistics',
        replaceWith: 'Dashboard analytics section',
      },
      {
        redundant: '/activity',
        replaceWith: 'Activity widget on dashboard + entity detail sidebars',
      },
    ],
    action: 'DELETE page, ADD as dashboard widget or sidebar section',
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 7: CROSS-ENTITY REPORT = REPORT SECTION
  // ─────────────────────────────────────────────────────────────────────────
  crossEntityReport: {
    description: 'Reports spanning multiple entities belong in a Reports section, not scattered pages',
    examples: [
      {
        redundant: ['/financial-summary', '/budget-report', '/revenue-report'],
        consolidateTo: '/reports',
        asSubpage: 'financial',
        reason: 'All are financial reports',
      },
    ],
    action: 'IF reports section exists, consolidate there. IF NOT, consider dashboard widgets.',
  },
};
```

### Step 1.3: Define Page Type Decision Tree
```typescript
// /lib/navigation/decision-tree.ts

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAGE LEVEL DECISION TREE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Use this flowchart to determine where content should live.
 */

export const decisionTree = `
START: You have content to add to the application
  │
  ├─► Q1: Is this content a distinct data entity?
  │   │
  │   ├─► YES: Does this entity have its own API endpoint?
  │   │   │
  │   │   ├─► YES: Is this entity standalone (not child of another)?
  │   │   │   │
  │   │   │   ├─► YES ──────────────────────► LEVEL 2: PAGE
  │   │   │   │                                 Create as top-level page in sidebar
  │   │   │   │
  │   │   │   └─► NO (Child entity) ────────► LEVEL 3: TAB on parent detail
  │   │   │                                     Add as tab in parent's detail view
  │   │   │
  │   │   └─► NO (No own endpoint) ─────────► LEVEL 4: CONTEXTUAL
  │   │                                         Inline section or modal
  │   │
  │   └─► NO: Is this a different VIEW of existing data?
  │       │
  │       ├─► YES: Same data, different visualization?
  │       │   │
  │       │   ├─► YES (e.g., Calendar vs Table) ► VIEW MODE
  │       │   │                                     Add to availableViews
  │       │   │
  │       │   └─► NO: Same data, different filter?
  │       │       │
  │       │       └─► YES (e.g., "My Items") ──► LEVEL 3: SUBPAGE
  │       │                                       Add to subpages with query filter
  │       │
  │       └─► NO: Is this a workflow/process?
  │           │
  │           ├─► YES ──────────────────────────► LEVEL 4: MODAL/WIZARD
  │           │                                     Implement as action-triggered UI
  │           │
  │           └─► NO: Is this aggregate/summary data?
  │               │
  │               ├─► YES ──────────────────────► DASHBOARD WIDGET
  │               │                                 Add to dashboard or sidebar
  │               │
  │               └─► NO ───────────────────────► REVIEW REQUIREMENTS
  │                                                 Content may not be needed
  │
  └─► Q2: Which SIDEBAR GROUP does this belong to?
      │
      ├─► Production (events, projects, schedules)
      ├─► Operations (venues, inventory, logistics)
      ├─► People (team, clients, contacts)
      ├─► Finance (budgets, invoices, payments)
      ├─► Content (files, documents, media)
      └─► Settings (configuration, preferences)
`;
```

---

## PHASE 2: EXECUTE CONSOLIDATION

### Step 2.1: Create Route Redirect Map
```typescript
// /lib/navigation/redirects.ts

/**
 * REDIRECT MAP
 * 
 * Maps old routes to new consolidated routes.
 * Used for:
 * 1. Next.js redirects in next.config.js
 * 2. In-app navigation migration
 * 3. Bookmarks/external links
 */

export interface RouteRedirect {
  from: string;
  to: string;
  permanent: boolean;
  preserveQuery?: boolean;
  queryMapping?: Record<string, string>;  // Map old query params to new
}

export const routeRedirects: RouteRedirect[] = [
  // ═══════════════════════════════════════════════════════════════
  // EVENT CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/calendar',
    to: '/events?view=calendar',
    permanent: true,
  },
  {
    from: '/upcoming',
    to: '/events?subpage=upcoming',
    permanent: true,
  },
  {
    from: '/upcoming-events',
    to: '/events?subpage=upcoming',
    permanent: true,
  },
  {
    from: '/my-events',
    to: '/events?subpage=my-events',
    permanent: true,
  },
  {
    from: '/event-calendar',
    to: '/events?view=calendar',
    permanent: true,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // TEAM CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/staff',
    to: '/team',
    permanent: true,
  },
  {
    from: '/crew',
    to: '/team?subpage=contractors',
    permanent: true,
  },
  {
    from: '/personnel',
    to: '/team',
    permanent: true,
  },
  {
    from: '/team-members',
    to: '/team',
    permanent: true,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // PROJECT CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/active-projects',
    to: '/projects?subpage=active',
    permanent: true,
  },
  {
    from: '/my-projects',
    to: '/projects?subpage=my-projects',
    permanent: true,
  },
  {
    from: '/kanban',
    to: '/projects?view=kanban',
    permanent: true,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // FINANCE CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/overdue-invoices',
    to: '/invoices?subpage=overdue',
    permanent: true,
  },
  {
    from: '/pending-invoices',
    to: '/invoices?subpage=pending',
    permanent: true,
  },
  {
    from: '/payments',
    to: '/invoices?subpage=paid',
    permanent: true,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // WORKFLOW PAGES (Redirect to parent with action param)
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/onboarding',
    to: '/?action=onboarding',
    permanent: true,
  },
  {
    from: '/import',
    to: '/?action=import',
    permanent: true,
  },
  {
    from: '/create-event',
    to: '/events/new',
    permanent: true,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // MISC CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/overview',
    to: '/',
    permanent: true,
  },
  {
    from: '/home',
    to: '/',
    permanent: true,
  },
  {
    from: '/activity',
    to: '/?widget=activity',
    permanent: true,
  },
  
  // ADD ALL OTHER REDIRECTS BASED ON YOUR AUDIT
];

// Generate Next.js config format
export function generateNextRedirects(): any[] {
  return routeRedirects.map(r => ({
    source: r.from,
    destination: r.to,
    permanent: r.permanent,
  }));
}
```

### Step 2.2: Update next.config.js
```javascript
// next.config.js

const { generateNextRedirects } = require('./lib/navigation/redirects');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      ...generateNextRedirects(),
      // Any additional redirects
    ];
  },
};

module.exports = nextConfig;
```

### Step 2.3: Delete Redundant Page Files
```bash
# /migration/delete-redundant-pages.sh

#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# REDUNDANT PAGE DELETION SCRIPT
# ═══════════════════════════════════════════════════════════════════════════
#
# Run this AFTER:
# 1. Redirects are configured
# 2. Primary pages are updated with consolidated functionality
# 3. All tests pass
#
# ═══════════════════════════════════════════════════════════════════════════

echo "Starting redundant page cleanup..."

# Create backup
BACKUP_DIR="migration/deleted-pages-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# EVENT REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "app/calendar"
  "app/upcoming"
  "app/upcoming-events"
  "app/my-events"
  "app/event-calendar"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# TEAM REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "app/staff"
  "app/crew"
  "app/personnel"
  "app/team-members"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# PROJECT REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "app/active-projects"
  "app/my-projects"
  "app/kanban"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW PAGES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "app/onboarding"
  "app/import"
  "app/create-event"
  "app/create-project"
  "app/generate-report"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# MISC REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "app/overview"
  "app/home"
  "app/activity"
  "app/statistics"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

echo "Cleanup complete. Backup stored in: $BACKUP_DIR"
echo "Run 'npm run build' to verify no broken imports."
```

### Step 2.4: Create Consolidated Sidebar Component
```typescript
// /lib/navigation/components/Sidebar.tsx

'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { informationArchitecture, SidebarGroupDefinition, PageDefinition } from '../ia-structure';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

/**
 * CONSOLIDATED SIDEBAR
 * 
 * Single source of truth for navigation.
 * Renders ONLY from informationArchitecture definition.
 * NO hardcoded links allowed.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  
  // Filter groups and pages by permission
  const visibleGroups = useMemo(() => {
    return informationArchitecture.groups
      .filter(group => !group.permission || hasPermission(group.permission))
      .map(group => ({
        ...group,
        pages: group.pages
          .map(pageKey => informationArchitecture.pages[pageKey])
          .filter(page => !page.permission || hasPermission(page.permission)),
      }))
      .filter(group => group.pages.length > 0);
  }, [hasPermission]);
  
  return (
    <nav className="sidebar" aria-label="Main navigation">
      {visibleGroups.map(group => (
        <SidebarGroup 
          key={group.key} 
          group={group} 
          currentPath={pathname} 
        />
      ))}
    </nav>
  );
}

interface SidebarGroupProps {
  group: SidebarGroupDefinition & { pages: PageDefinition[] };
  currentPath: string;
}

function SidebarGroup({ group, currentPath }: SidebarGroupProps) {
  const isExpanded = group.defaultExpanded ?? true;
  const [expanded, setExpanded] = useState(isExpanded);
  
  // Check if any page in group is active
  const hasActivePage = group.pages.some(page => 
    currentPath === page.path || currentPath.startsWith(`${page.path}/`)
  );
  
  return (
    <div className="sidebar-group">
      {group.collapsible !== false && (
        <button 
          className="sidebar-group-header"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <Icon name={group.icon} className="sidebar-group-icon" />
          <span className="sidebar-group-label">{group.label}</span>
          <Icon 
            name={expanded ? 'chevron-down' : 'chevron-right'} 
            className="sidebar-group-chevron" 
          />
        </button>
      )}
      
      {(expanded || group.collapsible === false) && (
        <ul className="sidebar-group-pages">
          {group.pages.map(page => (
            <SidebarPage 
              key={page.key} 
              page={page} 
              isActive={currentPath === page.path || currentPath.startsWith(`${page.path}/`)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface SidebarPageProps {
  page: PageDefinition;
  isActive: boolean;
}

function SidebarPage({ page, isActive }: SidebarPageProps) {
  return (
    <li>
      <Link
        href={page.path}
        className={cn('sidebar-page', isActive && 'sidebar-page-active')}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon name={page.icon} className="sidebar-page-icon" />
        <span className="sidebar-page-label">{page.label}</span>
        {page.badge && <PageBadge config={page.badge} />}
      </Link>
    </li>
  );
}

function PageBadge({ config }: { config: PageDefinition['badge'] }) {
  // Fetch badge data if needed
  const { data } = useSWR(config?.source);
  
  if (!data) return null;
  
  return (
    <span className={cn('sidebar-badge', `sidebar-badge-${config?.type}`)}>
      {config?.type === 'count' ? data.count : ''}
    </span>
  );
}
```

### Step 2.5: Create Subpage Navigation Component
```typescript
// /lib/navigation/components/SubpageNav.tsx

'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { EntitySchema } from '@/lib/schema/types';
import { cn } from '@/lib/utils';

/**
 * SUBPAGE NAVIGATION
 * 
 * Renders subpage tabs from schema definition.
 * NO hardcoded subpages allowed.
 */

interface SubpageNavProps {
  schema: EntitySchema;
  currentSubpage: string;
  onSubpageChange: (subpage: string) => void;
}

export function SubpageNav({ schema, currentSubpage, onSubpageChange }: SubpageNavProps) {
  const subpages = schema.layouts.list.subpages;
  
  return (
    <nav className="subpage-nav" aria-label="Data filters">
      <ul className="subpage-nav-list">
        {subpages.map(subpage => (
          <SubpageTab
            key={subpage.key}
            subpage={subpage}
            isActive={currentSubpage === subpage.key}
            onClick={() => onSubpageChange(subpage.key)}
            schema={schema}
          />
        ))}
      </ul>
    </nav>
  );
}

interface SubpageTabProps {
  subpage: SubpageDefinition;
  isActive: boolean;
  onClick: () => void;
  schema: EntitySchema;
}

function SubpageTab({ subpage, isActive, onClick, schema }: SubpageTabProps) {
  // Fetch count if enabled
  const { data: countData } = useSWR(
    subpage.showCount 
      ? `${schema.data.endpoint}/count?${buildQueryString(subpage.query)}`
      : null
  );
  
  return (
    <li>
      <button
        className={cn('subpage-tab', isActive && 'subpage-tab-active')}
        onClick={onClick}
        aria-pressed={isActive}
      >
        {subpage.icon && <Icon name={subpage.icon} className="subpage-tab-icon" />}
        <span className="subpage-tab-label">{subpage.label}</span>
        {subpage.showCount && countData && (
          <span 
            className={cn(
              'subpage-tab-count',
              subpage.countHighlight === 'when-nonzero' && countData.count > 0 && 'highlighted'
            )}
          >
            {countData.count}
          </span>
        )}
      </button>
    </li>
  );
}
```

---

## PHASE 3: ENFORCE 3NF DATA ARCHITECTURE

### Step 3.1: Create Data Dependency Map
```typescript
// /lib/data/dependency-map.ts

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATA DEPENDENCY MAP
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Documents which entities depend on which.
 * Used to:
 * 1. Validate 3NF compliance
 * 2. Determine correct IA placement
 * 3. Configure cascade behaviors
 */

export interface EntityDependency {
  entity: string;
  dependsOn: {
    entity: string;
    type: 'required' | 'optional';
    foreignKey: string;
    ui: {
      // Where this relationship surfaces in UI
      parentDetail: boolean;  // Shows as tab on parent
      childList: boolean;     // Shows in child's list (filtered)
      inline: boolean;        // Shows inline in forms
    };
  }[];
  independentlyAccessible: boolean;  // Can exist as top-level page?
}

export const entityDependencies: EntityDependency[] = [
  // ═══════════════════════════════════════════════════════════════
  // INDEPENDENT ENTITIES (Can be top-level pages)
  // ═══════════════════════════════════════════════════════════════
  {
    entity: 'Event',
    dependsOn: [
      { entity: 'Venue', type: 'required', foreignKey: 'venueId', ui: { parentDetail: false, childList: true, inline: true } },
      { entity: 'Client', type: 'required', foreignKey: 'clientId', ui: { parentDetail: false, childList: true, inline: true } },
      { entity: 'Project', type: 'optional', foreignKey: 'projectId', ui: { parentDetail: true, childList: true, inline: true } },
    ],
    independentlyAccessible: true,  // Has its own page
  },
  {
    entity: 'Project',
    dependsOn: [
      { entity: 'Client', type: 'required', foreignKey: 'clientId', ui: { parentDetail: false, childList: true, inline: true } },
    ],
    independentlyAccessible: true,
  },
  {
    entity: 'Venue',
    dependsOn: [],
    independentlyAccessible: true,
  },
  {
    entity: 'Client',
    dependsOn: [],
    independentlyAccessible: true,
  },
  {
    entity: 'TeamMember',
    dependsOn: [
      { entity: 'Department', type: 'optional', foreignKey: 'departmentId', ui: { parentDetail: true, childList: false, inline: true } },
    ],
    independentlyAccessible: true,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // DEPENDENT ENTITIES (Should be tabs/contextual, not pages)
  // ═══════════════════════════════════════════════════════════════
  {
    entity: 'ScheduleItem',
    dependsOn: [
      { entity: 'Event', type: 'required', foreignKey: 'eventId', ui: { parentDetail: true, childList: false, inline: false } },
    ],
    independentlyAccessible: false,  // Only exists on Event detail
  },
  {
    entity: 'BudgetLine',
    dependsOn: [
      { entity: 'Event', type: 'required', foreignKey: 'eventId', ui: { parentDetail: true, childList: false, inline: false } },
    ],
    independentlyAccessible: false,
  },
  {
    entity: 'EventAssignment',
    dependsOn: [
      { entity: 'Event', type: 'required', foreignKey: 'eventId', ui: { parentDetail: true, childList: false, inline: false } },
      { entity: 'TeamMember', type: 'required', foreignKey: 'teamMemberId', ui: { parentDetail: true, childList: false, inline: false } },
    ],
    independentlyAccessible: false,  // Many-to-many junction
  },
  {
    entity: 'Task',
    dependsOn: [
      { entity: 'Event', type: 'optional', foreignKey: 'eventId', ui: { parentDetail: true, childList: false, inline: false } },
      { entity: 'Project', type: 'optional', foreignKey: 'projectId', ui: { parentDetail: true, childList: false, inline: false } },
    ],
    independentlyAccessible: false,  // Always in context of parent
  },
  {
    entity: 'Note',
    dependsOn: [
      { entity: 'Event', type: 'optional', foreignKey: 'eventId', ui: { parentDetail: true, childList: false, inline: false } },
      { entity: 'Project', type: 'optional', foreignKey: 'projectId', ui: { parentDetail: true, childList: false, inline: false } },
      { entity: 'Client', type: 'optional', foreignKey: 'clientId', ui: { parentDetail: true, childList: false, inline: false } },
    ],
    independentlyAccessible: false,  // Always attached to something
  },
  
  // ═══════════════════════════════════════════════════════════════
  // LOOKUP/REFERENCE ENTITIES (Settings, not pages)
  // ═══════════════════════════════════════════════════════════════
  {
    entity: 'Department',
    dependsOn: [],
    independentlyAccessible: false,  // Managed in settings
  },
  {
    entity: 'EventType',
    dependsOn: [],
    independentlyAccessible: false,  // Managed in settings
  },
  {
    entity: 'Tag',
    dependsOn: [],
    independentlyAccessible: false,  // Managed in settings
  },
];

/**
 * Validate that IA structure matches data dependencies
 */
export function validateIAAgainstDependencies(): string[] {
  const errors: string[] = [];
  
  for (const dep of entityDependencies) {
    const hasPage = Object.values(informationArchitecture.pages)
      .some(p => p.entity === dep.entity);
    
    if (dep.independentlyAccessible && !hasPage) {
      errors.push(`${dep.entity} should have a page but doesn't`);
    }
    
    if (!dep.independentlyAccessible && hasPage) {
      errors.push(`${dep.entity} has a page but should be contextual only`);
    }
  }
  
  return errors;
}
```

### Step 3.2: Create 3NF Validation Script
```typescript
// /migration/validate-3nf.ts

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 3NF VALIDATION SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Run this to validate codebase follows 3NF principles.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ValidationResult {
  passed: boolean;
  violations: {
    rule: string;
    file: string;
    line?: number;
    description: string;
  }[];
}

async function validate3NF(): Promise<ValidationResult> {
  const violations: ValidationResult['violations'] = [];
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 1: No duplicate entity pages
  // ─────────────────────────────────────────────────────────────────────────
  const pageFiles = await glob('app/**/page.tsx');
  const entityPageMap = new Map<string, string[]>();
  
  for (const file of pageFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Extract schema import
    const schemaMatch = content.match(/import.*from\s+['"]@\/schemas\/(\w+)\.schema['"]/);
    if (schemaMatch) {
      const entity = schemaMatch[1];
      if (!entityPageMap.has(entity)) {
        entityPageMap.set(entity, []);
      }
      entityPageMap.get(entity)!.push(file);
    }
  }
  
  for (const [entity, pages] of entityPageMap) {
    if (pages.length > 1) {
      // Allow /entity, /entity/[id], /entity/new, /entity/[id]/edit
      const basePaths = pages.map(p => p.replace(/\/\[.*?\]/g, '').replace('/new', '').replace('/edit', ''));
      const uniqueBasePaths = [...new Set(basePaths)];
      
      if (uniqueBasePaths.length > 1) {
        violations.push({
          rule: '1NF: No duplicate entity pages',
          file: pages.join(', '),
          description: `Entity "${entity}" has multiple base pages: ${uniqueBasePaths.join(', ')}`,
        });
      }
    }
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 2: No stored computed values in schemas
  // ─────────────────────────────────────────────────────────────────────────
  const schemaFiles = await glob('schemas/*.schema.ts');
  
  const computedPatterns = [
    /count:\s*number/,           // Stored count
    /total:\s*number/,           // Stored total
    /average:\s*number/,         // Stored average
    /daysUntil:\s*number/,       // Stored computed date diff
    /isOverdue:\s*boolean/,      // Stored computed boolean
    /displayName:\s*string/,     // Stored computed string
  ];
  
  for (const file of schemaFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check if these are in data.fields (stored) vs data.computed (derived)
    const fieldsMatch = content.match(/fields:\s*\{([^}]+)\}/s);
    if (fieldsMatch) {
      const fieldsContent = fieldsMatch[1];
      
      for (const pattern of computedPatterns) {
        if (pattern.test(fieldsContent)) {
          violations.push({
            rule: '3NF: No stored computed values',
            file,
            description: `Schema stores computed value matching pattern: ${pattern}`,
          });
        }
      }
    }
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 3: No redundant data fetching
  // ─────────────────────────────────────────────────────────────────────────
  const componentFiles = await glob('**/*.tsx', { ignore: ['node_modules/**'] });
  
  const fetchPatterns = new Map<string, string[]>();
  
  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Find all API fetches
    const fetchMatches = content.matchAll(/fetch\(['"`](\/api\/[^'"]+)['"`]\)/g);
    
    for (const match of fetchMatches) {
      const endpoint = match[1];
      if (!fetchPatterns.has(endpoint)) {
        fetchPatterns.set(endpoint, []);
      }
      fetchPatterns.get(endpoint)!.push(file);
    }
  }
  
  // Check for same endpoint fetched in multiple unrelated components
  // (This is a heuristic - may have false positives)
  for (const [endpoint, files] of fetchPatterns) {
    // Ignore if all files are in same directory (likely related)
    const directories = files.map(f => path.dirname(f));
    const uniqueDirs = [...new Set(directories)];
    
    if (uniqueDirs.length > 3) {  // Arbitrary threshold
      violations.push({
        rule: '3NF: Potential redundant data fetching',
        file: files.slice(0, 3).join(', ') + (files.length > 3 ? '...' : ''),
        description: `Endpoint "${endpoint}" fetched in ${files.length} different locations`,
      });
    }
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 4: No hardcoded navigation
  // ─────────────────────────────────────────────────────────────────────────
  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Skip the IA definition files
    if (file.includes('ia-structure') || file.includes('navigation')) continue;
    
    // Check for hardcoded hrefs that should use IA
    const hardcodedLinks = content.matchAll(/href=["']\/([a-z-]+)["']/g);
    
    for (const match of hardcodedLinks) {
      const path = match[1];
      
      // Check if this path is in IA structure
      const isInIA = Object.values(informationArchitecture.pages)
        .some(p => p.path === `/${path}` || p.path.startsWith(`/${path}/`));
      
      if (!isInIA) {
        violations.push({
          rule: 'SSOT: Hardcoded navigation link',
          file,
          description: `Hardcoded link "/${path}" not found in IA structure`,
        });
      }
    }
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // RULE 5: No duplicate sidebar definitions
  // ─────────────────────────────────────────────────────────────────────────
  const sidebarMatches = await glob('**/*sidebar*', { ignore: ['node_modules/**'] });
  
  if (sidebarMatches.length > 2) {  // Allow Sidebar.tsx and ia-structure.ts
    violations.push({
      rule: 'SSOT: Multiple sidebar definitions',
      file: sidebarMatches.join(', '),
      description: 'Multiple sidebar-related files found. Should have single source.',
    });
  }
  
  return {
    passed: violations.length === 0,
    violations,
  };
}

// Run validation
validate3NF().then(result => {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('3NF VALIDATION RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  if (result.passed) {
    console.log('✅ All validations passed!\n');
  } else {
    console.log(`❌ Found ${result.violations.length} violations:\n`);
    
    result.violations.forEach((v, i) => {
      console.log(`${i + 1}. [${v.rule}]`);
      console.log(`   File: ${v.file}`);
      console.log(`   Issue: ${v.description}\n`);
    });
  }
});
```

---

## PHASE 4: CONSOLIDATION CHECKLIST

### Step 4.1: Pre-Consolidation Checklist
```markdown
## PRE-CONSOLIDATION CHECKLIST

### Analysis Complete
- [ ] Route inventory generated (ia_audit.txt)
- [ ] All routes classified in ia-audit.ts
- [ ] Data source overlap analysis complete
- [ ] Current sidebar structure documented
- [ ] Proposed sidebar structure defined

### Infrastructure Ready
- [ ] ia-structure.ts created with full IA definition
- [ ] consolidation-rules.ts created
- [ ] redirects.ts created with all mappings
- [ ] next.config.js updated with redirects

### Backup Created
- [ ] Full codebase backup
- [ ] Database backup (if applicable)
- [ ] Current navigation screenshot for reference
```

### Step 4.2: Per-Page Consolidation Checklist
```markdown
## PAGE CONSOLIDATION: [Page Name]

### Before Deletion
- [ ] Redirect configured in redirects.ts
- [ ] Functionality migrated to target page/subpage/view
- [ ] All incoming links updated or will be redirected
- [ ] Tests updated for new location
- [ ] Search/SEO redirects configured

### Migration Actions
- [ ] Data query moved to subpage config (if filtered view)
- [ ] View mode added to schema (if visualization)
- [ ] Tab added to parent detail (if child entity)
- [ ] Action/modal created (if workflow)
- [ ] Widget created (if aggregate view)

### After Deletion
- [ ] Page directory deleted
- [ ] No broken imports (npm run build passes)
- [ ] No 404s for old URLs (redirects work)
- [ ] New location works correctly
- [ ] Sidebar updated (if was in sidebar)
```

### Step 4.3: Post-Consolidation Validation
```markdown
## POST-CONSOLIDATION VALIDATION

### Structure Validation
- [ ] npm run build passes
- [ ] npm run lint passes
- [ ] npm run test passes
- [ ] 3NF validation script passes

### Navigation Validation
- [ ] All sidebar links work
- [ ] All subpage tabs work
- [ ] All view modes work
- [ ] All redirects work
- [ ] No duplicate pages remain

### Data Validation
- [ ] No duplicate data fetches
- [ ] All computed values derived (not stored)
- [ ] Entity dependencies correct
- [ ] Child entities only accessible via parent

### User Validation
- [ ] Navigation is intuitive
- [ ] No lost functionality
- [ ] Performance maintained or improved
- [ ] Mobile navigation works
```

---

## MIGRATION PROGRESS TRACKER
```markdown
## CONSOLIDATION PROGRESS

| Redundant Page | Target | Type | Status | Notes |
|---------------|--------|------|--------|-------|
| /calendar | /events | View Mode | ✅ | Calendar view implemented in events page |
| /upcoming | /events | Subpage | ✅ | Upcoming subpage implemented in events schema |
| /my-events | /events | Subpage | ✅ | My Events subpage implemented in events schema |
| /staff | /team | Redirect | ✅ | Redirected to /people?subpage=team |
| /crew | /team | Subpage | ✅ | Crew subpage implemented in people schema |
| /active-projects | /projects | Subpage | ✅ | Active Projects subpage implemented in projects schema |
| /kanban | /projects | View Mode | ✅ | Kanban view implemented in projects page |
| /onboarding | Modal | Workflow | ✅ | Converted to OnboardingModal wizard component |
| /overview | / | Redirect | ✅ | Dashboard is now root page |
| ... | | | ✅ | All redundant pages deleted and functionality migrated |

### Legend
- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ❌ Blocked
```

---

## SUCCESS METRICS
```markdown
## CONSOLIDATION METRICS

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Total routes | | | -40% |
| Sidebar items | | | -30% |
| Duplicate data fetches | | 0 | 0 |
| Pages per entity | >1 | 1 | 1 |
| Subpages (data filters) | 0 | | +N |
| View modes | 0 | | +N |
| Navigation depth | >4 | ≤3 | ≤3 |
| Time to find feature | | | -50% |
```

---

## TROUBLESHOOTING

### Common Issues

**Issue: Redirect loops**
Check: Ensure no circular redirects in redirects.ts

**Issue: Lost functionality after page deletion**
Check: Was feature migrated to subpage/view/modal?

**Issue: Subpage not showing correct data**
Check: Is query.where filter correct in schema?

**Issue: View mode not available**
Check: Is view type in schema.layouts.list.availableViews?

**Issue: Sidebar shows deleted page**
Check: Update informationArchitecture.groups