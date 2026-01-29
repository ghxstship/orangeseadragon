import { defineSchema } from '../schema/defineSchema';

export const onboardingTemplateSchema = defineSchema({
  identity: {
    name: 'Onboarding Template',
    namePlural: 'Onboarding Templates',
    slug: 'modules/workforce/onboarding/templates',
    icon: '📋',
    description: 'Employee onboarding checklists and templates',
  },
  data: {
    endpoint: '/api/onboarding-templates',
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
        relation: { entity: 'position_type', display: 'name' },
        helpText: 'Leave blank for all positions',
      },
      department_id: {
        type: 'relation',
        label: 'Department',
        inTable: true,
        inForm: true,
        relation: { entity: 'department', display: 'name' },
        helpText: 'Leave blank for all departments',
      },
      employment_type_id: {
        type: 'relation',
        label: 'Employment Type',
        inForm: true,
        relation: { entity: 'employment_type', display: 'name' },
        helpText: 'Leave blank for all employment types',
      },
      duration_days: {
        type: 'number',
        label: 'Duration (Days)',
        inTable: true,
        inForm: true,
        inDetail: true,
        default: 30,
        helpText: 'Expected onboarding duration',
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
        helpText: 'Use as default when no specific template matches',
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Template'),
    subtitle: (r: Record<string, unknown>) => {
      const dept = r.department as Record<string, unknown> | undefined;
      const pos = r.position_type as Record<string, unknown> | undefined;
      const parts = [];
      if (dept) parts.push(String(dept.name || ''));
      if (pos) parts.push(String(pos.name || ''));
      return parts.join(' • ') || 'All positions';
    },
    badge: (r: Record<string, unknown>) => {
      if (!r.is_active) return { label: 'Inactive', variant: 'secondary' };
      if (r.is_default) return { label: 'Default', variant: 'primary' };
      return { label: 'Active', variant: 'default' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search templates...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['position_type_id', 'department_id', 'is_active'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'items', label: 'Checklist Items', content: { type: 'related', entity: 'onboarding_item', foreignKey: 'template_id' } },
        { key: 'instances', label: 'Active Onboardings', content: { type: 'related', entity: 'onboarding_instance', foreignKey: 'template_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'items', label: 'Checklist Items', value: { type: 'relation-count', entity: 'onboarding_item', foreignKey: 'template_id' }, format: 'number' },
          { key: 'active', label: 'Active Onboardings', value: { type: 'relation-count', entity: 'onboarding_instance', foreignKey: 'template_id', filter: { status: 'in_progress' } }, format: 'number' },
        ],
        blocks: [
          { key: 'scope', title: 'Scope', content: { type: 'fields', fields: ['position_type_id', 'department_id', 'employment_type_id'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Template Info', fields: ['name', 'description', 'duration_days'] },
        { key: 'scope', title: 'Applies To', fields: ['position_type_id', 'department_id', 'employment_type_id'] },
        { key: 'settings', title: 'Settings', fields: ['is_active', 'is_default'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'position_type_id', 'department_id', 'duration_days', 'is_active'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/workforce/onboarding/templates/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/workforce/onboarding/templates/${r.id}/edit` } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'api', endpoint: '/api/onboarding-templates/duplicate', method: 'POST' } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Template', variant: 'primary', handler: { type: 'navigate', path: '/modules/workforce/onboarding/templates/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
