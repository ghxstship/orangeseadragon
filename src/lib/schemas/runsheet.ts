import { defineSchema } from '../schema/defineSchema';

/**
 * RUNSHEET ENTITY SCHEMA (SSOT)
 * 
 * Event runsheets with automatic time calculations, real-time sync,
 * and live cue calling support.
 */
export const runsheetSchema = defineSchema({
  identity: {
    name: 'runsheet',
    namePlural: 'Runsheets',
    slug: 'modules/operations/runsheets',
    icon: 'ScrollText',
    description: 'Event runsheets and show flows',
  },
  data: {
    endpoint: '/api/runsheets',
    primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Runsheet Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      eventId: { type: 'select', label: 'Event', required: true, inTable: true, inForm: true, options: [] },
      stageId: { type: 'select', label: 'Stage', inTable: true, inForm: true, options: [] },
      date: { type: 'date', label: 'Date', required: true, inTable: true, inForm: true, sortable: true },
      start_time: { type: 'text', label: 'Start Time', required: true, inTable: true, inForm: true, placeholder: 'HH:MM' },
      status: {
        type: 'select', label: 'Status', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Published', value: 'published', color: 'green' },
          { label: 'Live', value: 'live', color: 'emerald' },
          { label: 'Locked', value: 'locked', color: 'blue' },
          { label: 'Completed', value: 'completed', color: 'purple' },
        ],
        default: 'draft',
      },
      show_mode_active: { type: 'switch', label: 'Show Mode Active', inDetail: true },
      current_cue_id: { type: 'relation', label: 'Current Cue', inDetail: true },
      total_duration_seconds: { type: 'number', label: 'Total Duration (sec)', inTable: true, inDetail: true },
      actual_start_time: { type: 'datetime', label: 'Actual Start', inDetail: true },
      actual_end_time: { type: 'datetime', label: 'Actual End', inDetail: true },
      version: { type: 'number', label: 'Version', inDetail: true },
      websocket_channel: { type: 'text', label: 'Sync Channel', inDetail: true },
      notes: { type: 'textarea', label: 'Notes', inForm: true, inDetail: true },
    },
    computed: {
      total_duration_display: {
        label: 'Total Duration',
        computation: {
          type: 'derived',
          compute: (runsheet: Record<string, unknown>) => {
            const seconds = runsheet.total_duration_seconds as number;
            if (!seconds) return '-';
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            if (hours > 0) {
              return `${hours}h ${mins}m`;
            }
            return `${mins}m ${secs}s`;
          },
        },
        inTable: true,
        inDetail: true,
      },
      cue_count: {
        label: 'Cues',
        computation: {
          type: 'relation-count',
          entity: 'runsheet_cues',
          foreignKey: 'runsheet_id',
        },
        inTable: true,
        inDetail: true,
      },
      variance_display: {
        label: 'Variance',
        computation: {
          type: 'derived',
          compute: (runsheet: Record<string, unknown>) => {
            if (!runsheet.actual_start_time || !runsheet.actual_end_time) return '-';
            const actual = (new Date(runsheet.actual_end_time as string).getTime() - 
                          new Date(runsheet.actual_start_time as string).getTime()) / 1000;
            const planned = runsheet.total_duration_seconds as number || 0;
            const variance = Math.round(actual - planned);
            if (variance === 0) return 'On time';
            if (variance > 0) return `+${Math.floor(variance / 60)}m over`;
            return `${Math.floor(Math.abs(variance) / 60)}m under`;
          },
        },
        inDetail: true,
      },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Runsheet'),
    subtitle: (record: Record<string, unknown>) => `${record.date || ''} ${record.start_time || ''}`.trim(),
    badge: (record: Record<string, unknown>) => {
      const statusMap: Record<string, { label: string; variant: string }> = {
        draft: { label: 'Draft', variant: 'secondary' },
        published: { label: 'Published', variant: 'primary' },
        live: { label: 'LIVE', variant: 'destructive' },
        locked: { label: 'Locked', variant: 'secondary' },
        completed: { label: 'Completed', variant: 'default' },
      };
      return statusMap[record.status as string] || { label: 'Draft', variant: 'secondary' };
    },
    defaultSort: { field: 'date', direction: 'desc' },
  },

  search: { enabled: true, fields: ['name', 'notes'], placeholder: 'Search runsheets...' },

  filters: {
    quick: [
      { key: 'live', label: 'Live Now', query: { where: { status: 'live' } } },
      { key: 'published', label: 'Published', query: { where: { status: 'published' } } },
    ],
    advanced: ['status', 'eventId', 'stageId', 'date'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'live', label: 'Live', query: { where: { status: 'live' } }, count: true },
        { key: 'today', label: 'Today', query: { where: { date: { gte: 'today', lt: 'tomorrow' } } }, count: true },
        { key: 'upcoming', label: 'Upcoming', query: { where: { date: { gte: 'now' } } }, count: true },
        { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'calendar'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'cues', label: 'Cues', content: { type: 'related', entity: 'runsheet_cues', foreignKey: 'runsheet_id' } },
        { key: 'show-mode', label: 'Show Mode', content: { type: 'custom', component: 'RunsheetShowMode' } },
      ],
      overview: {
        stats: [
          { key: 'duration', label: 'Total Duration', value: { type: 'field', field: 'total_duration_seconds' }, format: 'duration' },
          { key: 'cues', label: 'Cues', value: { type: 'computed', compute: (record: Record<string, unknown>) => (record.cue_count as number) ?? 0 }, format: 'number' },
        ],
        blocks: [
          { key: 'timing', title: 'Timing', content: { type: 'fields', fields: ['start_time', 'actual_start_time', 'actual_end_time'] } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Runsheet Details', fields: ['name', 'eventId', 'stageId'] },
        { key: 'timing', title: 'Timing', fields: ['date', 'start_time'] },
        { key: 'status', title: 'Status', fields: ['status'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'eventId', 'stageId', 'date', 'start_time', 'total_duration_display', 'status'],
    },
    calendar: {
      titleField: 'name',
      startField: 'date',
      colorField: 'status',
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/runsheets/${r.id}` } },
      { key: 'show-mode', label: 'Show Mode', variant: 'primary', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/runsheets/${r.id}/show-mode` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'publish', label: 'Publish', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'New Runsheet', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'eventId', label: 'Event' },
      { entity: 'stage', foreignKey: 'stageId', label: 'Stage' },
    ],
  },



  permissions: { create: true, read: true, update: true, delete: true },
});
