/* eslint-disable @typescript-eslint/no-explicit-any */
// /lib/schemas/project.ts

import { defineSchema } from '../schema/defineSchema';

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

  // Relationships
  relationships: {
    belongsTo: [
      { entity: 'company', foreignKey: 'client_id', label: 'Client' },
      { entity: 'venue', foreignKey: 'venue_id', label: 'Venue' },
    ],
    hasMany: [
      { entity: 'task', foreignKey: 'project_id', label: 'Tasks', cascade: 'delete' },
      { entity: 'budget', foreignKey: 'project_id', label: 'Budgets', cascade: 'delete' },
      { entity: 'timeEntry', foreignKey: 'project_id', label: 'Time Entries', cascade: 'delete' },
      { entity: 'expense', foreignKey: 'project_id', label: 'Expenses', cascade: 'delete' },
      { entity: 'invoice', foreignKey: 'project_id', label: 'Invoices', cascade: 'restrict' },
      { entity: 'projectResource', foreignKey: 'project_id', label: 'Team Members', cascade: 'delete' },
      { entity: 'document', foreignKey: 'project_id', label: 'Documents', cascade: 'delete' },
      { entity: 'event', foreignKey: 'project_id', label: 'Events', cascade: 'restrict' },
    ],
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
        },
        {
          key: 'planning',
          label: 'Planning',
          query: { where: { status: 'planning' } },
          count: true,
        },
        {
          key: 'completed',
          label: 'Completed',
          query: { where: { status: 'completed' } },
          count: true,
        },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'calendar', 'timeline'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        {
          key: 'tasks',
          label: 'Tasks',
          content: { type: 'related', entity: 'task', foreignKey: 'project_id', defaultView: 'table', allowCreate: true },
          badge: { compute: (record: any) => record._task_count || '' },
        },
        {
          key: 'schedule',
          label: 'Schedule',
          content: { type: 'related', entity: 'task', foreignKey: 'project_id', defaultView: 'gantt', allowCreate: false },
        },
        {
          key: 'team',
          label: 'Team',
          content: { type: 'related', entity: 'projectResource', foreignKey: 'project_id', allowCreate: true },
          badge: { compute: (record: any) => record._team_count || '' },
        },
        {
          key: 'budget',
          label: 'Budget',
          content: { type: 'related', entity: 'budget', foreignKey: 'project_id', allowCreate: true },
        },
        {
          key: 'time',
          label: 'Time',
          content: { type: 'related', entity: 'timeEntry', foreignKey: 'project_id', defaultView: 'table', allowCreate: true },
        },
        {
          key: 'expenses',
          label: 'Expenses',
          content: { type: 'related', entity: 'expense', foreignKey: 'project_id', defaultView: 'table', allowCreate: true },
        },
        {
          key: 'documents',
          label: 'Documents',
          content: { type: 'files' },
        },
        {
          key: 'invoices',
          label: 'Invoices',
          content: { type: 'related', entity: 'invoice', foreignKey: 'project_id', defaultView: 'table', allowCreate: true },
        },
        {
          key: 'activity',
          label: 'Activity',
          content: { type: 'activity' },
        },
        {
          key: 'settings',
          label: 'Settings',
          content: { type: 'fields', fields: ['name', 'code', 'client', 'status', 'startDate', 'endDate', 'budget', 'description'], editable: true },
        },
      ],
      overview: {
        stats: [
          { key: 'budget', label: 'Budget', value: { type: 'field', field: 'budget' }, format: 'currency' },
          {
            key: 'burned',
            label: 'Burned',
            value: { type: 'relation-sum', entity: 'expense', foreignKey: 'project_id', field: 'amount' },
            format: 'currency',
          },
          {
            key: 'margin',
            label: 'Margin',
            value: {
              type: 'computed',
              compute: (record: any) => {
                const budget = Number(record.budget) || 0;
                const burned = Number(record._total_expenses) || 0;
                return budget > 0 ? Math.round(((budget - burned) / budget) * 100) : 0;
              },
            },
            format: 'percentage',
          },
          {
            key: 'team_count',
            label: 'Team',
            value: { type: 'relation-count', entity: 'projectResource', foreignKey: 'project_id' },
            suffix: ' members',
            onClick: { tab: 'team' },
          },
        ],
        blocks: [
          { key: 'description', title: 'Description', content: { type: 'fields', fields: ['description'] } },
          { key: 'key_dates', title: 'Key Dates', content: { type: 'fields', fields: ['startDate', 'endDate'] } },
        ]
      },
      sidebar: {
        width: 320,
        collapsible: true,
        defaultState: 'open',
        sections: [
          {
            key: 'properties',
            title: 'Properties',
            content: { type: 'stats', stats: ['status', 'client', 'startDate', 'endDate'] },
          },
          {
            key: 'budget_summary',
            title: 'Budget Health',
            content: { type: 'stats', stats: ['budget', 'burned', 'margin'] },
          },
          {
            key: 'quick_actions',
            title: 'Quick Actions',
            content: { type: 'quick-actions', actions: ['create-task', 'log-time', 'submit-expense', 'generate-invoice'] },
          },
          {
            key: 'recent_activity',
            title: 'Recent Activity',
            content: { type: 'activity', limit: 5 },
            collapsible: true,
          },
        ],
      },
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
        },
        {
          key: 'details',
          title: 'Details',
          fields: ['description'],
          collapsible: true,
        }
      ]
    }
  },

  // Views
  views: {
    table: {
      columns: [
        'name',
        'code',
        { field: 'client', format: { type: 'relation', entityType: 'company' } },
        { field: 'status', format: { type: 'badge', colorMap: { planning: '#6b7280', pre_production: '#3b82f6', in_production: '#eab308', wrap: '#f59e0b', complete: '#22c55e', cancelled: '#ef4444', on_hold: '#6b7280' } } },
        { field: 'startDate', format: { type: 'date' } },
        { field: 'endDate', format: { type: 'date' } },
        { field: 'budget', format: { type: 'currency' } },
        { field: 'progress', format: { type: 'percentage' } },
      ],
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
        handler: { type: 'function', fn: () => console.log('Create clicked') }
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
