import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * MEETING TYPE ENTITY SCHEMA (SSOT)
 * Configurable meeting templates for scheduling
 */
export const meetingTypeSchema = defineSchema({
  identity: {
    name: 'Meeting Type',
    namePlural: 'Meeting Types',
    slug: 'business/meetings/types',
    icon: 'Calendar',
    description: 'Meeting templates with booking links',
  },

  data: {
    endpoint: '/api/meeting-types',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      slug: {
        type: 'text',
        label: 'URL Slug',
        required: true,
        inForm: true,
        inDetail: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      duration_minutes: {
        type: 'select',
        label: 'Duration',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: '15 minutes', value: '15' },
          { label: '30 minutes', value: '30' },
          { label: '45 minutes', value: '45' },
          { label: '60 minutes', value: '60' },
          { label: '90 minutes', value: '90' },
          { label: '2 hours', value: '120' },
        ],
        default: 30,
      },
      location_type: {
        type: 'select',
        label: 'Location',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Video Call', value: 'video' },
          { label: 'Phone Call', value: 'phone' },
          { label: 'In Person', value: 'in_person' },
          { label: 'Custom', value: 'custom' },
        ],
        default: 'video',
      },
      video_provider: {
        type: 'select',
        label: 'Video Provider',
        inForm: true,
        options: [
          { label: 'Google Meet', value: 'google_meet' },
          { label: 'Zoom', value: 'zoom' },
          { label: 'Microsoft Teams', value: 'teams' },
        ],
      },
      buffer_before_minutes: {
        type: 'number',
        label: 'Buffer Before (min)',
        inForm: true,
        default: 0,
      },
      buffer_after_minutes: {
        type: 'number',
        label: 'Buffer After (min)',
        inForm: true,
        default: 15,
      },
      min_notice_hours: {
        type: 'number',
        label: 'Minimum Notice (hours)',
        inForm: true,
        default: 24,
      },
      max_days_ahead: {
        type: 'number',
        label: 'Max Days Ahead',
        inForm: true,
        default: 60,
      },
      requires_confirmation: {
        type: 'switch',
        label: 'Requires Confirmation',
        inForm: true,
        default: false,
      },
      color: {
        type: 'color',
        label: 'Color',
        inForm: true,
        default: '#3b82f6',
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
    },
  },

  display: {
    title: (record) => record.name || 'Meeting Type',
    subtitle: (record) => `${record.duration_minutes} min`,
    badge: (record) => {
      if (!record.is_active) return { label: 'Inactive', variant: 'secondary' };
      return undefined;
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search meeting types...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'all', label: 'All', query: { where: {} } },
    ],
    advanced: ['location_type', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
        { key: 'all', label: 'All', query: { where: {} }, count: true },
      ],
      defaultView: 'cards',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'bookings', label: 'Bookings', content: { type: 'related', entity: 'meeting_booking', foreignKey: 'meeting_type_id' } },
        { key: 'availability', label: 'Availability', content: { type: 'custom', component: 'AvailabilityEditor' } },
      ],
      overview: {
        stats: [
          { key: 'duration', label: 'Duration', value: { type: 'field', field: 'duration_minutes' }, format: 'number', suffix: ' min' },
        ],
        blocks: []
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Info',
          fields: ['name', 'slug', 'description', 'duration_minutes', 'color'],
        },
        {
          key: 'location',
          title: 'Location',
          fields: ['location_type', 'video_provider'],
        },
        {
          key: 'scheduling',
          title: 'Scheduling Rules',
          fields: ['buffer_before_minutes', 'buffer_after_minutes', 'min_notice_hours', 'max_days_ahead', 'requires_confirmation'],
        },
        {
          key: 'status',
          title: 'Status',
          fields: ['is_active'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'name',
        { field: 'duration_minutes', format: { type: 'number' } },
        'location_type',
        { field: 'is_active', format: { type: 'boolean' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/business/meetings/types/${record.id}` } },
      { key: 'copy_link', label: 'Copy Link', handler: { type: 'function', fn: () => {} } },
      { key: 'preview', label: 'Preview', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Meeting Type', variant: 'primary', handler: { type: 'navigate', path: () => '/business/meetings/types/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
