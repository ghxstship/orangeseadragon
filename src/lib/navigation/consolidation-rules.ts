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
        redundant: ['/people', '/staff', '/crew', '/personnel'],
        consolidateTo: '/people',
        reason: 'All show Person entities',
      },
      {
        redundant: ['/venues', '/locations', '/projects/places/venue-management'],
        consolidateTo: '/venues',
        reason: 'All show Venue entities',
      },
      {
        redundant: ['/invoices', '/business/invoices'],
        consolidateTo: '/invoices',
        reason: 'All show Invoice entities',
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
        redundant: '/people/crew',
        consolidateTo: '/people',
        asSubpage: 'crew',
        reason: 'Just people filtered by role',
      },
      {
        redundant: '/people/contractors',
        consolidateTo: '/people',
        asSubpage: 'contractors',
        reason: 'Just people filtered by type',
      },
      {
        redundant: '/events/upcoming',
        consolidateTo: '/events',
        asSubpage: 'upcoming',
        reason: 'Just events filtered by date',
      },
      {
        redundant: '/invoices/overdue',
        consolidateTo: '/invoices',
        asSubpage: 'overdue',
        reason: 'Just invoices filtered by status',
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
        redundant: '/projects/kanban',
        consolidateTo: '/projects',
        asViewMode: 'kanban',
        reason: 'Kanban is a visualization of projects',
      },
      {
        redundant: '/venues/map',
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
        replaceWith: 'Activity widget on dashboard',
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
