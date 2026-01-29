import { defineSchema } from '../schema/defineSchema';

export const emailSequenceSchema = defineSchema({
  identity: {
    name: 'Email Sequence',
    namePlural: 'Email Sequences',
    slug: 'modules/business/sequences',
    icon: '📧',
    description: 'Automated email nurture sequences',
  },
  data: {
    endpoint: '/api/email_sequences',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Sequence Name',
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
      sequence_type: {
        type: 'select',
        label: 'Sequence Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Lead Nurture', value: 'lead_nurture' },
          { label: 'Customer Onboarding', value: 'customer_onboarding' },
          { label: 'Re-engagement', value: 're_engagement' },
          { label: 'Event Follow-up', value: 'event_followup' },
          { label: 'Drip Campaign', value: 'drip' },
        ],
      },
      trigger_type: {
        type: 'select',
        label: 'Trigger',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Manual Enrollment', value: 'manual' },
          { label: 'Form Submission', value: 'form_submit' },
          { label: 'Lead Created', value: 'lead_created' },
          { label: 'Deal Won', value: 'deal_won' },
          { label: 'Event Registration', value: 'event_registration' },
          { label: 'Tag Added', value: 'tag_added' },
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
          { label: 'Paused', value: 'paused' },
          { label: 'Archived', value: 'archived' },
        ],
        default: 'draft',
      },
      from_name: {
        type: 'text',
        label: 'From Name',
        required: true,
        inForm: true,
      },
      from_email: {
        type: 'email',
        label: 'From Email',
        required: true,
        inForm: true,
      },
      step_count: {
        type: 'number',
        label: 'Steps',
        inTable: true,
        inDetail: true,
      },
      enrolled_count: {
        type: 'number',
        label: 'Enrolled',
        inTable: true,
        inDetail: true,
      },
      completed_count: {
        type: 'number',
        label: 'Completed',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'New Sequence'),
    subtitle: (r: Record<string, unknown>) => {
      const types: Record<string, string> = {
        lead_nurture: 'Lead Nurture',
        customer_onboarding: 'Customer Onboarding',
        re_engagement: 'Re-engagement',
        event_followup: 'Event Follow-up',
        drip: 'Drip Campaign',
      };
      return types[String(r.sequence_type)] || '';
    },
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        draft: 'secondary',
        active: 'success',
        paused: 'warning',
        archived: 'destructive',
      };
      return { label: String(r.status || 'draft'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search sequences...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
      { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } } },
    ],
    advanced: ['sequence_type', 'trigger_type', 'status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
        { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'steps', label: 'Steps', content: { type: 'related', entity: 'sequence_step', foreignKey: 'sequence_id' } },
        { key: 'enrollments', label: 'Enrollments', content: { type: 'related', entity: 'sequence_enrollment', foreignKey: 'sequence_id' } },
        { key: 'analytics', label: 'Analytics', content: { type: 'custom', component: 'SequenceAnalytics' } },
      ],
      overview: {
        stats: [
          { key: 'steps', label: 'Steps', value: { type: 'field', field: 'step_count' }, format: 'number' },
          { key: 'enrolled', label: 'Enrolled', value: { type: 'field', field: 'enrolled_count' }, format: 'number' },
          { key: 'completed', label: 'Completed', value: { type: 'field', field: 'completed_count' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Sequence Details', content: { type: 'fields', fields: ['name', 'description', 'sequence_type', 'trigger_type'] } },
          { key: 'sender', title: 'Sender', content: { type: 'fields', fields: ['from_name', 'from_email'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Sequence Details', fields: ['name', 'description', 'sequence_type', 'trigger_type', 'status'] },
        { key: 'sender', title: 'Sender Settings', fields: ['from_name', 'from_email'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'sequence_type', 'trigger_type', 'step_count', 'enrolled_count', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/business/sequences/${r.id}` } },
      { key: 'activate', label: 'Activate', variant: 'primary', handler: { type: 'api', endpoint: '/api/email_sequences', method: 'PATCH' }, condition: (r: Record<string, unknown>) => r.status === 'draft' },
      { key: 'pause', label: 'Pause', handler: { type: 'api', endpoint: '/api/email_sequences', method: 'PATCH' }, condition: (r: Record<string, unknown>) => r.status === 'active' },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Sequence', variant: 'primary', handler: { type: 'navigate', path: '/modules/business/sequences/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
