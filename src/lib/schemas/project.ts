// /lib/schemas/project.ts

import { defineSchema } from '../schema/defineSchema';
import type { EntitySchema } from '../schema/types';

/**
 * PROJECT ENTITY SCHEMA (SSOT)
 *
 * Single source of truth for ALL project behavior.
 * Following the master EntitySchema definition.
 */
export const projectSchema = defineSchema({
  // Identity
  identity: {
    name: 'project',
    namePlural: 'Projects',
    slug: 'modules/projects/projects',
    icon: 'FolderKanban',
    description: 'Manage theatrical and production projects',
  },

  // Data
  data: {
    endpoint: '/api/projects',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Project Name',
        placeholder: 'Enter project name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      code: {
        type: 'text',
        label: 'Project Code',
        placeholder: 'PROJ-001',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
        searchable: true,
      },
      client: {
        type: 'select',
        label: 'Client',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
        searchable: true,
        options: [], // Dynamic options
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Planning', value: 'planning', color: 'blue' },
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'On Hold', value: 'on-hold', color: 'yellow' },
          { label: 'Completed', value: 'completed', color: 'gray' },
          { label: 'Archived', value: 'archived', color: 'red' },
        ],
        default: 'planning',
      },
      startDate: {
        type: 'date',
        label: 'Start Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      endDate: {
        type: 'date',
        label: 'End Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      budget: {
        type: 'currency',
        label: 'Budget',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
        searchable: true,
      }
    },
    computed: {
      progress: {
        label: 'Progress',
        computation: {
          type: 'derived',
          compute: (record: any) => {
            if (record.status === 'completed') return 100;
            // Add actual logic later
            return 0;
          }
        },
        format: 'percentage',
        inTable: true,
        inDetail: true,
      }
    }
  },

  // Display
  display: {
    title: (record: any) => record.name || 'Untitled Project',
    subtitle: (record: any) => record.client || 'No Client',
    badge: (record: any) => {
      const status = record.status;
      if (status === 'active') return { label: 'Active', variant: 'success' };
      if (status === 'planning') return { label: 'Planning', variant: 'warning' };
      return { label: status, variant: 'secondary' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  // Search
  search: {
    enabled: true,
    fields: ['name', 'code', 'description'],
    placeholder: 'Search projects...',
  },

  // Filters
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'planning', label: 'Planning', query: { where: { status: 'planning' } } },
    ],
    advanced: ['status', 'client', 'startDate'],
  },

  // Layouts
  layouts: {
    list: {
      subpages: [
        {
          key: 'all',
          label: 'All Projects',
          query: { where: {} },
          count: true,
        },
        {
          key: 'active',
          label: 'Active',
          query: { where: { status: 'active' } },
          count: true,
        }
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'calendar'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        {
          key: 'team',
          label: 'Team',
          content: {
            type: 'related',
            entity: 'people',
            foreignKey: 'projectId',
            allowCreate: true
          }
        },
      ],
      overview: {
        stats: [
          { key: 'budget', label: 'Budget', value: { type: 'field', field: 'budget' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Project Details', content: { type: 'fields', fields: ['description'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['name', 'code', 'client', 'status'],
        },
        {
          key: 'dates',
          title: 'Timeline & Budget',
          fields: ['startDate', 'endDate', 'budget'],
        }
      ]
    }
  },

  // Views
  views: {
    table: {
      columns: ['name', 'code', 'client', 'status', 'startDate', 'endDate', 'budget', 'progress'],
    }
  },

  // Actions
  actions: {
    row: [
      {
        key: 'view',
        label: 'View Details',
        handler: { type: 'navigate', path: (record: any) => `/productions/projects/${record.id}` }
      }
    ],
    bulk: [],
    global: [
      {
        key: 'create',
        label: 'New Project',
        variant: 'primary',
        handler: { type: 'function', fn: (record: any, context: any) => console.log('Create clicked') }
      }
    ]
  },

  // Permissions
  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
