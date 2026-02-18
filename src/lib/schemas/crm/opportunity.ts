import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * OPPORTUNITY ENTITY SCHEMA (SSOT)
 */
export const opportunitySchema = defineSchema({
  identity: {
    name: 'Opportunity',
    namePlural: 'Opportunities',
    slug: 'network/opportunities',
    icon: 'Briefcase',
    description: 'Network opportunities and collaborations',
  },

  data: {
    endpoint: '/api/opportunities',
    primaryKey: 'id',
    fields: {
      title: {
        type: 'text',
        label: 'Title',
        placeholder: 'Enter opportunity title',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      opportunity_type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Collaboration', value: 'collaboration' },
          { label: 'Partnership', value: 'partnership' },
          { label: 'Sponsorship', value: 'sponsorship' },
          { label: 'Vendor', value: 'vendor' },
          { label: 'Other', value: 'other' },
        ],
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Open', value: 'open' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Closed', value: 'closed' },
          { label: 'Won', value: 'won' },
          { label: 'Lost', value: 'lost' },
        ],
      },
      deadline: {
        type: 'date',
        label: 'Deadline',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      value: {
        type: 'currency',
        label: 'Estimated Value',
        inTable: true,
        inForm: true,
      },
      contact_name: {
        type: 'text',
        label: 'Contact Name',
        inForm: true,
        inDetail: true,
      },
      contact_email: {
        type: 'email',
        label: 'Contact Email',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (record) => record.title || 'Untitled Opportunity',
    subtitle: (record) => record.opportunity_type || '',
    badge: (record) => {
      if (record.status === 'won') return { label: 'Won', variant: 'success' };
      if (record.status === 'open') return { label: 'Open', variant: 'primary' };
      if (record.status === 'lost') return { label: 'Lost', variant: 'destructive' };
      return { label: record.status, variant: 'secondary' };
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'description', 'contact_name'],
    placeholder: 'Search opportunities...',
  },

  filters: {
    quick: [
      { key: 'open', label: 'Open', query: { where: { status: 'open' } } },
    ],
    advanced: ['opportunity_type', 'status'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
        { key: 'open', label: 'Open', query: { where: { status: 'open' } } },
        { key: 'in-progress', label: 'In Progress', query: { where: { status: 'in_progress' } } },
        { key: 'closed', label: 'Closed', query: { where: { status: 'closed' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'value', label: 'Value', value: { type: 'field', field: 'value' }, format: 'currency' },
        ],
        blocks: [
          { key: 'details', title: 'Details', content: { type: 'fields', fields: ['description', 'deadline'] } },
          { key: 'contact', title: 'Contact', content: { type: 'fields', fields: ['contact_name', 'contact_email'] } },
        ]
      }
    },
    form: {
      sections: [
        {
          key: 'basic',
          title: 'Basic Information',
          fields: ['title', 'description', 'opportunity_type', 'status'],
        },
        {
          key: 'details',
          title: 'Details',
          fields: ['deadline', 'value'],
        },
        {
          key: 'contact',
          title: 'Contact',
          fields: ['contact_name', 'contact_email'],
        }
      ]
    }
  },

  views: {
    table: {
      columns: ['title', 'opportunity_type', 'status', 'deadline', 'value'],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'open', label: 'Open', color: 'blue' },
        { value: 'in_progress', label: 'In Progress', color: 'yellow' },
        { value: 'won', label: 'Won', color: 'green' },
        { value: 'lost', label: 'Lost', color: 'red' },
      ],
      card: {
        title: 'title',
        subtitle: 'opportunity_type',
      },
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record) => `/network/opportunities/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Opportunity', variant: 'primary', handler: { type: 'navigate', path: () => '/network/opportunities/new' } }
    ]
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  }
});
