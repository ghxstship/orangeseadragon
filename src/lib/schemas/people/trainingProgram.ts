import { defineSchema } from '../../schema-engine/defineSchema';

export const trainingProgramSchema = defineSchema({
  identity: {
    name: 'Training Program',
    namePlural: 'Training Programs',
    slug: 'modules/workforce/training',
    icon: 'GraduationCap',
    description: 'Training programs, courses, and certifications',
  },
  data: {
    endpoint: '/api/training_programs',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Program Name',
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
        inForm: true,
        helpText: 'URL-friendly identifier',
      },
      description: {
        type: 'textarea',
        label: 'Description',
        inForm: true,
        inDetail: true,
      },
      program_type: {
        type: 'select',
        label: 'Program Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Course', value: 'course' },
          { label: 'Certification', value: 'certification' },
          { label: 'Onboarding', value: 'onboarding' },
          { label: 'Compliance', value: 'compliance' },
          { label: 'Skill Development', value: 'skill_development' },
        ],
        default: 'course',
      },
      duration_hours: {
        type: 'number',
        label: 'Duration (Hours)',
        inTable: true,
        inForm: true,
      },
      is_required: {
        type: 'switch',
        label: 'Required',
        inTable: true,
        inForm: true,
        default: false,
        helpText: 'Mark as mandatory for assigned employees',
      },
      required_for_departments: {
        type: 'multiselect',
        label: 'Required for Departments',
        inForm: true,
      },
      required_for_positions: {
        type: 'multiselect',
        label: 'Required for Positions',
        inForm: true,
      },
      certification_type_id: {
        type: 'relation',
        label: 'Linked Certification',
        inForm: true,
        relation: { entity: 'certification_type', display: 'name' },
        helpText: 'Certification awarded upon completion',
      },
      passing_score: {
        type: 'number',
        label: 'Passing Score (%)',
        inForm: true,
        default: 80,
        helpText: 'Minimum score to pass (0-100)',
      },
      validity_months: {
        type: 'number',
        label: 'Validity (Months)',
        inForm: true,
        helpText: 'How long completion is valid before recertification',
      },
      content_url: {
        type: 'url',
        label: 'Content URL',
        inForm: true,
        inDetail: true,
        helpText: 'Link to training materials or LMS',
      },
      is_active: {
        type: 'switch',
        label: 'Active',
        inTable: true,
        inForm: true,
        default: true,
      },
      created_at: {
        type: 'datetime',
        label: 'Created',
        inDetail: true,
      },
      updated_at: {
        type: 'datetime',
        label: 'Updated',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'New Program'),
    subtitle: (r: Record<string, unknown>) => {
      const types: Record<string, string> = {
        course: 'Course',
        certification: 'Certification',
        onboarding: 'Onboarding',
        compliance: 'Compliance',
        skill_development: 'Skill Development',
      };
      return types[String(r.program_type)] || '';
    },
    badge: (r: Record<string, unknown>) => {
      if (r.is_required) return { label: 'Required', variant: 'destructive' };
      if (!r.is_active) return { label: 'Inactive', variant: 'secondary' };
      return { label: 'Active', variant: 'success' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name', 'description'],
    placeholder: 'Search programs...',
  },
  filters: {
    quick: [
      { key: 'required', label: 'Required', query: { where: { is_required: true } } },
      { key: 'active', label: 'Active', query: { where: { is_active: true } } },
      { key: 'compliance', label: 'Compliance', query: { where: { program_type: 'compliance' } } },
    ],
    advanced: ['program_type', 'is_required', 'is_active'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { is_active: true } }, count: true },
        { key: 'required', label: 'Required', query: { where: { is_required: true } }, count: true },
        { key: 'compliance', label: 'Compliance', query: { where: { program_type: 'compliance' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'assignments', label: 'Assignments', content: { type: 'related', entity: 'training_assignment', foreignKey: 'program_id' } },
        { key: 'sessions', label: 'Sessions', content: { type: 'related', entity: 'training_session', foreignKey: 'program_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'assignments', label: 'Assignments', value: { type: 'relation-count', entity: 'training_assignment', foreignKey: 'program_id' }, format: 'number' },
          { key: 'completed', label: 'Completed', value: { type: 'relation-count', entity: 'training_assignment', foreignKey: 'program_id', filter: { status: 'completed' } }, format: 'number' },
          { key: 'sessions', label: 'Sessions', value: { type: 'relation-count', entity: 'training_session', foreignKey: 'program_id' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Program Details', content: { type: 'fields', fields: ['name', 'description', 'program_type', 'duration_hours'] } },
          { key: 'requirements', title: 'Requirements', content: { type: 'fields', fields: ['is_required', 'passing_score', 'validity_months'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Program Details', fields: ['name', 'slug', 'description', 'program_type', 'is_active'] },
        { key: 'settings', title: 'Settings', fields: ['duration_hours', 'is_required', 'passing_score', 'validity_months'] },
        { key: 'requirements', title: 'Required For', fields: ['required_for_departments', 'required_for_positions'] },
        { key: 'content', title: 'Content', fields: ['content_url', 'certification_type_id'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'program_type', 'duration_hours', 'is_required', 'is_active'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/training/${r.id}` } },
      { key: 'assign', label: 'Assign', handler: { type: 'modal', component: 'AssignTrainingModal' } },
    ],
    bulk: [
      { key: 'activate', label: 'Activate', handler: { type: 'api', endpoint: '/api/training_programs/bulk-activate', method: 'POST' } },
      { key: 'deactivate', label: 'Deactivate', handler: { type: 'api', endpoint: '/api/training_programs/bulk-deactivate', method: 'POST' } },
    ],
    global: [
      { key: 'create', label: 'New Program', variant: 'primary', handler: { type: 'navigate', path: '/people/training/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
