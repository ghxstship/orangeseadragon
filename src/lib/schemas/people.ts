// /lib/schemas/people.ts

import { defineSchema } from '../schema/defineSchema';

/**
 * PEOPLE/USER ENTITY SCHEMA (SSOT)
 *
 * Single source of truth for ALL people/user behavior.
 */
export const peopleSchema = defineSchema({
  // Identity
  identity: {
    name: 'person',
    namePlural: 'People',
    slug: 'modules/workforce/roster',
    icon: 'User',
    description: 'Manage staff, crew, and contacts',
  },

  // Data - matches user_profiles table columns
  data: {
    endpoint: '/api/user_profiles',
    primaryKey: 'id',
    fields: {
      headline: {
        type: 'text',
        label: 'Headline',
        placeholder: 'Enter headline',
        inTable: true,
        inForm: true,
        searchable: true,
      },
      bio: {
        type: 'textarea',
        label: 'Bio',
        placeholder: 'Enter bio',
        inForm: true,
        inDetail: true,
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
      },
      website: {
        type: 'url',
        label: 'Website',
        inForm: true,
        inDetail: true,
      },
      linkedin_url: {
        type: 'url',
        label: 'LinkedIn',
        inForm: true,
        inDetail: true,
      },
      is_public: {
        type: 'checkbox',
        label: 'Public Profile',
        inTable: true,
        inForm: true,
        default: false,
      },
      is_available_for_hire: {
        type: 'checkbox',
        label: 'Available for Hire',
        inTable: true,
        inForm: true,
        default: false,
      },
      skills: {
        type: 'tags',
        label: 'Skills',
        inTable: true,
        inForm: true,
      },
      created_at: {
        type: 'datetime',
        label: 'Created',
        inTable: true,
        sortable: true,
      },
    },
  },

  // Display
  display: {
    title: (record: Record<string, unknown>) => String(record.headline || 'Untitled Profile'),
    subtitle: (record: Record<string, unknown>) => String(record.location || ''),
    badge: (record: Record<string, unknown>) => {
      return record.is_available_for_hire
        ? { label: 'Available', variant: 'success' }
        : { label: 'Not Available', variant: 'secondary' };
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  // Search
  search: {
    enabled: true,
    fields: ['headline', 'bio', 'location'],
    placeholder: 'Search people...',
  },

  // Filters
  filters: {
    quick: [
      { key: 'available', label: 'Available', query: { where: { is_available_for_hire: true } } },
    ],
    advanced: ['is_public', 'is_available_for_hire'],
  },

  // Layouts
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All People', query: { where: {} }, count: true },
        { key: 'available', label: 'Available', query: { where: { is_available_for_hire: true } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'projects', label: 'Projects', content: { type: 'related', entity: 'projectResource', foreignKey: 'user_id', defaultView: 'table', allowCreate: false } },
        { key: 'tasks', label: 'Tasks', content: { type: 'related', entity: 'task', foreignKey: 'assignee_id', defaultView: 'table', allowCreate: true } },
        { key: 'time', label: 'Time', content: { type: 'related', entity: 'timeEntry', foreignKey: 'user_id', defaultView: 'table', allowCreate: true } },
        { key: 'credentials', label: 'Credentials', content: { type: 'related', entity: 'credential', foreignKey: 'user_id', allowCreate: true } },
        { key: 'files', label: 'Files', content: { type: 'files' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'active_projects', label: 'Active Projects', value: { type: 'relation-count', entity: 'projectResource', foreignKey: 'user_id' }, onClick: { tab: 'projects' } },
          { key: 'open_tasks', label: 'Open Tasks', value: { type: 'relation-count', entity: 'task', foreignKey: 'assignee_id', filter: { status: { neq: 'done' } } }, onClick: { tab: 'tasks' } },
        ],
        blocks: [
          { key: 'bio', title: 'Bio', content: { type: 'fields', fields: ['bio'] } },
          { key: 'contact', title: 'Contact Info', content: { type: 'fields', fields: ['website', 'linkedin_url'] } },
        ]
      },
      sidebar: {
        width: 300,
        collapsible: true,
        defaultState: 'open',
        sections: [
          { key: 'properties', title: 'Properties', content: { type: 'stats', stats: ['headline', 'location', 'is_available_for_hire'] } },
          { key: 'quick_actions', title: 'Quick Actions', content: { type: 'quick-actions', actions: ['create-task'] } },
          { key: 'recent_activity', title: 'Recent Activity', content: { type: 'activity', limit: 5 }, collapsible: true },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Profile',
          fields: ['headline', 'bio', 'location'],
        },
        {
          key: 'links',
          title: 'Links',
          fields: ['website', 'linkedin_url'],
        },
        {
          key: 'settings',
          title: 'Settings',
          fields: ['is_public', 'is_available_for_hire', 'skills'],
        }
      ]
    }
  },

  // Views
  views: {
    table: {
      columns: [
        'headline',
        'location',
        { field: 'is_available_for_hire', format: { type: 'boolean', trueLabel: 'Available', falseLabel: 'Unavailable' } },
        { field: 'is_public', format: { type: 'boolean', trueLabel: 'Public', falseLabel: 'Private' } },
      ],
    }
  },

  // Actions
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: Record<string, unknown>) => `/people/roster/${record.id}` } }
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Person', variant: 'primary', handler: { type: 'function', fn: () => { } } }
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
