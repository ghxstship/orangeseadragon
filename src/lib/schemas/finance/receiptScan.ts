import { defineSchema } from '../../schema-engine/defineSchema';

export const receiptScanSchema = defineSchema({
  identity: {
    name: 'Receipt Scan',
    namePlural: 'Receipt Scans',
    slug: 'modules/finance/receipt-scans',
    icon: 'ScanLine',
    description: 'Scanned receipts with OCR data extraction',
  },
  data: {
    endpoint: '/api/receipt-scans',
    primaryKey: 'id',
    fields: {
      fileName: {
        type: 'text',
        label: 'File Name',
        inTable: true,
        inDetail: true,
        searchable: true,
      },
      fileUrl: {
        type: 'file',
        label: 'Receipt Image',
        required: true,
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        options: [
          { label: 'Processing', value: 'processing', color: 'yellow' },
          { label: 'Completed', value: 'completed', color: 'green' },
          { label: 'Failed', value: 'failed', color: 'red' },
          { label: 'Reviewed', value: 'reviewed', color: 'blue' },
        ],
        default: 'processing',
      },
      extractedVendor: {
        type: 'text',
        label: 'Vendor',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      extractedAmount: {
        type: 'currency',
        label: 'Amount',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      extractedDate: {
        type: 'date',
        label: 'Date',
        inTable: true,
        inForm: true,
        inDetail: true,
      },
      extractedCategory: {
        type: 'text',
        label: 'Category Suggestion',
        inDetail: true,
      },
      overallConfidence: {
        type: 'percentage',
        label: 'Confidence',
        inTable: true,
        inDetail: true,
      },
      expenseId: {
        type: 'relation',
        relation: { entity: 'expense', display: 'description' },
        label: 'Linked Expense',
        inTable: true,
        inDetail: true,
      },
      errorMessage: {
        type: 'text',
        label: 'Error',
        inDetail: true,
      },
      ocrProvider: {
        type: 'text',
        label: 'OCR Provider',
        inDetail: true,
      },
      processingTimeMs: {
        type: 'number',
        label: 'Processing Time (ms)',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.extractedVendor || r.fileName || 'Receipt'),
    subtitle: (r: Record<string, unknown>) => r.extractedAmount ? `$${r.extractedAmount}` : 'Processing...',
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        processing: 'warning',
        completed: 'success',
        failed: 'destructive',
        reviewed: 'default',
      };
      return { label: String(r.status || 'processing'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'createdAt', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['fileName', 'extractedVendor'],
    placeholder: 'Search receipts...',
  },
  filters: {
    quick: [
      { key: 'pending', label: 'Needs Review', query: { where: { status: 'completed' } } },
      { key: 'unlinked', label: 'Unlinked', query: { where: { expenseId: null } } },
    ],
    advanced: ['status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Needs Review', query: { where: { status: 'completed' } }, count: true },
        { key: 'linked', label: 'Linked', query: { where: { status: 'reviewed' } } },
        { key: 'failed', label: 'Failed', query: { where: { status: 'failed' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'gallery'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [
          { key: 'amount', label: 'Amount', value: { type: 'field', field: 'extractedAmount' }, format: 'currency' },
          { key: 'confidence', label: 'Confidence', value: { type: 'field', field: 'overallConfidence' }, format: 'percentage' },
        ],
        blocks: [
          { key: 'extracted', title: 'Extracted Data', content: { type: 'fields', fields: ['extractedVendor', 'extractedAmount', 'extractedDate', 'extractedCategory'] } },
          { key: 'meta', title: 'Processing Info', content: { type: 'fields', fields: ['status', 'overallConfidence', 'ocrProvider', 'processingTimeMs'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'upload', title: 'Upload Receipt', fields: ['fileUrl'] },
        { key: 'review', title: 'Review Extracted Data', fields: ['extractedVendor', 'extractedAmount', 'extractedDate'] },
      ],
    },
  },
  views: {
    table: {
      columns: [
        'fileName', 'extractedVendor',
        { field: 'extractedAmount', format: { type: 'currency' } },
        { field: 'extractedDate', format: { type: 'date' } },
        { field: 'status', format: { type: 'badge', colorMap: { pending: '#f59e0b', processing: '#3b82f6', completed: '#22c55e', failed: '#ef4444' } } },
        { field: 'overallConfidence', format: { type: 'percentage' } },
      ],
    },
    gallery: {
      imageField: 'fileUrl',
      titleField: 'extractedVendor',
      subtitleField: 'extractedAmount',
      badgeField: 'status',
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/finance/receipts/${r.id}` } },
      { key: 'createExpense', label: 'Create Expense', variant: 'primary', handler: { type: 'modal', component: 'CreateExpenseFromReceipt' }, condition: (r: Record<string, unknown>) => r.status === 'completed' && !r.expenseId },
      { key: 'retry', label: 'Retry Scan', handler: { type: 'api', endpoint: '/api/receipt-scans/{id}/retry', method: 'POST' }, condition: (r: Record<string, unknown>) => r.status === 'failed' },
    ],
    bulk: [
      { key: 'createExpenses', label: 'Create Expenses', variant: 'primary', handler: { type: 'api', endpoint: '/api/receipt-scans/bulk-create-expenses', method: 'POST' } },
    ],
    global: [
      { key: 'upload', label: 'Upload Receipts', variant: 'primary', handler: { type: 'modal', component: 'ReceiptUploadModal' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'expense', foreignKey: 'expenseId', label: 'Expense' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
