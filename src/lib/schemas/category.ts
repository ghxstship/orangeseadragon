import { defineSchema } from '../schema/defineSchema';

export const categorySchema = defineSchema({
  identity: { name: 'category', namePlural: 'Categories', slug: 'modules/assets/categories', icon: 'FolderTree', description: 'Asset categories and classifications' },
  data: {
    endpoint: '/api/asset_categories', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Category Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      parentId: { type: 'select', label: 'Parent Category', inTable: true, inForm: true, options: [] },
      code: { type: 'text', label: 'Code', inTable: true, inForm: true },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
      assetCount: { type: 'number', label: 'Assets', inTable: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => `${r.assetCount || 0} assets`, defaultSort: { field: 'name', direction: 'asc' } },
  search: { enabled: true, fields: ['name', 'code'], placeholder: 'Search categories...' },
  filters: { quick: [], advanced: ['parentId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'count', label: 'Assets', value: { type: 'field', field: 'assetCount' } }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Category Details', fields: ['name', 'parentId', 'code', 'description'] }] } },
  views: { table: { columns: ['name', 'code', 'parentId', 'assetCount'] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/assets/categories/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Category', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
