import { defineSchema } from '../schema/defineSchema';

export const performanceReviewSchema = defineSchema({
  identity: {
    name: 'Performance Review',
    namePlural: 'Performance Reviews',
    slug: 'modules/workforce/performance',
    icon: 'Star',
    description: 'Employee performance reviews and evaluations',
  },
  data: {
    endpoint: '/api/performance_reviews',
    primaryKey: 'id',
    fields: {
      employee_id: {
        type: 'relation',
        label: 'Employee',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'user', display: 'full_name' },
      },
      reviewer_id: {
        type: 'relation',
        label: 'Reviewer',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'user', display: 'full_name' },
      },
      review_period_start: {
        type: 'date',
        label: 'Period Start',
        required: true,
        inForm: true,
        inDetail: true,
      },
      review_period_end: {
        type: 'date',
        label: 'Period End',
        required: true,
        inTable: true,
        inForm: true,
        sortable: true,
      },
      review_type: {
        type: 'select',
        label: 'Review Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Annual', value: 'annual' },
          { label: 'Semi-Annual', value: 'semi_annual' },
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Probationary', value: 'probationary' },
          { label: '90-Day', value: '90_day' },
          { label: 'Project', value: 'project' },
        ],
        default: 'annual',
      },
      overall_rating: {
        type: 'select',
        label: 'Overall Rating',
        inTable: true,
        inForm: true,
        options: [
          { label: 'Exceeds Expectations', value: '5' },
          { label: 'Meets Expectations', value: '4' },
          { label: 'Developing', value: '3' },
          { label: 'Needs Improvement', value: '2' },
          { label: 'Unsatisfactory', value: '1' },
        ],
      },
      strengths: {
        type: 'textarea',
        label: 'Strengths',
        inForm: true,
        inDetail: true,
      },
      areas_for_improvement: {
        type: 'textarea',
        label: 'Areas for Improvement',
        inForm: true,
        inDetail: true,
      },
      goals_achieved: {
        type: 'textarea',
        label: 'Goals Achieved',
        inForm: true,
        inDetail: true,
      },
      next_period_goals: {
        type: 'textarea',
        label: 'Goals for Next Period',
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
          { label: 'Self Review', value: 'self_review' },
          { label: 'Manager Review', value: 'manager_review' },
          { label: 'Calibration', value: 'calibration' },
          { label: 'Completed', value: 'completed' },
          { label: 'Acknowledged', value: 'acknowledged' },
        ],
        default: 'draft',
      },
      self_review_completed_at: {
        type: 'datetime',
        label: 'Self Review Completed',
        inDetail: true,
      },
      manager_review_completed_at: {
        type: 'datetime',
        label: 'Manager Review Completed',
        inDetail: true,
      },
      acknowledged_at: {
        type: 'datetime',
        label: 'Acknowledged At',
        inDetail: true,
      },
      next_review_date: {
        type: 'date',
        label: 'Next Review Date',
        inForm: true,
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      const employee = r.employee as Record<string, unknown> | undefined;
      return employee ? String(employee.full_name || 'Employee') : 'Performance Review';
    },
    subtitle: (r: Record<string, unknown>) => {
      const start = r.review_period_start ? new Date(String(r.review_period_start)).toLocaleDateString() : '';
      const end = r.review_period_end ? new Date(String(r.review_period_end)).toLocaleDateString() : '';
      return start && end ? `${start} - ${end}` : '';
    },
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        draft: 'secondary',
        self_review: 'warning',
        manager_review: 'default',
        calibration: 'outline',
        completed: 'success',
        acknowledged: 'success',
      };
      return { label: String(r.status || 'draft'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'review_period_end', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['employee_id'],
    placeholder: 'Search reviews...',
  },
  filters: {
    quick: [
      { key: 'self_review', label: 'Self Review', query: { where: { status: 'self_review' } } },
      { key: 'manager_review', label: 'Manager Review', query: { where: { status: 'manager_review' } } },
      { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
    ],
    advanced: ['review_type', 'status', 'reviewer_id'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'pending', label: 'Pending', query: { where: { status: ['self_review', 'manager_review', 'calibration'] } }, count: true },
        { key: 'completed', label: 'Completed', query: { where: { status: ['completed', 'acknowledged'] } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'competencies', label: 'Competencies', content: { type: 'related', entity: 'performance_review_competency', foreignKey: 'review_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'rating', label: 'Overall Rating', value: { type: 'field', field: 'overall_rating' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Review Details', content: { type: 'fields', fields: ['employee_id', 'reviewer_id', 'review_period_start', 'review_period_end', 'review_type'] } },
          { key: 'feedback', title: 'Feedback', content: { type: 'fields', fields: ['strengths', 'areas_for_improvement', 'goals_achieved', 'next_period_goals'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Review Details', fields: ['employee_id', 'reviewer_id', 'review_period_start', 'review_period_end', 'review_type', 'status'] },
        { key: 'evaluation', title: 'Evaluation', fields: ['overall_rating', 'strengths', 'areas_for_improvement'] },
        { key: 'goals', title: 'Goals', fields: ['goals_achieved', 'next_period_goals', 'next_review_date'] },
      ],
    },
  },
  views: {
    table: {
      columns: [
        { field: 'employee_id', format: { type: 'relation', entityType: 'person' } },
        { field: 'reviewer_id', format: { type: 'relation', entityType: 'person' } },
        'review_type',
        { field: 'review_period_end', format: { type: 'date' } },
        { field: 'overall_rating', format: { type: 'number' } },
        { field: 'status', format: { type: 'badge', colorMap: { draft: '#6b7280', in_progress: '#f59e0b', submitted: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444' } } },
      ],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/people/performance/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Review', variant: 'primary', handler: { type: 'navigate', path: '/people/performance/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
