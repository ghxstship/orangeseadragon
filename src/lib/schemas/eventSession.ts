import { defineSchema } from '../schema/defineSchema';

export const eventSessionSchema = defineSchema({
  identity: {
    name: 'Session',
    namePlural: 'Sessions',
    slug: 'modules/production/sessions',
    icon: 'Mic',
    description: 'Event sessions and schedule management',
  },
  data: {
    endpoint: '/api/event_sessions',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Session Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      session_type_id: {
        type: 'relation',
        label: 'Session Type',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'session_type', display: 'name' },
      },
      track_id: {
        type: 'relation',
        label: 'Track',
        inTable: true,
        inForm: true,
        relation: { entity: 'session_track', display: 'name' },
      },
      venue_space_id: {
        type: 'relation',
        label: 'Room/Space',
        inTable: true,
        inForm: true,
        relation: { entity: 'venue_space', display: 'name' },
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
      capacity: {
        type: 'number',
        label: 'Capacity',
        inTable: true,
        inForm: true,
      },
      registered_count: {
        type: 'number',
        label: 'Registered',
        inTable: true,
        inDetail: true,
      },
      description: {
        type: 'richtext',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      status_id: {
        type: 'relation',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'status', display: 'name', filter: { domain: 'session' } },
      },
      is_featured: {
        type: 'switch',
        label: 'Featured',
        inTable: true,
        inForm: true,
        default: false,
      },
      requires_registration: {
        type: 'switch',
        label: 'Requires Registration',
        inForm: true,
        default: false,
      },
      recording_url: {
        type: 'url',
        label: 'Recording URL',
        inDetail: true,
        inForm: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'New Session'),
    subtitle: (r: Record<string, unknown>) => {
      const event = r.event as Record<string, unknown> | undefined;
      return event ? String(event.name || '') : '';
    },
    badge: (r: Record<string, unknown>) => {
      const status = r.status as Record<string, unknown> | undefined;
      if (!status) return { label: 'Draft', variant: 'secondary' };
      return { label: String(status.name || ''), variant: 'default' };
    },
    defaultSort: { field: 'start_time', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search sessions...',
  },
  filters: {
    quick: [
      { key: 'featured', label: 'Featured', query: { where: { is_featured: true } } },
    ],
    advanced: ['event_id', 'session_type_id', 'track_id', 'status_id'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'featured', label: 'Featured', query: { where: { is_featured: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'calendar'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'speakers', label: 'Speakers', content: { type: 'related', entity: 'session_talent', foreignKey: 'session_id' } },
        { key: 'registrations', label: 'Registrations', content: { type: 'related', entity: 'session_registration', foreignKey: 'session_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'capacity', label: 'Capacity', value: { type: 'field', field: 'capacity' }, format: 'number' },
          { key: 'registered', label: 'Registered', value: { type: 'field', field: 'registered_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Session Details', content: { type: 'fields', fields: ['name', 'session_type_id', 'track_id', 'venue_space_id'] } },
          { key: 'schedule', title: 'Schedule', content: { type: 'fields', fields: ['start_time', 'end_time'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Session Details', fields: ['name', 'event_id', 'session_type_id', 'track_id', 'status_id'] },
        { key: 'schedule', title: 'Schedule & Location', fields: ['start_time', 'end_time', 'venue_space_id', 'capacity'] },
        { key: 'options', title: 'Options', fields: ['is_featured', 'requires_registration'] },
        { key: 'content', title: 'Content', fields: ['description', 'recording_url'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'event_id', 'session_type_id', 'start_time', 'venue_space_id', 'capacity', 'status_id'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/sessions/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Session', variant: 'primary', handler: { type: 'navigate', path: '/productions/sessions/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
