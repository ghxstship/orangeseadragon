import { defineSchema } from '../../schema-engine/defineSchema';

export const offboardingTemplateSchema = defineSchema({
  identity: {
    name: 'Offboarding Template',
    namePlural: 'Offboarding Templates',
    slug: 'modules/workforce/offboarding/templates',
    icon: 'UserMinus',
    description: 'Employee offboarding checklist templates',
  },
  data: {
    endpoint: '/api/offboarding_templates',
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
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      position_type_id: {
        type: 'relation',
        label: 'Position Type',
        inTable: true,
        inForm: true,
      },
      department_id: {
        type: 'relation',
        label: 'Department',
        inTable: true,
        inForm: true,
        relation: { entity: 'department', display: 'name' },
      },
      duration_days: {
        type: 'number',
        label: 'Duration (Days)',
        inTable: true,
        inForm: true,
        default: 14,
        helpText: 'Standard offboarding period in days',
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      is_default: {
        type: 'switch',
        label: 'Default Template',
        inForm: true,
        default: false,
      },
      exit_interview_required: {
        type: 'switch',
        label: 'Exit Interview Required',
        inForm: true,
        default: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'New Template'),
    subtitle: (r: Record<string, unknown>) => {
      const dept = r.department as Record<string, unknown> | undefined;
      return dept ? String(dept.name || '') : 'All Departments';
    },
    badge: (r: Record<string, unknown>) => {
      if (!r.is_active) return { label: 'Inactive', variant: 'secondary' };
      if (r.is_default) return { label: 'Default', variant: 'success' };
      return { label: 'Active', variant: 'default' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search templates...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['department_id', 'position_type_id', 'is_active'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Checklist Items', content: { type: 'related', entity: 'offboarding_item', foreignKey: 'template_id' } },
        { key: 'instances', label: 'Active Offboardings', content: { type: 'related', entity: 'offboarding_instance', foreignKey: 'template_id' } },
      ],
      overview: {
        stats: [
          { key: 'duration', label: 'Duration', value: { type: 'field', field: 'duration_days' }, format: 'number', suffix: ' days' },
          { key: 'items', label: 'Checklist Items', value: { type: 'relation-count', entity: 'offboarding_item', foreignKey: 'template_id' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Template Details', content: { type: 'fields', fields: ['name', 'description', 'department_id', 'position_type_id'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Template Details', fields: ['name', 'description', 'department_id', 'position_type_id'] },
        { key: 'settings', title: 'Settings', fields: ['duration_days', 'is_active', 'is_default', 'exit_interview_required'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'department_id', 'duration_days', 'is_active'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/offboarding/templates/${r.id}` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'api', endpoint: '/api/offboarding_templates/{id}/duplicate', method: 'POST' } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Template', variant: 'primary', handler: { type: 'navigate', path: '/people/offboarding/templates/new' } },
    ],
  },
  relationships: {
    belongsTo: [
      { entity: 'department', foreignKey: 'department_id', label: 'Department' },
    ],
  },


  permissions: { create: true, read: true, update: true, delete: true },
});
