import { defineSchema } from '../schema/defineSchema';

/**
 * CHALLENGE PARTICIPANT ENTITY SCHEMA (SSOT)
 * Tracks user participation in challenges
 */
export const challengeParticipantSchema = defineSchema({
  identity: {
    name: 'Participant',
    namePlural: 'Participants',
    slug: 'network/challenge-participants',
    icon: 'Users',
    description: 'Challenge participation records',
  },

  data: {
    endpoint: '/api/challenge_participants',
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
      user_id: {
        type: 'relation',
        label: 'Participant',
        required: true,
        inTable: true,
        inDetail: true,
        relation: {
          entity: 'user',
          display: 'name',
        },
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        default: 'registered',
        options: [
          { label: 'Registered', value: 'registered', color: 'blue' },
          { label: 'Active', value: 'active', color: 'green' },
          { label: 'Completed', value: 'completed', color: 'purple' },
          { label: 'Withdrawn', value: 'withdrawn', color: 'gray' },
        ],
      },
      progress_percent: {
        type: 'percentage',
        label: 'Progress',
        inTable: true,
        inDetail: true,
        default: 0,
      },
      score: {
        type: 'number',
        label: 'Score',
        inTable: true,
        inDetail: true,
        default: 0,
      },
      rank: {
        type: 'number',
        label: 'Rank',
        inTable: true,
        inDetail: true,
      },
      joined_at: {
        type: 'datetime',
        label: 'Joined',
        inTable: true,
        sortable: true,
      },
      completed_at: {
        type: 'datetime',
        label: 'Completed',
        inTable: true,
      },
      last_activity_at: {
        type: 'datetime',
        label: 'Last Activity',
        inTable: true,
        sortable: true,
      },
      team_id: {
        type: 'relation',
        label: 'Team',
        inTable: true,
        relation: {
          entity: 'team',
          display: 'name',
        },
      },
    },
  },

  display: {
    title: (record) => record.user_id || 'Participant',
    subtitle: (record) => `${record.progress_percent || 0}% complete`,
    badge: (record) => {
      const statusColors: Record<string, string> = {
        registered: 'secondary',
        active: 'success',
        completed: 'primary',
        withdrawn: 'secondary',
      };
      return { label: record.status, variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'score', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['user_id'],
    placeholder: 'Search participants...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
    ],
    advanced: ['status'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
        { key: 'leaderboard', label: 'Leaderboard', query: { where: { status: 'active' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'grid'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'submissions', label: 'Submissions', content: { type: 'related', entity: 'challengeSubmission', foreignKey: 'participant_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'progress', label: 'Progress', value: { type: 'field', field: 'progress_percent' }, format: 'percentage' },
          { key: 'score', label: 'Score', value: { type: 'field', field: 'score' }, format: 'number' },
          { key: 'rank', label: 'Rank', value: { type: 'field', field: 'rank' }, format: 'number', prefix: '#' },
        ],
        blocks: [],
      },
    },
    form: {
      sections: [
        {
          key: 'participation',
          title: 'Participation',
          fields: ['status', 'team_id'],
        },
      ],
    },
  },

  views: {
    table: {
      columns: ['user_id', 'status', 'progress_percent', 'score', 'rank', 'joined_at'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/network/challenges/${record.challenge_id}/participants/${record.id}` } },
    ],
    bulk: [],
    global: [],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
