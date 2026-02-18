import { defineSchema } from '../../schema-engine/defineSchema';

export const zoneSchema = defineSchema({
  identity: { name: 'zone', namePlural: 'Zones', slug: 'modules/operations/zones', icon: 'MapPinned', description: 'Venue zones and areas' },
  data: {
    endpoint: '/api/venue_spaces', primaryKey: 'id',
    fields: {
      name: { type: 'text', label: 'Zone Name', required: true, inTable: true, inForm: true, inDetail: true, sortable: true, searchable: true },
      venueId: { type: 'select', label: 'Venue', required: true, inTable: true, inForm: true, options: [] },
      type: { type: 'select', label: 'Type', required: true, inTable: true, inForm: true, options: [{ label: 'Public', value: 'public', color: 'green' }, { label: 'VIP', value: 'vip', color: 'purple' }, { label: 'Backstage', value: 'backstage', color: 'blue' }, { label: 'Restricted', value: 'restricted', color: 'red' }] },
      capacity: { type: 'number', label: 'Capacity', inTable: true, inForm: true },
      color: { type: 'text', label: 'Color', inForm: true },
      description: { type: 'textarea', label: 'Description', inForm: true, inDetail: true },
    },
  },
  display: { title: (r: Record<string, unknown>) => String(r.name || 'Untitled Zone'), subtitle: (r: Record<string, unknown>) => String(r.type || ''), defaultSort: { field: 'name', direction: 'asc' } },
  search: { enabled: true, fields: ['name'], placeholder: 'Search zones...' },
  filters: { quick: [], advanced: ['type', 'venueId'] },
  layouts: { list: { subpages: [{ key: 'all', label: 'All', query: { where: {} }, count: true }, { key: 'public', label: 'Public', query: { where: { type: 'public' } } }, { key: 'vip', label: 'VIP', query: { where: { type: 'vip' } } }, { key: 'backstage', label: 'Backstage', query: { where: { type: 'backstage' } } }, { key: 'restricted', label: 'Restricted', query: { where: { type: 'restricted' } } }], defaultView: 'table', availableViews: ['table'] }, detail: { tabs: [{ key: 'overview', label: 'Overview', content: { type: 'overview' } }], overview: { stats: [{ key: 'capacity', label: 'Capacity', value: { type: 'field', field: 'capacity' } }], blocks: [] } }, form: { sections: [{ key: 'basic', title: 'Zone Details', fields: ['name', 'venueId', 'type', 'capacity', 'color', 'description'] }] } },
  views: { table: { columns: [
        'name',
        { field: 'venueId', format: { type: 'relation', entityType: 'venue' } },
        'type',
        { field: 'capacity', format: { type: 'number' } },
      ] } },
  actions: { row: [{ key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/zones/${r.id}` } }], bulk: [], global: [{ key: 'create', label: 'New Zone', variant: 'primary', handler: { type: 'function', fn: () => {} } }] },
  relationships: {
    belongsTo: [
      { entity: 'venue', foreignKey: 'venueId', label: 'Venue' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
