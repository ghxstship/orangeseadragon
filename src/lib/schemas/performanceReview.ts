import { defineSchema } from '../schema/defineSchema';

export const performanceReviewSchema = defineSchema({
  identity: {
    name: 'performance_review',
    namePlural: 'Performance Reviews',
    slug: 'modules/workforce/performance',
    icon: '📊',
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
        relation: { entity: 'contact', display: 'full_name' },
      },
      reviewer_id: {
        type: 'relation',
        label: 'Reviewer',
        required: true,
        inTable: true,
        inForm: true,
        relation: { entity: 'contact', display: 'full_name' },
      },
      review_period: {
        type: 'select',
        label: 'Review Period',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Q1', value: 'q1' },
          { label: 'Q2', value: 'q2' },
          { label: 'Q3', value: 'q3' },
          { label: 'Q4', value: 'q4' },
          { label: 'Annual', value: 'annual' },
          { label: 'Probation', value: 'probation' },
        ],
      },
      review_year: {
        type: 'number',
        label: 'Year',
        required: true,
        inTable: true,
        inForm: true,
      },
      review_type: {
        type: 'select',
        label: 'Review Type',
        required: true,
        inTable: true,
        inForm: true,
        options: [
          { label: 'Self Assessment', value: 'self' },
          { label: 'Manager Review', value: 'manager' },
          { label: '360 Review', value: '360' },
          { label: 'Peer Review', value: 'peer' },
        ],
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
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Pending Approval', value: 'pending_approval' },
          { label: 'Completed', value: 'completed' },
        ],
        default: 'draft',
      },
      due_date: {
        type: 'date',
        label: 'Due Date',
        inTable: true,
        inForm: true,
        sortable: true,
      },
      completed_at: {
        type: 'datetime',
        label: 'Completed At',
        inDetail: true,
      },
    },
  },
  display: {
    title: (r: Record<string, unknown>) => {
      const employee = r.employee as Record<string, unknown> | undefined;
      return employee ? String(employee.full_name || 'Employee') : 'Performance Review';
    },
    subtitle: (r: Record<string, unknown>) => `${r.review_period || ''} ${r.review_year || ''}`,
    badge: (r: Record<string, unknown>) => {
      const variants: Record<string, string> = {
        draft: 'secondary',
        in_progress: 'warning',
        pending_approval: 'default',
        completed: 'success',
      };
      return { label: String(r.status || 'draft'), variant: variants[String(r.status)] || 'secondary' };
    },
    defaultSort: { field: 'due_date', direction: 'desc' },
  },
  search: {
    enabled: true,
    fields: ['employee_id'],
    placeholder: 'Search reviews...',
  },
  filters: {
    quick: [
      { key: 'pending', label: 'Pending', query: { where: { status: 'pending_approval' } } },
    ],
    advanced: ['review_period', 'review_type', 'status', 'reviewer_id'],
  },
  layouts: {
    list: {
      subpages: [
        { key: 'all', label: 'All', query: { where: {} }, count: true },
        { key: 'in_progress', label: 'In Progress', query: { where: { status: 'in_progress' } }, count: true },
        { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } }, count: true },
      ],
      defaultView: 'table',
      availableViews: ['table'],
    },
    detail: {
      tabs: [
        { key: 'overview', label: 'Overview', content: { type: 'overview' } },
        { key: 'goals', label: 'Goals', content: { type: 'related', entity: 'performance_goal', foreignKey: 'review_id' } },
        { key: 'activity', label: 'Activity', content: { type: 'activity' } },
      ],
      overview: {
        stats: [
          { key: 'rating', label: 'Overall Rating', value: { type: 'field', field: 'overall_rating' }, format: 'number' },
        ],
        blocks: [
          { key: 'details', title: 'Review Details', content: { type: 'fields', fields: ['employee_id', 'reviewer_id', 'review_period', 'review_year', 'review_type'] } },
        ],
      },
    },
    form: {
      sections: [
        { key: 'basic', title: 'Review Details', fields: ['employee_id', 'reviewer_id', 'review_period', 'review_year', 'review_type', 'status', 'due_date'] },
        { key: 'evaluation', title: 'Evaluation', fields: ['overall_rating', 'strengths', 'areas_for_improvement'] },
        { key: 'goals', title: 'Goals', fields: ['goals_achieved', 'next_period_goals'] },
      ],
    },
  },
  views: {
    table: {
      columns: ['employee_id', 'reviewer_id', 'review_period', 'review_year', 'overall_rating', 'status'],
    },
  },
  actions: {
    row: [
      { key: 'view', label: 'View', handler: { type: 'navigate', path: (r: Record<string, unknown>) => `/modules/workforce/performance/${r.id}` } },
    ],
    bulk: [],
    global: [
      { key: 'create', label: 'New Review', variant: 'primary', handler: { type: 'navigate', path: '/modules/workforce/performance/new' } },
    ],
  },
  permissions: { create: true, read: true, update: true, delete: true },
});
