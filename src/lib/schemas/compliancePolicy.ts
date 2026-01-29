import { defineSchema } from '../schema/defineSchema';

export const compliancePolicySchema = defineSchema({
  identity: {
    name: 'Compliance Policy',
    namePlural: 'Compliance Policies',
    slug: 'modules/operations/compliance/policies',
    icon: '📋',
    description: 'Organizational policies requiring acknowledgment',
  },
  data: {
    endpoint: '/api/compliance_policies',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Policy Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      policy_type: {
        type: 'select',
        label: 'Policy Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Code of Conduct', value: 'code_of_conduct' },
          { label: 'Safety', value: 'safety' },
          { label: 'Privacy', value: 'privacy' },
          { label: 'Security', value: 'security' },
          { label: 'HR', value: 'hr' },
          { label: 'Financial', value: 'financial' },
          { label: 'Operational', value: 'operational' },
          { label: 'Other', value: 'other' },
        ],
      },
      version: {
        type: 'text',
        label: 'Version',
        required: true,
        inTable: true,
        inForm: true,
        default: '1.0',
      },
      effective_date: {
        type: 'date',
        label: 'Effective Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      review_date: {
        type: 'date',
        label: 'Next Review Date',
        inTable: true,
        inForm: true,
      },
      content: {
        type: 'richtext',
        label: 'Policy Content',
        required: true,
        inForm: true,
        inDetail: true,
      },
      summary: {
        type: 'textarea',
        label: 'Summary',
        inForm: true,
        inDetail: true,
        helpText: 'Brief summary shown to users before acknowledgment',
      },
      requires_acknowledgment: {
        type: 'switch',
        label: 'Requires Acknowledgment',
        inTable: true,
        inForm: true,
        default: true,
      },
      acknowledgment_frequency: {
        type: 'select',
        label: 'Acknowledgment Frequency',
        inForm: true,
        options: [
          { label: 'Once', value: 'once' },
          { label: 'Annually', value: 'annually' },
          { label: 'On Update', value: 'on_update' },
        ],
        default: 'on_update',
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
          { label: 'Archived', value: 'archived' },
        ],
        default: 'draft',
      },
      applies_to: {
        type: 'select',
        label: 'Applies To',
        required: true,
        inForm: true,
        options: [
          { label: 'All Staff', value: 'all' },
          { label: 'Full-time Only', value: 'full_time' },
          { label: 'Contractors', value: 'contractors' },
          { label: 'Specific Roles', value: 'specific_roles' },
        ],
        default: 'all',
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'New Policy'),
    subtitle: (r: Record<string, unknown>) => `v${r.version || '1.0'}`,
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        draft: 'secondary',
        active: 'success',
        archived: 'destructive',
      };
      return { label: String(r.status || 'draft'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'effective_date', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search policies...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
    ],
    advanced: ['policy_type', 'status', 'requires_acknowledgment'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
        { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'acknowledgments', label: 'Acknowledgments', content: { type: 'related', entity: 'policy_acknowledgment', foreignKey: 'policy_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'acknowledged', label: 'Acknowledged', value: { type: 'relation-count', entity: 'policy_acknowledgment', foreignKey: 'policy_id' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Policy Details', content: { type: 'fields', fields: ['name', 'policy_type', 'version', 'effective_date', 'review_date'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Policy Details', fields: ['name', 'policy_type', 'version', 'status'] },
        { key: 'dates', title: 'Dates', fields: ['effective_date', 'review_date'] },
        { key: 'content', title: 'Content', fields: ['summary', 'content'] },
        { key: 'settings', title: 'Settings', fields: ['requires_acknowledgment', 'acknowledgment_frequency', 'applies_to'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'policy_type', 'version', 'effective_date', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/operations/compliance/policies/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Policy', variant: 'primary', handler: { type: 'navigate', path: '/modules/operations/compliance/policies/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
