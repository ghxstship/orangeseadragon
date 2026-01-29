import { defineSchema } from '../schema/defineSchema';

export const trainingCourseSchema = defineSchema({
  identity: {
    name: 'Training Course',
    namePlural: 'Training Courses',
    slug: 'modules/workforce/training',
    icon: 'GraduationCap',
    description: 'Employee training courses and certifications',
  },
  data: {
    endpoint: '/api/training_courses',
    primaryKey: 'id',
    fields: {
      name: {
        type: 'text',
        label: 'Course Name',
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
      category: {
        type: 'select',
        label: 'Category',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Compliance', value: 'compliance' },
          { label: 'Safety', value: 'safety' },
          { label: 'Technical', value: 'technical' },
          { label: 'Soft Skills', value: 'soft_skills' },
          { label: 'Leadership', value: 'leadership' },
          { label: 'Product', value: 'product' },
          { label: 'Onboarding', value: 'onboarding' },
        ],
      },
      delivery_method: {
        type: 'select',
        label: 'Delivery Method',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Online Self-Paced', value: 'online_self_paced' },
          { label: 'Online Live', value: 'online_live' },
          { label: 'In-Person', value: 'in_person' },
          { label: 'Blended', value: 'blended' },
        ],
      },
      duration_hours: {
        type: 'number',
        label: 'Duration (Hours)',
        inTable: true,
        inForm: true,
      },
      is_mandatory: {
        type: 'switch',
        label: 'Mandatory',
        inTable: true,
        inForm: true,
        default: false,
      },
      recertification_months: {
        type: 'number',
        label: 'Recertification (Months)',
        inForm: true,
        helpText: 'Leave blank if no recertification required',
      },
      passing_score: {
        type: 'number',
        label: 'Passing Score (%)',
        inForm: true,
        default: 80,
      },
      content_url: {
        type: 'url',
        label: 'Content URL',
        inForm: true,
        inDetail: true,
      },
      status: {
        type: 'select',
        label: 'Status',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Active', value: 'active' },
          { label: 'Archived', value: 'archived' },
        ],
        default: 'draft',
      },
      enrolled_count: {
        type: 'number',
        label: 'Enrolled',
        inTable: true,
        inDetail: true,
      },
      completion_rate: {
        type: 'number',
        label: 'Completion Rate',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => String(r.name || 'New Course'),
    subtitle: (r: Record<string, unknown>) => {
      const categories: Record<string, string> = {
        compliance: 'Compliance',
        safety: 'Safety',
        technical: 'Technical',
        soft_skills: 'Soft Skills',
        leadership: 'Leadership',
        product: 'Product',
        onboarding: 'Onboarding',
      };
      return categories[String(r.category)] || '';
    },
    badge: (r: Record<string, unknown>) => {
      if (r.is_mandatory) return { label: 'Mandatory', variant: 'destructive' };
      const variants: Record<string, string> = {
        draft: 'secondary',
        active: 'success',
        archived: 'destructive',
      };
      return { label: String(r.status || 'draft'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'name', direction: 'asc' },
  },
  search: {
    enabled: true,
    fields: ['name'],
    placeholder: 'Search courses...',
  },
  filters: {
    quick: [
      { key: 'mandatory', label: 'Mandatory', query: { where: { is_mandatory: true } } },
      { key: 'active', label: 'Active', query: { where: { status: 'active' } } },
    ],
    advanced: ['category', 'delivery_method', 'status', 'is_mandatory'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'active', label: 'Active', query: { where: { status: 'active' } }, count: true },
        { key: 'mandatory', label: 'Mandatory', query: { where: { is_mandatory: true } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table', 'cards'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'enrollments', label: 'Enrollments', content: { type: 'related', entity: 'training_enrollment', foreignKey: 'course_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'enrolled', label: 'Enrolled', value: { type: 'field', field: 'enrolled_count' }, format: 'number' },
          { key: 'completion', label: 'Completion Rate', value: { type: 'field', field: 'completion_rate' }, format: 'percentage' },
        ],
        blocks: [
          { key: 'details', title: 'Course Details', content: { type: 'fields', fields: ['name', 'description', 'category', 'delivery_method', 'duration_hours'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Course Details', fields: ['name', 'description', 'category', 'delivery_method', 'status'] },
        { key: 'settings', title: 'Settings', fields: ['duration_hours', 'is_mandatory', 'recertification_months', 'passing_score'] },
        { key: 'content', title: 'Content', fields: ['content_url'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['name', 'category', 'delivery_method', 'duration_hours', 'is_mandatory', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/workforce/training/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Course', variant: 'primary', handler: { type: 'navigate', path: '/modules/workforce/training/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
