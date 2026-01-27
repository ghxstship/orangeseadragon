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
    entity: 'Person',
    dependsOn: [
      { entity: 'Department', type: 'optional', foreignKey: 'departmentId', ui: { parentDetail: true, childList: false, inline: true } },
    ],
    independentlyAccessible: true,
  },
  {
    entity: 'Invoice',
    dependsOn: [
      { entity: 'Client', type: 'required', foreignKey: 'clientId', ui: { parentDetail: false, childList: true, inline: true } },
      { entity: 'Event', type: 'optional', foreignKey: 'eventId', ui: { parentDetail: true, childList: true, inline: true } },
    ],
    independentlyAccessible: true,
  },
  {
    entity: 'Budget',
    dependsOn: [
      { entity: 'Event', type: 'optional', foreignKey: 'eventId', ui: { parentDetail: true, childList: true, inline: true } },
      { entity: 'Project', type: 'optional', foreignKey: 'projectId', ui: { parentDetail: true, childList: true, inline: true } },
    ],
    independentlyAccessible: true,
  },
  {
    entity: 'Content',
    dependsOn: [
      { entity: 'Event', type: 'optional', foreignKey: 'eventId', ui: { parentDetail: true, childList: true, inline: true } },
      { entity: 'Project', type: 'optional', foreignKey: 'projectId', ui: { parentDetail: true, childList: true, inline: true } },
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
      { entity: 'Budget', type: 'required', foreignKey: 'budgetId', ui: { parentDetail: true, childList: false, inline: false } },
    ],
    independentlyAccessible: false,
  },
  {
    entity: 'EventAssignment',
    dependsOn: [
      { entity: 'Event', type: 'required', foreignKey: 'eventId', ui: { parentDetail: true, childList: false, inline: false } },
      { entity: 'Person', type: 'required', foreignKey: 'personId', ui: { parentDetail: true, childList: false, inline: false } },
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

import { informationArchitecture, PageDefinition } from '../navigation/ia-structure';

/**
 * Validate that IA structure matches data dependencies
 */
export function validateIAAgainstDependencies(): string[] {
  const errors: string[] = [];

  for (const dep of entityDependencies) {
    const hasPage = Object.values(informationArchitecture.pages)
      .some((p: PageDefinition) => p.entity === dep.entity);

    if (dep.independentlyAccessible && !hasPage) {
      errors.push(`${dep.entity} should have a page but doesn't`);
    }

    if (!dep.independentlyAccessible && hasPage) {
      errors.push(`${dep.entity} has a page but should be contextual only`);
    }
  }

  return errors;
}
