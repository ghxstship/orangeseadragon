import { defineSchema } from '../schema/defineSchema';

export const quoteSchema = defineSchema({
  identity: {
    name: 'Quote',
    namePlural: 'Quotes',
    slug: 'modules/finance/quotes',
    icon: 'FileText',
    description: 'Quotes and estimates for clients',
  },
  data: {
    endpoint: '/api/quotes',
    primaryKey: 'id',
    fields: {
      quoteNumber: {
        type: 'text',
        label: 'Quote #',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      title: {
        type: 'text',
        label: 'Title',
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      clientId: {
        type: 'relation',
        label: 'Client',
        required: true,
        inTable: true,
        inForm: true,
      },
      contactId: {
        type: 'relation',
        label: 'Contact',
        inForm: true,
      },
      projectId: {
        type: 'relation',
        label: 'Project',
        inForm: true,
      },
      eventId: {
        type: 'relation',
        label: 'Event',
        inForm: true,
        relation: { entity: 'event', display: 'name' },
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft', color: 'gray' },
          { label: 'Sent', value: 'sent', color: 'blue' },
          { label: 'Viewed', value: 'viewed', color: 'purple' },
          { label: 'Accepted', value: 'accepted', color: 'green' },
          { label: 'Declined', value: 'declined', color: 'red' },
          { label: 'Expired', value: 'expired', color: 'orange' },
          { label: 'Converted', value: 'converted', color: 'teal' },
        ],
        default: 'draft',
      },
      validUntil: {
        type: 'date',
        label: 'Valid Until',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      subtotal: {
        type: 'currency',
        label: 'Subtotal',
        required: true,
        inForm: true,
        inDetail: true,
      },
      taxRate: {
        type: 'percentage',
        label: 'Tax Rate',
        inForm: true,
        default: 0,
      },
      taxAmount: {
        type: 'currency',
        label: 'Tax Amount',
        inDetail: true,
      },
      discountAmount: {
        type: 'currency',
        label: 'Discount',
        inForm: true,
        default: 0,
      },
      totalAmount: {
        type: 'currency',
        label: 'Total',
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
      termsAndConditions: {
        type: 'richtext',
        label: 'Terms & Conditions',
        inForm: true,
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      internalNotes: {
        type: 'textarea',
        label: 'Internal Notes',
        inForm: true,
        inDetail: true,
      },
      sentAt: {
        type: 'datetime',
        label: 'Sent At',
        inDetail: true,
      },
      viewedAt: {
        type: 'datetime',
        label: 'Viewed At',
        inDetail: true,
      },
      acceptedAt: {
        type: 'datetime',
        label: 'Accepted At',
        inDetail: true,
      },
      declinedAt: {
        type: 'datetime',
        label: 'Declined At',
        inDetail: true,
      },
      declineReason: {
        type: 'textarea',
        label: 'Decline Reason',
        inDetail: true,
      },
      convertedInvoiceId: {
        type: 'relation',
        label: 'Converted Invoice',
        inDetail: true,
        relation: { entity: 'invoice', display: 'invoice_number' },
      },
      convertedAt: {
        type: 'datetime',
        label: 'Converted At',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.quoteNumber || 'New Quote'),
    subtitle: (r: Record<string, unknown>) => r.title ? String(r.title) : `$${r.totalAmount || 0}`,
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        draft: 'secondary',
        sent: 'default',
        viewed: 'default',
        accepted: 'success',
        declined: 'destructive',
        expired: 'warning',
        converted: 'success',
      };
      return { label: String(r.status || 'draft'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'createdAt', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['quoteNumber', 'title'],
    placeholder: 'Search quotes...',
  },
  filters: {
    quick: [
      { key: 'pending', label: 'Pending Response', query: { where: { status: 'sent' } } },
      { key: 'accepted', label: 'Accepted', query: { where: { status: 'accepted' } } },
    ],
    advanced: ['status', 'clientId', 'projectId'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'draft', label: 'Draft', query: { where: { status: 'draft' } }, count: true },
        { key: 'sent', label: 'Sent', query: { where: { status: 'sent' } }, count: true },
        { key: 'accepted', label: 'Accepted', query: { where: { status: 'accepted' } }, count: true },
        { key: 'declined', label: 'Declined', query: { where: { status: 'declined' } } },
        { key: 'expired', label: 'Expired', query: { where: { status: 'expired' } } },
        { key: 'converted', label: 'Converted', query: { where: { status: 'converted' } } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'line-items', label: 'Line Items', content: { type: 'related', entity: 'quote_line_item', foreignKey: 'quote_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'total', label: 'Total', value: { type: 'field', field: 'totalAmount' }, format: 'currency' },
          { key: 'validUntil', label: 'Valid Until', value: { type: 'field', field: 'validUntil' }, format: 'date' },
        ],
        blocks: [
          { key: 'details', title: 'Quote Details', content: { type: 'fields', fields: ['quoteNumber', 'title', 'clientId', 'contactId', 'status', 'validUntil'] } },
          { key: 'amounts', title: 'Amounts', content: { type: 'fields', fields: ['subtotal', 'taxRate', 'taxAmount', 'discountAmount', 'totalAmount'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Quote Details', fields: ['quoteNumber', 'title', 'clientId', 'contactId', 'projectId', 'eventId'] },
        { key: 'validity', title: 'Validity', fields: ['validUntil', 'paymentTerms'] },
        { key: 'amounts', title: 'Amounts', fields: ['subtotal', 'taxRate', 'discountAmount', 'totalAmount', 'currency'] },
        { key: 'content', title: 'Content', fields: ['termsAndConditions', 'notes', 'internalNotes'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['quoteNumber', 'title', 'clientId', 'totalAmount', 'status', 'validUntil'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/quotes/${r.id}` } },
      { key: 'send', label: 'Send to Client', variant: 'primary', handler: { type: 'api', endpoint: '/api/quotes', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'draft' },
      { key: 'convert', label: 'Convert to Invoice', variant: 'primary', handler: { type: 'api', endpoint: '/api/quotes/{id}/convert', method: 'POST' }, condition: (r: Record<string, unknown>) => ['accepted', 'sent', 'viewed'].includes(String(r.status)) && !r.convertedInvoiceId },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'api', endpoint: '/api/quotes', method: 'POST' } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Quote', variant: 'primary', handler: { type: 'navigate', path: '/finance/quotes/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'company', foreignKey: 'clientId', label: 'Client' },
      { entity: 'contact', foreignKey: 'contactId', label: 'Contact' },
      { entity: 'project', foreignKey: 'projectId', label: 'Project' },
      { entity: 'event', foreignKey: 'eventId', label: 'Event' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
