import { defineSchema } from '../schema/defineSchema';

export const pipelineSchema = defineSchema({
  identity: { name: 'pipeline', namePlural: 'Pipelines', slug: 'modules/business/pipeline', icon: 'TrendingUp', description: 'Sales pipelines and stages' },
  data: {
    endpoint: '/api/pipeline_stages', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Pipeline Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
      dealCount: { type: 'number', label: 'Deals', inTable: true },
      totalValue: { type: 'currency', label: 'Total Value', inTable: true },
      isDefault: { type: 'switch', label: 'Default Pipeline', inForm: true, inTable: true },
      position: { type: 'number', label: 'Position', inTable: true, inForm: true, sortable: true },
      probability: { type: 'number', label: 'Probability %', inTable: true, inForm: true },
      is_won: { type: 'checkbox', label: 'Won Stage', inForm: true },
      is_lost: { type: 'checkbox', label: 'Lost Stage', inForm: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled'), subtitle: (r: Record<string, unknown>) => `${r.probability || 0}% probability`, badge: (r: Record<string, unknown>) => r.is_won ? { label: 'Won', variant: 'success' } : r.is_lost ? { label: 'Lost', variant: 'destructive' } : undefined, defaultSort: { field: 'position', direction: 'asc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search pipeline stages...' },
  filters: { quick: [], advanced: ['is_won', 'is_lost'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'active', label: 'Active', query: { where: { is_won: false, is_lost: false } }, count: true }, { key: 'won', label: 'Won', query: { where: { is_won: true } } }, { key: 'lost', label: 'Lost', query: { where: { is_lost: true } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'probability', label: 'Probability', value: { type: 'field', field: 'probability' } }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Stage Details', fields: ['name', 'description', 'position', 'probability', 'is_won', 'is_lost'] }] } },
  views: { table: { columns: [
        'name',
        { field: 'position', format: { type: 'number' } },
        { field: 'probability', format: { type: 'number' } },
        { field: 'is_won', format: { type: 'boolean' } },
        { field: 'is_lost', format: { type: 'boolean' } },
      ] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/business/pipeline/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Pipeline', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  permissions: { create: true, read: true, update: true, delete: true },
});
