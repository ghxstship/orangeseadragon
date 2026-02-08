import { defineSchema } from '../schema/defineSchema';

/**
 * RFP RESPONSE ENTITY SCHEMA (SSOT)
 *
 * Request for Proposal tracking with:
 * - Full lifecycle: received → reviewing → drafting → submitted → won/lost
 * - Response document linking
 * - Competitor intelligence
 * - Deal association
 */
export const rfpResponseSchema = defineSchema({
  identity: {
    name: 'RFP Response',
    namePlural: 'RFP Responses',
    slug: 'modules/sales/rfp-responses',
    icon: 'FileText',
    description: 'Track and manage RFP responses with full lifecycle and outcome tracking',
  },

  data: {
    endpoint: '/api/rfp-responses',
    primaryKey: 'id',
    fields: {
      rfp_number: {
        type: 'text',
        label: 'RFP Number',
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
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
      deal_id: {
        type: 'relation',
        label: 'Associated Deal',
        inTable: true,
        inForm: true,
        inDetail: true,
        relation: { entity: 'deals', display: 'name' },
      },
      issuing_organization: {
        type: 'text',
        label: 'Issuing Organization',
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        default: 'received',
        options: [
          { label: 'Received', value: 'received' },
          { label: 'Reviewing', value: 'reviewing' },
          { label: 'Drafting', value: 'drafting' },
          { label: 'Internal Review', value: 'internal_review' },
          { label: 'Submitted', value: 'submitted' },
          { label: 'Shortlisted', value: 'shortlisted' },
          { label: 'Won', value: 'won' },
          { label: 'Lost', value: 'lost' },
          { label: 'Withdrawn', value: 'withdrawn' },
          { label: 'No Bid', value: 'no_bid' },
        ],
      },
      received_date: {
        type: 'date',
        label: 'Received Date',
        inForm: true,
        inDetail: true,
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      submission_date: {
        type: 'date',
        label: 'Submission Date',
        inTable: true,
        inForm: true,
      },
      proposed_amount: {
        type: 'currency',
        label: 'Proposed Amount',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      proposed_timeline: {
        type: 'textarea',
        label: 'Proposed Timeline',
        inForm: true,
        inDetail: true,
      },
      key_differentiators: {
        type: 'textarea',
        label: 'Key Differentiators',
        inForm: true,
        inDetail: true,
      },
      team_lead_id: {
        type: 'relation',
        label: 'Team Lead',
        inTable: true,
        inForm: true,
        relation: { entity: 'users', display: 'name' },
      },
      response_document_id: {
        type: 'relation',
        label: 'Response Document',
        inForm: true,
        inDetail: true,
        relation: { entity: 'documents', display: 'name' },
      },
      outcome_notes: {
        type: 'textarea',
        label: 'Outcome Notes',
        inForm: true,
        inDetail: true,
      },
      feedback_received: {
        type: 'textarea',
        label: 'Feedback Received',
        inForm: true,
        inDetail: true,
      },
      tags: {
        type: 'tags',
        label: 'Tags',
        inForm: true,
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => `${r.title || 'RFP Response'}`,
    subtitle: (r: Record<string, unknown>) => r.rfp_number ? `#${r.rfp_number}` : '',
    defaultSort: { field: 'due_date', direction: 'asc' },
  },

  search: {
    enabled: true,
    fields: ['title', 'rfp_number', 'issuing_organization'],
    placeholder: 'Search RFPs...',
  },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: ['received', 'reviewing', 'drafting', 'internal_review'] } } },
      { key: 'submitted', label: 'Submitted', query: { where: { status: 'submitted' } } },
      { key: 'won', label: 'Won', query: { where: { status: 'won' } } },
    ],
    advanced: ['status', 'due_date', 'team_lead_id', 'tags'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: ['received', 'reviewing', 'drafting', 'internal_review'] } }, count: true },
        { key: 'submitted', label: 'Submitted', query: { where: { status: ['submitted', 'shortlisted'] } }, count: true },
        { key: 'closed', label: 'Closed', query: { where: { status: ['won', 'lost', 'withdrawn', 'no_bid'] } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'kanban', 'list'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'files', label: 'Documents', content: { type: 'files' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'amount', label: 'Proposed Amount', value: { type: 'field', field: 'proposed_amount' }, format: 'currency' },
          { key: 'due', label: 'Due Date', value: { type: 'field', field: 'due_date' }, format: 'date' },
        ],
        blocks: [
          { key: 'proposal', title: 'Proposal Details', content: { type: 'fields', fields: ['proposed_timeline', 'key_differentiators'] } },
          { key: 'outcome', title: 'Outcome', content: { type: 'fields', fields: ['outcome_notes', 'feedback_received'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'RFP Details', fields: ['rfp_number', 'title', 'issuing_organization', 'deal_id'] },
        { key: 'dates', title: 'Dates', fields: ['received_date', 'due_date', 'submission_date', 'status'] },
        { key: 'response', title: 'Response', fields: ['proposed_amount', 'proposed_timeline', 'key_differentiators', 'team_lead_id', 'response_document_id'] },
        { key: 'outcome', title: 'Outcome', fields: ['outcome_notes', 'feedback_received', 'tags', 'notes'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['rfp_number', 'title', 'issuing_organization', 'status', 'due_date', 'proposed_amount', 'team_lead_id', 'submission_date'],
    },
    kanban: {
      columnField: 'status',
      columns: [
        { value: 'received', label: 'Received', color: 'gray' },
        { value: 'reviewing', label: 'Reviewing', color: 'blue' },
        { value: 'drafting', label: 'Drafting', color: 'yellow' },
        { value: 'internal_review', label: 'Internal Review', color: 'orange' },
        { value: 'submitted', label: 'Submitted', color: 'purple' },
        { value: 'shortlisted', label: 'Shortlisted', color: 'cyan' },
        { value: 'won', label: 'Won', color: 'green' },
        { value: 'lost', label: 'Lost', color: 'red' },
      ],
      card: {
        title: 'title',
        subtitle: 'issuing_organization',
        fields: ['due_date', 'proposed_amount'],
      },
    },
  },

  actions: {
    row: [
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/sales/rfp-responses/${r.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New RFP Response', variant: 'primary', handler: { type: 'navigate', path: '/sales/rfp-responses/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
