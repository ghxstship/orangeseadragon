import { defineSchema } from '../schema/defineSchema';

/**
 * CUSTOM FIELD DEFINITION ENTITY SCHEMA (SSOT)
 *
 * Dynamic custom fields system supporting:
 * - Text, number, date, select, multi-select, checkbox, URL, email, currency, percentage, formula
 * - Per-entity-type field definitions
 * - Configurable visibility (table, form, filterable, sortable)
 * - Formula fields with expression evaluation
 */
export const customFieldDefinitionSchema = defineSchema({
  identity: {
    name: 'Custom Field',
    namePlural: 'Custom Fields',
    slug: 'modules/settings/custom-fields',
    icon: 'Settings2',
    description: 'Dynamic custom field definitions for any entity type',
  },

  data: {
    endpoint: '/api/custom-field-definitions',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Field Name',
        required: true,
        inTable: true,
        inForm: true,
        inDetail: true,
        sortable: true,
        searchable: true,
      },
      slug: {
        type: 'text',
        label: 'Slug',
        required: true,
        inTable: true,
        inForm: true,
        helpText: 'Unique identifier (auto-generated from name)',
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      entity_type: {
        type: 'select',
        label: 'Entity Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Task', value: 'task' },
          { label: 'Project', value: 'project' },
          { label: 'Deal', value: 'deal' },
          { label: 'Contact', value: 'contact' },
          { label: 'Company', value: 'company' },
          { label: 'Event', value: 'event' },
          { label: 'Invoice', value: 'invoice' },
          { label: 'Budget', value: 'budget' },
          { label: 'Expense', value: 'expense' },
          { label: 'Resource Booking', value: 'resource_booking' },
        ],
      },
      field_type: {
        type: 'select',
        label: 'Field Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Text', value: 'text' },
          { label: 'Number', value: 'number' },
          { label: 'Date', value: 'date' },
          { label: 'Date & Time', value: 'datetime' },
          { label: 'Select', value: 'select' },
          { label: 'Multi-Select', value: 'multi_select' },
          { label: 'Checkbox', value: 'checkbox' },
          { label: 'URL', value: 'url' },
          { label: 'Email', value: 'email' },
          { label: 'Currency', value: 'currency' },
          { label: 'Percentage', value: 'percentage' },
          { label: 'Formula', value: 'formula' },
          { label: 'Relation', value: 'relation' },
        ],
      },
      options: {
        type: 'code',
        label: 'Options (JSON)',
        inForm: true,
        inDetail: true,
        helpText: 'For select/multi-select: [{ "label": "Option A", "value": "a" }]',
      },
      default_value: {
        type: 'text',
        label: 'Default Value',
        inForm: true,
        inDetail: true,
      },
      is_required: {
        type: 'switch',
        label: 'Required',
        inForm: true,
        inTable: true,
        default: false,
      },
      is_filterable: {
        type: 'switch',
        label: 'Filterable',
        inForm: true,
        default: true,
      },
      is_sortable: {
        type: 'switch',
        label: 'Sortable',
        inForm: true,
        default: true,
      },
      show_in_table: {
        type: 'switch',
        label: 'Show in Table',
        inForm: true,
        default: false,
      },
      show_in_form: {
        type: 'switch',
        label: 'Show in Form',
        inForm: true,
        default: true,
      },
      position: {
        type: 'number',
        label: 'Position',
        inForm: true,
        default: 0,
      },
      formula_expression: {
        type: 'text',
        label: 'Formula Expression',
        inForm: true,
        inDetail: true,
        helpText: 'For formula fields: e.g. "{quantity} * {unit_price}"',
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Field'),
    subtitle: (r: Record<string, unknown>) => `${r.entity_type} — ${r.field_type}`,
    badge: (r: Record<string, unknown>) => r.is_active
      ? { label: String(r.field_type), variant: 'primary' }
      : { label: 'Inactive', variant: 'secondary' },
    defaultSort: { field: 'entity_type', direction: 'asc' },
  },

  search: { enabled: true, fields: ['name', 'slug'], placeholder: 'Search custom fields...' },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['entity_type', 'field_type', 'is_active'],
  },

  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'tasks', label: 'Task Fields', query: { where: { entity_type: 'task' } }, count: true },
        { key: 'projects', label: 'Project Fields', query: { where: { entity_type: 'project' } }, count: true },
        { key: 'deals', label: 'Deal Fields', query: { where: { entity_type: 'deal' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
      ],
      overview: {
        stats: [],
        blocks: [
          { key: 'config', title: 'Configuration', content: { type: 'fields', fields: ['entity_type', 'field_type', 'default_value', 'is_required', 'options'] } },
          { key: 'display', title: 'Display', content: { type: 'fields', fields: ['show_in_table', 'show_in_form', 'is_filterable', 'is_sortable', 'position'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Field Details', fields: ['name', 'slug', 'description', 'entity_type', 'field_type'] },
        { key: 'config', title: 'Configuration', fields: ['options', 'default_value', 'formula_expression', 'is_required'] },
        { key: 'display', title: 'Display', fields: ['show_in_table', 'show_in_form', 'is_filterable', 'is_sortable', 'position'] },
        { key: 'status', title: 'Status', fields: ['is_active'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'entity_type', 'field_type', 'is_required', 'show_in_table', 'is_active'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/settings/custom-fields/${r.id}` } },
      { key: 'edit', label: 'Edit', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/settings/custom-fields/${r.id}/edit` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Custom Field', variant: 'primary', handler: { type: 'navigate', path: '/settings/custom-fields/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
