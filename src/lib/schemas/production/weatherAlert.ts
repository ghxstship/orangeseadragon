import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * WEATHER ALERT ENTITY SCHEMA (SSOT)
 *
 * Weather alerts and conditions for event operations.
 */
export const weatherAlertSchema = defineSchema({
  identity: {
    name: 'Weather Alert',
    namePlural: 'Weather Alerts',
    slug: 'modules/operations/weather',
    icon: 'CloudRain',
    description: 'Weather alerts and conditions for event operations',
  },

  data: {
    endpoint: '/api/weather-alerts',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Alert Title',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      alert_type: {
        type: 'select',
        label: 'Alert Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Watch', value: 'watch', color: 'yellow' },
          { label: 'Warning', value: 'warning', color: 'orange' },
          { label: 'Advisory', value: 'advisory', color: 'blue' },
          { label: 'Emergency', value: 'emergency', color: 'red' },
        ],
      },
      severity: {
        type: 'select',
        label: 'Severity',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Low', value: 'low', color: 'green' },
          { label: 'Moderate', value: 'moderate', color: 'yellow' },
          { label: 'High', value: 'high', color: 'orange' },
          { label: 'Extreme', value: 'extreme', color: 'red' },
        ],
      },
      weather_type: {
        type: 'select',
        label: 'Weather Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Rain', value: 'rain' },
          { label: 'Wind', value: 'wind' },
          { label: 'Lightning', value: 'lightning' },
          { label: 'Heat', value: 'heat' },
          { label: 'Cold', value: 'cold' },
          { label: 'Snow/Ice', value: 'snow_ice' },
          { label: 'Fog', value: 'fog' },
          { label: 'Tornado', value: 'tornado' },
          { label: 'Hurricane', value: 'hurricane' },
        ],
      },
      event_id: {
        type: 'relation',
        relation: { entity: 'event', display: 'name', searchable: true },
        label: 'Event',
        inTable: true,
        inForm: true,
      },
      venue_id: {
        type: 'relation',
        relation: { entity: 'venue', display: 'name', searchable: true },
        label: 'Venue',
        inForm: true,
        inDetail: true,
      },
      start_time: {
        type: 'datetime',
        label: 'Start Time',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      end_time: {
        type: 'datetime',
        label: 'End Time',
        inForm: true,
        inDetail: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      action_taken: {
        type: 'textarea',
        label: 'Action Taken',
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Active', value: 'active', color: 'red' },
          { label: 'Monitoring', value: 'monitoring', color: 'yellow' },
          { label: 'Resolved', value: 'resolved', color: 'green' },
          { label: 'Cancelled', value: 'cancelled', color: 'gray' },
        ],
        default: 'active',
      },
    },
  },

  display: {
    title: (record) => record.title || 'Weather Alert',
    subtitle: (record) => record.weather_type || '',
    badge: (record) => {
      const colors: Record<string, string> = { active: 'destructive', monitoring: 'warning', resolved: 'success', cancelled: 'secondary' };
      return { label: record.status || 'Active', variant: colors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'start_time', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description'],
    placeholder: 'Search weather alerts...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
    ],
    advanced: ['alert_type', 'severity', 'status'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
        { key: 'monitoring', label: 'Monitoring', query: { where: { status: 'monitoring' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'alert', title: 'Alert Info', content: { type: 'fields', fields: ['alert_type', 'severity', 'weather_type', 'status'] } },
          { key: 'location', title: 'Location', content: { type: 'fields', fields: ['event_id', 'venue_id'] } },
          { key: 'timing', title: 'Timing', content: { type: 'fields', fields: ['start_time', 'end_time'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Alert Details', fields: ['title', 'alert_type', 'severity', 'weather_type', 'status'] },
        { key: 'location', title: 'Location', fields: ['event_id', 'venue_id'] },
        { key: 'timing', title: 'Timing', fields: ['start_time', 'end_time'] },
        { key: 'details', title: 'Details', fields: ['description', 'action_taken'] },
      ],
    },
  },

  views: {
    table: {
      columns: [
        'title',
        { field: 'alert_type', format: { type: 'badge', colorMap: { watch: '#eab308', warning: '#f59e0b', advisory: '#3b82f6', emergency: '#ef4444' } } },
        { field: 'severity', format: { type: 'badge', colorMap: { low: '#22c55e', moderate: '#eab308', high: '#f59e0b', extreme: '#ef4444' } } },
        { field: 'event_id', format: { type: 'relation', entityType: 'event' } },
        { field: 'start_time', format: { type: 'date' } },
        { field: 'status', format: { type: 'badge', colorMap: { active: '#ef4444', monitoring: '#eab308', resolved: '#22c55e', cancelled: '#6b7280' } } },
      ],
    },
  },

  actions: {
    row: [],
    bulk: [],
    global: [
      { key: 'create', label: 'New Alert', variant: 'primary', handler: { type: 'navigate', path: () => '/operations/comms/weather/new' } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
