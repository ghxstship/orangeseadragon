import { defineSchema } from '../schema/defineSchema';

export const projectResourceSchema = defineSchema({
  identity: {
    name: 'Project Resource',
    namePlural: 'Project Resources',
    slug: 'modules/projects/resources',
    icon: '👥',
    description: 'Resource allocation and capacity planning',
  },
  data: {
    endpoint: '/api/project_resources',
    primaryKey: 'id',
    fields: {
      project_id: {
        type: 'relation',
        label: 'Project',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'project', display: 'name' },
      },
      contact_id: {
        type: 'relation',
        label: 'Resource',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      role: {
        type: 'text',
        label: 'Role',
        required: true,
        inTable: true,
        inForm: true,
        searchable: true,
      },
      allocation_percent: {
        type: 'number',
        label: 'Allocation %',
        required: true,
        inTable: true,
        inForm: true,
        default: 100,
        helpText: 'Percentage of time allocated to this project',
      },
      start_date: {
        type: 'date',
        label: 'Start Date',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      end_date: {
        type: 'date',
        label: 'End Date',
        inTable: true,
        inForm: true,
      },
      hourly_rate: {
        type: 'currency',
        label: 'Hourly Rate',
        inForm: true,
        inDetail: true,
      },
      estimated_hours: {
        type: 'number',
        label: 'Estimated Hours',
        inTable: true,
        inForm: true,
      },
      actual_hours: {
        type: 'number',
        label: 'Actual Hours',
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
          { label: 'Planned', value: 'planned' },
          { label: 'Active', value: 'active' },
          { label: 'On Hold', value: 'on_hold' },
          { label: 'Completed', value: 'completed' },
        ],
        default: 'planned',
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        inForm: true,
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      const contact = r.contact as Record<string, unknown> | undefined;
      return contact ? String(contact.full_name || 'Resource') : 'Resource';
    },
    subtitle: (r: Record<string, unknown>) => String(r.role || ''),
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        planned: 'secondary',
        active: 'success',
        on_hold: 'warning',
        completed: 'default',
      };
      return { label: String(r.status || 'planned'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'start_date', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['role'],
    placeholder: 'Search resources...',
  },
  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
    ],
    advanced: ['project_id', 'status'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'time', label: 'Time Entries', content: { type: 'related', entity: 'time_entry', foreignKey: 'resource_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'allocation', label: 'Allocation', value: { type: 'field', field: 'allocation_percent' }, format: 'percentage' },
          { key: 'estimated', label: 'Estimated Hours', value: { type: 'field', field: 'estimated_hours' }, format: 'number' },
          { key: 'actual', label: 'Actual Hours', value: { type: 'field', field: 'actual_hours' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Resource Details', content: { type: 'fields', fields: ['project_id', 'contact_id', 'role', 'allocation_percent', 'start_date', 'end_date'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Resource Details', fields: ['project_id', 'contact_id', 'role', 'status'] },
        { key: 'allocation', title: 'Allocation', fields: ['allocation_percent', 'start_date', 'end_date'] },
        { key: 'budget', title: 'Budget', fields: ['hourly_rate', 'estimated_hours'] },
        { key: 'notes', title: 'Notes', fields: ['notes'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['contact_id', 'project_id', 'role', 'allocation_percent', 'start_date', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/projects/resources/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'Add Resource', variant: 'primary', handler: { type: 'navigate', path: '/modules/projects/resources/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
