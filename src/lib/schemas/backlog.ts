import { defineSchema } from '../schema/defineSchema';

export const backlogSchema = defineSchema({
  identity: {
    name: 'backlog',
    namePlural: 'Backlogs',
    slug: 'modules/projects/backlogs',
    icon: '📋',
    description: 'Manage product backlogs and user stories',
  },
  data: {
    endpoint: '/api/backlogs',
    primaryKey: 'id',
    fields: {
      title: { type: 'text', label: 'Title', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      projectId: { type: 'select', label: 'Project', required: true, inTable: true, inForm: true, options: [] },
      type: {
        type: 'select', label: 'Type', required: true, inTable: true, inForm: true,
        options: [
          { label: 'User Story', value: 'story', color: 'blue' },
          { label: 'Bug', value: 'bug', color: 'red' },
          { label: 'Task', value: 'task', color: 'gray' },
          { label: 'Epic', value: 'epic', color: 'purple' },
        ],
        default: 'story',
      },
      priority: {
        type: 'select', label: 'Priority', required: true, inTable: true, inForm: true,
        options: [
          { label: 'Critical', value: 'critical', color: 'red' },
          { label: 'High', value: 'high', color: 'orange' },
          { label: 'Medium', value: 'medium', color: 'yellow' },
          { label: 'Low', value: 'low', color: 'gray' },
        ],
        default: 'medium',
      },
      points: { type: 'number', label: 'Story Points', inTable: true, inForm: true, sortable: true },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true, searchable: true },
      acceptanceCriteria: { type: 'textarea', label: 'Acceptance Criteria', inForm: true, inDetail: true },
    },
  },
  display: {
    title: (record: Record<string, unknown>) => String(record.title || 'Untitled Item'),
    subtitle: (record: Record<string, unknown>) => `${record.type} • ${record.points || 0} points`,
    badge: (record: Record<string, unknown>) => ({ label: String(record.priority), variant: record.priority === 'critical' ? 'destructive' : 'secondary' }),
    defaultSort: { field: 'priority', direction: 'asc' },
  },
  search: { enabled: true, fields: ['title', 'description'], placeholder: 'Search backlog...' },
  filters: {
    quick: [
      { key: 'stories', label: 'Stories', query: { where: { type: 'story' } } },
      { key: 'bugs', label: 'Bugs', query: { where: { type: 'bug' } } },
    ],
    advanced: ['type', 'priority', 'projectId'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Items', query: { where: {} }, count: true },
        { key: 'stories', label: 'Stories', query: { where: { type: 'story' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }],
      overview: {
        stats: [{ key: 'points', label: 'Points', value: { type: 'field', field: 'points' } }],
        blocks: [{ key: 'details', title: 'Details', content: { type: 'fields', fields: ['description', 'acceptanceCriteria'] } }],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Item Details', fields: ['title', 'projectId', 'type', 'priority', 'points'] },
        { key: 'details', title: 'Description', fields: ['description', 'acceptanceCriteria'] },
      ],
    },
  },
  views: { table: { columns: ['title', 'type', 'priority', 'points', 'projectId'] } },
  actions: {
    row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/projects/backlogs/${r.id}` } }],
    bulk: [],
    global: [{ key: 'create', label: 'New Item', variant: 'primary', handler: { type: 'function', fn: () => {} } }],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
