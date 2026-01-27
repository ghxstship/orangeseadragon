import { defineSchema } from '../schema/defineSchema';

/**
 * CALENDAR EVENT ENTITY SCHEMA (SSOT)
 */
export const calendarSchema = defineSchema({
  identity: {
    name: 'Calendar Event',
    namePlural: 'Calendar',
    slug: 'core/calendar',
    icon: '📅',
    description: 'Calendar events and scheduling',
  },

  data: {
    endpoint: '/api/calendar',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      event_type: {
        type: 'select',
        label: 'Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Meeting', value: 'meeting' },
          { label: 'Event', value: 'event' },
          { label: 'Deadline', value: 'deadline' },
          { label: 'Reminder', value: 'reminder' },
          { label: 'Block', value: 'block' },
        ],
      },
      start_time: {
        type: 'datetime',
        label: 'Start Time',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      end_time: {
        type: 'datetime',
        label: 'End Time',
        required: true,
        inTable: true,
        inForm: true,
      },
      all_day: {
        type: 'switch',
        label: 'All Day',
        inForm: true,
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      attendees: {
        type: 'multiselect',
        label: 'Attendees',
        inForm: true,
        inDetail: true,
        options: [],
      },
      recurrence: {
        type: 'select',
        label: 'Recurrence',
        inForm: true,
        options: [
          { label: 'None', value: 'none' },
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Yearly', value: 'yearly' },
        ],
      },
      color: {
        type: 'select',
        label: 'Color',
        inForm: true,
        options: [
          { label: 'Blue', value: 'blue' },
          { label: 'Green', value: 'green' },
          { label: 'Red', value: 'red' },
          { label: 'Yellow', value: 'yellow' },
          { label: 'Purple', value: 'purple' },
        ],
      },
    },
  },

  display: {
    title: (record) => record.title || 'Untitled Event',
    subtitle: (record) => record.event_type || '',
    defaultSort: { field: 'start_time', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description', 'location'],
    placeholder: 'Search calendar...',
  },

  filters: {
    quick: [],
    advanced: ['event_type'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Events', query: { where: {} } },
        { key: 'meetings', label: 'Meetings', query: { where: { event_type: 'meeting' } } },
        { key: 'deadlines', label: 'Deadlines', query: { where: { event_type: 'deadline' } } },
      ],
      defaultView: 'calendar',
      availableViews: ['calendar', 'table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'details', title: 'Event Details', content: { type: 'fields', fields: ['description', 'location', 'attendees'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Event Details',
          fields: ['title', 'description', 'event_type', 'color'],
        },
        {
          key: 'timing',
          title: 'Date & Time',
          fields: ['start_time', 'end_time', 'all_day', 'recurrence'],
        },
        {
          key: 'location',
          title: 'Location & Attendees',
          fields: ['location', 'attendees'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['title', 'event_type', 'start_time', 'end_time', 'location'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/core/calendar/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Event', variant: 'primary', handler: { type: 'navigate', path: () => '/core/calendar/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
