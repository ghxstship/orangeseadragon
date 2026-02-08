import { defineSchema } from '../schema/defineSchema';

/**
 * PROJECT POST-MORTEM / AFTER ACTION REVIEW (AAR) SCHEMA (SSOT)
 *
 * Structured retrospective with:
 * - What went well / wrong / improve sections
 * - Metrics snapshot (budget variance, schedule, satisfaction)
 * - Action items tracking
 * - Links to lessons learned database
 */
export const projectPostMortemSchema = defineSchema({
  identity: {
    name: 'Post-Mortem',
    namePlural: 'Post-Mortems',
    slug: 'modules/projects/post-mortems',
    icon: 'ClipboardCheck',
    description: 'After Action Reviews with lessons learned and improvement tracking',
  },

  data: {
    endpoint: '/api/project-post-mortems',
    primaryKey: 'id',
    fields: {
      project_id: {
        type: 'relation',
        label: 'Project',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        relation: { entity: 'projects', display: 'name' },
      },
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        inTable: true,
        inForm: true,
        default: 'draft',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'In Review', value: 'in_review' },
          { label: 'Finalized', value: 'finalized' },
          { label: 'Archived', value: 'archived' },
        ],
      },
      meeting_date: {
        type: 'date',
        label: 'Meeting Date',
        inTable: true,
        inForm: true,
      },
      facilitator_id: {
        type: 'relation',
        label: 'Facilitator',
        inTable: true,
        inForm: true,
        relation: { entity: 'users', display: 'name' },
      },
      summary: {
        type: 'richtext',
        label: 'Summary',
        inForm: true,
        inDetail: true,
      },
      what_went_well: {
        type: 'richtext',
        label: 'What Went Well',
        inForm: true,
        inDetail: true,
      },
      what_went_wrong: {
        type: 'richtext',
        label: 'What Went Wrong',
        inForm: true,
        inDetail: true,
      },
      what_to_improve: {
        type: 'richtext',
        label: 'What To Improve',
        inForm: true,
        inDetail: true,
      },
      action_items: {
        type: 'json',
        label: 'Action Items',
        inForm: true,
        inDetail: true,
      },
      budget_variance_pct: {
        type: 'number',
        label: 'Budget Variance %',
        inTable: true,
        inDetail: true,
      },
      schedule_variance_days: {
        type: 'number',
        label: 'Schedule Variance (days)',
        inDetail: true,
      },
      client_satisfaction_score: {
        type: 'number',
        label: 'Client Satisfaction (1-10)',
        inTable: true,
        inDetail: true,
        min: 1,
        max: 10,
      },
      team_satisfaction_score: {
        type: 'number',
        label: 'Team Satisfaction (1-10)',
        inDetail: true,
        min: 1,
        max: 10,
      },
      safety_incidents: {
        type: 'number',
        label: 'Safety Incidents',
        inDetail: true,
        default: 0,
      },
      tags: {
        type: 'tags',
        label: 'Tags',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => `${r.title || 'Post-Mortem'}`,
    subtitle: (r: Record<string, unknown>) => `${r.status || 'draft'}`,
    defaultSort: { field: 'meeting_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'summary', 'what_went_well', 'what_went_wrong'],
    placeholder: 'Search post-mortems...',
  },

  filters: {
    quick: [
      { key: 'draft', label: 'Drafts', query: { where: { status: 'draft' } } },
      { key: 'finalized', label: 'Finalized', query: { where: { status: 'finalized' } } },
    ],
    advanced: ['status', 'meeting_date', 'tags'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'draft', label: 'Drafts', query: { where: { status: 'draft' } }, count: true },
        { key: 'finalized', label: 'Finalized', query: { where: { status: 'finalized' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'lessons', label: 'Lessons Learned', content: { type: 'related', entity: 'lessons-learned', foreignKey: 'post_mortem_id' } },
      ],
      overview: {
        stats: [
          { key: 'budget', label: 'Budget Variance', value: { type: 'field', field: 'budget_variance_pct' }, format: 'percentage' },
          { key: 'client', label: 'Client Score', value: { type: 'field', field: 'client_satisfaction_score' }, format: 'number' },
          { key: 'safety', label: 'Safety Incidents', value: { type: 'field', field: 'safety_incidents' }, format: 'number' },
        ],
        blocks: [
          { key: 'well', title: 'What Went Well', content: { type: 'fields', fields: ['what_went_well'] } },
          { key: 'wrong', title: 'What Went Wrong', content: { type: 'fields', fields: ['what_went_wrong'] } },
          { key: 'improve', title: 'What To Improve', content: { type: 'fields', fields: ['what_to_improve'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Basic Info', fields: ['project_id', 'title', 'status', 'meeting_date', 'facilitator_id'] },
        { key: 'review', title: 'Review', fields: ['summary', 'what_went_well', 'what_went_wrong', 'what_to_improve'] },
        { key: 'metrics', title: 'Metrics', fields: ['budget_variance_pct', 'schedule_variance_days', 'client_satisfaction_score', 'team_satisfaction_score', 'safety_incidents'] },
        { key: 'actions', title: 'Action Items', fields: ['action_items', 'tags'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['project_id', 'title', 'status', 'meeting_date', 'facilitator_id', 'budget_variance_pct', 'client_satisfaction_score'],
    },
  },

  actions: {
    row: [
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/projects/post-mortems/${r.id}/edit` } },
      { key: 'finalize', label: 'Finalize', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Post-Mortem', variant: 'primary', handler: { type: 'navigate', path: '/projects/post-mortems/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
