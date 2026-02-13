import { defineSchema } from '../schema/defineSchema';

/**
 * INCIDENT ENTITY SCHEMA (SSOT)
 * 
 * Enhanced incident management with control room features,
 * response tracking, and compliance audit trails.
 */
export const incidentSchema = defineSchema({
  identity: {
    name: 'incident',
    namePlural: 'Incidents',
    slug: 'modules/operations/incidents',
    icon: 'AlertTriangle',
    description: 'Incident reports, tracking, and control room management',
  },

  data: {
    endpoint: '/api/incident_reports',
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
      incident_number: {
        type: 'text',
        label: 'Incident #',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      eventId: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inForm: true,
      },
      venueId: {
        type: 'relation',
        label: 'Venue',
        inTable: true,
        inForm: true,
        relation: { entity: 'venue', display: 'name', searchable: true },
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
        inDetail: true,
        placeholder: 'e.g., Main Stage, Section A, Gate 3',
      },
      location_coordinates: {
        type: 'json',
        label: 'GPS Coordinates',
        inDetail: true,
      },
      type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Medical', value: 'medical', color: 'red' },
          { label: 'Security', value: 'security', color: 'orange' },
          { label: 'Safety', value: 'safety', color: 'yellow' },
          { label: 'Fire', value: 'fire', color: 'red' },
          { label: 'Weather', value: 'weather', color: 'blue' },
          { label: 'Crowd', value: 'crowd', color: 'purple' },
          { label: 'Technical', value: 'technical', color: 'cyan' },
          { label: 'Other', value: 'other', color: 'gray' },
        ],
      },
      severity: {
        type: 'select',
        label: 'Severity',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Critical', value: 'critical', color: 'red' },
          { label: 'High', value: 'high', color: 'orange' },
          { label: 'Medium', value: 'medium', color: 'yellow' },
          { label: 'Low', value: 'low', color: 'gray' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Open', value: 'open', color: 'red' },
          { label: 'Dispatched', value: 'dispatched', color: 'orange' },
          { label: 'On Scene', value: 'on-scene', color: 'yellow' },
          { label: 'In Progress', value: 'in-progress', color: 'blue' },
          { label: 'Resolved', value: 'resolved', color: 'green' },
          { label: 'Closed', value: 'closed', color: 'gray' },
        ],
        default: 'open',
      },
      escalation_level: {
        type: 'number',
        label: 'Escalation Level',
        inTable: true,
        inDetail: true,
      },
      reported_by_id: {
        type: 'relation',
        label: 'Reported By',
        inTable: true,
        inForm: true,
      },
      assigned_to_id: {
        type: 'relation',
        relation: { entity: 'user', display: 'full_name', searchable: true },
        label: 'Assigned To',
        inTable: true,
        inForm: true,
      },
      response_team_ids: {
        type: 'json',
        label: 'Response Team',
        inForm: true,
        inDetail: true,
      },
      reportedAt: {
        type: 'datetime',
        label: 'Reported At',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      dispatched_at: {
        type: 'datetime',
        label: 'Dispatched At',
        inDetail: true,
      },
      on_scene_at: {
        type: 'datetime',
        label: 'On Scene At',
        inDetail: true,
      },
      resolved_at: {
        type: 'datetime',
        label: 'Resolved At',
        inDetail: true,
      },
      closed_at: {
        type: 'datetime',
        label: 'Closed At',
        inDetail: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        required: true,
        inForm: true,
        inDetail: true,
      },
      initial_actions: {
        type: 'textarea',
        label: 'Initial Actions Taken',
        inForm: true,
        inDetail: true,
      },
      resolution: {
        type: 'textarea',
        label: 'Resolution',
        inForm: true,
        inDetail: true,
      },
      follow_up_required: {
        type: 'switch',
        label: 'Follow-up Required',
        inForm: true,
        inDetail: true,
      },
      follow_up_notes: {
        type: 'textarea',
        label: 'Follow-up Notes',
        inForm: true,
        inDetail: true,
      },
      photos: {
        type: 'file',
        label: 'Photos/Evidence',
        inForm: true,
        inDetail: true,
      },
      witnesses: {
        type: 'textarea',
        label: 'Witness Information',
        inForm: true,
        inDetail: true,
      },
      external_agencies: {
        type: 'text',
        label: 'External Agencies Involved',
        inForm: true,
        inDetail: true,
      },
    },
    computed: {
      response_time_seconds: {
        label: 'Response Time',
        computation: {
          type: 'derived',
          compute: (incident: Record<string, unknown>) => {
            if (!incident.reportedAt || !incident.on_scene_at) return null;
            const reported = new Date(incident.reportedAt as string).getTime();
            const onScene = new Date(incident.on_scene_at as string).getTime();
            return Math.round((onScene - reported) / 1000);
          },
        },
        inTable: true,
        inDetail: true,
      },
      resolution_time_seconds: {
        label: 'Resolution Time',
        computation: {
          type: 'derived',
          compute: (incident: Record<string, unknown>) => {
            if (!incident.reportedAt || !incident.resolved_at) return null;
            const reported = new Date(incident.reportedAt as string).getTime();
            const resolved = new Date(incident.resolved_at as string).getTime();
            return Math.round((resolved - reported) / 1000);
          },
        },
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.title || 'Untitled Incident'),
    subtitle: (r: Record<string, unknown>) => `${r.type || ''} - ${r.location || 'Unknown location'}`,
    badge: (r: Record<string, unknown>) => ({
      label: String(r.severity),
      variant: r.severity === 'critical' ? 'destructive' : r.severity === 'high' ? 'warning' : 'secondary',
    }),
    defaultSort: { field: 'reportedAt', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description', 'location', 'incident_number'],
    placeholder: 'Search incidents...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: { in: ['open', 'dispatched', 'on-scene', 'in-progress'] } } } },
      { key: 'critical', label: 'Critical', query: { where: { severity: 'critical' } } },
    ],
    advanced: ['type', 'severity', 'status', 'eventId', 'venueId', 'assigned_to_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'active', label: 'Active', query: { where: { status: { in: ['open', 'dispatched', 'on-scene', 'in-progress'] } } }, count: true },
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'open', label: 'Open', query: { where: { status: 'open' } }, count: true },
        { key: 'in-progress', label: 'In Progress', query: { where: { status: 'in-progress' } }, count: true },
        { key: 'resolved', label: 'Resolved', query: { where: { status: 'resolved' } } },
        { key: 'closed', label: 'Closed', query: { where: { status: 'closed' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'map'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'timeline', label: 'Timeline', content: { type: 'activity' } },
        { key: 'audit', label: 'Audit Log', content: { type: 'related', entity: 'audit_logs', foreignKey: 'incident_id' } },
      ],
      overview: {
        stats: [
          { key: 'response', label: 'Response Time', value: { type: 'computed', compute: (record: Record<string, unknown>) => (record.response_time_seconds as number) ?? 0 }, format: 'duration' },
          { key: 'resolution', label: 'Resolution Time', value: { type: 'computed', compute: (record: Record<string, unknown>) => (record.resolution_time_seconds as number) ?? 0 }, format: 'duration' },
        ],
        blocks: [
          { key: 'desc', title: 'Description', content: { type: 'fields', fields: ['description', 'initial_actions'] } },
          { key: 'resolution', title: 'Resolution', content: { type: 'fields', fields: ['resolution', 'follow_up_notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Incident Details', fields: ['title', 'type', 'severity', 'status', 'reportedAt'] },
        { key: 'location', title: 'Location', fields: ['eventId', 'venueId', 'location'] },
        { key: 'assignment', title: 'Assignment', fields: ['reported_by_id', 'assigned_to_id'] },
        { key: 'details', title: 'Details', fields: ['description', 'initial_actions'] },
        { key: 'resolution', title: 'Resolution', fields: ['resolution', 'follow_up_required', 'follow_up_notes'] },
        { key: 'evidence', title: 'Evidence', fields: ['photos', 'witnesses', 'external_agencies'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['incident_number', 'title', 'type', 'severity', 'status', 'location', 'reportedAt', 'assigned_to_id'],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'open', label: 'Open', color: 'red' },
        { value: 'dispatched', label: 'Dispatched', color: 'orange' },
        { value: 'on-scene', label: 'On Scene', color: 'yellow' },
        { value: 'in-progress', label: 'In Progress', color: 'blue' },
        { value: 'resolved', label: 'Resolved', color: 'green' },
      ],
      card: {
        title: 'title',
        subtitle: 'location',
        fields: ['severity', 'type'],
      },
    },
    map: {
      latitudeField: 'location_coordinates.lat',
      longitudeField: 'location_coordinates.lng',
      titleField: 'title',
      markerColor: 'severity',
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/incidents/${r.id}` } },
      { key: 'dispatch', label: 'Dispatch', variant: 'primary', handler: { type: 'function', fn: () => {} } },
      { key: 'escalate', label: 'Escalate', variant: 'warning', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'assign', label: 'Assign', handler: { type: 'function', fn: () => {} } },
      { key: 'close', label: 'Close', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'Report Incident', variant: 'destructive', handler: { type: 'function', fn: () => {} } },
      { key: 'control-room', label: 'Control Room', variant: 'primary', handler: { type: 'navigate', path: () => '/operations/incidents/control-room' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'eventId', label: 'Event' },
      { entity: 'venue', foreignKey: 'venueId', label: 'Venue' },
      { entity: 'user', foreignKey: 'reported_by_id', label: 'Reported By' },
      { entity: 'user', foreignKey: 'assigned_to_id', label: 'Assigned To' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
