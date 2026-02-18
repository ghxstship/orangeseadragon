import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * FEEDBACK ENTITY SCHEMA (SSOT)
 */
export const feedbackSchema = defineSchema({
  identity: {
    name: 'Feedback',
    namePlural: 'Feedback',
    slug: 'people/performance/feedback',
    icon: 'MessageSquare',
    description: 'Performance feedback and recognition',
  },

  data: {
    endpoint: '/api/feedback',
    primaryKey: 'id',
    fields: {
      subject: {
        type: 'text',
        label: 'Subject',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      recipient_id: {
        type: 'relation',
        label: 'Recipient',
        required: true,
        inTable: true,
        inForm: true,
      },
      sender_id: {
        type: 'relation',
        label: 'From',
        inTable: true,
        inDetail: true,
      },
      feedback_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Recognition', value: 'recognition' },
          { label: 'Constructive', value: 'constructive' },
          { label: 'Performance', value: 'performance' },
          { label: 'Peer Review', value: 'peer_review' },
          { label: '360 Review', value: '360_review' },
        ],
      },
      content: {
        type: 'textarea',
        label: 'Feedback',
        required: true,
        inForm: true,
        inDetail: true,
      },
      rating: {
        type: 'number',
        label: 'Rating',
        inTable: true,
        inForm: true,
      },
      is_anonymous: {
        type: 'switch',
        label: 'Anonymous',
        inForm: true,
      },
      is_private: {
        type: 'switch',
        label: 'Private',
        inForm: true,
      },
      event_id: {
        type: 'relation',
        relation: { entity: 'event', display: 'name', searchable: true },
        label: 'Event',
        inForm: true,
      },
      review_id: {
        type: 'relation',
        label: 'Performance Review',
        inForm: true,
      },
      created_at: {
        type: 'datetime',
        label: 'Created',
        inTable: true,
        sortable: true,
      },
    },
  },

  display: {
    title: (record) => record.subject || 'Feedback',
    subtitle: (record) => record.feedback_type || '',
    badge: (record) => {
      if (record.feedback_type === 'recognition') return { label: 'Recognition', variant: 'success' };
      return undefined;
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['subject', 'content'],
    placeholder: 'Search feedback...',
  },

  filters: {
    quick: [
      { key: 'all', label: 'All', query: { where: {} } },
      { key: 'recognition', label: 'Recognition', query: { where: { feedback_type: 'recognition' } } },
    ],
    advanced: ['feedback_type', 'recipient_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All Feedback', query: { where: {} } },
        { key: 'recognition', label: 'Recognition', query: { where: { feedback_type: 'recognition' } } },
      ],
      defaultView: 'list',
      availableViews: ['list', 'table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: []
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Feedback Details',
          fields: ['subject', 'recipient_id', 'feedback_type', 'rating'],
        },
        {
          key: 'content',
          title: 'Content',
          fields: ['content'],
        },
        {
          key: 'settings',
          title: 'Settings',
          fields: ['is_anonymous', 'is_private', 'event_id', 'review_id'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: [
        'subject',
        { field: 'recipient_id', format: { type: 'relation', entityType: 'person' } },
        'feedback_type',
        { field: 'rating', format: { type: 'number' } },
        { field: 'created_at', format: { type: 'datetime' } },
      ],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/people/performance/feedback/${record.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (record) => `/people/performance/feedback/${record.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Give Feedback', variant: 'primary', handler: { type: 'navigate', path: () => '/people/performance/feedback/new' } }
    ]
  },
  relationships: {
    belongsTo: [
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
    ],
  },



  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
