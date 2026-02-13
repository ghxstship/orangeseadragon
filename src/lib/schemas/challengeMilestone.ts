import { defineSchema } from '../schema/defineSchema';

/**
 * CHALLENGE MILESTONE ENTITY SCHEMA (SSOT)
 * Progress milestones within challenges
 */
export const challengeMilestoneSchema = defineSchema({
  identity: {
    name: 'Milestone',
    namePlural: 'Milestones',
    slug: 'network/challenge-milestones',
    icon: 'Flag',
    description: 'Challenge progress milestones',
  },

  data: {
    endpoint: '/api/challenge_milestones',
    primaryKey: 'id',
    fields: {
      challenge_id: {
        type: 'relation',
        label: 'Challenge',
        required: true,
        inTable: true,
        relation: {
          entity: 'challenge',
          display: 'title',
        },
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
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      order: {
        type: 'number',
        label: 'Order',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      due_date: {
        type: 'datetime',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      points: {
        type: 'number',
        label: 'Points',
        inTable: true,
        inForm: true,
        default: 10,
      },
      is_required: {
        type: 'switch',
        label: 'Required',
        inTable: true,
        inForm: true,
        default: true,
      },
      submission_type: {
        type: 'select',
        label: 'Submission Type',
        inForm: true,
        default: 'any',
        options: [
          { label: 'Any', value: 'any' },
          { label: 'Text', value: 'text' },
          { label: 'File', value: 'file' },
          { label: 'Link', value: 'link' },
          { label: 'None', value: 'none' },
        ],
      },
    },
  },

  display: {
    title: (record) => record.title || 'Milestone',
    subtitle: (record) => record.due_date ? `Due: ${record.due_date}` : '',
    badge: (record) => {
      if (record.is_required) return { label: 'Required', variant: 'primary' };
      return { label: 'Optional', variant: 'secondary' };
    },
    defaultSort: { field: 'order', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description'],
    placeholder: 'Search milestones...',
  },

  filters: {
    quick: [],
    advanced: ['is_required'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'submissions', label: 'Submissions', content: { type: 'related', entity: 'challengeSubmission', foreignKey: 'milestone_id' } },
      ],
      overview: {
        stats: [
          { key: 'points', label: 'Points', value: { type: 'field', field: 'points' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['description'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'milestone',
          title: 'Milestone',
          fields: ['title', 'description', 'order', 'due_date'],
        },
        {
          key: 'settings',
          title: 'Settings',
          fields: ['points', 'is_required', 'submission_type'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: ['order', 'title', 'due_date', 'points', 'is_required'],
    },
  },

  actions: {
    row: [
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/network/challenges/${record.challenge_id}/milestones/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Milestone', variant: 'primary', handler: { type: 'navigate', path: () => '/network/challenges/milestones/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'challenge', foreignKey: 'challenge_id', label: 'Challenge' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
