import { defineSchema } from '../schema/defineSchema';

/**
 * CHALLENGE SUBMISSION ENTITY SCHEMA (SSOT)
 * Submissions for challenge milestones and final entries
 */
export const challengeSubmissionSchema = defineSchema({
  identity: {
    name: 'Submission',
    namePlural: 'Submissions',
    slug: 'network/challenge-submissions',
    icon: 'Upload',
    description: 'Challenge submissions and entries',
  },

  data: {
    endpoint: '/api/challenge_submissions',
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
      participant_id: {
        type: 'relation',
        label: 'Participant',
        required: true,
        inTable: true,
        relation: {
          entity: 'challengeParticipant',
          display: 'user_id',
        },
      },
      milestone_id: {
        type: 'relation',
        label: 'Milestone',
        inTable: true,
        relation: {
          entity: 'challengeMilestone',
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
        type: 'richtext',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      attachments: {
        type: 'json',
        label: 'Attachments',
        inForm: true,
        inDetail: true,
      },
      submission_type: {
        type: 'select',
        label: 'Type',
        inTable: true,
        inForm: true,
        default: 'milestone',
        options: [
          { label: 'Milestone', value: 'milestone' },
          { label: 'Final', value: 'final' },
          { label: 'Update', value: 'update' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        default: 'pending',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Pending Review', value: 'pending' },
          { label: 'Reviewed', value: 'reviewed' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
        ],
      },
      score: {
        type: 'number',
        label: 'Score',
        inTable: true,
        inDetail: true,
      },
      feedback: {
        type: 'richtext',
        label: 'Feedback',
        inForm: true,
        inDetail: true,
      },
      reviewer_id: {
        type: 'relation',
        label: 'Reviewer',
        inDetail: true,
        relation: {
          entity: 'user',
          display: 'name',
        },
      },
      submitted_at: {
        type: 'datetime',
        label: 'Submitted',
        inTable: true,
        sortable: true,
      },
      reviewed_at: {
        type: 'datetime',
        label: 'Reviewed',
        inTable: true,
      },
    },
  },

  display: {
    title: (record) => record.title || 'Submission',
    subtitle: (record) => record.submission_type || '',
    badge: (record) => {
      const statusColors: Record<string, string> = {
        draft: 'secondary',
        pending: 'warning',
        reviewed: 'primary',
        approved: 'success',
        rejected: 'destructive',
      };
      return { label: record.status, variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'submitted_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description'],
    placeholder: 'Search submissions...',
  },

  filters: {
    quick: [
      { key: 'pending', label: 'Pending Review', query: { where: { status: 'pending' } } },
    ],
    advanced: ['status', 'submission_type'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
        { key: 'reviewed', label: 'Reviewed', query: { where: { status: 'reviewed' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'files', label: 'Files', content: { type: 'files' } },
      ],
      overview: {
        stats: [
          { key: 'score', label: 'Score', value: { type: 'field', field: 'score' }, format: 'number' },
        ],
        blocks: [
          { key: 'content', title: 'Submission', content: { type: 'fields', fields: ['description'] } },
          { key: 'feedback', title: 'Feedback', content: { type: 'fields', fields: ['feedback'] } },
        ],
      },
    },
    form: {
      sections: [
        {
          key: 'submission',
          title: 'Submission',
          fields: ['title', 'description', 'submission_type', 'attachments'],
        },
        {
          key: 'review',
          title: 'Review',
          fields: ['status', 'score', 'feedback'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: ['title', 'submission_type', 'status', 'score', 'submitted_at'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/network/challenges/${record.challenge_id}/submissions/${record.id}` } },
      { key: 'review', label: 'Review', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [],
  },
  relationships: {
    belongsTo: [
      { entity: 'challenge', foreignKey: 'challenge_id', label: 'Challenge' },
      { entity: 'challengeParticipant', foreignKey: 'participant_id', label: 'Participant' },
      { entity: 'milestone', foreignKey: 'milestone_id', label: 'Milestone' },
      { entity: 'user', foreignKey: 'reviewer_id', label: 'Reviewer' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
