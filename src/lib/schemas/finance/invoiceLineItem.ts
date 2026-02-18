import { defineSchema } from '../../schema-engine/defineSchema';

/**
 * INVOICE LINE ITEM ENTITY SCHEMA (SSOT)
 *
 * Individual line items on invoices with per-line tax,
 * discounts, and budget category linking.
 */
export const invoiceLineItemSchema = defineSchema({
  identity: {
    name: 'Invoice Line Item',
    namePlural: 'Invoice Line Items',
    slug: 'modules/finance/invoice-line-items',
    icon: 'ListOrdered',
    description: 'Individual line items on invoices',
  },

  data: {
    endpoint: '/api/invoice-line-items',
    primaryKey: 'id',
    fields: {
      invoice_id: {
        type: 'relation',
        label: 'Invoice',
        required: true,
        inForm: true,
        relation: { entity: 'invoice', display: 'invoice_number' },
      },
      position: {
        type: 'number',
        label: 'Position',
        required: true,
        inTable: true,
        inForm: true,
        default: 0,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      quantity: {
        type: 'number',
        label: 'Quantity',
        required: true,
        inTable: true,
        inForm: true,
        default: 1,
      },
      unit_price: {
        type: 'currency',
        label: 'Unit Price',
        required: true,
        inTable: true,
        inForm: true,
      },
      tax_rate: {
        type: 'percentage',
        label: 'Tax Rate',
        inTable: true,
        inForm: true,
        default: 0,
      },
      tax_amount: {
        type: 'currency',
        label: 'Tax Amount',
        inTable: true,
        inDetail: true,
      },
      discount_percent: {
        type: 'percentage',
        label: 'Discount %',
        inForm: true,
        default: 0,
      },
      discount_amount: {
        type: 'currency',
        label: 'Discount Amount',
        inDetail: true,
      },
      line_total: {
        type: 'currency',
        label: 'Line Total',
        required: true,
        inTable: true,
        inDetail: true,
      },
      budget_category_id: {
        type: 'relation',
        label: 'Budget Category',
        inForm: true,
        relation: { entity: 'budget_category', display: 'name' },
      },
    },
    computed: {
      computed_total: {
        label: 'Computed Total',
        computation: {
          type: 'derived',
          compute: (r: Record<string, unknown>) => {
            const qty = Number(r.quantity) || 0;
            const price = Number(r.unit_price) || 0;
            const discountPct = Number(r.discount_percent) || 0;
            const subtotal = qty * price;
            const afterDiscount = subtotal * (1 - discountPct / 100);
            const taxRate = Number(r.tax_rate) || 0;
            return afterDiscount * (1 + taxRate / 100);
          },
        },
        format: 'currency',
        inDetail: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.description || 'Line Item').substring(0, 60),
    subtitle: (r: Record<string, unknown>) => `${r.quantity} × $${Number(r.unit_price || 0).toLocaleString()}`,
    defaultSort: { field: 'position', direction: 'asc' },
  },

  search: { enabled: false, fields: [], placeholder: '' },

  filters: {
    quick: [],
    advanced: ['invoice_id'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} } },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: { stats: [], blocks: [] },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Line Item', fields: ['invoice_id', 'position', 'description', 'quantity', 'unit_price'] },
        { key: 'tax', title: 'Tax & Discount', fields: ['tax_rate', 'discount_percent', 'budget_category_id'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['position', 'description', 'quantity', 'unit_price', 'tax_rate', 'discount_percent', 'line_total'],
    },
  },

  actions: {
    row: [
      { key: 'delete', label: 'Remove', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Line Item', variant: 'primary', handler: { type: 'function', fn: () => {} } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'invoice', foreignKey: 'invoice_id', label: 'Invoice' },
    ],
  },



  permissions: { create: true, read: true, update: true, delete: true },
});
