import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * CHALLENGE ENTITY SCHEMA (SSOT)
 */
export const challengeSchema = defineSchema({
  identity: {
    name: 'Challenge',
    namePlural: 'Challenges',
    slug: 'network/challenges',
    icon: 'Trophy',
    description: 'Community challenges and competitions',
  },

  data: {
    endpoint: '/api/challenges',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        placeholder: 'Enter challenge title',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      description: {
        type: 'richtext',
        label: 'Description',
        required: true,
        inForm: true,
        inDetail: true,
      },
      challenge_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Competition', value: 'competition' },
          { label: 'Hackathon', value: 'hackathon' },
          { label: 'Learning', value: 'learning' },
          { label: 'Community', value: 'community' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Active', value: 'active' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      start_date: {
        type: 'datetime',
        label: 'Start Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      end_date: {
        type: 'datetime',
        label: 'End Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      prize: {
        type: 'text',
        label: 'Prize',
        inTable: true,
        inForm: true,
      },
      participant_count: {
        type: 'number',
        label: 'Participants',
        inTable: true,
      },
      rules: {
        type: 'richtext',
        label: 'Rules',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => record.title || 'Untitled Challenge',
    subtitle: (record) => record.challenge_type || '',
    badge: (record) => {
      if (record.status === 'active') return { label: 'Active', variant: 'success' };
      if (record.status === 'draft') return { label: 'Draft', variant: 'secondary' };
      if (record.status === 'completed') return { label: 'Completed', variant: 'primary' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'start_date', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description'],
    placeholder: 'Search challenges...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
    ],
    advanced: ['challenge_type', 'status'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
        { key: 'upcoming', label: 'Upcoming', query: { where: { status: 'draft' } } },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
      ],
      defaultView: 'grid',
      availableViews: ['grid', 'table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'milestones', label: 'Milestones', content: { type: 'related', entity: 'challengeMilestone', foreignKey: 'challenge_id' } },
        { key: 'participants', label: 'Participants', content: { type: 'related', entity: 'challengeParticipant', foreignKey: 'challenge_id' } },
        { key: 'submissions', label: 'Submissions', content: { type: 'related', entity: 'challengeSubmission', foreignKey: 'challenge_id' } },
        { key: 'leaderboard', label: 'Leaderboard', content: { type: 'custom', component: 'ChallengeLeaderboard' } },
      ],
      overview: {
        stats: [
          { key: 'participants', label: 'Participants', value: { type: 'field', field: 'participant_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['description', 'prize'] } },
          { key: 'rules', title: 'Rules', content: { type: 'fields', fields: ['rules'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['title', 'description', 'challenge_type', 'status'],
        },
        {
          key: 'timing',
          title: 'Timing',
          fields: ['start_date', 'end_date'],
        },
        {
          key: 'details',
          title: 'Details',
          fields: ['prize', 'rules'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'title', 'challenge_type',
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', active: '#22c55e', completed: '#3b82f6', cancelled: '#ef4444' } } },
        { field: 'start_date', format: { type: 'date' } },
        { field: 'end_date', format: { type: 'date' } },
        { field: 'participant_count', format: { type: 'number' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/network/challenges/${record.id}` } },
      { key: 'join', label: 'Join Challenge', variant: 'primary', condition: (record) => record.status === 'active', handler: { type: 'api', endpoint: '/api/challenges/{id}/join', method: 'POST' }, successMessage: 'You have joined the challenge!' },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Challenge', variant: 'primary', handler: { type: 'navigate', path: () => '/network/challenges/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
