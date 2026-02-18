import { defineSchema } from '../schema/defineSchema';

export const purchaseOrderSchema = defineSchema({
  identity: {
    name: 'Purchase Order',
    namePlural: 'Purchase Orders',
    slug: 'modules/operations/procurement/orders',
    icon: 'Package',
    description: 'Purchase orders and procurement',
  },
  data: {
    endpoint: '/api/purchase-orders',
    primaryKey: 'id',
    fields: {
      po_number: {
        type: 'text',
        label: 'PO Number',
        required: true,
        inTable: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      vendor_id: {
        type: 'relation',
        label: 'Vendor',
        required: true,
        inTable: true,
        inForm: true,
      },
      event_id: {
        type: 'relation',
        label: 'Event',
        inTable: true,
        inForm: true,
      },
      project_id: {
        type: 'relation',
        label: 'Project',
        inForm: true,
        relation: { entity: 'project', display: 'name' },
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Pending Approval', value: 'pending_approval' },
          { label: 'Approved', value: 'approved' },
          { label: 'Sent', value: 'sent' },
          { label: 'Acknowledged', value: 'acknowledged' },
          { label: 'Partially Received', value: 'partial' },
          { label: 'Received', value: 'received' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
        default: 'draft',
      },
      order_date: {
        type: 'date',
        label: 'Order Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      expected_delivery_date: {
        type: 'date',
        label: 'Expected Delivery',
        inTable: true,
        inForm: true,
      },
      shipping_address_id: {
        type: 'relation',
        label: 'Ship To',
        inForm: true,
      },
      billing_address_id: {
        type: 'relation',
        label: 'Bill To',
        inForm: true,
      },
      currency_id: {
        type: 'relation',
        label: 'Currency',
        required: true,
        inForm: true,
        relation: { entity: 'currency', display: 'code' },
      },
      subtotal_cents: {
        type: 'currency',
        label: 'Subtotal',
        inDetail: true,
      },
      tax_cents: {
        type: 'currency',
        label: 'Tax',
        inDetail: true,
      },
      shipping_cents: {
        type: 'currency',
        label: 'Shipping',
        inForm: true,
        inDetail: true,
      },
      total_cents: {
        type: 'currency',
        label: 'Total',
        inTable: true,
        inDetail: true,
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
      terms: {
        type: 'textarea',
        label: 'Terms & Conditions',
        inForm: true,
        inDetail: true,
      },
      approved_by_user_id: {
        type: 'relation',
        label: 'Approved By',
        inDetail: true,
        relation: { entity: 'profile', display: 'full_name' },
      },
      approved_at: {
        type: 'datetime',
        label: 'Approved At',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.po_number || 'New PO'),
    subtitle: (r: Record<string, unknown>) => {
      const vendor = r.vendor as Record<string, unknown> | undefined;
      return vendor ? String(vendor.name || '') : '';
    },
    badge: (r: Record<string, unknown>) => {
      const status = String(r.status || 'draft');
      const variants: Record<string, string> = {
        draft: 'secondary',
        pending_approval: 'warning',
        approved: 'default',
        sent: 'primary',
        acknowledged: 'default',
        partial: 'warning',
        received: 'default',
        cancelled: 'destructive',
      };
      return { label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), variant: variants[status] || 'secondary' };
    },
    defaultSort: { field: 'order_date', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['po_number'],
    placeholder: 'Search purchase orders...',
  },
  filters: {
    quick: [
      { key: 'pending', label: 'Pending Approval', query: { where: { status: 'pending_approval' } } },
      { key: 'open', label: 'Open', query: { where: { status: { in: ['approved', 'sent', 'acknowledged', 'partial'] } } } },
    ],
    advanced: ['vendor_id', 'event_id', 'status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'draft', label: 'Drafts', query: { where: { status: 'draft' } }, count: true },
        { key: 'pending', label: 'Pending Approval', query: { where: { status: 'pending_approval' } }, count: true },
        { key: 'open', label: 'Open', query: { where: { status: { in: ['approved', 'sent', 'acknowledged', 'partial'] } } }, count: true },
        { key: 'received', label: 'Received', query: { where: { status: 'received' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Line Items', content: { type: 'related', entity: 'purchase_order_item', foreignKey: 'purchase_order_id' } },
        { key: 'receipts', label: 'Receipts', content: { type: 'related', entity: 'goods_receipt', foreignKey: 'purchase_order_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'total', label: 'Total', value: { type: 'computed', compute: (r: Record<string, unknown>) => Number(r.total_cents || 0) / 100 }, format: 'currency' },
          { key: 'items', label: 'Line Items', value: { type: 'relation-count', entity: 'purchase_order_item', foreignKey: 'purchase_order_id' }, format: 'number' },
        ],
        blocks: [
          { key: 'vendor', title: 'Vendor', content: { type: 'fields', fields: ['vendor_id'] } },
          { key: 'dates', title: 'Dates', content: { type: 'fields', fields: ['order_date', 'expected_delivery_date'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Order Info', fields: ['vendor_id', 'event_id', 'project_id', 'status'] },
        { key: 'dates', title: 'Dates', fields: ['order_date', 'expected_delivery_date'] },
        { key: 'addresses', title: 'Addresses', fields: ['shipping_address_id', 'billing_address_id'] },
        { key: 'amounts', title: 'Amounts', fields: ['currency_id', 'shipping_cents'] },
        { key: 'notes', title: 'Notes', fields: ['notes', 'terms'] },
      ],
    },
  },
  views: {
    table: {
      columns: [
        'po_number',
        { field: 'vendor_id', format: { type: 'relation', entityType: 'vendor' } },
        { field: 'event_id', format: { type: 'relation', entityType: 'event' } },
        { field: 'order_date', format: { type: 'date' } },
        { field: 'total_cents', format: { type: 'currency' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', submitted: '#3b82f6', approved: '#22c55e', rejected: '#ef4444', received: '#8b5cf6', cancelled: '#6b7280' } } },
      ],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/procurement/orders/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/procurement/orders/${r.id}/edit` }, condition: (r: Record<string, unknown>) => r.status === 'draft' },
      { key: 'submit', label: 'Submit for Approval', variant: 'primary', handler: { type: 'api', endpoint: '/api/purchase-orders/{id}/submit', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'draft' },
      { key: 'approve', label: 'Approve', variant: 'primary', handler: { type: 'api', endpoint: '/api/purchase-orders/{id}/approve', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'pending_approval' },
      { key: 'send', label: 'Send to Vendor', handler: { type: 'api', endpoint: '/api/purchase-orders/{id}/send', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'approved' },
      { key: 'receive', label: 'Mark Received', handler: { type: 'api', endpoint: '/api/purchase-orders/{id}/receive', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'sent' || r.status === 'approved' },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New PO', variant: 'primary', handler: { type: 'navigate', path: '/operations/procurement/orders/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'company', foreignKey: 'vendor_id', label: 'Vendor' },
      { entity: 'event', foreignKey: 'event_id', label: 'Event' },
      { entity: 'project', foreignKey: 'project_id', label: 'Project' },
      { entity: 'user', foreignKey: 'approved_by_user_id', label: 'Approved By' },
    ],
    hasMany: [
      { entity: 'purchaseOrderItem', foreignKey: 'purchase_order_id', label: 'Line Items', cascade: 'delete' },
      { entity: 'goodsReceipt', foreignKey: 'purchase_order_id', label: 'Receipts', cascade: 'restrict' },
      { entity: 'vendorPaymentSchedule', foreignKey: 'purchase_order_id', label: 'Payment Schedules', cascade: 'restrict' },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: false },
});
