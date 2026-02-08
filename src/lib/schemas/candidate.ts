/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineSchema } from '../schema/defineSchema';

export const candidateSchema = defineSchema({
  identity: {
    name: 'candidate',
    namePlural: 'Candidates',
    slug: 'modules/workforce/candidates',
    icon: 'UserPlus',
    description: 'Job candidates and recruitment pipeline',
  },

  data: {
    endpoint: '/api/candidates',
    primaryKey: 'id',
    fields: {
      first_name: {
        type: 'text',
        label: 'First Name',
        required: true,
        inTable: true,
        inForm: true,
        searchable: true,
      },
      last_name: {
        type: 'text',
        label: 'Last Name',
        required: true,
        inTable: true,
        inForm: true,
        searchable: true,
      },
      email: {
        type: 'email',
        label: 'Email',
        inTable: true,
        inForm: true,
        searchable: true,
      },
      phone: {
        type: 'phone',
        label: 'Phone',
        inForm: true,
      },
      requisition_id: {
        type: 'select',
        label: 'Job Requisition',
        inTable: true,
        inForm: true,
        options: [],
      },
      source: {
        type: 'text',
        label: 'Source',
        inTable: true,
        inForm: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'New', value: 'new', color: 'blue' },
          { label: 'Screening', value: 'screening', color: 'cyan' },
          { label: 'Phone Screen', value: 'phone_screen', color: 'purple' },
          { label: 'Interview', value: 'interview', color: 'yellow' },
          { label: 'Assessment', value: 'assessment', color: 'orange' },
          { label: 'Reference Check', value: 'reference_check', color: 'amber' },
          { label: 'Offer', value: 'offer', color: 'green' },
          { label: 'Hired', value: 'hired', color: 'emerald' },
          { label: 'Rejected', value: 'rejected', color: 'red' },
          { label: 'Withdrawn', value: 'withdrawn', color: 'gray' },
        ],
        default: 'new',
      },
      resume_url: {
        type: 'url',
        label: 'Resume',
        inForm: true,
        inDetail: true,
      },
      cover_letter_url: {
        type: 'url',
        label: 'Cover Letter',
        inForm: true,
        inDetail: true,
      },
      portfolio_url: {
        type: 'url',
        label: 'Portfolio',
        inForm: true,
        inDetail: true,
      },
      linkedin_url: {
        type: 'url',
        label: 'LinkedIn',
        inForm: true,
        inDetail: true,
      },
      rating: {
        type: 'number',
        label: 'Rating',
        inTable: true,
        inForm: true,
      },
      recruiter_id: {
        type: 'select',
        label: 'Recruiter',
        inTable: true,
        inForm: true,
        options: [],
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      created_at: {
        type: 'datetime',
        label: 'Applied',
        inTable: true,
        sortable: true,
      },
    },
  },

  display: {
    title: (record: any) => `${record.first_name} ${record.last_name}`,
    subtitle: (record: any) => record.email || '',
    badge: (record: any) => {
      const statusColors: Record<string, string> = {
        new: 'primary', screening: 'primary', phone_screen: 'primary',
        interview: 'warning', assessment: 'warning', reference_check: 'warning',
        offer: 'success', hired: 'success', rejected: 'destructive', withdrawn: 'secondary',
      };
      return { label: record.status || 'Unknown', variant: statusColors[record.status] || 'secondary' };
    },
    defaultSort: { field: 'created_at', direction: 'desc' },
  },

  search: {
    enabled: true,
    fields: ['first_name', 'last_name', 'email'],
    placeholder: 'Search candidates...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: { notIn: ['hired', 'rejected', 'withdrawn'] } } } },
      { key: 'interviewing', label: 'Interviewing', query: { where: { status: { in: ['phone_screen', 'interview', 'assessment'] } } } },
    ],
    advanced: ['status', 'requisition_id', 'recruiter_id', 'source'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'new', label: 'New', query: { where: { status: 'new' } }, count: true },
        { key: 'screening', label: 'Screening', query: { where: { status: { in: ['screening', 'phone_screen'] } } }, count: true },
        { key: 'interview', label: 'Interview', query: { where: { status: { in: ['interview', 'assessment'] } } }, count: true },
        { key: 'offer', label: 'Offer', query: { where: { status: { in: ['reference_check', 'offer'] } } }, count: true },
        { key: 'hired', label: 'Hired', query: { where: { status: 'hired' } } },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'interviews', label: 'Interviews', content: { type: 'related', entity: 'candidate_interviews', foreignKey: 'candidate_id' } },
        { key: 'offers', label: 'Offers', content: { type: 'related', entity: 'job_offers', foreignKey: 'candidate_id' } },
      ],
      overview: {
        stats: [
          { key: 'rating', label: 'Rating', value: { type: 'field', field: 'rating' }, format: 'number' },
        ],
        blocks: [
          { key: 'links', title: 'Documents & Links', content: { type: 'fields', fields: ['resume_url', 'cover_letter_url', 'portfolio_url', 'linkedin_url'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'personal', title: 'Personal Information', fields: ['first_name', 'last_name', 'email', 'phone'] },
        { key: 'application', title: 'Application', fields: ['requisition_id', 'source', 'status', 'rating'] },
        { key: 'documents', title: 'Documents', fields: ['resume_url', 'cover_letter_url', 'portfolio_url', 'linkedin_url'] },
        { key: 'internal', title: 'Internal', fields: ['recruiter_id', 'notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['first_name', 'last_name', 'email', 'requisition_id', 'status', 'rating', 'recruiter_id'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (record: any) => `/people/candidates/${record.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Candidate', variant: 'primary', handler: { type: 'function', fn: () => console.log('Create Candidate') } },
    ],
  },

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
});
