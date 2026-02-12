/* eslint-disable @typescript-eslint/no-explicit-any */
// /lib/schemas/event.ts

import { defineSchema } from '../schema/defineSchema';

/**
 * EVENT ENTITY SCHEMA (SSOT)
 *
 * Single source of truth for ALL event behavior.
 */
export const eventSchema = defineSchema({
  // Identity
  identity: {
    name: 'event',
    namePlural: 'Events',
    slug: 'modules/production/events',
    icon: 'CalendarDays',
    description: 'Manage show productions and events',
  },

  // Data
  data: {
    endpoint: '/api/events',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Event Name',
        placeholder: 'Enter event name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      eventType: {
        type: 'select',
        label: 'Event Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Corporate', value: 'corporate' },
          { label: 'Wedding', value: 'wedding' },
          { label: 'Concert', value: 'concert' },
          { label: 'Festival', value: 'festival' },
          { label: 'Conference', value: 'conference' },
          { label: 'Private Party', value: 'private' },
        ],
      },
      startDate: {
        type: 'datetime',
        label: 'Start Date & Time',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      endDate: {
        type: 'datetime',
        label: 'End Date & Time',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      venueId: {
        type: 'select',
        label: 'Venue',
        required: true,
        inTable: true,
        inForm: true,
        options: [], // Dynamic
      },
      clientId: {
        type: 'select',
        label: 'Client',
        required: true,
        inTable: true,
        inForm: true,
        options: [], // Dynamic
      },
      budget: {
        type: 'currency',
        label: 'Budget',
        inTable: true,
        inForm: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      }
    },
    computed: {
      phase: {
        label: 'Phase',
        computation: {
          type: 'derived',
          compute: (event: any) => {
            const now = new Date();
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            if (end < now) return 'completed';
            if (start <= now && end >= now) return 'active';
            return 'planned';
          }
        },
        inTable: true,
        inDetail: true,
      }
    }
  },

  // Display
  display: {
    title: (record: any) => record.name || 'Untitled Event',
    subtitle: (record: any) => record.eventType || 'No Type',
    badge: (record: any) => {
      const start = new Date(record.startDate);
      const now = new Date();
      if (start < now) return { label: 'Past', variant: 'secondary' };
      return { label: 'Upcoming', variant: 'primary' };
    },
    defaultSort: { field: 'startDate', direction: 'asc' },
  },

  // Search
  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search events...',
  },

  // Filters
  filters: {
    quick: [
      { key: 'upcoming', label: 'Upcoming', query: { where: { startDate: { gte: 'now' } } } },
    ],
    advanced: ['eventType', 'venueId'],
  },

  // Layouts
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'upcoming', label: 'Upcoming', query: { where: { startDate: { gte: 'now' } } }, count: true },
        { key: 'live', label: 'Live', query: { where: { startDate: { lte: 'now' }, endDate: { gte: 'now' } } }, count: true },
        { key: 'past', label: 'Past', query: { where: { endDate: { lt: 'now' } } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'calendar', 'timeline'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'schedule', label: 'Schedule', content: { type: 'related', entity: 'schedule_items', foreignKey: 'eventId' } },
      ],
      overview: {
        stats: [
          { key: 'budget', label: 'Budget', value: { type: 'field', field: 'budget' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Event Details', content: { type: 'fields', fields: ['description'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['name', 'eventType', 'clientId', 'venueId'],
        },
        {
          key: 'times',
          title: 'Timing & Budget',
          fields: ['startDate', 'endDate', 'budget'],
        }
      ]
    }
  },

  // Views
  views: {
    table: {
      columns: [
        'name',
        { field: 'eventType', format: { type: 'badge', colorMap: { concert: '#3b82f6', festival: '#8b5cf6', corporate: '#f59e0b', conference: '#22c55e', private: '#ec4899', other: '#6b7280' } } },
        { field: 'startDate', format: { type: 'date' } },
        { field: 'endDate', format: { type: 'date' } },
        { field: 'venueId', format: { type: 'relation', entityType: 'venue' } },
        { field: 'budget', format: { type: 'currency' } },
        { field: 'phase', format: { type: 'badge', colorMap: { planning: '#6b7280', pre_production: '#3b82f6', production: '#eab308', wrap: '#f59e0b', complete: '#22c55e', cancelled: '#ef4444' } } },
      ],
    }
  },

  // Actions
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/productions/events/${record.id}` } }
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Event', variant: 'primary', handler: { type: 'function', fn: () => console.log('Create Event') } }
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
