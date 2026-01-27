// /lib/schemas/people.ts

import { defineSchema } from '../schema/defineSchema';
import type { EntitySchema } from '../schema/types';

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
    icon: '👤',
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
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'contact', title: 'Contact Info', content: { type: 'fields', fields: ['website', 'linkedin_url'] } },
        ]
      }
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
      columns: ['headline', 'location', 'is_available_for_hire', 'is_public'],
    }
  },

  // Actions
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: Record<string, unknown>) => `/modules/workforce/roster/${record.id}` } }
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Person', variant: 'primary', handler: { type: 'function', fn: () => {} } }
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
