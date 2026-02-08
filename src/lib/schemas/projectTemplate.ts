import { defineSchema } from '../schema/defineSchema';

/**
 * PROJECT TEMPLATE ENTITY SCHEMA (SSOT)
 *
 * Reusable project templates with:
 * - Production type categorization
 * - Task templates with relative scheduling
 * - Dependency cloning on instantiation
 * - Budget template linking
 * - One-click project creation from template
 */
export const projectTemplateSchema = defineSchema({
  identity: {
    name: 'Project Template',
    namePlural: 'Project Templates',
    slug: 'modules/operations/project-templates',
    icon: 'LayoutTemplate',
    description: 'Reusable project templates with tasks and dependencies',
  },

  data: {
    endpoint: '/api/project-templates',
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
      production_type: {
        type: 'select',
        label: 'Production Type',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Concert / Festival', value: 'concert_festival' },
          { label: 'Corporate Event', value: 'corporate_event' },
          { label: 'Conference', value: 'conference' },
          { label: 'Trade Show', value: 'trade_show' },
          { label: 'Broadcast / Film', value: 'broadcast_film' },
          { label: 'Theater', value: 'theater' },
          { label: 'Tour', value: 'tour' },
          { label: 'Installation', value: 'installation' },
          { label: 'Private Event', value: 'private_event' },
          { label: 'General', value: 'general' },
        ],
      },
      category: {
        type: 'text',
        label: 'Category',
        inTable: true,
        inForm: true,
      },
      icon: {
        type: 'text',
        label: 'Icon',
        inForm: true,
      },
      color: {
        type: 'text',
        label: 'Color',
        inForm: true,
      },
      default_status: {
        type: 'select',
        label: 'Default Project Status',
        inForm: true,
        options: [
          { label: 'Planning', value: 'planning' },
          { label: 'Active', value: 'active' },
          { label: 'On Hold', value: 'on_hold' },
        ],
        default: 'planning',
      },
      default_visibility: {
        type: 'select',
        label: 'Default Visibility',
        inForm: true,
        options: [
          { label: 'Team', value: 'team' },
          { label: 'Organization', value: 'organization' },
          { label: 'Private', value: 'private' },
        ],
        default: 'team',
      },
      default_priority: {
        type: 'select',
        label: 'Default Priority',
        inForm: true,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
          { label: 'Urgent', value: 'urgent' },
        ],
        default: 'medium',
      },
      estimated_duration_days: {
        type: 'number',
        label: 'Estimated Duration (days)',
        inTable: true,
        inForm: true,
      },
      budget_template_id: {
        type: 'relation',
        label: 'Budget Template',
        inForm: true,
        inDetail: true,
        relation: { entity: 'budget_template', display: 'name' },
      },
      usage_count: {
        type: 'number',
        label: 'Times Used',
        inTable: true,
        inDetail: true,
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
    },
    computed: {
      task_count: {
        label: 'Tasks',
        computation: {
          type: 'relation-count',
          entity: 'task_templates',
          foreignKey: 'project_template_id',
        },
        format: 'number',
        inTable: true,
      },
    },
  },

  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'Untitled Template'),
    subtitle: (r: Record<string, unknown>) => String(r.production_type || r.category || ''),
    badge: (r: Record<string, unknown>) => r.is_active
      ? { label: 'Active', variant: 'success' }
      : { label: 'Inactive', variant: 'secondary' },
    defaultSort: { field: 'name', direction: 'asc' },
  },

  search: { enabled: true, fields: ['name', 'description'], placeholder: 'Search templates...' },

  filters: {
    quick: [
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
    ],
    advanced: ['production_type', 'category', 'is_active'],
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
        { key: 'tasks', label: 'Task Templates', content: { type: 'related', entity: 'task_templates', foreignKey: 'project_template_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'usage', label: 'Times Used', value: { type: 'field', field: 'usage_count' }, format: 'number' },
          { key: 'duration', label: 'Duration', value: { type: 'field', field: 'estimated_duration_days' }, format: 'number' },
        ],
        blocks: [
          { key: 'config', title: 'Configuration', content: { type: 'fields', fields: ['default_status', 'default_visibility', 'default_priority', 'budget_template_id'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Template Details', fields: ['name', 'description', 'production_type', 'category', 'icon', 'color'] },
        { key: 'defaults', title: 'Project Defaults', fields: ['default_status', 'default_visibility', 'default_priority', 'estimated_duration_days'] },
        { key: 'budget', title: 'Budget', fields: ['budget_template_id'] },
        { key: 'status', title: 'Status', fields: ['is_active'] },
      ],
    },
  },

  views: {
    table: {
      columns: ['name', 'production_type', 'category', 'task_count', 'estimated_duration_days', 'usage_count', 'is_active'],
    },
  },

  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/operations/project-templates/${r.id}` } },
      { key: 'create-project', label: 'Create Project', variant: 'primary', handler: { type: 'api', endpoint: '/api/project-templates/create-project', method: 'POST' } },
      { key: 'duplicate', label: 'Duplicate', handler: { type: 'function', fn: () => {} } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Template', variant: 'primary', handler: { type: 'navigate', path: '/operations/project-templates/new' } },
    ],
  },

  permissions: { create: true, read: true, update: true, delete: true },
});
