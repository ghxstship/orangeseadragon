import { defineSchema } from '../../schema-engine/defineSchema';

export const networkingSessionSchema = defineSchema({
  identity: {
    name: 'Networking Session',
    namePlural: 'Networking Sessions',
    slug: 'modules/production/networking',
    icon: 'Handshake',
    description: 'Networking events and matchmaking sessions',
  },
  data: {
    endpoint: '/api/networking_sessions',
    primaryKey: 'id',
    fields: {
      event_id: {
        type: 'relation',
        label: 'Event',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
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
      session_type: {
        type: 'select',
        label: 'Session Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Speed Networking', value: 'speed_networking' },
          { label: 'Roundtable', value: 'roundtable' },
          { label: 'Mixer', value: 'mixer' },
          { label: 'Matchmaking', value: 'matchmaking' },
          { label: 'Birds of a Feather', value: 'bof' },
          { label: 'Open Networking', value: 'open' },
        ],
      },
      venue_space_id: {
        type: 'relation',
        label: 'Location',
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
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      matching_criteria: {
        type: 'textarea',
        label: 'Matching Criteria',
        inForm: true,
        inDetail: true,
        helpText: 'Criteria for matching participants (for matchmaking sessions)',
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
        default: 'draft',
      },
      requires_registration: {
        type: 'switch',
        label: 'Requires Registration',
        inForm: true,
        default: true,
      },
      connections_made: {
        type: 'number',
        label: 'Connections Made',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'New Networking Session'),
    subtitle: (r: Record<string, unknown>) => {
      const types: Record<string, string> = {
        speed_networking: 'Speed Networking',
        roundtable: 'Roundtable',
        mixer: 'Mixer',
        matchmaking: 'Matchmaking',
        bof: 'Birds of a Feather',
        open: 'Open Networking',
      };
      return types[String(r.session_type)] || '';
    },
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        draft: 'secondary',
        published: 'default',
        in_progress: 'warning',
        completed: 'success',
        cancelled: 'destructive',
      };
      return { label: String(r.status || 'draft'), variant: variants[String(r.status)] || 'secondary' };
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
      { key: 'upcoming', label: 'Upcoming', query: { where: { status: 'published' } } },
    ],
    advanced: ['event_id', 'session_type', 'status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'upcoming', label: 'Upcoming', query: { where: { status: 'published' } }, count: true },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'participants', label: 'Participants', content: { type: 'related', entity: 'networking_participant', foreignKey: 'session_id' } },
        { key: 'matches', label: 'Matches', content: { type: 'related', entity: 'networking_match', foreignKey: 'session_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'registered', label: 'Registered', value: { type: 'field', field: 'registered_count' }, format: 'number' },
          { key: 'connections', label: 'Connections Made', value: { type: 'field', field: 'connections_made' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Session Details', content: { type: 'fields', fields: ['name', 'session_type', 'event_id', 'venue_space_id', 'start_time', 'end_time'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Session Details', fields: ['event_id', 'name', 'session_type', 'status'] },
        { key: 'schedule', title: 'Schedule', fields: ['venue_space_id', 'start_time', 'end_time'] },
        { key: 'capacity', title: 'Capacity', fields: ['capacity', 'requires_registration'] },
        { key: 'content', title: 'Content', fields: ['description', 'matching_criteria'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'event_id', 'session_type', 'start_time', 'registered_count', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/productions/networking/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Session', variant: 'primary', handler: { type: 'navigate', path: '/productions/networking/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
