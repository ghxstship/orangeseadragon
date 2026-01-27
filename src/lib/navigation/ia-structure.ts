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
  | 'network'       // Community, connections, marketplace
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
  | 'people'
  | 'companies'
  // Finance
  | 'budgets'
  | 'invoices'
  // Content
  | 'content'
  // Network
  | 'connections'
  | 'discussions'
  | 'marketplace'
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
      description: 'Team members, companies, and contacts',
      pages: ['people', 'companies'],
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
      pages: ['content'],
    },

    // ═══════════════════════════════════════════════════════════════
    // NETWORK GROUP
    // ═══════════════════════════════════════════════════════════════
    {
      key: 'network',
      label: 'Network',
      icon: 'network',
      description: 'Community, connections, and marketplace',
      pages: ['connections', 'discussions', 'marketplace'],
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
    // EVENTS (Consolidated from: /events, /projects/productions, etc.)
    // ═══════════════════════════════════════════════════════════════
    events: {
      key: 'events',
      path: '/events',
      label: 'Events',
      icon: 'calendar-event',
      entity: 'event',
      type: 'entity-list',
      // Subpages defined in event.schema.ts layouts.list.subpages
      subpages: ['all', 'upcoming', 'active', 'completed', 'drafts', 'archived'],
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
    // VENUES (Consolidated from: /venues, /locations)
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
    // PEOPLE (Consolidated from: /people, /people/teams, /people/crew, etc.)
    // ═══════════════════════════════════════════════════════════════
    people: {
      key: 'people',
      path: '/people',
      label: 'People',
      icon: 'users',
      entity: 'person',
      type: 'entity-list',
      subpages: ['all', 'team', 'crew', 'contractors', 'talent', 'contacts'],
    },

    // ═══════════════════════════════════════════════════════════════
    // COMPANIES
    // ═══════════════════════════════════════════════════════════════
    companies: {
      key: 'companies',
      path: '/companies',
      label: 'Companies',
      icon: 'briefcase',
      entity: 'company',
      type: 'entity-list',
      subpages: ['all', 'clients', 'vendors', 'partners'],
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
    // INVOICES (Consolidated from: /invoices, /business/invoices)
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
    // CONTENT (Consolidated from: /content, /documents, /media)
    // ═══════════════════════════════════════════════════════════════
    content: {
      key: 'content',
      path: '/content',
      label: 'Content',
      icon: 'folder',
      entity: 'content',
      type: 'entity-list',
      subpages: ['all', 'documents', 'media', 'recent', 'shared'],
    },

    // ═══════════════════════════════════════════════════════════════
    // CONNECTIONS
    // ═══════════════════════════════════════════════════════════════
    connections: {
      key: 'connections',
      path: '/network/connections',
      label: 'Connections',
      icon: 'network',
      entity: 'connection',
      type: 'entity-list',
      subpages: ['all', 'requests', 'groups'],
    },

    // ═══════════════════════════════════════════════════════════════
    // DISCUSSIONS
    // ═══════════════════════════════════════════════════════════════
    discussions: {
      key: 'discussions',
      path: '/network/discussions',
      label: 'Discussions',
      icon: 'message-circle',
      entity: 'discussion',
      type: 'entity-list',
      subpages: ['all', 'categories', 'my-posts'],
    },

    // ═══════════════════════════════════════════════════════════════
    // MARKETPLACE
    // ═══════════════════════════════════════════════════════════════
    marketplace: {
      key: 'marketplace',
      path: '/network/marketplace',
      label: 'Marketplace',
      icon: 'shopping-bag',
      entity: 'marketplaceItem',
      type: 'entity-list',
      subpages: ['browse', 'my-listings', 'bookings', 'reviews'],
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
