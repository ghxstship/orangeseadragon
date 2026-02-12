import { defineSchema } from '../schema/defineSchema';

export const reminderTemplateSchema = defineSchema({
  identity: {
    name: 'Reminder Template',
    namePlural: 'Reminder Templates',
    slug: 'modules/finance/reminder-templates',
    icon: 'Bell',
    description: 'Payment reminder email templates',
  },
  data: {
    endpoint: '/api/reminder-templates',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Template Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      triggerType: {
        type: 'select',
        label: 'Trigger',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Before Due Date', value: 'before_due', color: 'blue' },
          { label: 'On Due Date', value: 'on_due', color: 'yellow' },
          { label: 'After Due Date', value: 'after_due', color: 'red' },
        ],
      },
      triggerDays: {
        type: 'number',
        label: 'Days',
        required: true,
        inTable: true,
        inForm: true,
        helpText: 'Number of days before/after due date',
        min: 0,
        max: 90,
        default: 0,
      },
      subject: {
        type: 'text',
        label: 'Email Subject',
        required: true,
        inForm: true,
        inDetail: true,
        helpText: 'Use {invoice_number}, {amount}, {due_date}, {client_name} as placeholders',
      },
      body: {
        type: 'richtext',
        label: 'Email Body',
        required: true,
        inForm: true,
        inDetail: true,
        helpText: 'Use {invoice_number}, {amount}, {due_date}, {client_name}, {payment_link} as placeholders',
      },
      isActive: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      isDefault: {
        type: 'switch',
        label: 'Default Template',
        inForm: true,
        inDetail: true,
        helpText: 'Apply to all new invoices automatically',
        default: false,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Template'),
    subtitle: (r: Record<string, unknown>) => {
      const type = String(r.triggerType || '');
      const days = Number(r.triggerDays || 0);
      if (type === 'before_due') return `${days} days before due`;
      if (type === 'on_due') return 'On due date';
      if (type === 'after_due') return `${days} days after due`;
      return '';
    },
    badge: (r: Record<string, unknown>) =>
      r.isActive
        ? { label: 'Active', variant: 'success' }
        : { label: 'Inactive', variant: 'secondary' },
    defaultSort: { field: 'triggerDays', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name', 'subject'],
    placeholder: 'Search templates...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { isActive: true } } },
    ],
    advanced: ['triggerType', 'isActive'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'before', label: 'Before Due', query: { where: { triggerType: 'before_due' } } },
        { key: 'on', label: 'On Due', query: { where: { triggerType: 'on_due' } } },
        { key: 'after', label: 'After Due', query: { where: { triggerType: 'after_due' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'preview', label: 'Preview', content: { type: 'custom', component: 'ReminderPreview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'trigger', title: 'Trigger Settings', content: { type: 'fields', fields: ['triggerType', 'triggerDays', 'isActive', 'isDefault'] } },
          { key: 'content', title: 'Email Content', content: { type: 'fields', fields: ['subject', 'body'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Template Details', fields: ['name', 'triggerType', 'triggerDays'] },
        { key: 'content', title: 'Email Content', fields: ['subject', 'body'] },
        { key: 'settings', title: 'Settings', fields: ['isActive', 'isDefault'] },
      ],
    },
  },
  views: {
    table: {
      columns: [
        'name',
        'triggerType',
        { field: 'triggerDays', format: { type: 'number' } },
        { field: 'isActive', format: { type: 'boolean' } },
      ],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/settings/reminders/${r.id}` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'api', endpoint: '/api/reminder-templates', method: 'POST' } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Template', variant: 'primary', handler: { type: 'navigate', path: '/finance/settings/reminders/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
