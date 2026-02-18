import { defineSchema } from '../schema/defineSchema';

export const recurringInvoiceSchema = defineSchema({
  identity: {
    name: 'Recurring Invoice',
    namePlural: 'Recurring Invoices',
    slug: 'modules/finance/recurring-invoices',
    icon: 'RefreshCw',
    description: 'Automated recurring invoice schedules',
  },
  data: {
    endpoint: '/api/recurring-invoices',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Schedule Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      clientId: {
        type: 'relation',
        relation: { entity: 'company', display: 'name', searchable: true },
        label: 'Client',
        required: true,
        inTable: true,
        inForm: true,
      },
      frequency: {
        type: 'select',
        label: 'Frequency',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Weekly', value: 'weekly', color: 'blue' },
          { label: 'Bi-weekly', value: 'biweekly', color: 'blue' },
          { label: 'Monthly', value: 'monthly', color: 'green' },
          { label: 'Quarterly', value: 'quarterly', color: 'purple' },
          { label: 'Yearly', value: 'yearly', color: 'orange' },
        ],
      },
      dayOfMonth: {
        type: 'number',
        label: 'Day of Month',
        inForm: true,
        inDetail: true,
        min: 1,
        max: 31,
      },
      startDate: {
        type: 'date',
        label: 'Start Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      endDate: {
        type: 'date',
        label: 'End Date',
        inForm: true,
        inDetail: true,
      },
      nextRunDate: {
        type: 'date',
        label: 'Next Invoice',
        inTable: true,
        inDetail: true,
        sortable: true,
      },
      subtotal: {
        type: 'currency',
        label: 'Amount',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      currency: {
        type: 'select',
        label: 'Currency',
        inForm: true,
        options: [
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
          { label: 'GBP', value: 'GBP' },
          { label: 'CAD', value: 'CAD' },
        ],
        default: 'USD',
      },
      paymentTerms: {
        type: 'number',
        label: 'Payment Terms (days)',
        inForm: true,
        default: 30,
      },
      autoSend: {
        type: 'switch',
        label: 'Auto-send to Client',
        inForm: true,
        inDetail: true,
        default: false,
      },
      includePaymentLink: {
        type: 'switch',
        label: 'Include Payment Link',
        inForm: true,
        default: true,
      },
      sendReminders: {
        type: 'switch',
        label: 'Send Payment Reminders',
        inForm: true,
        default: true,
      },
      isActive: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      invoicesGenerated: {
        type: 'number',
        label: 'Invoices Generated',
        inTable: true,
        inDetail: true,
      },
      projectId: {
        type: 'relation',
        relation: { entity: 'project', display: 'name', searchable: true },
        label: 'Project',
        inForm: true,
      },
      notes: {
        type: 'textarea',
        label: 'Invoice Notes',
        inForm: true,
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Schedule'),
    subtitle: (r: Record<string, unknown>) => {
      const freq = String(r.frequency || '').charAt(0).toUpperCase() + String(r.frequency || '').slice(1);
      return `${freq} • $${r.subtotal || 0}`;
    },
    badge: (r: Record<string, unknown>) =>
      r.isActive
        ? { label: 'Active', variant: 'success' }
        : { label: 'Inactive', variant: 'secondary' },
    defaultSort: { field: 'nextRunDate', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search recurring invoices...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { isActive: true } } },
      { key: 'inactive', label: 'Inactive', query: { where: { isActive: false } } },
    ],
    advanced: ['frequency', 'clientId', 'isActive'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { isActive: true } }, count: true },
        { key: 'inactive', label: 'Inactive', query: { where: { isActive: false } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'line-items', label: 'Line Items', content: { type: 'related', entity: 'recurring_invoice_line_item', foreignKey: 'recurring_invoice_id' } },
        { key: 'generated', label: 'Generated Invoices', content: { type: 'related', entity: 'invoice', foreignKey: 'recurring_invoice_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'amount', label: 'Amount', value: { type: 'field', field: 'subtotal' }, format: 'currency' },
          { key: 'generated', label: 'Generated', value: { type: 'field', field: 'invoicesGenerated' }, format: 'number' },
        ],
        blocks: [
          { key: 'schedule', title: 'Schedule', content: { type: 'fields', fields: ['frequency', 'dayOfMonth', 'startDate', 'endDate', 'nextRunDate'] } },
          { key: 'settings', title: 'Automation', content: { type: 'fields', fields: ['autoSend', 'includePaymentLink', 'sendReminders'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Schedule Details', fields: ['name', 'clientId', 'projectId'] },
        { key: 'schedule', title: 'Schedule', fields: ['frequency', 'dayOfMonth', 'startDate', 'endDate'] },
        { key: 'invoice', title: 'Invoice Details', fields: ['subtotal', 'currency', 'paymentTerms', 'notes'] },
        { key: 'automation', title: 'Automation', fields: ['autoSend', 'includePaymentLink', 'sendReminders', 'isActive'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'clientId', 'frequency', 'subtotal', 'nextRunDate', 'isActive', 'invoicesGenerated'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/recurring-invoices/${r.id}` } },
      { key: 'generate', label: 'Generate Now', variant: 'default', handler: { type: 'api', endpoint: '/api/recurring-invoices/{id}/generate', method: 'POST' } },
      { key: 'pause', label: 'Pause', handler: { type: 'api', endpoint: '/api/recurring-invoices/{id}/pause', method: 'POST' }, condition: (r: Record<string, unknown>) => r.isActive === true },
      { key: 'resume', label: 'Resume', handler: { type: 'api', endpoint: '/api/recurring-invoices/{id}/resume', method: 'POST' }, condition: (r: Record<string, unknown>) => r.isActive === false },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Recurring Invoice', variant: 'primary', handler: { type: 'navigate', path: '/finance/recurring-invoices/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'company', foreignKey: 'clientId', label: 'Client' },
      { entity: 'project', foreignKey: 'projectId', label: 'Project' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
