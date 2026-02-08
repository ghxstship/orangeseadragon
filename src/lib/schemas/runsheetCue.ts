import { defineSchema } from '../schema/defineSchema';

/**
 * RUNSHEET CUE ENTITY SCHEMA (SSOT)
 * 
 * Individual cues within a runsheet with timing, status, and cue type.
 * Supports automatic time calculations and live cue calling.
 */
export const runsheetCueSchema = defineSchema({
  identity: {
    name: 'runsheet_cue',
    namePlural: 'Runsheet Cues',
    slug: 'operations/runsheets/cues',
    icon: 'Play',
    description: 'Individual cues within a runsheet',
  },

  data: {
    endpoint: '/api/runsheet-cues',
    primaryKey: 'id',
    fields: {
      runsheet_id: {
        type: 'relation',
        label: 'Runsheet',
        required: true,
        inForm: true,
      },
      sequence: {
        type: 'number',
        label: 'Sequence',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      name: {
        type: 'text',
        label: 'Cue Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      cue_type: {
        type: 'select',
        label: 'Cue Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Action', value: 'action', color: 'blue' },
          { label: 'Audio', value: 'audio', color: 'purple' },
          { label: 'Video', value: 'video', color: 'pink' },
          { label: 'Lighting', value: 'lighting', color: 'yellow' },
          { label: 'Transition', value: 'transition', color: 'cyan' },
          { label: 'Break', value: 'break', color: 'gray' },
          { label: 'Speech', value: 'speech', color: 'green' },
          { label: 'Presentation', value: 'presentation', color: 'orange' },
          { label: 'Music', value: 'music', color: 'indigo' },
          { label: 'Standby', value: 'standby', color: 'amber' },
        ],
        default: 'action',
      },
      duration_seconds: {
        type: 'number',
        label: 'Duration (seconds)',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      scheduled_time: {
        type: 'text',
        label: 'Scheduled Time',
        inTable: true,
        inForm: true,
        inDetail: true,
        placeholder: 'HH:MM:SS',
      },
      actual_start_time: {
        type: 'datetime',
        label: 'Actual Start',
        inDetail: true,
      },
      actual_end_time: {
        type: 'datetime',
        label: 'Actual End',
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Pending', value: 'pending', color: 'gray' },
          { label: 'Standby', value: 'standby', color: 'amber' },
          { label: 'Go', value: 'go', color: 'green' },
          { label: 'Complete', value: 'complete', color: 'blue' },
          { label: 'Skipped', value: 'skipped', color: 'red' },
        ],
        default: 'pending',
      },
      assigned_to_id: {
        type: 'relation',
        label: 'Assigned To',
        inTable: true,
        inForm: true,
      },
      department_id: {
        type: 'relation',
        label: 'Department',
        inForm: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      script_text: {
        type: 'textarea',
        label: 'Script/Teleprompter Text',
        inForm: true,
        inDetail: true,
      },
      media_url: {
        type: 'text',
        label: 'Media URL',
        inForm: true,
        inDetail: true,
      },
      is_locked: {
        type: 'switch',
        label: 'Lock Time',
        inForm: true,
        inDetail: true,
      },
    },
    computed: {
      duration_display: {
        label: 'Duration',
        computation: {
          type: 'derived',
          compute: (cue: Record<string, unknown>) => {
            const seconds = cue.duration_seconds as number;
            if (!seconds) return '-';
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
          },
        },
        inTable: true,
        inDetail: true,
      },
      variance_seconds: {
        label: 'Variance',
        computation: {
          type: 'derived',
          compute: (cue: Record<string, unknown>) => {
            if (!cue.actual_start_time || !cue.actual_end_time) return null;
            const actual = (new Date(cue.actual_end_time as string).getTime() - 
                          new Date(cue.actual_start_time as string).getTime()) / 1000;
            const planned = cue.duration_seconds as number || 0;
            return Math.round(actual - planned);
          },
        },
        inDetail: true,
      },
    },
  },

  display: {
    title: (record: Record<string, unknown>) => String(record.name || 'Untitled Cue'),
    subtitle: (record: Record<string, unknown>) => String(record.cue_type || ''),
    badge: (record: Record<string, unknown>) => {
      const statusColors: Record<string, string> = {
        pending: 'secondary',
        standby: 'warning',
        go: 'success',
        complete: 'primary',
        skipped: 'destructive',
      };
      return { 
        label: String(record.status || 'pending'), 
        variant: statusColors[record.status as string] || 'secondary' 
      };
    },
    defaultSort: { field: 'sequence', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['name', 'description', 'notes'],
    placeholder: 'Search cues...',
  },

  filters: {
    quick: [
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
      { key: 'complete', label: 'Complete', query: { where: { status: 'complete' } } },
    ],
    advanced: ['status', 'cue_type', 'assigned_to_id', 'department_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Cues', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } }, count: true },
        { key: 'complete', label: 'Complete', query: { where: { status: 'complete' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [
          { key: 'duration', label: 'Duration', value: { type: 'field', field: 'duration_seconds' }, format: 'number' },
        ],
        blocks: [
          { key: 'script', title: 'Script', content: { type: 'fields', fields: ['script_text'] } },
          { key: 'notes', title: 'Notes', content: { type: 'fields', fields: ['notes'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Cue Details',
          fields: ['name', 'description', 'cue_type', 'sequence'],
        },
        {
          key: 'timing',
          title: 'Timing',
          fields: ['duration_seconds', 'scheduled_time', 'is_locked'],
        },
        {
          key: 'assignment',
          title: 'Assignment',
          fields: ['assigned_to_id', 'department_id'],
        },
        {
          key: 'content',
          title: 'Content',
          fields: ['script_text', 'media_url', 'notes'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: ['sequence', 'name', 'cue_type', 'duration_display', 'scheduled_time', 'status', 'assigned_to_id'],
    },
    list: {
      titleField: 'name',
      subtitleField: 'cue_type',
      metaFields: ['duration_display', 'scheduled_time'],
      showChevron: true,
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/runsheets/${r.runsheet_id}/cues/${r.id}` } },
      { key: 'go', label: 'GO', variant: 'primary', handler: { type: 'function', fn: () => {} } },
      { key: 'skip', label: 'Skip', variant: 'destructive', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [
      { key: 'delete', label: 'Delete', variant: 'destructive', handler: { type: 'function', fn: () => {} } },
    ],
    global: [
      { key: 'create', label: 'Add Cue', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
