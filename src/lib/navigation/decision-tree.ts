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
      ├─► People (team, companies, contacts)
      ├─► Finance (budgets, invoices, payments)
      ├─► Content (files, documents, media)
      ├─► Network (community, connections, marketplace)
      └─► Settings (configuration, preferences)
`;
