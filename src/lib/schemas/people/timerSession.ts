import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * TIMER SESSION ENTITY SCHEMA (SSOT)
 *
 * Real-time start/stop timer for time tracking.
 * Supports pause/resume, project/task linking,
 * and conversion to time entries.
 */
export const timerSessionSchema = defineSchema({
  identity: {
    name: 'Timer Session',
    namePlural: 'Timer Sessions',
    slug: 'modules/time/timers',
    icon: 'Timer',
    description: 'Real-time start/stop timer for time tracking',
  },

  data: {
    endpoint: '/api/timer-sessions',
    primaryKey: 'id',
    fields: {
      user_id: {
        type: 'relation',
        label: 'User',
        required: true,
        inTable: true,
      },
      project_id: {
        type: 'relation',
        label: 'Project',
        inTable: true,
        inForm: true,
      },
      task_id: {
        type: 'relation',
        label: 'Task',
        inTable: true,
        inForm: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      description: {
        type: 'text',
        label: 'Description',
        inTable: true,
        inForm: true,
        placeholder: 'What are you working on?',
      },
      is_billable: {
        type: 'switch',
        label: 'Billable',
        inTable: true,
        inForm: true,
        default: true,
      },
      started_at: {
        type: 'datetime',
        label: 'Started At',
        required: true,
        inTable: true,
        sortable: true,
      },
      stopped_at: {
        type: 'datetime',
        label: 'Stopped At',
        inTable: true,
      },
      is_running: {
        type: 'switch',
        label: 'Running',
        inTable: true,
        default: true,
      },
      accumulated_seconds: {
        type: 'number',
        label: 'Accumulated Seconds',
        inDetail: true,
        default: 0,
      },
      time_entry_id: {
        type: 'relation',
        relation: { entity: 'timeEntry', display: 'description' },
        label: 'Converted To',
        inDetail: true,
      },
    },
    computed: {
      duration: {
        label: 'Duration',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const acc = Number(r.accumulated_seconds) || 0;
            if (r.is_running && r.started_at) {
              const started = new Date(String(r.last_resumed_at || r.started_at)).getTime();
              const now = Date.now();
              return acc + Math.floor((now - started) / 1000);
            }
            return acc;
          },
        },
        format: 'duration',
        inTable: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.description || 'Timer'),
    subtitle: (r: Record<string, unknown>) => r.is_running ? 'Running...' : 'Stopped',
    badge: (r: Record<string, unknown>) => r.is_running
      ? { label: 'Running', variant: 'success' }
      : r.time_entry_id
        ? { label: 'Converted', variant: 'primary' }
        : { label: 'Stopped', variant: 'secondary' },
    defaultSort: { field: 'started_at', direction: 'desc' },
  },

  search: { enabled: true, fields: ['description'], placeholder: 'Search timers...' },

  filters: {
    quick: [
      { key: 'running', label: 'Running', query: { where: { is_running: true } } },
    ],
    advanced: ['is_running', 'project_id', 'user_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'running', label: 'Running', query: { where: { is_running: true } }, count: true },
        { key: 'stopped', label: 'Stopped', query: { where: { is_running: false } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: { stats: [], blocks: [] },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Timer', fields: ['project_id', 'task_id', 'event_id', 'description', 'is_billable'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['description', 'project_id', 'task_id', 'is_billable', 'started_at', 'duration', 'is_running'],
    },
  },

  actions: {
    row: [
      { key: 'stop', label: 'Stop', variant: 'destructive', handler: { type: 'api', endpoint: '/api/timer-sessions/{id}/stop', method: 'POST' }, condition: (r: Record<string, unknown>) => r.is_running === true },
      { key: 'resume', label: 'Resume', variant: 'primary', handler: { type: 'api', endpoint: '/api/timer-sessions/{id}/resume', method: 'POST' }, condition: (r: Record<string, unknown>) => r.is_running === false && !r.time_entry_id },
      { key: 'convert', label: 'Save as Time Entry', handler: { type: 'api', endpoint: '/api/timer-sessions/{id}/convert', method: 'POST' }, condition: (r: Record<string, unknown>) => r.is_running === false && !r.time_entry_id },
      { key: 'discard', label: 'Discard', variant: 'destructive', handler: { type: 'function', fn: () => {} }, condition: (r: Record<string, unknown>) => !r.time_entry_id },
    ],
    bulk: [],
    global: [
      { key: 'start', label: 'Start Timer', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },

  relationships: {
    belongsTo: [
      { entity: 'user', foreignKey: 'user_id', label: 'User' },
      { entity: 'project', foreignKey: 'project_id', label: 'Project' },
      { entity: 'task', foreignKey: 'task_id', label: 'Task' },
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'timeEntry', foreignKey: 'time_entry_id', label: 'Converted To' },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
