import { defineSchema } from '../schema/defineSchema';

export const orgUnitSchema = defineSchema({
  identity: {
    name: 'Organization Unit',
    namePlural: 'Organization Units',
    slug: 'modules/workforce/org-units',
    icon: 'Building2',
    description: 'Organizational structure units (departments, teams, divisions)',
  },
  data: {
    endpoint: '/api/org-units',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        searchable: true,
      },
      code: {
        type: 'text',
        label: 'Code',
        inTable: true,
        inForm: true,
        helpText: 'Short identifier (e.g., ENG, HR, FIN)',
      },
      type: {
        type: 'select',
        label: 'Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Company', value: 'company' },
          { label: 'Division', value: 'division' },
          { label: 'Department', value: 'department' },
          { label: 'Team', value: 'team' },
          { label: 'Project', value: 'project' },
        ],
        default: 'department',
      },
      parent_id: {
        type: 'relation',
        label: 'Parent Unit',
        inTable: true,
        inForm: true,
        relation: { entity: 'org_unit', display: 'name' },
      },
      head_id: {
        type: 'relation',
        label: 'Unit Head',
        inTable: true,
        inForm: true,
        relation: { entity: 'user_profile', display: 'headline' },
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      cost_center: {
        type: 'text',
        label: 'Cost Center',
        inForm: true,
        inDetail: true,
      },
      location: {
        type: 'text',
        label: 'Location',
        inTable: true,
        inForm: true,
      },
      headcount: {
        type: 'number',
        label: 'Headcount',
        inTable: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Planned', value: 'planned' },
        ],
        default: 'active',
      },
      color: {
        type: 'text',
        label: 'Color',
        inForm: true,
        helpText: 'Hex color for org chart visualization',
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Organization Unit'),
    subtitle: (r: Record<string, unknown>) => String(r.type || ''),
    badge: (r: Record<string, unknown>) => {
      const status = String(r.status || 'active');
      const variants: Record<string, string> = {
        active: 'success',
        inactive: 'secondary',
        planned: 'warning',
      };
      return { label: status.charAt(0).toUpperCase() + status.slice(1), variant: variants[status] || 'secondary' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name', 'code', 'description'],
    placeholder: 'Search organization units...',
  },
  filters: {
    quick: [
      { key: 'departments', label: 'Departments', query: { where: { type: 'department' } } },
      { key: 'teams', label: 'Teams', query: { where: { type: 'team' } } },
    ],
    advanced: ['type', 'status', 'parent_id', 'head_id'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'departments', label: 'Departments', query: { where: { type: 'department' } }, count: true },
        { key: 'teams', label: 'Teams', query: { where: { type: 'team' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'tree'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'members', label: 'Members', content: { type: 'related', entity: 'user_profile', foreignKey: 'org_unit_id' } },
        { key: 'children', label: 'Sub-Units', content: { type: 'related', entity: 'org_unit', foreignKey: 'parent_id' } },
      ],
      overview: {
        stats: [
          { key: 'headcount', label: 'Headcount', value: { type: 'field', field: 'headcount' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Unit Details', content: { type: 'fields', fields: ['name', 'code', 'type', 'parent_id', 'head_id'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Unit Information', fields: ['name', 'code', 'type', 'description'] },
        { key: 'hierarchy', title: 'Hierarchy', fields: ['parent_id', 'head_id'] },
        { key: 'details', title: 'Details', fields: ['cost_center', 'location', 'status', 'color'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'code', 'type', 'parent_id', 'head_id', 'headcount', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/org/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Unit', variant: 'primary', handler: { type: 'navigate', path: '/people/org/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
